import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { DataAccess } from '@async-workers/data-access';
import { toast } from '@/hooks/useToast';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function NewJob(): ReactNode {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const job = await DataAccess.createJob(name);
      toast({ title: `Задача "${name}" создана` });
      navigate(`/jobs/${job.id}`);
    } catch {
      toast({ title: 'Ошибка создания', variant: 'destructive' });
    }
  };

  return (
    <DialogContent>
      <form onSubmit={handleSubmit} className="space-y-4 max-w">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
          <DialogDescription className="text-primary">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название"
              className="border px-2 py-1 rounded w-full"
            />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Отмена</Button>
          </DialogClose>
          <Button type="submit" variant="default">
            Создать
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
