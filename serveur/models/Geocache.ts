// models/Geocache.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IComment {
  user: mongoose.Types.ObjectId;
  text?: string;
  date?: Date;
}

export interface IGeocache extends Document {
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  creator: mongoose.Types.ObjectId;
  difficulty: number;
  description?: string;
  comments: IComment[];
}

const CommentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  date: { type: Date, default: Date.now }
});

const GeocacheSchema: Schema = new Schema({
  gpsCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  comments: [CommentSchema]
});

export default mongoose.model<IGeocache>('Geocache', GeocacheSchema);