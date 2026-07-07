export const RECIPE_COOK_TIME_OPTIONS = [
	{ label: "15分钟内", value: "15分钟内", aliases: ["15分钟以内", "一刻钟内"] },
	{ label: "15-30分钟", value: "15-30分钟", aliases: ["15到30分钟", "15~30分钟", "半小时内"] },
	{ label: "30-60分钟", value: "30-60分钟", aliases: ["30到60分钟", "30~60分钟", "一小时内"] },
	{ label: "1小时+", value: "1小时+", aliases: ["一个小时以上", "1小时以上", "一小时以上"] },
	{ label: "2小时+", value: "2小时+", aliases: ["两个小时以上", "2小时以上", "二小时以上"] },
];

export const RECIPE_DIFFICULTY_OPTIONS = [
	{ label: "轻松投喂", value: "轻松投喂", aliases: ["简单", "容易", "轻松"] },
	{ label: "家常练手", value: "家常练手", aliases: ["普通", "中等", "家常"] },
	{ label: "进阶开火", value: "进阶开火", aliases: ["困难", "较难", "进阶"] },
	{ label: "大厨挑战", value: "大厨挑战", aliases: ["地狱", "复杂", "挑战"] },
];

const findOptionValue = (options, rawValue) => {
	const value = String(rawValue || "").trim();
	if (!value) return "";
	const matched = options.find((option) => {
		return option.value === value || option.label === value || option.aliases?.includes(value);
	});
	return matched?.value || "";
};

const parseCookMinutes = (value) => {
	if (!value) return 0;
	if (/半小时/.test(value)) return 30;
	const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:小时|h)/i);
	if (hourMatch) return Number(hourMatch[1]) * 60;
	const minuteMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:分钟|min)?/i);
	return minuteMatch ? Number(minuteMatch[1]) : 0;
};

/**
 * @description 将后端或 AI 草稿里的烹饪时长归一到前端固定选项。
 * @param {string|number} value - 烹饪时长原始值。
 * @returns {string} 匹配到的固定选项；无法识别时返回空字符串。
 */
export const normalizeRecipeCookTimeChoice = (value) => {
	const matched = findOptionValue(RECIPE_COOK_TIME_OPTIONS, value);
	if (matched) return matched;
	const minutes = parseCookMinutes(String(value || "").trim());
	if (!minutes) return "";
	if (minutes <= 15) return "15分钟内";
	if (minutes <= 30) return "15-30分钟";
	if (minutes <= 60) return "30-60分钟";
	if (minutes < 120) return "1小时+";
	return "2小时+";
};

/**
 * @description 将后端或 AI 草稿里的难度归一到当前项目文案。
 * @param {string} value - 难度原始值。
 * @returns {string} 匹配到的固定选项；无法识别时返回空字符串。
 */
export const normalizeRecipeDifficultyChoice = (value) => {
	return findOptionValue(RECIPE_DIFFICULTY_OPTIONS, value);
};

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
 * @description 格式化菜谱难度；隐藏旧数据里的数据库默认值“简单”，避免未手动选择的菜谱被误认为真实难度。
 * @param {Object} recipe - 后端菜谱对象。
 * @returns {string} 可展示的难度；无可信难度时返回空字符串。
 */
export const formatRecipeDifficulty = (recipe = {}) => {
	const difficulty = String(recipe.difficulty || "").trim();
	return difficulty && difficulty !== "简单" ? difficulty : "";
};
