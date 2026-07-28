import mongoose, { Schema, models, model } from "mongoose";

export interface ILeagueMember {
  userId: string;
  username: string;
  joinedAt: Date;
}

export interface ILeague {
  _id?: string;
  name: string;
  code: string;
  season: number;
  ownerId: string;
  ownerUsername: string;
  members: ILeagueMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

const LeagueMemberSchema = new Schema<ILeagueMember>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeagueSchema = new Schema<ILeague>(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    season: { type: Number, required: true },
    ownerId: { type: String, required: true, index: true },
    ownerUsername: { type: String, required: true },
    members: { type: [LeagueMemberSchema], default: [] },
  },
  { timestamps: true }
);

LeagueSchema.index({ "members.userId": 1 });

export default (models.League as mongoose.Model<ILeague>) || model<ILeague>("League", LeagueSchema);
