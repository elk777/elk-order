/*
 * @Author: elk
 * @Date: 2026-06-08
 * @FilePath: /hkt-applet/hooks/home/useHomeSkin.js
 * @Description: 首页背景换肤状态与持久化
 */

import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { getHomeSkin, saveHomeSkin, uploadHomeSkin } from '@/apis/home/skin.js'

const STORAGE_KEY = 'home_skin_wallpaper'

export const HOME_WALLPAPERS = [
	{
		id: 'warm-kitchen',
		name: '暖厨偏爱',
		type: 'preset',
		path: '/static/images/home/wallpapers/warm-kitchen.png',
		thumb: '/static/images/home/wallpapers/warm-kitchen.png',
	},
	{
		id: 'couple-table',
		name: '双人餐桌',
		type: 'preset',
		path: '/static/images/home/wallpapers/couple-table.png',
		thumb: '/static/images/home/wallpapers/couple-table.png',
	},
	{
		id: 'order-note',
		name: '点餐小票',
		type: 'preset',
		path: '/static/images/home/wallpapers/order-note.png',
		thumb: '/static/images/home/wallpapers/order-note.png',
	},
	{
		id: 'morning-bento',
		name: '早安便当',
		type: 'preset',
		path: '/static/images/home/wallpapers/morning-bento.png',
		thumb: '/static/images/home/wallpapers/morning-bento.png',
	},
]

const defaultSkin = HOME_WALLPAPERS[0]
const selectedSkin = ref({ ...defaultSkin })
const initialized = ref(false)
const saving = ref(false)
const uploading = ref(false)

export function useHomeSkin() {
	const bgPath = computed(() => selectedSkin.value.path || defaultSkin.path)

	async function initHomeSkin(force = false) {
		if (initialized.value && !force) return selectedSkin.value

		const cachedSkin = normalizeSkin(readLocalSkin())
		if (cachedSkin) {
			selectedSkin.value = cachedSkin
		}
		initialized.value = true

		const userStore = useUserStore()
		if (!userStore.isLogin) return selectedSkin.value

		try {
			const remoteSkin = normalizeSkin(await getHomeSkin())
			if (remoteSkin) {
				selectedSkin.value = remoteSkin
				writeLocalSkin(remoteSkin)
			}
		} catch (err) {
			console.warn('[home-skin] 获取远端壁纸失败，使用本地缓存', err)
		}

		return selectedSkin.value
	}

	async function applySkin(skin, options = {}) {
		const { remote = true, toast = true } = options
		const nextSkin = normalizeSkin(skin)
		if (!nextSkin) return null

		selectedSkin.value = nextSkin
		writeLocalSkin(nextSkin)

		if (toast) {
			uni.showToast({ title: '已切换壁纸', icon: 'none' })
		}

		if (remote) {
			await saveRemoteSkin(nextSkin)
		}

		return nextSkin
	}

	async function resetSkin() {
		return applySkin(defaultSkin)
	}

	async function chooseCustomSkin() {
		const filePath = await chooseImage()
		if (!filePath) return null

		uploading.value = true
		try {
			const uploadRes = await uploadHomeSkin(filePath)
			const remoteUrl = getImageUrl(uploadRes)
			if (remoteUrl) {
				return await applySkin({
					id: `custom_${Date.now()}`,
					name: '自定义壁纸',
					type: 'custom',
					path: remoteUrl,
					thumb: remoteUrl,
				})
			}
			throw new Error('上传响应缺少图片地址')
		} catch (err) {
			console.warn('[home-skin] 自定义壁纸上传失败，使用本地图片兜底', err)
			uni.showToast({ title: '上传失败，已使用本地图片', icon: 'none' })
			return applySkin({
				id: `local_${Date.now()}`,
				name: '本地壁纸',
				type: 'local',
				path: filePath,
				thumb: filePath,
			}, { remote: false, toast: false })
		} finally {
			uploading.value = false
		}
	}

	return {
		wallpapers: HOME_WALLPAPERS,
		selectedSkin,
		bgPath,
		saving,
		uploading,
		initHomeSkin,
		applySkin,
		resetSkin,
		chooseCustomSkin,
	}
}

async function saveRemoteSkin(skin) {
	const userStore = useUserStore()
	if (!userStore.isLogin) return

	saving.value = true
	try {
		await saveHomeSkin({
			id: skin.id,
			name: skin.name,
			type: skin.type,
			url: skin.path,
			thumb: skin.thumb || skin.path,
		})
	} catch (err) {
		console.warn('[home-skin] 保存远端壁纸失败，已保留本地缓存', err)
	} finally {
		saving.value = false
	}
}

function normalizeSkin(input) {
	const data = unwrapResponse(input)
	if (!data) return null

	if (typeof data === 'string') {
		return createCustomSkin(data)
	}

	const preset = HOME_WALLPAPERS.find((item) => item.id === data.id || item.path === data.path || item.path === data.url)
	if (preset) {
		return { ...preset }
	}

	const path = data.path || data.url || data.imageUrl || data.wallpaperUrl || data.thumb
	if (!path) return null

	return {
		id: data.id || `custom_${Date.now()}`,
		name: data.name || data.title || '自定义壁纸',
		type: data.type || 'custom',
		path,
		thumb: data.thumb || data.thumbnail || path,
	}
}

function createCustomSkin(path) {
	return {
		id: `custom_${Date.now()}`,
		name: '自定义壁纸',
		type: 'custom',
		path,
		thumb: path,
	}
}

function unwrapResponse(input) {
	if (!input) return null
	if (input.data?.skin) return input.data.skin
	if (input.data?.wallpaper) return input.data.wallpaper
	if (input.data) return input.data
	if (input.skin) return input.skin
	if (input.wallpaper) return input.wallpaper
	return input
}

function getImageUrl(input) {
	const data = unwrapResponse(input)
	if (!data) return ''
	if (typeof data === 'string') return data
	return data.url || data.path || data.imageUrl || data.fileUrl || data.thumb || ''
}

function readLocalSkin() {
	try {
		return uni.getStorageSync(STORAGE_KEY)
	} catch {
		return null
	}
}

function writeLocalSkin(skin) {
	try {
		uni.setStorageSync(STORAGE_KEY, skin)
	} catch (err) {
		console.warn('[home-skin] 写入本地壁纸缓存失败', err)
	}
}

function chooseImage() {
	return new Promise((resolve) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				resolve(res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path || '')
			},
			fail: () => resolve(''),
		})
	})
}
