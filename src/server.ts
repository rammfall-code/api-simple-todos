import { initializeServer } from './initializers/initializeServer';
import {
  CreateTaskPayload,
  ListTaskPayload,
  ListTaskResponse,
  TaskErrorResponse,
  TaskIdPayload,
  TaskSchema,
  UpdateTaskPayload,
} from './schemas/task.schema';
import {
  CreateMoviePayload,
  ListMoviePayload,
  ListMovieResponse,
  MovieErrorResponse,
  MovieIdPayload,
  MovieSchema,
  UpdateMoviePayload,
} from './schemas/movie.schema';
import { Static, Type } from '@sinclair/typebox';
import { taskService } from './services/task/task.service';
import { movieService } from './services/movie/movie.service';

export const server = await initializeServer();

const taskTags = ['Task'];

server.register(
  async (instance, opts) => {
    instance.post<{
      Body: Static<typeof CreateTaskPayload>;
      Reply: {
        201: Static<typeof TaskSchema>;
      };
    }>(
      '',
      {
        schema: {
          summary: 'Create task',
          description: 'Create task',
          tags: taskTags,
          body: Type.Ref(CreateTaskPayload),
          response: {
            201: Type.Ref(TaskSchema),
          },
        },
      },
      async (request, reply) => {
        const { title, deadline } = request.body;
        const task = await taskService.create({
          title,
          deadline: new Date(deadline),
        });

        reply
          .status(201)
          .send({ ...task, deadline: task.deadline.toISOString() });
      },
    );

    instance.get<{
      Params: Static<typeof TaskIdPayload>;
      Reply: {
        200: Static<typeof TaskSchema>;
        400: Static<typeof TaskErrorResponse>;
      };
    }>(
      '/:id',
      {
        schema: {
          tags: taskTags,
          summary: 'Get task',
          description: 'Get task',
          params: Type.Ref(TaskIdPayload),
          response: {
            200: Type.Ref(TaskSchema, { description: 'Success task object' }),
            400: Type.Ref(TaskErrorResponse, {
              description: 'Error if does not have object with this id',
            }),
          },
        },
      },
      async (request, reply) => {
        try {
          const task = await taskService.getOne({ id: request.params.id });

          reply
            .status(200)
            .send({ ...task, deadline: task.deadline.toISOString() });
        } catch (err) {
          if (err instanceof Error) {
            reply.status(400).send({ message: err.message });
          }
        }
      },
    );

    instance.get<{
      Querystring: Static<typeof ListTaskPayload>;
      Reply: { 200: Static<typeof ListTaskResponse> };
    }>(
      '',
      {
        schema: {
          tags: taskTags,
          summary: 'Get tasks',
          description: 'Get tasks',
          querystring: Type.Ref(ListTaskPayload),
          response: {
            200: Type.Ref(ListTaskResponse),
          },
        },
      },
      async (request, reply) => {
        const response = await taskService.getList({
          ...request.query,
          deadlineTo: request.query.deadlineTo
            ? new Date(request.query.deadlineTo)
            : undefined,
          deadlineFrom: request.query.deadlineFrom
            ? new Date(request.query.deadlineFrom)
            : undefined,
        });

        reply.status(200).send({
          ...response,
          items: response.items.map((task) => {
            return {
              ...task,
              deadline: task.deadline.toISOString(),
            };
          }),
        });
      },
    );

    instance.patch<{
      Params: Static<typeof TaskIdPayload>;
      Body: Static<typeof UpdateTaskPayload>;
      Reply: {
        200: Static<typeof TaskSchema>;
        400: Static<typeof TaskErrorResponse>;
      };
    }>(
      '/:id',
      {
        schema: {
          tags: taskTags,
          summary: 'Update task',
          description: 'Update task',
          body: Type.Ref(UpdateTaskPayload),
          params: Type.Ref(TaskIdPayload),
          response: {
            200: Type.Ref(TaskSchema),
            400: Type.Ref(TaskErrorResponse),
          },
        },
      },
      async (request, reply) => {
        try {
          const task = await taskService.updateOne({
            id: request.params.id,
            ...request.body,
            deadline: request.body.deadline
              ? new Date(request.body.deadline)
              : undefined,
          });

          reply.status(200).send({
            ...task,
            deadline: task.deadline.toISOString(),
          });
        } catch (err) {
          if (err instanceof Error) {
            reply.status(400).send({ message: err.message });
          }
        }
      },
    );

    instance.delete<{ Params: Static<typeof TaskIdPayload> }>(
      '/:id',
      {
        schema: {
          tags: taskTags,
          summary: 'Delete task',
          description: 'Delete task',
          params: Type.Ref(TaskIdPayload),
        },
      },
      async (request, reply) => {
        await taskService.deleteOne({ id: request.params.id });

        reply.status(201).send();
      },
    );
  },
  {
    prefix: '/api/v1/task',
  },
);

server.addSchema(TaskSchema);
server.addSchema(CreateTaskPayload);
server.addSchema(ListTaskResponse);
server.addSchema(TaskIdPayload);
server.addSchema(TaskErrorResponse);
server.addSchema(ListTaskPayload);
server.addSchema(UpdateTaskPayload);

