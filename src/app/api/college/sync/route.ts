import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import CollegeGame from "@/models/CollegeGame";
import CollegePrediction from "@/models/CollegePrediction";
import { generateCollegePrediction } from "@/lib/college-prediction-engine";
import { espnAbbrToCollegeAbbr } from "@/lib/college-teams";
import { requireAdmin } from "@/lib/requireAdmin";

interface EspnTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  color?: string;
  alternateColor?: string;
  logo?: string;
}

interface EspnCompetitor {
  homeAway: "home" | "away";
  team: EspnTeam;
  score?: string;
  records?: { summary: string; type: string }[];
  curatedRank?: { current: number };
}

interface EspnEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: { type: { name: string; completed: boolean } };
  competitions: {
    competitors: EspnCompetitor[];
    venue?: { fullName: string; address?: { city: string; state: string } };
    broadcasts?: { names: string[] }[];
    neutralSite?: boolean;
    notes?: { headline?: string }[];
  }[];
}

async function fetchEspnSchedule(dates?: string): Promise<EspnEvent[]> {
  const params = new URLSearchParams({
    limit: "100",
    groups: "80",  // FBS group
  });
  if (dates) params.set("dates", dates);

  const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?${params}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`ESPN API error: ${res.status}`);

  const data = await res.json();
  return data.events || [];
}

function parseStatus(espnStatus: string): "scheduled" | "live" | "final" {
  if (espnStatus.includes("IN_PROGRESS") || espnStatus.includes("HALFTIME")) return "live";
  if (espnStatus.includes("FINAL") || espnStatus.includes("COMPLETED")) return "final";
  return "scheduled";
}

