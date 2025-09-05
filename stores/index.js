/**
 * @Description: pinia入口配置文件
 * @Author: elk
 * @Date: 2025-09-05 15:22:17
 * @LastEditors: 
 * @LastEditTime: 2025-09-05 15:22:17
 */
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist)          // 注册持久化插件
export default pinia