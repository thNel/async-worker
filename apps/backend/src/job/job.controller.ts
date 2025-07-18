import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { JobService } from './job.service';
import { Job } from '../entities/job';
import { CreateJobDto } from './dto/create-job.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async create(@Body() dto: CreateJobDto): Promise<Job> {
    return this.jobService.create(dto.name);
  }

  @Get()
  async findAll(): Promise<Job[]> {
    return this.jobService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobService.findOne(id);
  }

  @Post(':id/start')
  async start(@Param('id') id: string): Promise<Job> {
    await this.jobService.startJob(id);
    return this.jobService.findOne(id);
  }
}