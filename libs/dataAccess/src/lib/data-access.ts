import axios from 'axios';
import {
  Job,
  JobsStats,
  JobsSummary,
  JobStatus,
} from '@async-workers/shared-types';

class DataAccess {
  private API = axios.create({ baseURL: '/api' });

  private handleError = (err: unknown): Promise<never> => {
    console.error('DataAccess error', err);
    if (axios.isAxiosError(err)) {
      return Promise.reject(err.response?.data?.message ?? err.message);
    }
    if (err instanceof Error) {
      return Promise.reject(err.message);
    }
    return Promise.reject(String(err));
  };

  public getAllJobs = async (status?: JobStatus): Promise<Job[]> => {
    try {
      const { data } = await this.API.get<Job[]>('/jobs', {
        params: { status },
      });
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public getJobById = async (id: Nullish<string>): Promise<Job> => {
    if (!id) {
      return Promise.reject('Job ID is required');
    }
    try {
      const { data } = await this.API.get<Job>(`/jobs/${id}`);
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public createJob = async (name: string): Promise<Job> => {
    try {
      const { data } = await this.API.post<Job>('/jobs', { name });
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public getJobsSummary = async (): Promise<JobsSummary> => {
    try {
      const { data } = await this.API.get<JobsSummary>('/jobs/summary');
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public getJobsStats = async (days = 7): Promise<JobsStats[]> => {
    try {
      const { data } = await this.API.get<JobsStats[]>(`/jobs/stats`, {
        params: { days },
      });
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public startJob = async (jobId: string, cb?: () => void): Promise<Job> => {
    try {
      const { data } = await this.API.post<Job>(`/jobs/${jobId}/start`);
      cb?.();
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };

  public cancelJob = async (jobId: string, cb?: () => void): Promise<Job> => {
    try {
      const { data } = await this.API.post<Job>(`/jobs/${jobId}/cancel`);
      cb?.();
      return data;
    } catch (err) {
      return this.handleError(err);
    }
  };
}

export default new DataAccess();
