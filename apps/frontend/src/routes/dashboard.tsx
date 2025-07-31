import { useState, useMemo } from 'react';
import { useJobsStats } from '@/utils/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RingChart from '@/components/ui/ring-chart';

export default function DashboardPage() {
  const [days, setDays] = useState(7);
  const { data: stats, isLoading } = useJobsStats(days);

  const totals = useMemo(() => {
    if (!stats) return { queued: 0, running: 0, done: 0, failed: 0 };
    return stats.reduce(
      (acc, d) => {
        acc.queued += d.queued.count;
        acc.running += d.running.count;
        acc.done += d.done.count;
        acc.failed += d.failed.count;
        return acc;
      },
      { queued: 0, running: 0, done: 0, failed: 0 }
    );
  }, [stats]);

  const totalCount = totals.queued + totals.running + totals.done + totals.failed;
  const segments = [
    { value: (totals.done / totalCount) * 100 || 0, colorClass: 'stroke-chart-1' },
    { value: (totals.running / totalCount) * 100 || 0, colorClass: 'stroke-chart-2' },
    { value: (totals.queued / totalCount) * 100 || 0, colorClass: 'stroke-chart-3' },
    { value: (totals.failed / totalCount) * 100 || 0, colorClass: 'stroke-chart-4' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={days === 7 ? 'default' : 'outline'} onClick={() => setDays(7)}>
          Неделя
        </Button>
        <Button size="sm" variant={days === 30 ? 'default' : 'outline'} onClick={() => setDays(30)}>
          Месяц
        </Button>
        <Button size="sm" variant={days === 365 ? 'default' : 'outline'} onClick={() => setDays(365)}>
          Год
        </Button>
        <Input
          type="number"
          min={1}
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 1)}
          className="w-20"
        />
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <RingChart segments={segments} />
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-chart-1" />
                Выполнено: {totals.done}
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-chart-2" />
                В процессе: {totals.running}
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-chart-3" />
                В очереди: {totals.queued}
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-chart-4" />
                Ошибки: {totals.failed}
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Дата</th>
                <th>Выполнено</th>
                <th>В процессе</th>
                <th>В очереди</th>
                <th>Ошибки</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((day) => (
                <tr key={day.startDate.toString()} className="border-b hover:bg-muted/50">
                  <td className="py-2">
                    {new Date(day.startDate).toLocaleDateString()}
                  </td>
                  <td>{day.done.count}</td>
                  <td>{day.running.count}</td>
                  <td>{day.queued.count}</td>
                  <td>{day.failed.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
