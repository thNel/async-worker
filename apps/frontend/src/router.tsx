import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./routes/layout'),
    children: [
      {
        index: true,
        lazy: () => import('./routes'),
      },
      {
        path: 'page-2',
        lazy: () => import('./routes/page-2'),
      },
    ],
  },
  {
    path: '*',
    lazy: () => import('./routes/not-found'),
  },
]);
