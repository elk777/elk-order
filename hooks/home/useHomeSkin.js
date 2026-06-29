/*
 * @Author: elk
 * @Date: 2026-06-08
 * @FilePath: /hkt-applet/hooks/home/useHomeSkin.js
 * @Description: 首页背景换肤状态与持久化
 */

import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { getHomeSkin, saveHomeSkin, uploadHomeSkin } from '@/apis/home/skin.js'
import { getPointsOverview } from '@/apis/points.js'
import { normalizeMediaUrl } from '@/utils/media.js'

const STORAGE_KEY = 'home_skin_wallpaper'
export const HOME_SKIN_MEDIA_TYPES = {
	IMAGE: 'image',
	VIDEO: 'video',
}
export const HOME_SKIN_VIDEO_LIMIT_SECONDS = 10
const HOME_SKIN_COST_FALLBACK = 60

export const HOME_WALLPAPERS = [
	{
		id: 'warm-kitchen',
		name: '暖厨偏爱',
		type: 'preset',
		mediaType: HOME_SKIN_MEDIA_TYPES.IMAGE,
		path: '/static/images/home/wallpapers/warm-kitchen.jpg',
		thumb: '/static/images/home/wallpapers/warm-kitchen.jpg',
		legacyPath: '/static/images/home/wallpapers/warm-kitchen.png',
	},
	{
		id: 'couple-table',
		name: '双人餐桌',
		type: 'preset',
		mediaType: HOME_SKIN_MEDIA_TYPES.IMAGE,
		path: '/static/images/home/wallpapers/couple-table.jpg',
		thumb: '/static/images/home/wallpapers/couple-table.jpg',
		legacyPath: '/static/images/home/wallpapers/couple-table.png',
	},
	{
		id: 'order-note',
		name: '点餐小票',
		type: 'preset',
		mediaType: HOME_SKIN_MEDIA_TYPES.IMAGE,
		path: '/static/images/home/wallpapers/order-note.jpg',
		thumb: '/static/images/home/wallpapers/order-note.jpg',
		legacyPath: '/static/images/home/wallpapers/order-note.png',
	},
	{
		id: 'morning-bento',
		name: '早安便当',
		type: 'preset',
		mediaType: HOME_SKIN_MEDIA_TYPES.IMAGE,
		path: '/static/images/home/wallpapers/morning-bento.jpg',
		thumb: '/static/images/home/wallpapers/morning-bento.jpg',
		legacyPath: '/static/images/home/wallpapers/morning-bento.png',
	},
]

const defaultSkin = HOME_WALLPAPERS[0]
const selectedSkin = ref({ ...defaultSkin })
const initialized = ref(false)
const saving = ref(false)
const uploading = ref(false)