function parseRecord(competitor: EspnCompetitor): [number, number] | undefined {
  const rec = competitor.records?.find(r => r.type === "total" || r.type === "overall");
  if (!rec) return undefined;
  const [w, l] = rec.summary.split("-").map(Number);
  return [w || 0, l || 0];
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { dates } = body; // e.g. "20250906" or "20250901-20250930"

    const events = await fetchEspnSchedule(dates);
    await connectDB();

    let synced = 0;
    let predicted = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        const comp = event.competitions[0];
        if (!comp) continue;

        const homeComp = comp.competitors.find(c => c.homeAway === "home");
        const awayComp = comp.competitors.find(c => c.homeAway === "away");
        if (!homeComp || !awayComp) continue;

        const homeEspnAbbr = homeComp.team.abbreviation.toUpperCase();
        const awayEspnAbbr = awayComp.team.abbreviation.toUpperCase();
        const homeAbbr = espnAbbrToCollegeAbbr(homeEspnAbbr);
        const awayAbbr = espnAbbrToCollegeAbbr(awayEspnAbbr);

        const homeTeamFull = homeComp.team.displayName;
        const awayTeamFull = awayComp.team.displayName;

        const kickoff = new Date(event.date);
        const season = kickoff.getFullYear() >= 2026 ? 2026 : kickoff.getFullYear();
        const isNeutral = comp.neutralSite ?? false;

        // Week number from date (rough CFB week)
        const seasonStart = new Date(season, 7, 25); // ~Aug 25
        const weekNum = Math.max(1, Math.ceil((kickoff.getTime() - seasonStart.getTime()) / (7 * 86400000)));
        const isBowl = weekNum > 16 || (comp.notes?.[0]?.headline?.toLowerCase().includes("bowl") ?? false);

        const status = parseStatus(event.status.type.name);
        const homeScore = parseInt(homeComp.score || "0") || undefined;
        const awayScore = parseInt(awayComp.score || "0") || undefined;

        const baseSlug = slugify(`${awayTeamFull}-at-${homeTeamFull}-${season}`, {
          lower: true, strict: true,
        });
        let slug = baseSlug;
        let counter = 1;
        const existing = await CollegeGame.findOne({ espnId: event.id }).lean();
        if (!existing) {
          while (await CollegeGame.exists({ slug })) slug = `${baseSlug}-${counter++}`;
        } else {
          slug = (existing as any).slug;
        }

        const network = comp.broadcasts?.[0]?.names?.[0] || "TBD";

        const gameDoc = {
          slug,
          espnId: event.id,
          season,
          week: weekNum,
          homeTeam: homeAbbr,
          awayTeam: awayAbbr,
          homeTeamFull,
          awayTeamFull,
          homeTeamLogo: homeComp.team.logo,
          awayTeamLogo: awayComp.team.logo,
          homeColor: homeComp.team.color,
          awayColor: awayComp.team.color,
          kickoff,
          network,
          status,
          homeScore: status !== "scheduled" ? homeScore : undefined,
          awayScore: status !== "scheduled" ? awayScore : undefined,
          neutral: isNeutral,
          isBowlGame: isBowl,
          viewerCountBase: 8000,
          featured: false,
        };

        await CollegeGame.findOneAndUpdate(
          { espnId: event.id },
          { $set: gameDoc },
          { upsert: true, new: true }
        );
        synced++;

        // Generate prediction if scheduled and not already predicted
        const existingPred = await CollegePrediction.findOne({
          homeTeam: homeAbbr,
          awayTeam: awayAbbr,
          season,
          _type: { $exists: false },
        }).lean();

        if (!existingPred) {
          const homeRecord = parseRecord(homeComp);
          const awayRecord = parseRecord(awayComp);

          const result = generateCollegePrediction(
            homeAbbr,
            awayAbbr,
            isNeutral,
            homeRecord,
            awayRecord,
          );

          await CollegePrediction.create({
            slug,
            season,
            week: weekNum,
            homeTeam: homeAbbr,
            awayTeam: awayAbbr,
            homeTeamFull,
            awayTeamFull,
            kickoff,
            ...result,
            generatedAt: new Date(),
          });
          predicted++;
        }
      } catch (err) {
        errors.push((err as Error).message);
      }
    }

    return NextResponse.json({
      ok: true,
      synced,
      predicted,
      total: events.length,
      errors: errors.slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** GET — trigger sync for the current week (no auth for cron convenience) */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && secret !== process.env.ADMIN_SECRET && secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use provided dates param or default to next 16 weeks (CFB season)
  const datesParam = searchParams.get("dates");
  let espnDates: string | undefined;
  if (datesParam) {
    espnDates = datesParam;
  } else {
    const now = new Date();
    const start = now.toISOString().slice(0, 10).replace(/-/g, "");
    const end = new Date(now.getTime() + 112 * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
    espnDates = `${start}-${end}`;
  }

  // For cron, generate predictions directly
  try {
    const events = await fetchEspnSchedule(espnDates);
    await connectDB();

    let synced = 0;
    let predicted = 0;

    for (const event of events) {
      const comp = event.competitions[0];
      if (!comp) continue;

      const homeComp = comp.competitors.find(c => c.homeAway === "home");
      const awayComp = comp.competitors.find(c => c.homeAway === "away");
      if (!homeComp || !awayComp) continue;

      const homeAbbr = espnAbbrToCollegeAbbr(homeComp.team.abbreviation.toUpperCase());
      const awayAbbr = espnAbbrToCollegeAbbr(awayComp.team.abbreviation.toUpperCase());
      const homeTeamFull = homeComp.team.displayName;
      const awayTeamFull = awayComp.team.displayName;
      const kickoff = new Date(event.date);
      const season = kickoff.getFullYear();
      const seasonStart = new Date(season, 7, 25);
      const weekNum = Math.max(1, Math.ceil((kickoff.getTime() - seasonStart.getTime()) / (7 * 86400000)));
      const isNeutral = comp.neutralSite ?? false;
      const status = parseStatus(event.status.type.name);

      const baseSlug = slugify(`${awayTeamFull}-at-${homeTeamFull}-${season}`, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      const existing = await CollegeGame.findOne({ espnId: event.id }).lean();
      if (!existing) {
        while (await CollegeGame.exists({ slug })) slug = `${baseSlug}-${counter++}`;
      } else {
        slug = (existing as any).slug;
      }

      await CollegeGame.findOneAndUpdate(
        { espnId: event.id },
        { $set: { slug, espnId: event.id, season, week: weekNum, homeTeam: homeAbbr, awayTeam: awayAbbr, homeTeamFull, awayTeamFull, homeTeamLogo: homeComp.team.logo, awayTeamLogo: awayComp.team.logo, homeColor: homeComp.team.color, awayColor: awayComp.team.color, kickoff, network: comp.broadcasts?.[0]?.names?.[0] || "TBD", status, neutral: isNeutral, viewerCountBase: 8000, featured: false } },
        { upsert: true }
      );
      synced++;

      const existingPred = await CollegePrediction.findOne({ homeTeam: homeAbbr, awayTeam: awayAbbr, season, _type: { $exists: false } }).lean();
      if (!existingPred) {
        const result = generateCollegePrediction(homeAbbr, awayAbbr, isNeutral, parseRecord(homeComp), parseRecord(awayComp));
        await CollegePrediction.create({ slug, season, week: weekNum, homeTeam: homeAbbr, awayTeam: awayAbbr, homeTeamFull, awayTeamFull, kickoff, ...result, generatedAt: new Date() });
        predicted++;
      }
    }

    return NextResponse.json({ ok: true, synced, predicted, total: events.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
