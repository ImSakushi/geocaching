// serveur/models/Geocache.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  text?: string;
  date?: Date;
  likes: mongoose.Types.ObjectId[];
}

export interface IGeocache extends Document {
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  creator: mongoose.Types.ObjectId;
  difficulty: number;
  description?: string;
  password?: string; 
  comments: IComment[];
  likes: mongoose.Types.ObjectId[];
  foundBy: mongoose.Types.ObjectId[];
  photos: string[];
}

const CommentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  date: { type: Date, default: Date.now },
  likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }
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
  difficulty: { type: Number, required: true },
  description: { type: String },
  password: { type: String, default: '' }, 
  comments: [CommentSchema],
  likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  foundBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  photos: { type: [String], default: [] }
});

export default mongoose.model<IGeocache>('Geocache', GeocacheSchema);