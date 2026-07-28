import mongoose, { Schema, models, model } from "mongoose";

export interface IPushSubscription {
  _id?: string;
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt?: Date;
  updatedAt?: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default (models.PushSubscription as mongoose.Model<IPushSubscription>) ||
  model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
