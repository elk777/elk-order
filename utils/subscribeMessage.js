/*
 * @Author: elk
 * @Date: 2026-06-15
 * @FilePath: /hkt-applet/utils/subscribeMessage.js
 * @Description: 微信订阅消息授权与续期封装
 */

import { computed, ref } from "vue";
import { saveSubscriptionSettings, getSubscriptionSettings } from "@/apis/notifications.js";
import {
	SUBSCRIBE_MESSAGE_SCENE_TYPES,
	SUBSCRIBE_MESSAGE_SCENES,
	SUBSCRIBE_MESSAGE_TEMPLATE_ID_TO_TYPE,
	SUBSCRIBE_MESSAGE_TEMPLATES,
	SUBSCRIBE_MESSAGE_TYPE_TO_TEMPLATE,
} from "@/config/subscriptionMessages.js";
import { useUserStore } from "@/stores/user.js";

const STORAGE_PREFIX = "SUBSCRIBE_MESSAGE_SETTINGS_V1";
const MAX_TEMPLATE_IDS_PER_REQUEST = 1;
const TEMPLATE_UNAVAILABLE_STATUS = "unavailable";

const defaultSettings = {
	enabled: false,
	keepAlive: true,
	acceptedTypes: [],
	rejectedTypes: [],
	lastResult: {},
	lastSubscribedAt: "",
};

const settings = ref({ ...defaultSettings });
const loading = ref(false);
const loadedKey = ref("");

