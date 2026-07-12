import mongoose, { Schema, models, model } from "mongoose";

export interface IContactMessage {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt?: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.ContactMessage as mongoose.Model<IContactMessage>) ||
  model<IContactMessage>("ContactMessage", ContactMessageSchema);
