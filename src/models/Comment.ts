import mongoose, { Schema, models, model } from "mongoose";

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface IComment {
  _id?: string;
  postSlug: string;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId | null;
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  status: CommentStatus;
  reportCount: number;
  reportedBy: mongoose.Types.ObjectId[];
  isEdited: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postSlug: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    likeCount: { type: Number, default: 0 },
    status: { type: String, default: "pending", enum: ["pending", "approved", "rejected", "spam"] },
    reportCount: { type: Number, default: 0 },
    reportedBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ postSlug: 1, status: 1, createdAt: -1 });

export default (models.Comment as mongoose.Model<IComment>) || model<IComment>("Comment", CommentSchema);