export function useHomeSkin() {
	const bgPath = computed(() => selectedSkin.value.path || defaultSkin.path)
	const mediaType = computed(() => selectedSkin.value.mediaType || HOME_SKIN_MEDIA_TYPES.IMAGE)
	const isVideoSkin = computed(() => mediaType.value === HOME_SKIN_MEDIA_TYPES.VIDEO)

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

		const shouldBlockRemote = remote && nextSkin.type === 'custom'
		if (shouldBlockRemote) {
			await saveRemoteSkin(nextSkin, { throwOnError: true })
		}

		selectedSkin.value = nextSkin
		writeLocalSkin(nextSkin)

		if (toast) {
			uni.showToast({ title: '已切换壁纸', icon: 'none' })
		}

		if (remote && !shouldBlockRemote) {
			await saveRemoteSkin(nextSkin)
		}

		return nextSkin
	}

	async function resetSkin() {
		return applySkin(defaultSkin)
	}

	async function fallbackToDefaultSkin() {
		if (selectedSkin.value?.id === defaultSkin.id) return selectedSkin.value
		return applySkin(defaultSkin, { remote: false, toast: false })
	}

	async function chooseCustomSkin(mediaType = HOME_SKIN_MEDIA_TYPES.IMAGE) {
		const canContinue = await confirmCustomSkinCost()
		if (!canContinue) return null

		const media = await chooseCustomMedia(mediaType)
		if (!media.path) return null

		if (media.mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO && !isVideoDurationValid(media.duration)) {
			uni.showToast({ title: `视频建议控制在${HOME_SKIN_VIDEO_LIMIT_SECONDS}秒内`, icon: 'none' })
			return null
		}

		const uploadPath = media.mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO
			? await compressVideoFile(media.path)
			: media.path

		uploading.value = true
		let uploadRes = null
		try {
			uploadRes = await uploadHomeSkin(uploadPath, media.mediaType)
			const remoteUrl = getMediaUrl(uploadRes)
			if (remoteUrl) {
				const remoteSkin = {
					id: getMediaId(uploadRes) || `custom_${Date.now()}`,
					name: media.mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO ? '动态壁纸' : '自定义壁纸',
					type: 'custom',
					mediaType: media.mediaType,
					path: remoteUrl,
					thumb: getMediaThumb(uploadRes) || remoteUrl,
					duration: media.duration,
				}
				return await applySkin(remoteSkin)
			}
			throw new Error('上传响应缺少资源地址')
		} catch (err) {
			if (uploadRes) {
				console.warn('[home-skin] 自定义壁纸保存失败', err)
				uni.showToast({ title: resolveErrorMessage(err, '保存失败，请稍后重试'), icon: 'none' })
				return null
			}
			console.warn('[home-skin] 自定义壁纸上传失败，使用本地文件兜底', err)
			const fallbackText = media.mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO ? '上传失败，已本地预览视频' : '上传失败，已使用本地图片'
			uni.showToast({ title: fallbackText, icon: 'none' })
			return applySkin({
				id: `local_${Date.now()}`,
				name: media.mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO ? '本地动态壁纸' : '本地壁纸',
				type: 'local',
				mediaType: media.mediaType,
				path: media.path,
				thumb: media.thumb || media.path,
				duration: media.duration,
			}, { remote: false, toast: false })
		} finally {
			uploading.value = false
		}
	}

	return {
		wallpapers: HOME_WALLPAPERS,
		selectedSkin,
		bgPath,
		mediaType,
		isVideoSkin,
		saving,
		uploading,
		initHomeSkin,
		applySkin,
		resetSkin,
		fallbackToDefaultSkin,
		chooseCustomSkin,
	}
}

async function saveRemoteSkin(skin, options = {}) {
	const { throwOnError = false } = options
	const userStore = useUserStore()
	if (!userStore.isLogin) return

	saving.value = true
	try {
		const res = await saveHomeSkin({
			id: skin.id,
			name: skin.name,
			type: skin.type,
			mediaType: skin.mediaType || HOME_SKIN_MEDIA_TYPES.IMAGE,
			url: skin.path,
			thumb: skin.thumb || skin.path,
			duration: skin.duration,
		})
		if (res?.code && res.code !== 200) {
			throw new Error(res.message || '保存壁纸失败')
		}
	} catch (err) {
		console.warn('[home-skin] 保存远端壁纸失败，已保留本地缓存', err)
		if (throwOnError) throw err
	} finally {
		saving.value = false
	}
}

async function confirmCustomSkinCost() {
	const userStore = useUserStore()
	if (!userStore.isLogin) return true

	let cost = HOME_SKIN_COST_FALLBACK
	try {
		const overview = await getPointsOverview()
		if (overview?.code !== 200 || !overview?.data) {
			throw new Error(overview?.message || '积分概览加载失败')
		}
		const data = overview?.data || {}
		const currentPoints = Number(data.account?.currentPoints || 0)
		const benefit = (data.benefits || []).find((item) => item.id === 'kitchen-skin')
		cost = Number(benefit?.cost || HOME_SKIN_COST_FALLBACK)
		if (currentPoints < cost) {
			uni.showToast({ title: '积分不足，先去完成任务吧', icon: 'none' })
			return false
		}
	} catch (error) {
		console.warn('[home-skin] 获取积分概览失败，继续交给后端兜底', error)
	}

	return new Promise((resolve) => {
		uni.showModal({
			title: '厨房装扮',
			content: `保存新的自定义壁纸将消耗 ${cost} 积分，是否继续？`,
			confirmText: '继续',
			cancelText: '再想想',
			success: (res) => resolve(!!res.confirm),
			fail: () => resolve(false),
		})
	})
}

