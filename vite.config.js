import { resolve } from "path"
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import libCss from 'vite-plugin-libcss';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    libCss(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
      skipDiagnostics: true,
      logDiagnostics: false
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "Vue3ConfirmDialogBox",
      fileName: (format) => `vue3-confirm-dialog-box.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2015'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})