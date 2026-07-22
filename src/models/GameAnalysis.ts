import mongoose, { Schema, Document } from "mongoose";

export interface IGameAnalysis extends Document {
  slug: string;
  overview: string;
  keyMatchups: string[];
  offensiveBreakdown: string;
  defensiveBreakdown: string;
  xFactor: string;
  predictionNarrative: string;
  generatedAt: Date;
}

const GameAnalysisSchema = new Schema<IGameAnalysis>({
  slug: { type: String, required: true, unique: true, index: true },
  overview: { type: String, required: true },
  keyMatchups: [{ type: String }],
  offensiveBreakdown: { type: String },
  defensiveBreakdown: { type: String },
  xFactor: { type: String },
  predictionNarrative: { type: String },
  generatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.GameAnalysis ||
  mongoose.model<IGameAnalysis>("GameAnalysis", GameAnalysisSchema);
