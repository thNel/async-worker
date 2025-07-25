import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
  RouteObject,
  IndexRouteObject,
} from 'react-router';
import routes from '~react-pages';
import Layout from '@/layout';
import './styles.css';

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
    <RouterProvider router={router} />
  </StrictMode>
);
