import { Test, TestingModule } from '@nestjs/testing';
import { SseController } from './sse.controller';
import { JobService } from '../job/job.service';
import { Job } from '../entities/job';
import { JobStatus } from '@async-workers/shared-types';
import { Response } from 'express';

describe('SseController', () => {
  let controller: SseController;
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

  const mockRes: Partial<Response> = {
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn().mockImplementation(function (this: any, event: string, handler: () => void) {
      if (event === 'close') {
        handler();
      }
    }),
    setHeader: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SseController],
      providers: [
        {
          provide: JobService,
          useValue: {
            subscribeToJob: jest.fn(),
            unsubscribeFromJob: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SseController>(SseController);
    jobService = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sse', () => {
    it('should set correct headers', () => {
      controller.sse(mockJob.id, mockRes as Response);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    });

    it('should call jobService.subscribeToJob with correct id and callback', () => {
      const subscribeSpy = jest.spyOn(jobService, 'subscribeToJob');

      controller.sse(mockJob.id, mockRes as Response);

      expect(subscribeSpy).toHaveBeenCalledWith(mockJob.id, expect.any(Function));
    });

    it('should send job updates via res.write', () => {
      controller.sse(mockJob.id, mockRes as Response);

      // Имитируем обновление задачи
      const callback = (jobService.subscribeToJob as jest.Mock).mock.calls[0][1];
      callback(mockJob);

      expect(mockRes.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockJob)}\n\n`);
    });

    it('should call jobService.unsubscribeFromJob on connection close', () => {
      const unsubscribeSpy = jest.spyOn(jobService, 'unsubscribeFromJob');

      controller.sse(mockJob.id, mockRes as Response);

      // Имитируем закрытие соединения
      const closeHandler = (mockRes.on as jest.Mock).mock.calls.find(call => call[0] === 'close')?.[1];

      closeHandler?.();

      expect(unsubscribeSpy).toHaveBeenCalledWith(mockJob.id, expect.any(Function));
    });

    it('should end response on connection close', () => {
      controller.sse(mockJob.id, mockRes as Response);

      const closeHandler = (mockRes.on as jest.Mock).mock.calls.find(call => call[0] === 'close')?.[1];

      closeHandler?.();

      expect(mockRes.end).toHaveBeenCalled();
    });
  });
});