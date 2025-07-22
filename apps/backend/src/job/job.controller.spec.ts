import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobStatus } from '@async-workers/shared-types';
import { Job } from '../entities/job';

describe('JobController', () => {
  let controller: JobController;
  let jobService: JobService;

  const mockJob: Job = {
    id: '1',
    name: 'Test Task',
    status: JobStatus.Queued,
    progress: 0,
    logs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateProgress: jest.fn(),
            startJob: jest.fn(),
            subscribeToJob: jest.fn(),
            unsubscribeFromJob: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
    jobService = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call jobService.create with name and return job', async () => {
      const dto = { name: 'New Task' };
      const createdJob = { ...mockJob, name: dto.name };

      jest.spyOn(jobService, 'create').mockResolvedValue(createdJob as Job);

      const result = await controller.create(dto);
      expect(jobService.create).toHaveBeenCalledWith(dto.name);
      expect(result).toEqual(createdJob);
    });
  });

  describe('findAll', () => {
    it('should call jobService.findAll and return list of jobs', async () => {
      const jobs = [mockJob];

      jest.spyOn(jobService, 'findAll').mockResolvedValue(jobs as Job[]);

      const result = await controller.findAll();
      expect(jobService.findAll).toHaveBeenCalled();
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should call jobService.findOne with id and return job', async () => {
      jest.spyOn(jobService, 'findOne').mockResolvedValue(mockJob as Job);

      const result = await controller.findOne(mockJob.id);
      expect(jobService.findOne).toHaveBeenCalledWith(mockJob.id);
      expect(result).toEqual(mockJob);
    });
  });

  describe('start', () => {
    it('should call jobService.startJob with id', async () => {
      jest
        .spyOn(jobService, 'startJob')
        .mockImplementation(async () => mockJob);
      await controller.start(mockJob.id);
      expect(jobService.startJob).toHaveBeenCalledWith(mockJob.id);
    });
  });

  describe('getSummary', () => {
    it('should call jobService.findAll and return correct summary statistics', async () => {
      const mockJobs: Job[] = [
        { ...mockJob, id: '1', status: JobStatus.Queued, progress: 0 },
        { ...mockJob, id: '2', status: JobStatus.Running, progress: 50 },
        { ...mockJob, id: '3', status: JobStatus.Done, progress: 100 },
        { ...mockJob, id: '4', status: JobStatus.Failed, progress: 25 },
        { ...mockJob, id: '5', status: JobStatus.Queued, progress: 0 },
      ];

      (jobService.findAll as jest.Mock).mockResolvedValue(mockJobs);

      const result = await controller.getSummary();

      expect(jobService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        total: 5,
        queued: {
          count: 2,
          averageProgress: 0,
        },
        running: {
          count: 1,
          averageProgress: 50,
        },
        done: {
          count: 1,
          averageProgress: 100,
        },
        failed: {
          count: 1,
          averageProgress: 25,
        },
      });
    });

    it('should handle empty job list', async () => {
      (jobService.findAll as jest.Mock).mockResolvedValue([]);

      const result = await controller.getSummary();

      expect(jobService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        total: 0,
        queued: {
          count: 0,
          averageProgress: 0,
        },
        running: {
          count: 0,
          averageProgress: 0,
        },
        done: {
          count: 0,
          averageProgress: 0,
        },
        failed: {
          count: 0,
          averageProgress: 0,
        },
      });
    });

    it('should calculate correct averages for multiple jobs with same status', async () => {
      const mockJobs: Job[] = [
        { ...mockJob, id: '1', status: JobStatus.Running, progress: 20 },
        { ...mockJob, id: '2', status: JobStatus.Running, progress: 40 },
        { ...mockJob, id: '3', status: JobStatus.Running, progress: 60 },
      ];

      (jobService.findAll as jest.Mock).mockResolvedValue(mockJobs);

      const result = await controller.getSummary();

      expect(result.running.count).toBe(3);
      expect(result.running.averageProgress).toBeCloseTo(40); // (20 + 40 + 60) / 3
    });
  });
});
