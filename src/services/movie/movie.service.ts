import { IMovie, Movie, MovieDocument } from '../../db/Movie';
import { RootFilterQuery } from 'mongoose';
import { MovieFilter } from './movie.type';

class MovieService {
  async create({
    title,
    rating = null,
    watchedAt = null,
    status = 'planned',
    isFavorite = false,
  }: Pick<MovieDocument, 'title'> &
    Partial<Pick<MovieDocument, 'rating' | 'watchedAt' | 'status' | 'isFavorite'>>): Promise<IMovie> {
    const movie = new Movie({ title, rating, watchedAt, status, isFavorite });

    await movie.save();

    return this.toIMovie(movie);
  }

  async getOne({ id }: Pick<IMovie, 'id'>): Promise<IMovie> {
    const movie = await Movie.findOne({ _id: id }).exec();

    if (!movie) {
      throw new Error('Not found');
    }

    return this.toIMovie(movie);
  }

  async getList({
    offset,
    limit,
    title,
    status,
    isFavorite,
    ratingFrom,
    ratingTo,
  }: MovieFilter): Promise<{ items: IMovie[]; count: number }> {
    const filter: RootFilterQuery<MovieDocument> = {};

    if (title) {
      filter.title = new RegExp(title, 'i');
    }

    if (status !== undefined) {
      filter.status = status;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite;
    }

    if (ratingFrom !== undefined) {
      filter.rating = { $gte: ratingFrom };
    }

    if (ratingTo !== undefined) {
      filter.rating = Object.assign(filter.rating ?? {}, { $lte: ratingTo });
    }

    const items = await Movie.find(filter).limit(limit).skip(offset).exec();
    const count = await Movie.countDocuments(filter);

    return {
      items: items.map((movie) => this.toIMovie(movie)),
      count,
    };
  }

  async updateOne({
    id,
    title,
    rating,
    watchedAt,
    status,
    isFavorite,
  }: Partial<Omit<IMovie, 'id'>> & Pick<IMovie, 'id'>): Promise<IMovie> {
    const movie = await Movie.findOne({ _id: id }).exec();

    if (!movie) {
      throw new Error('Not found');
    }

    const updateObj: Partial<Omit<IMovie, 'id'>> = {};

    if (title !== undefined) updateObj.title = title;
    if (rating !== undefined) updateObj.rating = rating;
    if (watchedAt !== undefined) updateObj.watchedAt = watchedAt;
    if (status !== undefined) updateObj.status = status;
    if (isFavorite !== undefined) updateObj.isFavorite = isFavorite;

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: id },
      updateObj,
      { new: true },
    ).exec();

    if (!updatedMovie) {
      throw new Error('Not found');
    }

    return this.toIMovie(updatedMovie);
  }

  async deleteOne({ id }: Pick<IMovie, 'id'>): Promise<void> {
    await Movie.deleteOne({ _id: id });
  }

  private toIMovie(movie: MovieDocument): IMovie {
    return {
      id: movie.id,
      title: movie.title,
      rating: movie.rating,
      watchedAt: movie.watchedAt,
      status: movie.status,
      isFavorite: movie.isFavorite,
    };
  }
}

export const movieService = new MovieService();
