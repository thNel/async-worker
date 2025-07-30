import { useParams, Link } from 'react-router';
import { useSseListener } from '@/hooks/useSseListener';
import { useJob } from '@/utils/queries';
import { Progress } from '@/components/ui/progress';
import { JobStatus } from '@async-workers/shared-types';
import { Button } from '@/components/ui/button';
import { DataAccess } from '@async-workers/data-access';
import { useToast } from '@/hooks/useToast';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { data: job, isLoading } = useJob(id);
  const { toast } = useToast();

  useSseListener(id);

  if (isLoading) return <div>Загрузка...</div>;

  if (!job) return <div>Задача не найдена</div>;

  const handleStartJob = async () => {
    try {
      await DataAccess.startJob(job.id, () =>
        toast({
          title: 'Job started',
          description: job.name,
        })
      );
    } catch (e) {
      toast({ title: 'Ошибка запуска', variant: 'destructive' });
    }
  };

  const handleCancelJob = async () => {
    try {
      await DataAccess.cancelJob(job.id, () =>
        toast({
          title: 'Job canceled',
          description: job.name,
        })
      );
    } catch (e) {
      toast({ title: 'Ошибка отмены', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" asChild>
        <Link to="/jobs">Назад к списку</Link>
      </Button>
      <h1 className="text-2xl font-bold">{job.name}</h1>
      <div>Статус: {job.status}</div>
      {!!job.progress && <Progress value={job.progress} />}
      {job.status === JobStatus.Queued && (
        <Button variant="default" onClick={handleStartJob}>
          Запустить задачу
        </Button>
      )}
      {job.status === JobStatus.Running && (
        <Button variant="destructive" onClick={handleCancelJob}>
          Отменить задачу
        </Button>
      )}
      {!!job.logs.length && (
        <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
          {job.logs.join('\n')}
        </pre>
      )}
    </div>
  );
}
