import { Controller, Get, Param, Res } from '@nestjs/common';
import { JobService, JobSubscriber } from '../job/job.service';
import { Job } from '../entities/job';
import type { Response } from 'express';
import { JobStatus } from '@async-workers/shared-types';

@Controller('sse')
export class SseController {
  constructor(private readonly jobService: JobService) {}

  @Get(':id')
  async sse(@Param('id') id: string, @Res() res: Response) {
    const sendEvent = (event: string, data: string) => {
      res.write(`event: ${event}\ndata: ${data}\n\n`);
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // sendEvent('open', 'connection established');

    const sendUpdate: JobSubscriber = (
      job: Job,
      event = 'unknown-event',
      close?: boolean
    ) => {
      sendEvent(event, JSON.stringify(job));
      if (close) {
        sendEvent('stop', 'connection ended');
        return;
      }
    };

    const job = await this.jobService.findOne(id);
    if (job.status === JobStatus.Done) {
      sendUpdate(job, 'job-done', true);
      return;
    }

    const unsubscribe = () =>
      this.jobService.unsubscribeFromJob(id, sendUpdate);

    res.on('close', unsubscribe);

    this.jobService.subscribeToJob(id, sendUpdate);
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
    });
  }
}
