import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            includeDependenciesRecursively: true,
            groups: [
              {
                name: 'react',
                test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 30,
              },
              { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 20 },
              { name: 'react-three', test: /node_modules[\\/]@react-three[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
  },
});
