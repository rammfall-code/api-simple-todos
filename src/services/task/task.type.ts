export interface TaskFilter {
  offset: number;
  limit: number;
  title?: string;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  isCompleted?: boolean;
}
