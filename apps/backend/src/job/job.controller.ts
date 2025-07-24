import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { Job } from '../entities/job';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsSummary, JobStatus } from '@async-workers/shared-types';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async create(@Body() dto: CreateJobDto): Promise<Job> {
    return this.jobService.create(dto.name);
  }

  @Get()
  async findAll(@Query('status') status?: JobStatus): Promise<Job[]> {
    const jobs = await this.jobService.findAll();
    if (status) {
      return jobs.filter((job) => job.status === status);
    }
    return jobs;
  }

  @Get('summary')
  async getSummary(): Promise<JobsSummary> {
    const allJobs = await this.jobService.findAll();

    const jobs = {
      queued: allJobs.filter((j) => j.status === JobStatus.Queued),
      running: allJobs.filter((j) => j.status === JobStatus.Running),
      done: allJobs.filter((j) => j.status === JobStatus.Done),
      failed: allJobs.filter((j) => j.status === JobStatus.Failed),
    };

    return {
      total: allJobs.length,
      queued: {
        count: jobs.queued.length,
        averageProgress: Math.round(
          jobs.queued.reduce((acc, job) => acc + job.progress, 0) /
            jobs.queued.length || 0
        ),
      },
      running: {
        count: jobs.running.length,
        averageProgress: Math.round(
          jobs.running.reduce((acc, job) => acc + job.progress, 0) /
            jobs.running.length || 0
        ),
      },
      done: {
        count: jobs.done.length,
        averageProgress: Math.round(
          jobs.done.reduce((acc, job) => acc + job.progress, 0) /
            jobs.done.length || 0
        ),
      },
      failed: {
        count: jobs.failed.length,
        averageProgress: Math.round(
          jobs.failed.reduce((acc, job) => acc + job.progress, 0) /
            jobs.failed.length || 0
        ),
      },
    };
  }

  @Get('stats')
  async getStats(@Query('range') range = '7d') {
    const match = /^(\d+)d$/.exec(range ?? '7d');
    const days = match ? parseInt(match[1], 10) : 7;
    return this.jobService.getStats(days);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobService.findOne(id);
  }

  @Post(':id/start')
  @HttpCode(200)
  async start(@Param('id') id: string): Promise<Job> {
    return await this.jobService.startJob(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  async cancel(@Param('id') id: string): Promise<Job> {
    return this.jobService.cancelJob(id);
  }
}
