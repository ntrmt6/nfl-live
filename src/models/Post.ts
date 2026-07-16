import mongoose, { Schema, models, model } from "mongoose";

export interface IPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML from Tiptap WYSIWYG
  coverImage?: string;
  author: string;
  tags: string[];
  published: boolean;
  metaTitle?: string;
  metaDescription?: string;
  schemaMarkup?: string; // JSON string for additional JSON-LD (FAQPage, SportsEvent, etc.)
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    author: { type: String, default: "NFL Predictions Hub Staff" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    schemaMarkup: { type: String },
  },
  { timestamps: true }
);

export default (models.Post as mongoose.Model<IPost>) || model<IPost>("Post", PostSchema);