function normalizeSkin(input) {
	const data = unwrapResponse(input)
	if (!data) return null

	if (typeof data === 'string') {
		return createCustomSkin(data)
	}

	const preset = HOME_WALLPAPERS.find((item) => {
		const skinPath = normalizePresetPath(data.path || data.url || data.thumb)
		return (
			item.id === data.id ||
			normalizePresetPath(item.path) === skinPath ||
			normalizePresetPath(item.legacyPath) === skinPath
		)
	})
	if (preset) {
		return { ...preset }
	}

	const path = normalizeMediaUrl(data.path || data.url || data.imageUrl || data.wallpaperUrl || data.thumb)
	if (!path) return null
	const mediaType = resolveMediaType(data, path)
	const thumb = normalizeMediaUrl(data.thumb || data.thumbnail || path)

	return {
		id: data.id || `custom_${Date.now()}`,
		name: data.name || data.title || '自定义壁纸',
		type: data.type || 'custom',
		mediaType,
		path,
		thumb,
		duration: data.duration || data.durationSeconds || data.duration_seconds || 0,
	}
}

function normalizePresetPath(value = '') {
	const raw = String(value || '').trim().split('?')[0].split('#')[0]
	if (!raw) return ''
	const pathMatch = raw.match(/^https?:\/\/[^/]+(\/.*)$/i)
	const path = pathMatch?.[1] || raw
	const staticIndex = path.indexOf('/static/')
	return staticIndex >= 0 ? path.slice(staticIndex) : path
}

function createCustomSkin(path) {
	const normalizedPath = normalizeMediaUrl(path)
	return {
		id: `custom_${Date.now()}`,
		name: '自定义壁纸',
		type: 'custom',
		mediaType: resolveMediaType({}, normalizedPath),
		path: normalizedPath,
		thumb: normalizedPath,
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

function getMediaUrl(input) {
	const data = unwrapResponse(input)
	if (!data) return ''
	if (typeof data === 'string') return normalizeMediaUrl(data)
	return normalizeMediaUrl(data.url || data.path || data.imageUrl || data.fileUrl || data.thumb || '')
}

function getMediaThumb(input) {
	const data = unwrapResponse(input)
	if (!data || typeof data === 'string') return ''
	return normalizeMediaUrl(data.thumb || data.thumbnail || data.poster || data.posterUrl || '')
}

function getMediaId(input) {
	const data = unwrapResponse(input)
	if (!data || typeof data === 'string') return ''
	return String(data.id || data.fileId || '').slice(0, 50)
}

function resolveErrorMessage(error, fallback) {
	return error?.data?.message || error?.message || error?.errMsg || fallback
}

function resolveMediaType(data = {}, path = '') {
	const mediaType = data.mediaType || data.media_type || data.fileType
	if (mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO || mediaType === HOME_SKIN_MEDIA_TYPES.IMAGE) {
		return mediaType
	}

	const lowerPath = String(path).split('?')[0].toLowerCase()
	if (/\.(mp4|mov|m4v|webm)$/.test(lowerPath)) return HOME_SKIN_MEDIA_TYPES.VIDEO
	return HOME_SKIN_MEDIA_TYPES.IMAGE
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

function chooseCustomMedia(mediaType) {
	if (mediaType === HOME_SKIN_MEDIA_TYPES.VIDEO) {
		return chooseVideo()
	}
	return chooseImage()
}

function chooseImage() {
	return new Promise((resolve) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const path = res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path || ''
				resolve({
					path,
					mediaType: HOME_SKIN_MEDIA_TYPES.IMAGE,
					thumb: path,
				})
			},
			fail: () => resolve({ path: '' }),
		})
	})
}

function chooseVideo() {
	return new Promise((resolve) => {
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: HOME_SKIN_VIDEO_LIMIT_SECONDS,
			compressed: true,
			success: (res) => {
				resolve({
					path: res.tempFilePath || '',
					mediaType: HOME_SKIN_MEDIA_TYPES.VIDEO,
					duration: Number(res.duration || 0),
					size: Number(res.size || 0),
					thumb: res.thumbTempFilePath || '',
				})
			},
			fail: () => resolve({ path: '' }),
		})
	})
}

function isVideoDurationValid(duration) {
	if (!duration) return true
	return Number(duration) <= HOME_SKIN_VIDEO_LIMIT_SECONDS
}

function compressVideoFile(filePath) {
	return new Promise((resolve) => {
		if (!uni.compressVideo) {
			resolve(filePath)
			return
		}

		uni.compressVideo({
			src: filePath,
			quality: 'medium',
			fps: 24,
			resolution: 0.75,
			success: (res) => resolve(res.tempFilePath || filePath),
			fail: () => resolve(filePath),
		})
	})
}
