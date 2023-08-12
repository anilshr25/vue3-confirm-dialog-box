import { resolve } from "path"
import { defineConfig } from "vite";
import createVuePlugin from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [createVuePlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "vue3-confirm-dialog-box",
      fileName: "vue3-confirm-dialog-box",
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        }
      }
    }
  },
})
