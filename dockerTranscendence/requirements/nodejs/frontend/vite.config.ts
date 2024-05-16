import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
// })

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});

// import { defineConfig } from 'vite'  a try for request token?
// import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [vue()],
//   build: {
//     target: 'es2015',
//     outDir: 'dist',
//     assetsDir: '',
//     minify: true,
//     server: {
//       chunkSize: 500 * 1024, // 500k
//       strictPort: true
//     }
//   }
// })
