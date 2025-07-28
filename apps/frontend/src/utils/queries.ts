import { useQuery } from '@tanstack/react-query';
import { useJobStore } from '@/stores/jobStore';
import { DataAccess } from '@async-workers/data-access';
import { JobStatus } from '@async-workers/shared-types';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function useJobs(status?: JobStatus) {
  const store = useJobStore.getState();

  return useQuery({
    queryKey: ['jobs', status],
    queryFn: async () => {
      const jobs = await DataAccess.getAllJobs(status);
      if (status) {
        store.updateGroup(status, jobs, async (id) => {
          const job = await DataAccess.getJobById(id);
          store.setJob(job);
        });
      } else {
        store.setAll(jobs);
      }
      return jobs;
    },
  });
}

export function useJob(id: Insecure<string>) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const job = await DataAccess.getJobById(id!);
      useJobStore.getState().setJob(job);
      return job;
    },
    enabled: !!id,
  });
}
