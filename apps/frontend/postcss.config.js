import { join } from 'path';

// Note: If you use library-specific PostCSS/Tailwind configuration then you should remove the `postcssConfig` build
// option from your application's configuration (i.e. project.json).
//
// See: https://nx.dev/guides/using-tailwind-css-in-react#step-4:-applying-configuration-to-libraries


/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    tailwindcss: {
      config: join(process.cwd(), 'apps/frontend/tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
