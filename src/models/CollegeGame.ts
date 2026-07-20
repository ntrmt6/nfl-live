import mongoose, { Schema, models, model } from "mongoose";

export interface ICollegeGame {
  _id?: string;
  slug: string;
  espnId?: string;
  season: number;
  week: number; // 0 = bowl game
  homeTeam: string; // ESPN abbreviation, uppercase
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  homeTeamLogo?: string; // ESPN logo URL
  awayTeamLogo?: string;
  homeColor?: string; // hex color, no #
  awayColor?: string;
  venue?: string;
  city?: string;
  kickoff: Date;
  network?: string;
  status: "scheduled" | "live" | "final";
  homeScore?: number;
  awayScore?: number;
  conference?: string; // home team conference
  awayConference?: string;
  isRivalry?: boolean;
  isBowlGame?: boolean;
  bowlName?: string;
  isPlayoff?: boolean;
  neutral?: boolean; // true for bowl/playoff games
  viewerCountBase: number;
  featured: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollegeGameDTO {
  _id: string;
  slug: string;
  espnId?: string;
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeColor?: string;
  awayColor?: string;
  venue?: string;
  city?: string;
  kickoff: string; // ISO string
  network?: string;
  status: "scheduled" | "live" | "final";
  homeScore?: number;
  awayScore?: number;
  conference?: string;
  awayConference?: string;
  isRivalry?: boolean;
  isBowlGame?: boolean;
  bowlName?: string;
  isPlayoff?: boolean;
  neutral?: boolean;
  viewerCountBase: number;
  featured: boolean;
  description?: string;
}

const CollegeGameSchema = new Schema<ICollegeGame>(
  {
    slug:             { type: String, required: true, unique: true, index: true },
    espnId:           { type: String },
    season:           { type: Number, required: true },
    week:             { type: Number, required: true },
    homeTeam:         { type: String, required: true, uppercase: true },
    awayTeam:         { type: String, required: true, uppercase: true },
    homeTeamFull:     { type: String, required: true },
    awayTeamFull:     { type: String, required: true },
    homeTeamLogo:     { type: String },
    awayTeamLogo:     { type: String },
    homeColor:        { type: String },
    awayColor:        { type: String },
    venue:            { type: String },
    city:             { type: String },
    kickoff:          { type: Date, required: true, index: true },
    network:          { type: String },
    status:           { type: String, enum: ["scheduled", "live", "final"], default: "scheduled" },
    homeScore:        { type: Number },
    awayScore:        { type: Number },
    conference:       { type: String },
    awayConference:   { type: String },
    isRivalry:        { type: Boolean, default: false },
    isBowlGame:       { type: Boolean, default: false },
    bowlName:         { type: String },
    isPlayoff:        { type: Boolean, default: false },
    neutral:          { type: Boolean, default: false },
    viewerCountBase:  { type: Number, default: 8000 },
    featured:         { type: Boolean, default: false },
    description:      { type: String },
  },
  { timestamps: true }
);

export default (models.CollegeGame as mongoose.Model<ICollegeGame>) ||
  model<ICollegeGame>("CollegeGame", CollegeGameSchema);
