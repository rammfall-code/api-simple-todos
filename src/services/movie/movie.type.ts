import { MovieStatus } from '../../db/Movie';

export interface MovieFilter {
  offset: number;
  limit: number;
  title?: string;
  status?: MovieStatus;
  isFavorite?: boolean;
  ratingFrom?: number;
  ratingTo?: number;
}
