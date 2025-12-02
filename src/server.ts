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
import { Static, Type } from '@sinclair/typebox';
import { taskService } from './services/task/task.service';

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
