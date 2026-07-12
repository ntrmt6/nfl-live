"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { TEAM_LIST } from "@/lib/teams";

export interface GameFormValues {
  _id?: string;
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  venue?: string;
  kickoff: string;
  network?: string;
  status: "scheduled" | "live" | "final";
  homeScore?: number;
  awayScore?: number;
  affiliateUrl: string;
  viewerCountBase: number;
  featured: boolean;
  description?: string;
}

const DEFAULT_VALUES: GameFormValues = {
  season: new Date().getFullYear(),
  week: 1,
  homeTeam: "",
  awayTeam: "",
  homeTeamFull: "",
  awayTeamFull: "",
  venue: "",
  kickoff: "",
  network: "",
  status: "scheduled",
  affiliateUrl: "",
  viewerCountBase: 12000,
  featured: false,
  description: "",
};

function toDatetimeLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function GameForm({ initialValues }: { initialValues?: Partial<GameFormValues> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = useState<GameFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
    kickoff: toDatetimeLocal(initialValues?.kickoff),
  });
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initialValues?._id);

  const update = <K extends keyof GameFormValues>(key: K, value: GameFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleTeamSelect = (side: "home" | "away", abbr: string) => {
    const team = TEAM_LIST.find((t) => t.abbr === abbr);
    if (!team) return;
    if (side === "home") {
      update("homeTeam", team.abbr);
      update("homeTeamFull", team.name);
    } else {
      update("awayTeam", team.abbr);
      update("awayTeamFull", team.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/games/${initialValues!._id}` : "/api/games";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          kickoff: new Date(values.kickoff).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Save failed", description: data.error, variant: "error" });
        setSaving(false);
        return;
      }
      toast({ title: isEdit ? "Game updated" : "Game created", variant: "success" });
      router.push("/admin/games");
      router.refresh();
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Away Team</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm"
            value={values.awayTeam}
            onChange={(e) => handleTeamSelect("away", e.target.value)}
            required
          >
            <option value="">Select team</option>
            {TEAM_LIST.map((t) => (
              <option key={t.abbr} value={t.abbr}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Home Team</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm"
            value={values.homeTeam}
            onChange={(e) => handleTeamSelect("home", e.target.value)}
            required
          >
            <option value="">Select team</option>
            {TEAM_LIST.map((t) => (
              <option key={t.abbr} value={t.abbr}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label>Season</Label>
          <Input type="number" value={values.season} onChange={(e) => update("season", Number(e.target.value))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Week</Label>
          <Input type="number" value={values.week} onChange={(e) => update("week", Number(e.target.value))} required />
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label>Status</Label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 text-sm"
            value={values.status}
            onChange={(e) => update("status", e.target.value as GameFormValues["status"])}
          >
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="final">Final</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Network</Label>
          <Input value={values.network} onChange={(e) => update("network", e.target.value)} placeholder="CBS" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Kickoff Date & Time</Label>
          <Input
            type="datetime-local"
            value={values.kickoff}
            onChange={(e) => update("kickoff", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Venue</Label>
          <Input value={values.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Arrowhead Stadium" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Away Score</Label>
          <Input
            type="number"
            value={values.awayScore ?? ""}
            onChange={(e) => update("awayScore", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Home Score</Label>
          <Input
            type="number"
            value={values.homeScore ?? ""}
            onChange={(e) => update("homeScore", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Affiliate / Stream Partner URL</Label>
        <Input
          type="url"
          value={values.affiliateUrl}
          onChange={(e) => update("affiliateUrl", e.target.value)}
          placeholder="https://your-affiliate-network.com/offer"
          required
        />
        <p className="text-xs text-muted-foreground">
          Destination users are sent to when they tap the live player on this game&apos;s page.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Base Viewer Count</Label>
        <Input
          type="number"
          value={values.viewerCountBase}
          onChange={(e) => update("viewerCountBase", Number(e.target.value))}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Description (used for SEO / schema markup)</Label>
        <Textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={values.featured} onCheckedChange={(v) => update("featured", v)} />
        <Label>Feature this game on the homepage</Label>
      </div>

      <Button type="submit" variant="neon" disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : isEdit ? "Update Game" : "Create Game"}
      </Button>
    </form>
  );
}
