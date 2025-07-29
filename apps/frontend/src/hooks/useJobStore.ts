import type { StateCreator } from 'zustand';
import { create } from 'zustand';
import { Job, JobStatus } from '@async-workers/shared-types';
import { useShallow } from 'zustand/react/shallow';
import { devtools } from 'zustand/middleware';

interface JobStoreType {
  jobs: Job[];

  getById: (id: string) => Job | undefined;
  getByStatus: (status: JobStatus) => Job[];

  setAll: (jobs: Job[]) => void;
  setJob: (job: Job) => void;
  removeJob: (id: string) => void;
  updateGroup: (
    status: JobStatus,
    incoming: Job[],
    refetchMissing: (id: string) => void | Promise<void>
  ) => void;
}

const jobStoreCreator: StateCreator<JobStoreType> = (set, get) => ({
  jobs: [],

  getById: (id) => get().jobs.find((j) => j.id === id),

  getByStatus: (status) => get().jobs.filter((j) => j.status === status),

  setAll: (jobs) => set({ jobs }),

  setJob: (job) =>
    set((state) => {
      const index = state.jobs.findIndex((j) => j.id === job.id);
      if (index === -1) {
        return { jobs: [...state.jobs, job] };
      }
      const updated = [...state.jobs];
      updated[index] = job;
      return { jobs: updated };
    }),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),

  updateGroup: (status, incoming, refetchMissing) => {
    const incomingIds = new Set(incoming.map((j) => j.id));
    const missingIds = new Set<string>();

    set((state) => {
      const preserved = state.jobs.filter((j) => j.status !== status);
      const known = state.jobs.filter((j) => j.status === status);
      for (const old of known) {
        if (!incomingIds.has(old.id)) {
          missingIds.add(old.id);
        }
      }
      return { jobs: [...preserved, ...incoming] };
    });

    for (const id of missingIds) {
      refetchMissing(id);
    }
  },
});

const JobStore =
  import.meta.env.MODE === 'development'
    ? create<JobStoreType>()(devtools(jobStoreCreator, { name: 'JobStore' }))
    : create<JobStoreType>(jobStoreCreator);

export function useJobs() {
  return JobStore((state) => state.jobs);
}

export function useJobById(id: string) {
  return JobStore((state) => state.getById(id));
}

export function useJobByStatus(status: JobStatus) {
  return JobStore((state) => state.getByStatus(status));
}

export const useJobActions = () =>
  JobStore(
    useShallow((state) => ({
      setAll: state.setAll,
      setJob: state.setJob,
      removeJob: state.removeJob,
      updateGroup: state.updateGroup,
    }))
  );
