import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../entities/job';
import { JobService, JobSubscriber } from './job.service';
import { Repository } from 'typeorm';
import { JobStatus } from '@async-workers/shared-types';

describe('JobService', () => {
  let service: JobService;
  let repository: Repository<Job>;
  let mockJob: Job;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(Job),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    repository = module.get<Repository<Job>>(getRepositoryToken(Job));

    mockJob = {
      id: '1',
      name: 'Test Task',
      status: JobStatus.Queued,
      progress: 0,
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Мокаем часто используемые методы
    repository.create = jest
      .fn()
      .mockReturnValue({ ...mockJob, status: JobStatus.Queued });
    repository.save = jest.fn().mockImplementation((job) => {
      mockJob = job;
      return Promise.resolve({ ...job } as Job);
    });
    repository.findOneBy = jest.fn().mockImplementation((where) => {
      if (where.id === mockJob.id) return Promise.resolve(mockJob);
      return Promise.resolve(undefined);
    });
    repository.find = jest.fn().mockReturnValue([mockJob]);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    service['activeJobs'].clear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a job', async () => {
    const result = await service.create(mockJob.name);
    expect(result.name).toBe(mockJob.name);
    expect(result.status).toBe(JobStatus.Queued);
  });

  it('should throw error if job not found', async () => {
    await expect(service.findOne('invalid-id')).rejects.toThrow();
  });

  it('should find a job by id', async () => {
    const result = await service.findOne(mockJob.id);
    expect(result).toEqual(mockJob);
  });

  it('should update job progress and add log', async () => {
    let subscriberResult: Job | null = null;
    service.subscribeToJob(mockJob.id, (job) => {
      subscriberResult = job;
    });

    expect(subscriberResult).toBe(null);

    const result = await service.updateProgress(
      mockJob.id,
      50,
      'Progress updated to 50%'
    );

    expect(subscriberResult).toBe(result);
    expect(result.progress).toBe(50);
    expect(result.logs).toContain('Progress updated to 50%');
  });

  it('should set status to Done if progress is 100', async () => {
    let subscriberResult: Job | null = null;
    const subscriber = (job: Job) => {
      subscriberResult = job;
    };
    service.subscribeToJob(mockJob.id, subscriber);

    expect(subscriberResult).toBe(null);

    const result50 = await service.updateProgress(
      mockJob.id,
      50,
      'Progress updated to 50%'
    );

    expect(subscriberResult).toBe(result50);
    expect(result50.progress).toBe(50);
    expect(result50.logs).toContain('Progress updated to 50%');

    service.unsubscribeFromJob(mockJob.id, subscriber);

    const result100 = await service.updateProgress(
      mockJob.id,
      100,
      'Completed'
    );

    expect(subscriberResult).toBe(result50);
    expect(subscriberResult).not.toBe(result100);

    expect(result100.progress).toBe(100);
    expect(result100.logs).toContain('Completed');
    expect(result100.status).toBe(JobStatus.Done);
  });

  it('should not notify unsubscribed callback', async () => {
    let called = false;
    const callback: JobSubscriber = () => {
      called = true;
    };

    await service.subscribeToJob(mockJob.id, callback);
    service.unsubscribeFromJob(mockJob.id, callback);

    await service.updateProgress(mockJob.id, 50, 'Progress updated');

    expect(called).toBe(false);
  });

  it('should notify all subscribers', async () => {
    let called1 = false;
    let called2 = false;

    const cb1 = () => {
      called1 = true;
    };
    const cb2 = () => {
      called2 = true;
    };

    service.subscribeToJob(mockJob.id, cb1);
    service.subscribeToJob(mockJob.id, cb2);

    await service.updateProgress(mockJob.id, 50, 'Progress updated');

    expect(called1).toBe(true);
    expect(called2).toBe(true);
  });

  it('should start job if status is Queued', async () => {
    await service.startJob('1');

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: JobStatus.Running })
    );
  });

  it('should start job and complete progress', async () => {
    const updateProgressSpy = jest.spyOn(service, 'updateProgress');

    expect(mockJob).toHaveProperty('status', JobStatus.Queued);
    expect(mockJob).toHaveProperty('progress', 0);

    await service.startJob('1');

    await jest.runOnlyPendingTimersAsync();

    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: JobStatus.Running, progress: 10 })
    );

    // Вызываем ещё 9 раз для достижения 100%
    for (let i = 1; i < 10; i++) {
      await jest.runOnlyPendingTimersAsync();
    }

    expect(repository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: JobStatus.Done })
    );

    expect(updateProgressSpy).toHaveBeenCalledTimes(10);

    expect(service['activeJobs'].has('1')).toBe(false);
  });

  it('should notify subscribers with job-canceled and close flag on cancel', async () => {
    const callback = jest.fn();
    service['subscribers'].set(mockJob.id, new Set([callback]));

    // Сначала запускаем задачу
    await service.startJob(mockJob.id);

    await service.cancelJob(mockJob.id);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ status: JobStatus.Cancelled }),
      'job-canceled',
      true
    );
  });

  it('should call subscriber with event "job-update"', async () => {
    const callback = jest.fn();
    service.subscribeToJob(mockJob.id, callback);

    await service.updateProgress(mockJob.id, 50, 'Halfway');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 50 }),
      'job-update'
    );
  });

  it('should send job-done event when progress reaches 100', async () => {
    const callback = jest.fn();
    service.subscribeToJob(mockJob.id, callback);

    await service.updateProgress(mockJob.id, 100, 'Completed');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ status: JobStatus.Done }),
      'job-done',
      true
    );
  });

  it('should send job-done event when subscribing to all jobs and job is done', async () => {
    mockJob.status = JobStatus.Done;
    const callback = jest.fn();

    await service.subscribeToAllJobs(callback);

    expect(callback).toHaveBeenCalledWith(mockJob, 'job-done');
  });

  it('should subscribe to updates for running job via subscribeToAllJobs', async () => {
    mockJob.status = JobStatus.Running;
    const callback = jest.fn();

    await service.subscribeToAllJobs(callback);

    await service.updateProgress(mockJob.id, 50, 'Halfway');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 50 }),
      'job-update'
    );
  });

  it('should unsubscribe from all jobs', () => {
    const callback = jest.fn();
    service['subscribers'].set('1', new Set([callback]));
    service['subscribers'].set('2', new Set([callback]));

    service.unsubscribeFromAllJobs(callback);

    expect(service['subscribers'].get('1')).toBeUndefined();
    expect(service['subscribers'].get('2')).toBeUndefined();
  });
});
