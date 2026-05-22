import { model, Schema, HydratedDocument } from 'mongoose';

export type MovieStatus = 'planned' | 'watched';

export interface IMovie {
  id: string;
  title: string;
  rating: number | null;
  watchedAt: Date | null;
  status: MovieStatus;
  isFavorite: boolean;
}

export const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: null,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['planned', 'watched'],
      required: true,
      default: 'planned',
    },
    isFavorite: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    id: true,
    _id: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Movie = model<IMovie>('Movie', MovieSchema);

export type MovieDocument = HydratedDocument<IMovie>;
