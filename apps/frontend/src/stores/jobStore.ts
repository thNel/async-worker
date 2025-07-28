import { create } from 'zustand';
import { Job, JobStatus } from '@async-workers/shared-types';

interface JobStore {
  jobs: Record<string, Job>;

  all: () => Job[];
  byStatus: (status: JobStatus) => Job[];
  byId: (id: string) => Job | undefined;

  setAll: (jobs: Job[]) => void;
  setJob: (job: Job) => void;
  removeJob: (id: string) => void;
  updateGroup: (
    status: JobStatus,
    incoming: Job[],
    refetchMissing: (id: string) => void | Promise<void>
  ) => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: {},

  all: () => Object.values(get().jobs),

  byStatus: (status) =>
    Object.values(get().jobs).filter((j) => j.status === status),

  byId: (id) => get().jobs[id],

  setAll: (jobs) =>
    set({
      jobs: Object.fromEntries(jobs.map((j) => [j.id, j])),
    }),

  setJob: (job) =>
    set((state) => ({
      jobs: {
        ...state.jobs,
        [job.id]: job,
      },
    })),

  removeJob: (id) =>
    set((state) => {
      const { [id]: _, ...rest } = state.jobs;
      return { jobs: rest };
    }),

  updateGroup: (status, incoming, refetchMissing) => {
    const missingIds: Set<string> = new Set();
    set((state) => {
      const current = state.byStatus(status);
      const updated = { ...state.jobs };

      const incomingIds = new Set(incoming.map((j) => j.id));
      const knownIdsInGroup = new Set(current.map((j) => j.id));

      for (const job of incoming) {
        updated[job.id] = job;
      }

      for (const id of knownIdsInGroup) {
        if (!incomingIds.has(id)) {
          missingIds.add(id);
        }
      }

      return { jobs: updated };
    });
    for (const id of missingIds) {
      refetchMissing(id);
    }
  },
}));
