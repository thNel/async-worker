import React from 'react';
import { Route, Routes } from 'react-router';
import AppLayout from './layout';

const HomePage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-3xl font-bold mb-4">
      Добро пожаловать в AsyncWorkers Dashboard
    </h1>
    <p className="text-muted-foreground mb-6">
      Здесь будет отображаться список фоновых задач.
    </p>
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-2">Начало работы</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Создайте новую задачу</li>
        <li>Отслеживайте прогресс выполнения</li>
        <li>Получайте уведомления о завершении</li>
      </ul>
    </div>
  </div>
);

const PageTwo: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Страница 2</h1>
    <p>Это вторая страница.</p>
  </div>
);

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />{' '}
        <Route path="page-2" element={<PageTwo />} />
      </Route>
    </Routes>
  );
}

export default App;
