/**
 * @description 格式化菜谱烹饪时长，仅在后端返回真实字段时展示。
 * @param {Object} recipe - 后端菜谱对象，兼容 cookTime、cook_time、cookingTime、cooking_time。
 * @returns {string} 可展示的烹饪时长；无真实值时返回空字符串。
 */
export const formatRecipeCookTime = (recipe = {}) => {
	const cookTime = recipe.cookTime || recipe.cook_time || recipe.cookingTime || recipe.cooking_time || "";
	if (typeof cookTime === "number") {
		return cookTime > 0 ? `${cookTime}分钟` : "";
	}
	const value = String(cookTime).trim();
	return value ? (/^\d+$/.test(value) ? `${value}分钟` : value) : "";
};

/**
 * @description 格式化菜谱难度；当前新增页尚未采集难度，隐藏数据库默认的“简单”以避免误导。
 * @param {Object} recipe - 后端菜谱对象。
 * @returns {string} 可展示的难度；无可信难度时返回空字符串。
 */
export const formatRecipeDifficulty = (recipe = {}) => {
	const difficulty = String(recipe.difficulty || "").trim();
	return difficulty && difficulty !== "简单" ? difficulty : "";
};
