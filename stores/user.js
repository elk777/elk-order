/**
 * @Description: 用户信息状态管理
 * @Author: elk
 * @Date: 2025-09-05 15:24:18
 * @LastEditors: 
 * @LastEditTime: 2025-09-05 15:24:18
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userType = ref('0')   // 0 饲养员  1 吃货
    const profile = ref({})

    const setToken = (v) => (token.value = v)
    const setUserType = (v) => (userType.value = v)
    const setProfile = (v) => (profile.value = v)

    return { token, userType, profile, setToken, setUserType, setProfile }
  },
  {
    persist: {
      key: 'user',
      storage: {
        getItem: (k) => uni.getStorageSync(k),
        setItem: (k, v) => uni.setStorageSync(k, v),
      },
    },
  }
)