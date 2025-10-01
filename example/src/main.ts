import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import Vue3ConfirmDialogBox from 'vue3-confirm-dialog-box'

const app = createApp(App)

// Install published plugin and ensure component is registered under the
// name used in templates (Vue3ConfirmDialogBox)
app.use(Vue3ConfirmDialogBox, { componentName: 'Vue3ConfirmDialogBox' })

app.mount('#app')
