import { QueryClient, useQuery } from '@tanstack/react-query';
import { useJobActions } from '@/hooks/useJobStore';
import { DataAccess } from '@async-workers/data-access';
import { JobStatus } from '@async-workers/shared-types';
import { useEffect } from 'react';

export const queryClient = new QueryClient();

export function useJobsQuery(status?: JobStatus) {
  const { updateGroup, setJob, setAll } = useJobActions();

  const query = useQuery({
    queryKey: ['jobs', status],
    queryFn: async () => await DataAccess.getAllJobs(status),
  });

  useEffect(() => {
    if (query.data) {
      if (status) {
        updateGroup(status, query.data, async (id) => {
          const job = await DataAccess.getJobById(id);
          setJob(job);
        });
      } else {
        setAll(query.data);
      }
    }
  }, [query.data, status, updateGroup, setAll, setJob]);

  return query;
}

export function useJob(id: Nullish<string>) {
  const { setJob } = useJobActions();

  const query = useQuery({
    queryKey: ['job', id],
    queryFn: async () => await DataAccess.getJobById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      setJob(query.data);
    }
  }, [query.data, setJob]);

  return query;
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
