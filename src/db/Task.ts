import { model, Schema, HydratedDocument } from 'mongoose';

export interface ITask {
  title: string;
  deadline: Date;
  isCompleted: boolean;
  id: string;
}

export const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isCompleted: {
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

export const Task = model<ITask>('Task', TaskSchema);

export type TaskDocument = HydratedDocument<ITask>;
