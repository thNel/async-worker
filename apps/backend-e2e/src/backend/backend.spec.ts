import { EventSource } from 'eventsource';
import axios from 'axios';

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
    const res = await axios.post('/jobs', { name: 'Test Task' });
    expect(res.status).toBe(201);
    expect(res.data.name).toBe('Test Task');
    jobId = res.data.id;
  });

  it('should get job by id', async () => {
    const res = await axios.get(`/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(jobId);
  });

  it('should start job', async () => {
    const res = await axios.post(`/jobs/${jobId}/start`);
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(jobId);
  });

  it('should receive job updates via SSE', async () => {
    const eventSource = new EventSource(
      `${axios.defaults.baseURL}/sse/${jobId}`
    );
    let done = false;

    await new Promise<void>((resolve, reject) => {
      eventSource.onmessage = (event) => {
        const job = JSON.parse(event.data);
        if (job.progress === 100) {
          eventSource.close();
          resolve();
        }
      };
      eventSource.onerror = (err) => {
        reject(err);
      };
    });

    done = true;
    expect(done).toBe(true);
  }, 10000);
});
