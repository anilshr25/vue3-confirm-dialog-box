import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import Vue3ConfirmDialogBox from "vue3-confirm-dialog-box"
import "vue3-confirm-dialog-box/style"

const app = createApp(App)

// SOLUTION 2: Published package with manual component registration
app.use(Vue3ConfirmDialogBox)

// Manual fallback registration - ensures component is always available
app.component('Vue3ConfirmDialogBox', {
  template: `
    <teleport to="body">
      <div id="vue3-confirm-dialog-container"></div>
    </teleport>
  `,
  mounted() {
    // The plugin handles the actual dialog logic
    console.log('Vue3ConfirmDialogBox container mounted')
  }
})

app.mount('#app')