import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CollegeGame from "@/models/CollegeGame";
import CollegePrediction from "@/models/CollegePrediction";
import { generateCollegePrediction } from "@/lib/college-prediction-engine";
import { espnAbbrToCollegeAbbr } from "@/lib/college-teams";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");
    const conference = searchParams.get("conference");
    const season = searchParams.get("season");

    const query: Record<string, unknown> = {};
    if (week) query.week = Number(week);
    if (conference) query.conference = conference;
    if (season) query.season = Number(season);

    const games = await CollegeGame.find(query).sort({ kickoff: 1 }).limit(200).lean();
    return NextResponse.json({ games });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** Seed demo games so the page has content even before ESPN sync */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));

    if (body.seedDemo) {
      return seedDemoGames();
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

async function seedDemoGames() {
  const season = 2026;

  const matchups = [
    { away: "ALA", home: "UGA",  week: 1, kickoff: new Date("2026-08-30T20:00:00Z"), network: "CBS",    featured: true },
    { away: "OSU", home: "MICH", week: 1, kickoff: new Date("2026-08-30T22:30:00Z"), network: "FOX",    featured: true },
    { away: "ORE", home: "ND",   week: 1, kickoff: new Date("2026-09-05T17:00:00Z"), network: "NBC",    featured: false },
    { away: "TEX", home: "CLEM", week: 1, kickoff: new Date("2026-09-05T20:00:00Z"), network: "ESPN",   featured: false },
    { away: "LSU", home: "TAMU", week: 1, kickoff: new Date("2026-09-05T23:00:00Z"), network: "ESPN",   featured: false },
    { away: "OKLA",home: "TENN", week: 2, kickoff: new Date("2026-09-12T20:00:00Z"), network: "ESPN",   featured: false },
    { away: "MICH",home: "PSU",  week: 2, kickoff: new Date("2026-09-12T22:30:00Z"), network: "ABC",    featured: true  },
    { away: "UGA", home: "FLA",  week: 3, kickoff: new Date("2026-09-19T20:00:00Z"), network: "CBS",    featured: false },
    { away: "OSU", home: "ND",   week: 3, kickoff: new Date("2026-09-19T22:00:00Z"), network: "NBC",    featured: true  },
    { away: "KSU", home: "OKST", week: 3, kickoff: new Date("2026-09-19T23:30:00Z"), network: "FS1",   featured: false },
    { away: "ALA", home: "LSU",  week: 4, kickoff: new Date("2026-09-26T20:00:00Z"), network: "CBS",    featured: true  },
    { away: "TEX", home: "OKLA", week: 4, kickoff: new Date("2026-09-26T23:30:00Z"), network: "FOX",    featured: false },
    { away: "TCU", home: "BAY",  week: 5, kickoff: new Date("2026-10-03T20:00:00Z"), network: "FS1",   featured: false },
    { away: "UGA", home: "TENN", week: 5, kickoff: new Date("2026-10-03T22:00:00Z"), network: "CBS",    featured: false },
    { away: "MICH",home: "OSU",  week: 6, kickoff: new Date("2026-11-21T20:00:00Z"), network: "FOX",    featured: true  },
    { away: "ALA", home: "UGA",  week: 7, kickoff: new Date("2027-01-09T20:00:00Z"), network: "ESPN",   featured: true, isBowl: true, bowlName: "College Football Playoff Championship" },
  ];

  let created = 0;
  let predicted = 0;

  for (const m of matchups) {
    const { away: awayAbbr, home: homeAbbr, week, kickoff, network, featured, isBowl, bowlName } = m;
    const { name: homeName } = await import("@/lib/college-teams").then(mod => mod.getCollegeTeam(homeAbbr));
    const { name: awayName } = await import("@/lib/college-teams").then(mod => mod.getCollegeTeam(awayAbbr));

    const baseSlug = slugify(`${awayName}-at-${homeName}-${season}`, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    const existingGame = await CollegeGame.findOne({ homeTeam: homeAbbr, awayTeam: awayAbbr, season }).lean();
    if (existingGame) {
      slug = (existingGame as any).slug;
    } else {
      while (await CollegeGame.exists({ slug })) slug = `${baseSlug}-${counter++}`;

      await CollegeGame.create({
        slug,
        season,
        week,
        homeTeam: homeAbbr,
        awayTeam: awayAbbr,
        homeTeamFull: homeName,
        awayTeamFull: awayName,
        kickoff,
        network,
        status: "scheduled",
        featured,
        viewerCountBase: 12000,
        isBowlGame: isBowl ?? false,
        bowlName,
        neutral: isBowl ?? false,
      });
      created++;
    }

    // Generate prediction
    const existingPred = await CollegePrediction.findOne({
      homeTeam: homeAbbr, awayTeam: awayAbbr, season, _type: { $exists: false },
    }).lean();

    if (!existingPred) {
      const result = generateCollegePrediction(homeAbbr, awayAbbr, isBowl ?? false);
      await CollegePrediction.create({
        slug,
        season,
        week,
        homeTeam: homeAbbr,
        awayTeam: awayAbbr,
        homeTeamFull: homeName,
        awayTeamFull: awayName,
        kickoff,
        ...result,
        generatedAt: new Date(),
      });
      predicted++;
    }
  }

  return NextResponse.json({ ok: true, created, predicted });
}
