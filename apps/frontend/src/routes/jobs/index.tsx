import { Link } from 'react-router';
import { useJobs } from '@/lib/queries';
import { useSseListener } from '@/hooks/useSseListener';
import { queryClient } from '@/lib/react-query';

export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs();

  useSseListener({
    url: '/api/sse/all',
    events: ['job-updated', 'job-done', 'job-canceled'],
    queryClient,
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Задачи</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Название</th>
            <th>Статус</th>
            <th>Прогресс</th>
          </tr>
        </thead>
        <tbody>
          {jobs?.map((job) => (
            <tr key={job.id} className="border-b hover:bg-muted/50">
              <td className="py-2">
                <Link to={`/jobs/${job.id}`} className="underline">
                  {job.name}
                </Link>
              </td>
              <td>{job.status}</td>
              <td>{job.progress}%</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
