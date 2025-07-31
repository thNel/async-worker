import { EventSource } from 'eventsource';
import axios from 'axios';
import { Job, JobStatus } from '@async-workers/shared-types';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('Job API', () => {
  let jobId: string;

  it('should create a job', async () => {
    const res = await axios.post<Job>('/jobs', { name: 'Test Task' });
    expect(res.status).toBe(201);
    expect(res.data.name).toBe('Test Task');
    jobId = res.data.id;
  });

  it('should get job by id', async () => {
    const res = await axios.get<Job>(`/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(jobId);
  });

  it('should start job', async () => {
    const res = await axios.post<Job>(`/jobs/${jobId}/start`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(jobId);
    expect(res.data.status).toBe(JobStatus.Running);
  });

  it('should receive job updates via SSE', async () => {
    const eventSource = new EventSource(
      `${axios.defaults.baseURL}/sse/${jobId}`
    );
    let progress = 0;
    let done = false;

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };
    eventSource.addEventListener('job-updated', (event) => {
      const data = JSON.parse(event.data);
      progress = data.progress;
    });
    eventSource.addEventListener('job-done', () => {
      done = true;
    });
    eventSource.addEventListener('stop', () => {
      eventSource.close();
    });

    await new Promise((resolve) => setTimeout(resolve, 6000));

    expect(progress).toBeGreaterThanOrEqual(100);
    expect(done).toBe(true);
  }, 10000);

  it('should cancel a running job and close SSE connection', async () => {
    const createRes = await axios.post<Job>('/jobs', {
      name: 'Cancel Test Task',
    });
    expect(createRes.status).toBe(201);
    const jobId = createRes.data.id;

    const startRes = await axios.post<Job>(`/jobs/${jobId}/start`);
    expect(startRes.status).toBe(200);
    expect(startRes.data.status).toBe(JobStatus.Running);

    let eventCount = 0;
    let sseClosed = false;

    const eventSource = new EventSource(
      `${axios.defaults.baseURL}/sse/${jobId}`
    );

    eventSource.addEventListener('job-updated', (event) => {
      const job: Job = JSON.parse(event.data);
      eventCount++;
      expect(job.id).toBe(jobId);
      expect(job.status).not.toBe(JobStatus.Done); // не должно быть завершено
    });

    eventSource.onopen = () => {
      setTimeout(() => axios.post(`/jobs/${jobId}/cancel`), 500);
    };

    await new Promise<void>((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (sseClosed) {
          clearInterval(checkClosed);
          resolve();
        }
      }, 100);

      eventSource.addEventListener('stop', () => {
        sseClosed = true;
        clearInterval(checkClosed);
        resolve();
      });

      eventSource.addEventListener('error', (error) => {
        eventSource.close();
        clearInterval(checkClosed);
        reject(error);
      });
    });

    expect(sseClosed).toBe(true);
    expect(eventCount).toBeGreaterThan(0);

    const getRes = await axios.get<Job>(`/jobs/${jobId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.data.status).toBe(JobStatus.Canceled);
  });

  describe('GET /jobs', () => {
    let createdJobId: string;

    beforeAll(async () => {
      // Создадим задачу для проверки, что список не пустой
      const res = await axios.post<Job>('/jobs', { name: 'List Test Task' });
      expect(res.status).toBe(201);
      createdJobId = res.data.id;
    });

    it('should return a list of jobs', async () => {
      const res = await axios.get<Job[]>('/jobs');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      // Проверим, что созданная задача есть в списке
      const foundJob = res.data.find((job) => job.id === createdJobId);
      expect(foundJob).toBeDefined();
      if (foundJob) {
        expect(foundJob.name).toBe('List Test Task');
      }
    });
  });

  describe('GET /jobs/summary', () => {
    it('should return job summary statistics', async () => {
      const res = await axios.get('/jobs/summary');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('total');
      expect(typeof res.data.total).toBe('number');
      expect(res.data).toHaveProperty('queued');
      expect(res.data).toHaveProperty('running');
      expect(res.data).toHaveProperty('done');
      expect(res.data).toHaveProperty('failed');
    });
  });
});

describe('GET /sse/all', () => {
  let jobIdForSseAll: string;

  beforeAll(async () => {
    const createRes = await axios.post<Job>('/jobs', {
      name: 'SSE All Test Task',
    });
    expect(createRes.status).toBe(201);
    jobIdForSseAll = createRes.data.id;
  });

  it('should receive updates for all jobs via SSE', async () => {
    const eventSource = new EventSource(`${axios.defaults.baseURL}/sse/all`);

    let receivedJobUpdateForSpecificId = false;

    eventSource.addEventListener('job-updated', (event) => {
      const data = JSON.parse(event.data);
      if (data.id === jobIdForSseAll) {
        receivedJobUpdateForSpecificId = true;
        expect(data.status).toBe(JobStatus.Running);
        expect(typeof data.progress).toBe('number');
      }
    });

    const timers: NodeJS.Timeout[] = [];

    const startRes = await axios.post<Job>(`/jobs/${jobIdForSseAll}/start`);
    expect(startRes.status).toBe(200);

    await Promise.race([
      new Promise<void>((resolve) => {
        const checkInterval = timers.push(
          setInterval(() => {
            if (receivedJobUpdateForSpecificId) {
              clearInterval(checkInterval);
              eventSource.close();
              for (const timer of timers) {
                clearInterval(timer);
                clearTimeout(timer);
              }
              resolve();
            }
          }, 500)
        );
      }),
      new Promise<void>((resolve) =>
        timers.push(
          setTimeout(() => {
            console.log('Timeout waiting for /sse/all events');
            eventSource.close();
            for (const timer of timers) {
              clearInterval(timer);
              clearTimeout(timer);
            }
            resolve();
          }, 5000)
        )
      ),
    ]);

    expect(receivedJobUpdateForSpecificId).toBe(true);
  }, 10000);
});
