const AI_RECIPE_DRAFT_KEY_PREFIX = "AI_RECIPE_DRAFT";

/**
 * @description 暂存 AI 生成的菜谱草稿，用于跨页面回填新增菜谱表单。
 * @param {Object} draft - 后端返回的结构化菜谱草稿。
 * @returns {string} storage key，供目标页面读取。
 */
export function saveAiRecipeDraft(draft) {
	const key = `${AI_RECIPE_DRAFT_KEY_PREFIX}_${Date.now()}`;
	uni.setStorageSync(key, {
		draft,
		createdAt: Date.now(),
	});
	return key;
}

/**
 * @description 读取并清理 AI 菜谱草稿，避免用户后续手动新增时误用旧草稿。
 * @param {string} key - saveAiRecipeDraft 返回的 storage key。
 * @returns {Object|null} 菜谱草稿。
 */
export function consumeAiRecipeDraft(key) {
	if (!key || !String(key).startsWith(AI_RECIPE_DRAFT_KEY_PREFIX)) {
		return null;
	}
	const payload = uni.getStorageSync(key);
	uni.removeStorageSync(key);
	return payload?.draft || null;
}
