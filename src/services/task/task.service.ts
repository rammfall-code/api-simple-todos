import { ITask, Task, TaskDocument } from '../../db/Task';
import { FlattenMaps, RootFilterQuery } from 'mongoose';
import { TaskFilter } from './task.type';

class TaskService {
  async create({
    title,
    deadline,
  }: Pick<TaskDocument, 'title' | 'deadline'>): Promise<ITask> {
    const task = new Task({
      title,
      deadline,
    });

    await task.save();

    return {
      id: task.id,
      title: task.title,
      isCompleted: task.isCompleted,
      deadline: task.deadline,
    };
  }
  async getOne({ id }: Pick<TaskDocument, 'id'>): Promise<ITask> {
    const task = await Task.findOne({ _id: id }).exec();

    if (!task) {
      throw new Error('Not found');
    }

    return {
      id: task.id,
      title: task.title,
      isCompleted: task.isCompleted,
      deadline: task.deadline,
    };
  }

  async getList({
    offset,
    limit,
    title,
    deadlineTo,
    deadlineFrom,
    isCompleted,
  }: TaskFilter): Promise<{
    items: ITask[];
    count: number;
  }> {
    const filter: RootFilterQuery<TaskDocument> = {};

    if (title) {
      filter.title = new RegExp(title, 'i');
    }

    if (deadlineTo) {
      filter.deadline = { $lte: deadlineTo };
    }

    if (deadlineFrom) {
      filter.deadline = Object.assign(filter.deadline ?? {}, {
        $gte: deadlineFrom,
      });
    }

    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted;
    }

    const items = await Task.find(filter).limit(limit).skip(offset).exec();
    const count = await Task.countDocuments(filter);

    return {
      items: items.map((task) => {
        return {
          id: task.id,
          title: task.title,
          deadline: task.deadline,
          isCompleted: task.isCompleted,
        };
      }),
      count,
    };
  }

  async deleteOne({ id }: Pick<ITask, 'id'>): Promise<void> {
    await Task.deleteOne({ _id: id });
  }

  async updateOne({
    id,
    title,
    isCompleted,
    deadline,
  }: Partial<ITask> & Pick<ITask, 'id'>): Promise<ITask> {
    const task = await Task.findOne({ _id: id }).exec();
    const updateObj: Partial<ITask> = {};

    if (!task) {
      throw new Error('Not found');
    }

    if (title) {
      updateObj.title = title;
    }

    if (deadline) {
      updateObj.deadline = deadline;
    }

    if (isCompleted !== undefined) {
      updateObj.isCompleted = isCompleted;
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id },
      updateObj,
      { new: true }, // return the updated document
    ).exec();

    if (!updatedTask) {
      throw new Error('Not found');
    }

    return {
      id: updatedTask.id,
      title: updatedTask.title,
      isCompleted: updatedTask.isCompleted,
      deadline: updatedTask.deadline,
    };
  }
}

export const taskService = new TaskService();
