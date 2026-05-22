import { Type } from '@sinclair/typebox';

const MovieStatus = Type.Union([Type.Literal('planned'), Type.Literal('watched')], {
  description: "Watching status of the movie: 'planned' or 'watched'",
});

export const MovieSchema = Type.Object(
  {
    id: Type.String({ description: 'Mongo ObjectId of movie entity' }),
    title: Type.String({ minLength: 1, maxLength: 150, description: 'Title of the movie' }),
    rating: Type.Union([Type.Number({ minimum: 0, maximum: 10 }), Type.Null()], {
      description: 'Rating of the movie from 0 to 10, null if not rated yet',
    }),
    watchedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()], {
      description: 'ISO 8601 datetime when the movie was watched, null if not watched yet',
    }),
    status: MovieStatus,
    isFavorite: Type.Boolean({ description: 'Whether the movie is marked as a favourite' }),
  },
  { $id: 'Movie' },
);

// title is required on create; every other movie field has a server-side default
export const CreateMoviePayload = Type.Intersect(
  [
    Type.Pick(MovieSchema, ['title']),
    Type.Partial(Type.Omit(MovieSchema, ['id', 'title'])),
  ],
  { $id: 'CreateMoviePayload' },
);

export const MovieIdPayload = Type.Pick(MovieSchema, ['id'], {
  $id: 'MovieIdPayload',
});

export const MovieErrorResponse = Type.Object(
  { message: Type.String() },
  { $id: 'MovieErrorResponse' },
);

// all fields except id are optional on update
export const UpdateMoviePayload = Type.Partial(
  Type.Omit(MovieSchema, ['id']),
  { $id: 'UpdateMoviePayload' },
);

// reuse title / status / isFavorite from MovieSchema; add pagination + rating range
export const ListMoviePayload = Type.Object(
  {
    offset: Type.Number({ minimum: 0, description: 'Number of items to skip' }),
    limit: Type.Number({ minimum: 1, maximum: 20, description: 'Number of items to return' }),
    ...Type.Partial(Type.Pick(MovieSchema, ['title', 'status', 'isFavorite'])).properties,
    ratingFrom: Type.Optional(
      Type.Number({ minimum: 0, maximum: 10, description: 'Filter movies with rating >= this value' }),
    ),
    ratingTo: Type.Optional(
      Type.Number({ minimum: 0, maximum: 10, description: 'Filter movies with rating <= this value' }),
    ),
  },
  { $id: 'ListMoviePayload' },
);

export const ListMovieResponse = Type.Object(
  {
    count: Type.Number({ description: 'Total count of items matching the filter' }),
    items: Type.Array(Type.Ref(MovieSchema)),
  },
  { $id: 'ListMovieResponse' },
);
