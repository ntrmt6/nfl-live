import mongoose, { Schema, models, model } from "mongoose";

export interface IVote {
  _id?: string;
  gameSlug: string;
  choice: "home" | "away";
  userId?: string;
  voterKey: string; // userId if logged in, UUID fingerprint if anon
  createdAt?: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    gameSlug: { type: String, required: true, index: true },
    choice: { type: String, enum: ["home", "away"], required: true },
    userId: { type: String },
    voterKey: { type: String, required: true },
  },
  { timestamps: true }
);

VoteSchema.index({ gameSlug: 1, voterKey: 1 }, { unique: true });

export default (models.Vote as mongoose.Model<IVote>) || model<IVote>("Vote", VoteSchema);
