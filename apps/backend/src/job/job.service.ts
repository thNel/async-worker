import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Job } from '../entities/job';
import { JobsStats, JobStatus } from '@async-workers/shared-types';
import { addDays, startOfDay } from 'date-fns';

export type JobSubscriber = (job: Job, event?: string, close?: boolean) => void;

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>
  ) {}

  private activeJobs: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, Set<JobSubscriber>> = new Map();

  async create(name: string): Promise<Job> {
    const job = this.jobRepository.create({
      name,
      status: JobStatus.Queued,
    });
    return this.jobRepository.save(job);
  }

  // Возвращает все задачи, хранящиеся в репозитории
  async findAll(): Promise<Job[]> {
    return this.jobRepository.find();
  }

  async getStats(rangeDays = 7): Promise<JobsStats[]> {
    const start = startOfDay(addDays(new Date(), -(rangeDays - 1)));

    const jobs = await this.jobRepository.find({
      where: { createdAt: MoreThanOrEqual(start) },
    });

    const stats: Record<string, JobsStats> = {};

    for (const job of jobs) {
      const key = job.createdAt.toISOString().slice(0, 10);
      if (!stats[key]) {
        stats[key] = {
          startDate: startOfDay(job.createdAt),
          done: { count: 0, averageProgress: 0 },
          failed: { count: 0, averageProgress: 0 },
          running: { count: 0, averageProgress: 0 },
          queued: { count: 0, averageProgress: 0 },
        };
      }
      const day = stats[key];
      if (!day) continue;
      switch (job.status) {
        case JobStatus.Done:
          day.done.count++;
          day.done.averageProgress += job.progress;
          break;
        case JobStatus.Failed:
          day.failed.count++;
          day.failed.averageProgress += job.progress;
          break;
        case JobStatus.Running:
          day.running.count++;
          day.running.averageProgress += job.progress;
          break;
        case JobStatus.Queued:
          day.queued.count++;
          day.queued.averageProgress += job.progress;
          break;
      }
    }

    for (const day in stats) {
      stats[day].done.averageProgress = Math.round(
        stats[day].done.averageProgress / stats[day].done.count || 0
      );
      stats[day].failed.averageProgress = Math.round(
        stats[day].failed.averageProgress / stats[day].failed.count || 0
      );
      stats[day].running.averageProgress = Math.round(
        stats[day].running.averageProgress / stats[day].running.count || 0
      );
      stats[day].queued.averageProgress = Math.round(
        stats[day].queued.averageProgress / stats[day].queued.count || 0
      );
    }

    return Object.values(stats);
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    return job;
  }

  async updateProgress(
    id: string,
    progress: number,
    log: string
  ): Promise<Job> {
    const job = await this.findOne(id);
    job.progress = progress;
    job.logs.push(log);
    job.updatedAt = new Date();
    if (progress >= 100) job.status = JobStatus.Done;

    const updatedJob = await this.jobRepository.save(job);

    // Уведомляем всех подписчиков
    const subscribers = this.subscribers.get(id);
    if (subscribers) {
      for (const callback of subscribers) {
        callback(updatedJob, 'job-updated');
        if (job.status === JobStatus.Done) {
          callback(updatedJob, 'job-done', true);
        }
      }
    }

    return updatedJob;
  }

  async startJob(id: string): Promise<Job> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.Queued && job.status !== JobStatus.Failed)
      throw new BadRequestException(
        `Job with status "${job.status}" can't be started`
      );

    job.status = JobStatus.Running;
    await this.jobRepository.save(job);

    let progress = 0;

    // Заменить на реальный процесс выполнения задачи
    const interval = setInterval(async () => {
      progress += 10;
      const log = `Progress updated to ${progress}%`;
      await this.updateProgress(id, progress, log);

      if (progress >= 100) {
        clearInterval(interval);
        this.activeJobs.delete(id);
      }
    }, 500);

    this.activeJobs.set(id, interval);
    return job;
  }

  async cancelJob(id: string): Promise<Job> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.Running) {
      throw new BadRequestException(
        `Job with status "${job.status}" can't be canceled`
      );
    }

    job.status = JobStatus.Canceled;
    await this.jobRepository.save(job);

    const interval = this.activeJobs.get(id);
    if (interval) {
      clearInterval(interval);
      this.activeJobs.delete(id);
    }

    // Уведомляем всех подписчиков
    const subscribers = this.subscribers.get(id);
    if (subscribers) {
      for (const callback of subscribers) {
        this.unsubscribeFromJob(id, callback);
        callback(job, 'job-canceled', true);
      }
    }

    return job;
  }

  subscribeToJob(id: string, callback: JobSubscriber): void {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }
    this.subscribers.get(id)?.add(callback);
  }

  unsubscribeFromJob(id: string, callback: JobSubscriber): void {
    const jobSubscribers = this.subscribers.get(id);
    if (jobSubscribers) {
      jobSubscribers.delete(callback);
      if (jobSubscribers.size === 0) {
        this.subscribers.delete(id);
      }
    }
  }

  async subscribeToAllJobs(callback: JobSubscriber): Promise<void> {
    const jobs = await this.findAll();
    for (const job of jobs) {
      switch (job.status) {
        case JobStatus.Queued:
        case JobStatus.Running:
        case JobStatus.Failed:
          this.subscribeToJob(job.id, callback);
          break;
        case JobStatus.Done:
          callback(job, 'job-done');
          break;
        case JobStatus.Canceled:
          callback(job, 'job-canceled');
          break;
        default:
          throw new BadRequestException(
            `Unknown job (${job.id}) status: ${job.status}`
          );
      }
    }
  }

  unsubscribeFromAllJobs(callback: JobSubscriber): void {
    for (const [id, jobSubscribers] of this.subscribers.entries()) {
      jobSubscribers.delete(callback);
      if (jobSubscribers.size === 0) {
        this.subscribers.delete(id);
      }
    }
  }
}
