import React from 'react';
import { useState } from 'react';
import { DataAccess } from '@async-workers/data-access';
import { useNavigate } from 'react-router';
import { toast } from '@/hooks/use-toast';

export default function NewJobPage() {
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <h1 className="text-2xl font-bold">Новая задача</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название"
        className="border px-2 py-1 rounded w-full"
      />
      <button type="submit" className="bg-primary text-white px-4 py-1 rounded">
        Создать
      </button>
    </form>
  );
}
