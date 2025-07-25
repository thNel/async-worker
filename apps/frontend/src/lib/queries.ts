import { useQuery } from '@tanstack/react-query';
import { fetchJobs, fetchJob, fetchJobsSummary, fetchJobsStats } from './api';

export function useJobs() {
  return useQuery({ queryKey: ['jobs'], queryFn: fetchJobs });
}

export function useJob(id: string) {
  return useQuery({ queryKey: ['job', id], queryFn: () => fetchJob(id), enabled: !!id });
}

export function useJobsSummary() {
  return useQuery({ queryKey: ['jobs-summary'], queryFn: fetchJobsSummary });
}

export function useJobsStats(range = '7d') {
  return useQuery({ queryKey: ['jobs-stats', range], queryFn: () => fetchJobsStats(range) });
}