export function useSubscribeMessage() {
	const userStore = useUserStore();
	const isEnabled = computed(() => !!settings.value.enabled);
	const isFullyEnabled = computed(() => {
		const acceptedTypes = settings.value.acceptedTypes || [];
		return SUBSCRIBE_MESSAGE_TEMPLATES.every((item) => acceptedTypes.includes(item.type));
	});
	const keepAlive = computed(() => settings.value.keepAlive !== false);
	const needsAttention = computed(() => userStore.isLogin && !isFullyEnabled.value);

	function getStorageKey() {
		const profile = userStore.profile || {};
		return `${STORAGE_PREFIX}_${profile.uuid || profile.id || "guest"}`;
	}

	function readLocalSettings() {
		try {
			const cached = uni.getStorageSync(getStorageKey());
			return normalizeSettings(cached);
		} catch (error) {
			console.warn("[subscribe-message] read local settings failed", error);
			return { ...defaultSettings };
		}
	}

	function writeLocalSettings(nextSettings = settings.value) {
		try {
			uni.setStorageSync(getStorageKey(), normalizeSettings(nextSettings));
		} catch (error) {
			console.warn("[subscribe-message] write local settings failed", error);
		}
	}

	async function loadSettings(options = {}) {
		const { force = false } = options;
		const key = getStorageKey();
		if (!force && loadedKey.value === key) return settings.value;

		settings.value = readLocalSettings();
		loadedKey.value = key;

		if (!userStore.isLogin) return settings.value;

		try {
			const res = await getSubscriptionSettings();
			if (res?.code === 200 && res?.data) {
				settings.value = normalizeSettings({
					...settings.value,
					...res.data,
				});
				writeLocalSettings();
			}
		} catch (error) {
			console.warn("[subscribe-message] load remote settings failed", error);
		}

		return settings.value;
	}

	async function savePreference(patch = {}) {
		const nextSettings = normalizeSettings({
			...settings.value,
			...patch,
		});
		settings.value = nextSettings;
		writeLocalSettings(nextSettings);

		if (!userStore.isLogin) return nextSettings;

		try {
			const res = await saveSubscriptionSettings({
				enabled: nextSettings.enabled,
				keepAlive: nextSettings.keepAlive,
				acceptedTypes: nextSettings.acceptedTypes,
				rejectedTypes: nextSettings.rejectedTypes,
				lastResult: nextSettings.lastResult,
			});
			if (res?.code === 200 && res?.data) {
				settings.value = normalizeSettings({
					...settings.value,
					...res.data,
				});
				writeLocalSettings();
			}
		} catch (error) {
			console.warn("[subscribe-message] save remote settings failed", error);
		}

		return settings.value;
	}

	function authorizeAll(options = {}) {
		return requestTypes(SUBSCRIBE_MESSAGE_SCENE_TYPES[SUBSCRIBE_MESSAGE_SCENES.SETTINGS], {
			keepAlive: options.keepAlive,
			showToast: options.showToast !== false,
		});
	}

	function renewForScene(scene, options = {}) {
		ensureLocalSettingsLoaded();
		const types = SUBSCRIBE_MESSAGE_SCENE_TYPES[scene] || [];
		if (!types.length) return { acceptedCount: 0, rejectedCount: 0, statuses: {} };

		return requestTypes(types, {
			keepAlive: settings.value.keepAlive,
			showToast: options.showToast === true,
			silentLog: true,
		});
	}

	function ensureLocalSettingsLoaded() {
		const key = getStorageKey();
		if (loadedKey.value === key) return;
		settings.value = readLocalSettings();
		loadedKey.value = key;
	}

	function requestTypes(types = [], options = {}) {
		const templateIds = selectTemplateIdsForRequest(types);

		if (!templateIds.length) {
			return Promise.resolve().then(() => {
				const hasIncompleteTypes = hasIncompleteSubscribeTypes(types);
				if (options.showToast && hasIncompleteTypes) {
					uni.showToast({ title: "剩余模板暂不可用，请检查微信后台", icon: "none" });
				} else if (options.showToast) {
					uni.showToast({ title: "可用通知已处理完成", icon: "none" });
				}
				return { acceptedCount: 0, rejectedCount: unique(types).length, statuses: {} };
			});
		}

		const subscribeApi = resolveSubscribeApi();
		if (!subscribeApi) {
			return savePreference({
				enabled: false,
				keepAlive: options.keepAlive ?? settings.value.keepAlive,
			}).then(() => {
				if (options.showToast) {
					uni.showToast({ title: "当前环境不支持订阅消息", icon: "none" });
				}
				return { acceptedCount: 0, rejectedCount: templateIds.length, statuses: {} };
			});
		}

		loading.value = true;

		return requestSubscribeChunk(subscribeApi, templateIds)
			.then((statuses) => persistSubscribeResult(statuses, options))
			.catch((error) => {
				console.warn("[subscribe-message] request subscribe failed", error);
				if (isTemplateUnavailableError(error)) {
					const statuses = templateIds.reduce((map, templateId) => {
						map[templateId] = TEMPLATE_UNAVAILABLE_STATUS;
						return map;
					}, {});
					return persistSubscribeResult(statuses, options);
				}

				const errorMessage = getSubscribeErrorMessage(error);
				return savePreference({
					enabled: settings.value.enabled,
					keepAlive: options.keepAlive ?? settings.value.keepAlive,
					lastResult: {
						...settings.value.lastResult,
						error: error?.errMsg || error?.message || "requestSubscribeMessage failed",
					},
				}).then(() => {
					if (options.showToast) {
						uni.showToast({ title: errorMessage, icon: "none" });
					}
					return { acceptedCount: 0, rejectedCount: templateIds.length, statuses: {} };
				});
			})
			.finally(() => {
				loading.value = false;
			});
	}

	function persistSubscribeResult(statuses = {}, options = {}) {
		const acceptedTypes = [];
		const rejectedTypes = [];
		const unavailableTypes = [];
		Object.entries(statuses).forEach(([templateId, status]) => {
			const type = SUBSCRIBE_MESSAGE_TEMPLATE_ID_TO_TYPE[templateId];
			if (!type) return;
			if (status === "accept") {
				acceptedTypes.push(type);
			} else if (status === TEMPLATE_UNAVAILABLE_STATUS) {
				unavailableTypes.push(type);
			} else {
				rejectedTypes.push(type);
			}
		});

		const nextAcceptedTypes = unique([
			...settings.value.acceptedTypes,
			...acceptedTypes,
		]);
		const nextRejectedTypes = unique([
			...settings.value.rejectedTypes.filter((type) => !acceptedTypes.includes(type)),
			...rejectedTypes,
			...unavailableTypes,
		]);
		const enabled = nextAcceptedTypes.length > 0;
		const failedType = unavailableTypes[0] || rejectedTypes[0] || "";

		return savePreference({
			enabled,
			keepAlive: options.keepAlive ?? settings.value.keepAlive,
			acceptedTypes: nextAcceptedTypes,
			rejectedTypes: nextRejectedTypes,
			lastResult: mapTemplateStatusToType(statuses, failedType),
			lastSubscribedAt: new Date().toISOString(),
		}).then(() => {
			if (options.showToast) {
				const hasUnavailableTemplate = unavailableTypes.length > 0;
				const unavailableTitle = getTypeTitle(unavailableTypes[0]);
				uni.showToast({
					title: acceptedTypes.length
						? "消息提醒已开启"
						: hasUnavailableTemplate
							? `${unavailableTitle}暂不可用`
							: "未开启消息提醒",
					icon: acceptedTypes.length ? "success" : "none",
				});
			}

			return {
				acceptedCount: acceptedTypes.length,
				rejectedCount: rejectedTypes.length + unavailableTypes.length,
				statuses: mapTemplateStatusToType(statuses, failedType),
			};
		});
	}

	return {
		settings,
		loading,
		isEnabled,
		isFullyEnabled,
		keepAlive,
		needsAttention,
		templates: SUBSCRIBE_MESSAGE_TEMPLATES,
		loadSettings,
		savePreference,
		authorizeAll,
		renewForScene,
	};
}

