import mongoose, { Schema, models, model } from "mongoose";

export interface ICollegePrediction {
  _id?: string;
  gameId?: mongoose.Types.ObjectId; // ref "CollegeGame"
  slug?: string;
  espnId?: string;
  season?: number;
  week?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamFull?: string;
  awayTeamFull?: string;
  kickoff?: Date;
  homeWinProbability?: number; // 0-100
  awayWinProbability?: number; // 0-100
  predictedWinner?: string; // team abbr
  confidence?: number; // 0-100
  modelAccuracy?: number; // historical accuracy %
  homeTeamStats?: Record<string, number>; // pts_for, pts_against, win_rate, srs, sos
  awayTeamStats?: Record<string, number>;
  conditionLayers?: any[]; // array of condition layer objects
  historicalH2H?: any; // head-to-head record
  seasonRecords?: any;
  generatedAt?: Date;
  // internal meta document marker
  _type?: string;
  accuracy?: number;
  trainingSamples?: number;
  seasons?: number[];
  updatedAt?: Date;
}

export interface CollegePredictionDTO {
  _id: string;
  gameId?: string;
  slug?: string;
  espnId?: string;
  season?: number;
  week?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamFull?: string;
  awayTeamFull?: string;
  kickoff?: string; // ISO string
  homeWinProbability?: number;
  awayWinProbability?: number;
  predictedWinner?: string;
  confidence?: number;
  modelAccuracy?: number;
  homeTeamStats?: Record<string, number>;
  awayTeamStats?: Record<string, number>;
  conditionLayers?: any[];
  historicalH2H?: any;
  seasonRecords?: any;
  generatedAt?: Date;
  _type?: string;
  accuracy?: number;
  trainingSamples?: number;
  seasons?: number[];
  updatedAt?: Date;
}

const CollegePredictionSchema = new Schema<ICollegePrediction>(
  {
    gameId:             { type: Schema.Types.ObjectId, ref: "CollegeGame", index: true, sparse: true },
    slug:               { type: String, index: true, sparse: true },
    espnId:             { type: String },
    season:             { type: Number },
    week:               { type: Number },
    homeTeam:           { type: String },
    awayTeam:           { type: String },
    homeTeamFull:       { type: String },
    awayTeamFull:       { type: String },
    kickoff:            { type: Date },
    homeWinProbability: { type: Number },
    awayWinProbability: { type: Number },
    predictedWinner:    { type: String },
    confidence:         { type: Number },
    modelAccuracy:      { type: Number },
    homeTeamStats:      { type: Schema.Types.Mixed },
    awayTeamStats:      { type: Schema.Types.Mixed },
    conditionLayers:    [{ type: Schema.Types.Mixed }],
    historicalH2H:      { type: Schema.Types.Mixed },
    seasonRecords:      { type: Schema.Types.Mixed },
    generatedAt:        { type: Date, default: Date.now },
    _type:              { type: String, index: true, sparse: true },
    accuracy:           { type: Number },
    trainingSamples:    { type: Number },
    seasons:            [{ type: Number }],
  },
  { timestamps: true }
);

export default (models.CollegePrediction as mongoose.Model<ICollegePrediction>) ||
  model<ICollegePrediction>("CollegePrediction", CollegePredictionSchema);
