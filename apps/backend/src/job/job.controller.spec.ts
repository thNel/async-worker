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

      jest.spyOn(jobService, 'create').mockResolvedValue(createdJob as any);

      const result = await controller.create(dto);
      expect(jobService.create).toHaveBeenCalledWith(dto.name);
      expect(result).toEqual(createdJob);
    });
  });

  describe('findAll', () => {
    it('should call jobService.findAll and return list of jobs', async () => {
      const jobs = [mockJob];

      jest.spyOn(jobService, 'findAll').mockResolvedValue(jobs as any);

      const result = await controller.findAll();
      expect(jobService.findAll).toHaveBeenCalled();
      expect(result).toEqual(jobs);
    });
  });

  describe('findOne', () => {
    it('should call jobService.findOne with id and return job', async () => {
      jest.spyOn(jobService, 'findOne').mockResolvedValue(mockJob as any);

      const result = await controller.findOne(mockJob.id);
      expect(jobService.findOne).toHaveBeenCalledWith(mockJob.id);
      expect(result).toEqual(mockJob);
    });
  });

  describe('start', () => {
    it('should call jobService.startJob with id', async () => {
      jest.spyOn(jobService, 'startJob').mockImplementation(async () => {});
      await controller.start(mockJob.id);
      expect(jobService.startJob).toHaveBeenCalledWith(mockJob.id);
    });
  });
});