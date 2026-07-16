import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  adsenseClientId: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    adsenseClientId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
