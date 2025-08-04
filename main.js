import App from './App'

// 引入uview-plas 组件库
import uviewPlus from '@/uni_modules/uview-plus'


// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // 注入组件库
  app.use(uviewPlus)
  return {
    app
  }
}
// #endif