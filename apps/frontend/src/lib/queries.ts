import { useQuery } from '@tanstack/react-query';
import { DataAccess } from '@async-workers/data-access';
import { JobStatus } from '@async-workers/shared-types';

export function useJobs(status?: JobStatus) {
  return useQuery({
    queryKey: ['jobs', status],
    queryFn: () => DataAccess.getAllJobs(status),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => DataAccess.getJobById(id),
    enabled: !!id,
  });
}

export function useJobsSummary() {
  return useQuery({
    queryKey: ['jobs-summary'],
    queryFn: DataAccess.getJobsSummary,
  });
}

export function useJobsStats(days = 7) {
  return useQuery({
    queryKey: ['jobs-stats', days],
    queryFn: () => DataAccess.getJobsStats(days),
  });
}
