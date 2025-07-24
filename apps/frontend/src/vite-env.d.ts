/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client-react" />

declare module 'virtual:generated-pages-react' {
  import type { RouteObject } from 'react-router';
  const routes: RouteObject[];
  export default routes;
}
