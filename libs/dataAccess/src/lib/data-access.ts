import axios from 'axios';
import {
  Job,
  JobsStats,
  JobsSummary,
  JobStatus,
} from '@async-workers/shared-types';

class DataAccess {
  private API = axios.create({ baseURL: '/api' });

  public getAllJobs = async (status?: JobStatus): Promise<Job[]> => {
    const { data } = await this.API.get<Job[]>('/jobs', {
      params: { status },
    });
    return data;
  };

  public getJobById = async (id: Insecure<string>): Promise<Job> => {
    if (!id) {
      throw new Error('Job ID is required');
    }
    const { data } = await this.API.get<Job>(`/jobs/${id}`);
    return data;
  };

  public createJob = async (name: string): Promise<Job> => {
    const { data } = await this.API.post<Job>('/jobs', { name });
    return data;
  };

  public getJobsSummary = async (): Promise<JobsSummary> => {
    const { data } = await this.API.get<JobsSummary>('/jobs/summary');
    return data;
  };

  public getJobsStats = async (days = 7): Promise<JobsStats[]> => {
    const { data } = await this.API.get<JobsStats[]>(`/jobs/stats`, {
      params: { days },
    });
    return data;
  };

  public startJob = async (jobId: string, cb?: () => void): Promise<Job> => {
    const { data } = await this.API.post<Job>(`/jobs/${jobId}/start`);
    cb?.();
    return data;
  };

  public cancelJob = async (jobId: string, cb?: () => void): Promise<Job> => {
    const { data } = await this.API.post<Job>(`/jobs/${jobId}/cancel`);
    cb?.();
    return data;
  };
}

export default new DataAccess();
