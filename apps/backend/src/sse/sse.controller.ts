import { Controller, Get, Param, Res } from '@nestjs/common';
import { JobService, JobSubscriber } from '../job/job.service';
import { Job } from '../entities/job';
import type { Response } from 'express';
import { JobStatus } from '@async-workers/shared-types';

@Controller('sse')
export class SseController {
  constructor(private readonly jobService: JobService) {}

  private closeConnection =
    (id: string, cb: (job: Job) => void, res: Response) => () => {
      this.jobService.unsubscribeFromJob(id, cb);
      res.end();
    };

  @Get(':id')
  async sse(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate: JobSubscriber = (
      job: Job,
      event = 'unknown-event',
      close?: boolean
    ) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(job)}\n\n`);
      if (job.status === JobStatus.Done) {
        this.closeConnection(id, sendUpdate, res)();
      }
      if (close) {
        res.end();
      }
    };

    await this.jobService.subscribeToJob(id, sendUpdate);

    res.on('close', this.closeConnection(id, sendUpdate, res));
  }

  @Get('all')
  async sseAll(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate: JobSubscriber = (job: Job, event = 'unknown-event') => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(job)}\n\n`);
    };

    await this.jobService.subscribeToAllJobs(sendUpdate);

    res.on('close', () => {
      this.jobService.unsubscribeFromAllJobs(sendUpdate);
      res.end();
    });
  }
}
