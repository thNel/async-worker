import { Link } from 'react-router';
import { useJobsQuery } from '@/utils/queries';
import { useSseListener } from '@/hooks/useSseListener';
import { useJobs } from '@/hooks/useJobStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import NewJob from '@/components/modals/newJob';

export default function JobsPage() {
  const { isLoading } = useJobsQuery();
  const jobs = useJobs();

  useSseListener('all');

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Dialog>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold">Задачи</h1>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <span className="text-2xl -mt-1.5">+</span>
            </Button>
          </DialogTrigger>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Название</th>
              <th>Статус</th>
              <th>Прогресс</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b hover:bg-muted/50">
                <td className="py-2">
                  <Link to={`/jobs/${job.id}`} className="underline">
                    {job.name}
                  </Link>
                </td>
                <td>{job.status}</td>
                <td>{job.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewJob />
    </Dialog>
  );
}
