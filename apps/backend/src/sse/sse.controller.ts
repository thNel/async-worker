import { Controller, Get, Param, Res } from '@nestjs/common';
import { JobService } from '../job/job.service';
import { Job } from '../entities/job';
import type { Response } from 'express';

@Controller('sse')
export class SseController {
  constructor(private readonly jobService: JobService) {}

  @Get(':id')
  sse(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = (job: Job) => {
      res.write(`data: ${JSON.stringify(job)}\n\n`);
    };

    this.jobService.subscribeToJob(id, sendUpdate);

    res.on('close', () => {
      this.jobService.unsubscribeFromJob(id, sendUpdate);
      res.end();
    });
  }
}