export enum JobStatus {
  Queued = 'queued',
  Running = 'running',
  Done = 'done',
  Failed = 'failed',
  Canceled = 'canceled',
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

export interface JobStatusSummary {
  count: number;
  averageProgress: number;
}

export interface JobsSummary {
  total: number;
  queued: JobStatusSummary;
  running: JobStatusSummary;
  done: JobStatusSummary;
  failed: JobStatusSummary;
}

export interface JobsStats {
  startDate: Date;
  queued: JobStatusSummary;
  running: JobStatusSummary;
  done: JobStatusSummary;
  failed: JobStatusSummary;
}
