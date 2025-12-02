import { Type } from '@sinclair/typebox';

export const TaskSchema = Type.Object(
  {
    id: Type.String({ description: 'Mongo ObjectId of task entity' }),
    title: Type.String({
      minLength: 6,
      maxLength: 30,
      description: 'Title of the task',
    }),
    deadline: Type.String({
      format: 'date-time',
      description:
        'Deadline of the task after that you can not change completed',
    }),
    isCompleted: Type.Boolean({ description: 'Status of completing task' }),
  },
  {
    $id: 'Task',
  },
);

export const CreateTaskPayload = Type.Pick(TaskSchema, ['title', 'deadline'], {
  $id: 'TaskCreatePayload',
});

export const TaskIdPayload = Type.Pick(TaskSchema, ['id'], {
  $id: 'TaskIdPayload',
});

export const TaskErrorResponse = Type.Object(
  {
    message: Type.String(),
  },
  {
    $id: 'TaskErrorResponse',
  },
);

export const ListTaskPayload = Type.Object(
  {
    offset: Type.Number({ minimum: 0 }),
    limit: Type.Number({ maximum: 20, minimum: 1 }),
    title: Type.Optional(
      Type.String({
        minLength: 2,
        maxLength: 30,
      }),
    ),
    deadlineFrom: Type.Optional(Type.String({ format: 'date-time' })),
    deadlineTo: Type.Optional(Type.String({ format: 'date-time' })),
    isCompleted: Type.Optional(Type.Boolean()),
  },
  { $id: 'ListTaskPayload' },
);

export const ListTaskResponse = Type.Object(
  {
    count: Type.Number({ description: 'Count of items for this request' }),
    items: Type.Array(Type.Ref(TaskSchema)),
  },
  {
    $id: 'TaskCreateResponse',
  },
);

export const UpdateTaskPayload = Type.Partial(
  Type.Pick(TaskSchema, ['title', 'isCompleted', 'deadline']),
  {
    $id: 'UpdateTaskPayload',
  },
);
