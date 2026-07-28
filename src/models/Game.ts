import mongoose, { Schema, models, model } from "mongoose";

export interface IGame {
  _id?: string;
  slug: string;
  season: number;
  week: number;
  homeTeam: string; // team abbreviation, e.g. "KC"
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  venue?: string;
  kickoff: Date;
  network?: string;
  status: "scheduled" | "live" | "final";
  homeScore?: number;
  awayScore?: number;
  affiliateUrl: string;
  viewerCountBase: number;
  featured: boolean;
  description?: string;
  kickoffReminderSent?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const GameSchema = new Schema<IGame>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    season: { type: Number, required: true },
    week: { type: Number, required: true },
    homeTeam: { type: String, required: true, uppercase: true },
    awayTeam: { type: String, required: true, uppercase: true },
    homeTeamFull: { type: String, required: true },
    awayTeamFull: { type: String, required: true },
    venue: { type: String },
    kickoff: { type: Date, required: true, index: true },
    network: { type: String, default: "TBD" },
    status: {
      type: String,
      enum: ["scheduled", "live", "final"],
      default: "scheduled",
    },
    homeScore: { type: Number },
    awayScore: { type: Number },
    affiliateUrl: { type: String, required: true },
    viewerCountBase: { type: Number, default: 12000 },
    featured: { type: Boolean, default: false },
    description: { type: String },
    kickoffReminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.Game as mongoose.Model<IGame>) || model<IGame>("Game", GameSchema);
