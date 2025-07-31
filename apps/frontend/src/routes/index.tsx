import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function IndexPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Добро пожаловать в AsyncWorkers</h1>
        <p className="text-muted-foreground">Управляйте задачами и следите за их выполнением.</p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/dashboard">Перейти к дашборду</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/jobs">Список задач</Link>
        </Button>
      </div>
    </div>
  );
}
