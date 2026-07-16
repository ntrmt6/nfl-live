import mongoose, { Schema, models, model } from "mongoose";

export type UserRank = "Rookie" | "Regular" | "Veteran" | "All-Pro" | "Hall of Famer";

export type BadgeId =
  | "first-down"
  | "fan-favorite"
  | "top-commenter"
  | "century-club"
  | "nfl-expert"
  | "verified-fan"
  | "mvp";

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string; // base64 data URL
  rank: UserRank;
  badges: BadgeId[];
  reputationPoints: number;
  commentCount: number;
  approvedCommentCount: number;
  isBanned: boolean;
  banReason?: string;
  lastCommentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    rank: { type: String, default: "Rookie", enum: ["Rookie", "Regular", "Veteran", "All-Pro", "Hall of Famer"] },
    badges: { type: [String], default: [] },
    reputationPoints: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    approvedCommentCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    lastCommentAt: { type: Date },
  },
  { timestamps: true }
);

export default (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
