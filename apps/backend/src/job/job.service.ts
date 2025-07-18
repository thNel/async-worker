import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job';
import { JobStatus } from '@async-workers/shared-types';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>
  ) {}

  private activeJobs: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, Set<(job: Job) => void>> = new Map();

  async create(name: string): Promise<Job> {
    const job = this.jobRepository.create({
      name,
      status: JobStatus.Queued,
    });
    return this.jobRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobRepository.find();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOneBy({ id });
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
    return job;
  }

  async updateProgress(id: string, progress: number, log: string): Promise<Job> {
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
        callback(updatedJob);
      }
    }

    return updatedJob;
  }

  async startJob(id: string): Promise<void> {
    const job = await this.findOne(id);
    if (job.status !== JobStatus.Queued && job.status !== JobStatus.Failed) return;

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
  }

  subscribeToJob(id: string, callback: (job: Job) => void): void {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }
    this.subscribers.get(id)?.add(callback);
  }

  unsubscribeFromJob(id: string, callback: (job: Job) => void): void {
    const jobSubscribers = this.subscribers.get(id);
    if (jobSubscribers) {
      jobSubscribers.delete(callback);
      if (jobSubscribers.size === 0) {
        this.subscribers.delete(id);
      }
    }
  }
}