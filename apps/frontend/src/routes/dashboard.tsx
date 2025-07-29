import { useJobsSummary, useJobsStats } from '@/utils/queries';

export default function DashboardPage() {
  const { data: summary } = useJobsSummary();
  const { data: stats } = useJobsStats();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-md shadow">
            <div className="text-sm text-muted-foreground">Всего</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </div>
          <div className="bg-card p-4 rounded-md shadow">
            <div className="text-sm text-muted-foreground">Выполнено</div>
            <div className="text-2xl font-bold">{summary.done.count}</div>
          </div>
          <div className="bg-card p-4 rounded-md shadow">
            <div className="text-sm text-muted-foreground">В процессе</div>
            <div className="text-2xl font-bold">{summary.running.count}</div>
          </div>
          <div className="bg-card p-4 rounded-md shadow">
            <div className="text-sm text-muted-foreground">Ошибки</div>
            <div className="text-2xl font-bold">{summary.failed.count}</div>
          </div>
        </div>
      ) : (
        <div>Загрузка...</div>
      )}
      {stats ? (
        <pre className="bg-muted p-2 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(stats, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
