import axios from 'axios';
import type { Job, JobsSummary, JobsStats } from '@async-workers/shared-types';

export const api = axios.create({ baseURL: '/api' });

export const fetchJobs = async (): Promise<Job[]> => {
  const { data } = await api.get<Job[]>('/jobs');
  return data;
};

export const fetchJob = async (id: string): Promise<Job> => {
  const { data } = await api.get<Job>(`/jobs/${id}`);
  return data;
};

export const fetchJobsSummary = async (): Promise<JobsSummary> => {
  const { data } = await api.get<JobsSummary>('/jobs/summary');
  return data;
};

export const fetchJobsStats = async (range = '7d'): Promise<JobsStats[]> => {
  const { data } = await api.get<JobsStats[]>(`/jobs/stats?range=${range}`);
  return data;
};

export const createJob = async (name: string): Promise<Job> => {
  const { data } = await api.post<Job>('/jobs', { name });
  return data;
};
