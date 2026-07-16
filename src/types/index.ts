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
