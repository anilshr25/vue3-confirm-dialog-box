import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import Vue3ConfirmDialogBox from "../../src/index"

const app = createApp(App)

app.use(Vue3ConfirmDialogBox, {
  componentName: 'Vue3ConfirmDialogBox'
})

app.mount('#app')
