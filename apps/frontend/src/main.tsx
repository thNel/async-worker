import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import routes from 'virtual:generated-pages-react';
import Layout from '@/layout';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes.map((route) => {
      if (route.path === '/') {
        return { ...route, index: true, path: undefined };
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
    <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
  </StrictMode>
);
