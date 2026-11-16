import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js' // 明確指定路由入口，避免 Vite 無法解析資料夾入口

const app = createApp(App)

app.use(router) // 🔌 讓 Vue 專案啟用路由功能

app.mount('#app')