// ─── Movie schemas ────────────────────────────────────────────────────────────
server.addSchema(MovieSchema);
server.addSchema(CreateMoviePayload);
server.addSchema(MovieIdPayload);
server.addSchema(MovieErrorResponse);
server.addSchema(UpdateMoviePayload);
server.addSchema(ListMoviePayload);
server.addSchema(ListMovieResponse);

// ─── Movie routes ─────────────────────────────────────────────────────────────
const movieTags = ['Movie'];

server.register(
  async (instance) => {
    // POST /api/v1/movie
    instance.post<{
      Body: Static<typeof CreateMoviePayload>;
      Reply: { 201: Static<typeof MovieSchema> };
    }>(
      '',
      {
        schema: {
          summary: 'Create movie',
          description: 'Create a new movie entry',
          tags: movieTags,
          body: Type.Ref(CreateMoviePayload),
          response: {
            201: Type.Ref(MovieSchema),
          },
        },
      },
      async (request, reply) => {
        const { title, rating, watchedAt, status, isFavorite } = request.body;

        const movie = await movieService.create({
          title,
          rating: rating ?? null,
          watchedAt: watchedAt ? new Date(watchedAt) : null,
          status,
          isFavorite,
        });

        reply.status(201).send(serializeMovie(movie));
      },
    );

    // GET /api/v1/movie/:id
    instance.get<{
      Params: Static<typeof MovieIdPayload>;
      Reply: {
        200: Static<typeof MovieSchema>;
        400: Static<typeof MovieErrorResponse>;
      };
    }>(
      '/:id',
      {
        schema: {
          summary: 'Get movie',
          description: 'Get a single movie by id',
          tags: movieTags,
          params: Type.Ref(MovieIdPayload),
          response: {
            200: Type.Ref(MovieSchema, { description: 'Movie object' }),
            400: Type.Ref(MovieErrorResponse, { description: 'Not found error' }),
          },
        },
      },
      async (request, reply) => {
        try {
          const movie = await movieService.getOne({ id: request.params.id });
          reply.status(200).send(serializeMovie(movie));
        } catch (err) {
          if (err instanceof Error) {
            reply.status(400).send({ message: err.message });
          }
        }
      },
    );

    // GET /api/v1/movie
    instance.get<{
      Querystring: Static<typeof ListMoviePayload>;
      Reply: { 200: Static<typeof ListMovieResponse> };
    }>(
      '',
      {
        schema: {
          summary: 'Get movies',
          description: 'Get a paginated list of movies with optional filters',
          tags: movieTags,
          querystring: Type.Ref(ListMoviePayload),
          response: {
            200: Type.Ref(ListMovieResponse),
          },
        },
      },
      async (request, reply) => {
        const response = await movieService.getList(request.query);

        reply.status(200).send({
          count: response.count,
          items: response.items.map(serializeMovie),
        });
      },
    );

    // PATCH /api/v1/movie/:id
    instance.patch<{
      Params: Static<typeof MovieIdPayload>;
      Body: Static<typeof UpdateMoviePayload>;
      Reply: {
        200: Static<typeof MovieSchema>;
        400: Static<typeof MovieErrorResponse>;
      };
    }>(
      '/:id',
      {
        schema: {
          summary: 'Update movie',
          description: 'Partially update a movie by id',
          tags: movieTags,
          params: Type.Ref(MovieIdPayload),
          body: Type.Ref(UpdateMoviePayload),
          response: {
            200: Type.Ref(MovieSchema),
            400: Type.Ref(MovieErrorResponse),
          },
        },
      },
      async (request, reply) => {
        try {
          const { watchedAt, rating, ...rest } = request.body;

          const movie = await movieService.updateOne({
            id: request.params.id,
            ...rest,
            rating: rating !== undefined ? rating : undefined,
            watchedAt: watchedAt !== undefined
              ? watchedAt === null ? null : new Date(watchedAt)
              : undefined,
          });

          reply.status(200).send(serializeMovie(movie));
        } catch (err) {
          if (err instanceof Error) {
            reply.status(400).send({ message: err.message });
          }
        }
      },
    );

    // DELETE /api/v1/movie/:id
    instance.delete<{ Params: Static<typeof MovieIdPayload> }>(
      '/:id',
      {
        schema: {
          summary: 'Delete movie',
          description: 'Delete a movie by id',
          tags: movieTags,
          params: Type.Ref(MovieIdPayload),
        },
      },
      async (request, reply) => {
        await movieService.deleteOne({ id: request.params.id });
        reply.status(204).send();
      },
    );
  },
  { prefix: '/api/v1/movie' },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function serializeMovie(movie: {
  id: string;
  title: string;
  rating: number | null;
  watchedAt: Date | null;
  status: 'planned' | 'watched';
  isFavorite: boolean;
}) {
  return {
    ...movie,
    watchedAt: movie.watchedAt ? movie.watchedAt.toISOString() : null,
  };
}
