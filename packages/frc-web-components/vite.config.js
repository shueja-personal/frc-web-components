const { defineConfig } = require('vite');

module.exports = defineConfig({
  build: {
    lib: {
      name: 'frc-web-components',
      entry: 'src/index.ts',
      formats: ['es'],
    },
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['.'],
    },
  },
});
