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
    eventSource.addEventListener('job-update', (event) => {
      const data = JSON.parse(event.data);
      progress = data.progress;
    });
    eventSource.addEventListener('job-done', (event) => {
      console.log(event.type, event.data);
      done = true;
    });
    eventSource.addEventListener('stop', (event) => {
      console.log(event.type, event.data);
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

    eventSource.addEventListener('job-update', (event) => {
      const job: Job = JSON.parse(event.data);
      eventCount++;
      expect(job.id).toBe(jobId);
      expect(job.status).not.toBe(JobStatus.Done); // не должно быть завершено
    });

    eventSource.onopen = () => {
      axios.post(`/jobs/${jobId}/cancel`);
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
    expect(getRes.data.status).toBe(JobStatus.Cancelled);
  });
});
