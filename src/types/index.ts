export interface GameDTO {
  _id: string;
  slug: string;
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

export interface LiveGameScore {
  key: string; // "AWAY-HOME" using our team abbrs
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "halftime" | "final";
  period: number;
  clock: string;
  statusText: string; // e.g. "Q2 4:32" | "Halftime" | "Final" | "Final/OT"
}

export interface PostDTO {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  tags: string[];
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
  schemaMarkup?: string;
  createdAt: string;
  updatedAt: string;
}
