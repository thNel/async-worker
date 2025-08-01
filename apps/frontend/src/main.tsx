import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  RouteObject,
  IndexRouteObject,
} from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import routes from '~react-pages';
import Layout from '@/layout';
import './styles.css';
import { queryClient } from '@/utils/queries';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes.map<RouteObject>((route): RouteObject => {
      if (route.path === '/') {
        return { ...route, index: true, path: undefined } as IndexRouteObject;
      }
      return route.path
        ? { ...route, path: route.path.replace(/^\//, '') }
        : route;
    }),
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
      {import.meta.env.MODE === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </StrictMode>
);
