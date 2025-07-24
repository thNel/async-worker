export enum JobStatus {
  Queued = 'queued',
  Running = 'running',
  Done = 'done',
  Failed = 'failed',
  Canceled = 'Canceled',
}

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  progress: number;
  logs: string[];
  createdAt: Date;
  updatedAt: Date;
}
