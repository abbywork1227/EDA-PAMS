import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router' // 📥 引入你剛剛手動建立的 router

const app = createApp(App)

app.use(router) // 🔌 讓 Vue 專案啟用路由功能

app.mount('#app')