function normalizeSettings(input = {}) {
	const source = input && typeof input === "object" ? input : {};
	return {
		...defaultSettings,
		...source,
		enabled: !!source.enabled,
		keepAlive: source.keepAlive !== false,
		acceptedTypes: Array.isArray(source.acceptedTypes) ? unique(source.acceptedTypes) : [],
		rejectedTypes: Array.isArray(source.rejectedTypes) ? unique(source.rejectedTypes) : [],
		lastResult: source.lastResult && typeof source.lastResult === "object" ? source.lastResult : {},
		lastSubscribedAt: source.lastSubscribedAt || "",
	};
}

function resolveSubscribeApi() {
	if (typeof uni !== "undefined" && typeof uni.requestSubscribeMessage === "function") {
		return uni;
	}
	if (typeof wx !== "undefined" && typeof wx.requestSubscribeMessage === "function") {
		return wx;
	}
	return null;
}

function requestSubscribeChunk(subscribeApi, tmplIds) {
	return new Promise((resolve, reject) => {
		subscribeApi.requestSubscribeMessage({
			tmplIds,
			success: (res) => resolve(res || {}),
			fail: (error) => reject(error),
		});
	});
}

function mapTemplateStatusToType(statuses = {}, failedType = "") {
	const result = Object.entries(statuses).reduce((map, [templateId, status]) => {
		const type = SUBSCRIBE_MESSAGE_TEMPLATE_ID_TO_TYPE[templateId];
		if (type) map[type] = status;
		return map;
	}, {});
	if (failedType) result._lastFailedType = failedType;
	return result;
}

function selectTemplateIdsForRequest(types = []) {
	const acceptedTypes = settings.value.acceptedTypes || [];
	const lastFailedType = settings.value.lastResult?._lastFailedType || "";
	const requests = buildTemplateRequests(types);
	const pendingRequests = requests.filter((item) => !acceptedTypes.includes(item.type));
	if (pendingRequests.length) {
		const nextRequests = pendingRequests.filter((item) => item.type !== lastFailedType);
		const requestQueue = nextRequests.length ? nextRequests : pendingRequests;
		return requestQueue
			.map((item) => item.templateId)
			.slice(0, MAX_TEMPLATE_IDS_PER_REQUEST);
	}

	return requests
		.map((item) => item.templateId)
		.slice(0, MAX_TEMPLATE_IDS_PER_REQUEST);
}

function hasIncompleteSubscribeTypes(types = []) {
	const acceptedTypes = settings.value.acceptedTypes || [];
	return unique(types).some((type) => !acceptedTypes.includes(type));
}

function getTypeTitle(type) {
	return SUBSCRIBE_MESSAGE_TYPE_TO_TEMPLATE[type]?.title || "订阅模板";
}

function buildTemplateRequests(types = []) {
	return unique(types)
		.map((type) => ({
			type,
			templateId: normalizeTemplateId(SUBSCRIBE_MESSAGE_TYPE_TO_TEMPLATE[type]?.templateId),
		}))
		.filter((item) => isUsableTemplateId(item.templateId));
}

function normalizeTemplateId(value) {
	return typeof value === "string" ? value.trim() : "";
}

function isUsableTemplateId(templateId) {
	if (!templateId) return false;
	if (!/^[A-Za-z0-9_-]{20,}$/.test(templateId)) return false;
	const normalized = templateId.toLowerCase();
	return !["todo", "template_id", "your_template_id"].includes(normalized);
}

function isTemplateUnavailableError(error) {
	const message = `${error?.errMsg || error?.message || error || ""}`;
	return /No template data return|template id exist/i.test(message);
}

function getSubscribeErrorMessage(error) {
	if (isTemplateUnavailableError(error)) return "订阅模板未配置，请检查微信后台";
	const message = `${error?.errMsg || error?.message || error || ""}`;
	if (/cancel/i.test(message)) return "已取消订阅授权";
	if (/auth deny|permission|ban/i.test(message)) return "订阅消息权限不可用";
	return "订阅授权失败，可稍后再试";
}

function unique(list = []) {
	return Array.from(new Set(list.filter(Boolean)));
}
