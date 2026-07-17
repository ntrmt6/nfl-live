import mongoose, { Schema, models, model } from "mongoose";

export interface IPick {
  _id?: string;
  userId: string;
  username: string;
  gameSlug: string;
  season: number;
  week: number;
  choice: "home" | "away";
  homeTeam: string;
  awayTeam: string;
  homeTeamFull: string;
  awayTeamFull: string;
  correct?: boolean; // undefined until resolved
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PickSchema = new Schema<IPick>(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    gameSlug: { type: String, required: true },
    season: { type: Number, required: true },
    week: { type: Number, required: true },
    choice: { type: String, enum: ["home", "away"], required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeTeamFull: { type: String, required: true },
    awayTeamFull: { type: String, required: true },
    correct: { type: Boolean },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

PickSchema.index({ userId: 1, gameSlug: 1 }, { unique: true });
PickSchema.index({ gameSlug: 1 });
PickSchema.index({ userId: 1, season: 1, week: 1 });

export default (models.Pick as mongoose.Model<IPick>) || model<IPick>("Pick", PickSchema);
