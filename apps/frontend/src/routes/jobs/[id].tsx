import { useParams } from 'react-router';
import { useJob } from '@/lib/queries';
import { useSseListener } from '@/hooks/useSseListener';
import { queryClient } from '@/lib/react-query';
import { Progress } from '@/components/ui/progress';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { data: job } = useJob(id || '');

  useSseListener({
    url: `/api/sse/${id}`,
    events: ['job-updated', 'job-done', 'job-canceled', 'stop'],
    queryClient,
  });

  if (!job) return <div>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{job.name}</h1>
      <div>Статус: {job.status}</div>
      {!!job.progress && <Progress value={job.progress} />}
      {!!job.logs.length && (
        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
          {job.logs.join('\n')}
        </pre>
      )}
    </div>
  );
}
