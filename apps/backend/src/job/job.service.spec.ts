import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Job } from '../entities/job';
import { JobService } from './job.service';
import { Repository } from 'typeorm';

describe('JobService', () => {
  let service: JobService;
  let repository: Repository<Job>;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a job', async () => {
    const mockJob = {
      id: '1',
      name: 'Test Task',
      status: 'queued',
      progress: 0,
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(repository, 'create').mockReturnValue(mockJob as any);
    jest.spyOn(repository, 'save').mockResolvedValue(mockJob as any);

    const result = await service.create('Test Task');
    expect(result.name).toBe('Test Task');
    expect(result.status).toBe('queued');
  });

  it('should throw error if job not found', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
    await expect(service.findOne('invalid-id')).rejects.toThrow();
  });

  it('should update job progress and log', async () => {
    const mockJob = {
      id: '1',
      name: 'Test Task',
      status: 'running',
      progress: 0,
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockJob as any);
    jest.spyOn(repository, 'save').mockResolvedValue({
      ...mockJob,
      progress: 50,
      logs: ['Progress updated to 50%'],
      updatedAt: new Date(),
    } as any);

    const result = await service.updateProgress('1', 50, 'Progress updated to 50%');

    expect(result.progress).toBe(50);
    expect(result.logs).toContain('Progress updated to 50%');
  });
});