import mongoose, { Schema, models, model } from "mongoose";

export interface IPrediction {
  _id?: string;
  gameId?: mongoose.Types.ObjectId;
  slug?: string;
  season?: number;
  week?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamFull?: string;
  awayTeamFull?: string;
  kickoff?: Date;
  homeWinProbability?: number;
  awayWinProbability?: number;
  predictedWinner?: string;
  confidence?: number;
  modelAccuracy?: number;
  homeTeamStats?: Record<string, number>;
  awayTeamStats?: Record<string, number>;
  generatedAt?: Date;
  // internal meta document marker
  _type?: string;
  accuracy?: number;
  trainingSamples?: number;
  seasons?: number[];
  updatedAt?: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    gameId:               { type: Schema.Types.ObjectId, ref: "Game", index: true, sparse: true },
    slug:                 { type: String, index: true, sparse: true },
    season:               { type: Number },
    week:                 { type: Number },
    homeTeam:             { type: String },
    awayTeam:             { type: String },
    homeTeamFull:         { type: String },
    awayTeamFull:         { type: String },
    kickoff:              { type: Date },
    homeWinProbability:   { type: Number },
    awayWinProbability:   { type: Number },
    predictedWinner:      { type: String },
    confidence:           { type: Number },
    modelAccuracy:        { type: Number },
    homeTeamStats:        { type: Schema.Types.Mixed },
    awayTeamStats:        { type: Schema.Types.Mixed },
    generatedAt:          { type: Date, default: Date.now },
    _type:                { type: String, index: true, sparse: true },
    accuracy:             { type: Number },
    trainingSamples:      { type: Number },
    seasons:              [{ type: Number }],
  },
  { timestamps: true }
);

export default (models.Prediction as mongoose.Model<IPrediction>) ||
  model<IPrediction>("Prediction", PredictionSchema);
