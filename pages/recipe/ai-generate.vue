<template>
	<view class="ai-recipe-page">
		<view class="hero">
			<view class="hero-chip">AI 菜谱草稿</view>
			<view class="hero-title">灵感成菜</view>
			<view class="hero-desc">输入菜名、现有食材或想吃的口味，我先帮你整理成可编辑菜谱。</view>
		</view>

		<view class="points-card">
			<view class="points-copy">
				<view class="points-title">本次将消耗 {{ aiCost }} 积分</view>
				<view class="points-desc">当前可用 {{ currentPoints }} 积分，生成失败或取消不会扣除</view>
			</view>
			<view class="points-badge" :class="{ 'points-badge--low': currentPoints < aiCost }">
				{{ currentPoints >= aiCost ? "可生成" : "积分不足" }}
			</view>
		</view>

		<view class="prompt-card">
			<view class="field-head">
				<view class="field-title">今天想做什么？</view>
				<view class="field-count">{{ prompt.length }}/300</view>
			</view>
			<up-textarea
				v-model="prompt"
				:height="150"
				:maxlength="300"
				:disabled="generating"
				count
				placeholder="例如：家里有鸡胸肉、西兰花，想吃低脂晚餐"
			></up-textarea>
		</view>

		<view v-if="generating" class="generation-panel">
			<view class="generation-head">
				<view class="generation-icon pubFlex">
					<up-icon name="plus" size="22" color="#FF5C8D"></up-icon>
				</view>
				<view class="generation-copy">
					<view class="generation-title">正在把灵感整理成菜谱</view>
					<view class="generation-desc">生成完成后自动回填新增菜谱页</view>
				</view>
				<view class="generation-badge">第 {{ generationStepIndex + 1 }}/{{ generationSteps.length }} 步</view>
			</view>

			<view class="generation-progress">
				<view class="generation-progress__bar" :style="{ width: generationProgress + '%' }"></view>
			</view>

			<view class="generation-timeline">
				<view
					v-for="item in generationStepItems"
					:key="item.title"
					class="generation-step"
					:class="`generation-step--${item.state}`"
				>
					<view class="generation-step__mark pubFlex">
						<up-icon v-if="item.state === 'done'" name="checkmark" size="13" color="#FFFFFF"></up-icon>
					</view>
					<view class="generation-step__copy">
						<view class="generation-step__title">{{ item.title }}</view>
						<view class="generation-step__desc">{{ item.desc }}</view>
					</view>
				</view>
			</view>

			<view class="draft-skeleton">
				<view class="draft-skeleton__label">草稿预览生成中</view>
				<view class="draft-skeleton__lines">
					<view class="draft-skeleton__line draft-skeleton__line--short"></view>
					<view class="draft-skeleton__line"></view>
				</view>
			</view>
		</view>

		<view v-if="!generating" class="example-section">
			<view class="section-title">试试这些说法</view>
			<view class="example-list">
				<view
					v-for="item in examples"
					:key="item"
					class="example-chip"
					:class="{ 'example-chip--disabled': generating }"
					@click="useExample(item)"
				>
					{{ item }}
				</view>
			</view>
		</view>

		<view v-if="!generating" class="result-note">
			<view class="note-icon pubFlex">
				<up-icon name="file-text-fill" size="22" color="#FF5C8D"></up-icon>
			</view>
			<view class="note-copy">
				<view class="note-title">生成后会回填新增菜谱页</view>
				<view class="note-desc">名称、描述、食材、步骤和小贴士会先成为草稿。封面、分类、步骤图片仍由你决定。</view>
			</view>
		</view>

		<view class="bottom-actions">
			<view v-if="generating" class="generation-status">
				<view class="generation-spinner"></view>
				<view class="generation-status__copy">
					<view class="generation-status__title">正在生成菜谱</view>
					<view class="generation-status__desc">通常 10-20 秒，完成后自动回填</view>
				</view>
				<view class="generation-cancel pubFlex" @click="cancelGeneration">取消</view>
			</view>
			<up-button v-else shape="circle" :color="COLOURS['theme-color']" @click="handleGenerate">
				开始生成
			</up-button>
		</view>
	</view>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import { onShow, onUnload } from "@dcloudio/uni-app";
import { COLOURS } from "@/config/index.js";
import { generateRecipeDraft } from "@/api/recipes.js";
import { getPointsOverview } from "@/apis/points.js";
import { saveAiRecipeDraft } from "@/utils/recipeDraft.js";

const DEFAULT_AI_COST = 20;
const prompt = ref("");
const generating = ref(false);
const generationStepIndex = ref(0);
const currentRequestTask = ref(null);
const activeRequestId = ref(0);
const currentPoints = ref(0);
const aiCost = ref(DEFAULT_AI_COST);
const canceledRequestIds = new Set();
let generationTimer = null;
let generationRequestSeq = 0;

const examples = [
	"番茄炒蛋，要下饭一点",
	"家里有鸡胸肉、西兰花，想吃低脂晚餐",
	"给我一道适合周末做的虾仁菜",
];

const generationSteps = [
	{ title: "理解你的口味", desc: "把菜名、食材和偏好整理清楚" },
	{ title: "搭配食材和火候", desc: "让味道更下饭，步骤更清楚" },
	{ title: "整理制作步骤", desc: "马上生成可编辑草稿" },
	{ title: "补充小贴士", desc: "封面和分类仍由你决定" },
];

const generationProgress = computed(() => {
	const progressMap = [24, 58, 82, 96];
	return progressMap[generationStepIndex.value] || 24;
});

const generationStepItems = computed(() => {
	return generationSteps.map((item, index) => {
		let state = "pending";
		if (index < generationStepIndex.value) state = "done";
		if (index === generationStepIndex.value) state = "active";
		return { ...item, state };
	});
});

onShow(() => {
	loadPointsOverview();
});

const useExample = (value) => {
	if (generating.value) return;
	prompt.value = value;
};

const clearGenerationTimer = () => {
	if (!generationTimer) return;
	clearInterval(generationTimer);
	generationTimer = null;
};

const startGenerationTimer = () => {
	clearGenerationTimer();
	generationStepIndex.value = 0;
	// 【等待态感知进度】：当前 AI 接口非流式返回，用本地阶段推进降低用户等待焦虑。
	generationTimer = setInterval(() => {
		if (generationStepIndex.value < generationSteps.length - 1) {
			generationStepIndex.value += 1;
		}
	}, 3200);
};

const stopGeneration = (requestId) => {
	if (requestId && activeRequestId.value !== requestId) return;
	clearGenerationTimer();
	generating.value = false;
	currentRequestTask.value = null;
	activeRequestId.value = 0;
};

const bindRecipeDraftTask = (task, requestId) => {
	if (activeRequestId.value === requestId) {
		currentRequestTask.value = task;
	}
};

const isCancelError = (error = {}) => {
	const message = error.message || error.errMsg || "";
	return /abort|取消/i.test(message);
};

const cancelGeneration = ({ silent = false } = {}) => {
	if (!generating.value) return;
	const requestId = activeRequestId.value;
	if (requestId) {
		canceledRequestIds.add(requestId);
	}
	currentRequestTask.value?.abort?.();
	stopGeneration(requestId);
	if (!silent) {
		uni.showToast({ title: "已取消生成，输入内容已保留", icon: "none" });
	}
};

const handleGenerate = async () => {
	const content = prompt.value.trim();
	if (content.length < 2) {
		uni.showToast({ title: "先写点菜名或食材吧", icon: "none" });
		return;
	}
	if (content.length > 300) {
		uni.showToast({ title: "描述不能超过300字", icon: "none" });
		return;
	}
	if (currentPoints.value < aiCost.value) {
		uni.showToast({ title: "积分不足，先去完成任务吧", icon: "none" });
		return;
	}
	if (generating.value) return;

	const requestId = ++generationRequestSeq;
	const requestKey = `${Date.now()}-${requestId}`;
	try {
		// 【防重复提交】：AI 请求耗时较长，锁住按钮避免连续点击消耗免费额度。
		generating.value = true;
		activeRequestId.value = requestId;
		currentRequestTask.value = null;
		startGenerationTimer();
		const res = await generateRecipeDraft(
			{ prompt: content, requestId: requestKey },
			{
				timeout: 45000,
				onTask: (task) => bindRecipeDraftTask(task, requestId),
				isCanceled: () => canceledRequestIds.has(requestId),
			}
		);
		if (canceledRequestIds.has(requestId)) return;
		if (res.code !== 200 || !res.data) {
			throw new Error(res.message || "生成失败");
		}

		const draftKey = saveAiRecipeDraft(res.data);
		stopGeneration(requestId);
		uni.navigateTo({
			url: `/pages/recipe/redact?title=新增菜谱&aiDraftKey=${encodeURIComponent(draftKey)}`,
		});
	} catch (error) {
		if (canceledRequestIds.has(requestId) || isCancelError(error)) return;
		console.error("AI 生成菜谱失败:", error);
		uni.showToast({ title: error.message || "生成失败，请稍后重试", icon: "none" });
	} finally {
		canceledRequestIds.delete(requestId);
		stopGeneration(requestId);
	}
};

async function loadPointsOverview() {
	try {
		const res = await getPointsOverview();
		if (res?.code !== 200 || !res?.data) return;
		currentPoints.value = Number(res.data.account?.currentPoints || 0);
		const aiBenefit = (res.data.benefits || []).find((item) => item.id === "ai-text");
		aiCost.value = Number(aiBenefit?.cost || DEFAULT_AI_COST);
	} catch (error) {
		console.warn("[ai-generate] load points overview failed", error);
	}
}

onUnload(() => {
	// 【生命周期自闭环】：用户离开页面时终止长耗时 AI 请求，避免后台继续等待和潜在额度消耗。
	cancelGeneration({ silent: true });
});

onUnmounted(() => {
	// 【内存泄漏防线】：兜底清理本地进度定时器，兼容非小程序运行时的组件卸载。
	cancelGeneration({ silent: true });
	clearGenerationTimer();
});
</script>

<style lang="scss" scoped>
.ai-recipe-page {
	min-height: 100vh;
	box-sizing: border-box;
	padding: 28rpx 24rpx calc(150rpx + env(safe-area-inset-bottom));
	background:
		linear-gradient(180deg, #fff0f5 0, #fff9fb 360rpx),
		#f8f8f8;
}

.hero {
	padding: 18rpx 4rpx 28rpx;
}

.hero-chip {
	display: inline-flex;
	align-items: center;
	height: 40rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #ffffff;
	color: $theme-color;
	font-size: 12px;
	font-weight: 800;
	box-shadow: 0 8rpx 20rpx rgba(255, 92, 141, 0.12);
}

.hero-title {
	margin-top: 20rpx;
	color: #202124;
	font-size: 28px;
	font-weight: 900;
	line-height: 1.2;
}

.hero-desc {
	margin-top: 14rpx;
	max-width: 620rpx;
	color: #6f747d;
	font-size: 15px;
	font-weight: 500;
	line-height: 1.55;
}

.points-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18rpx;
	margin-bottom: 22rpx;
	padding: 22rpx 24rpx;
	box-sizing: border-box;
	border: 1rpx solid rgba(255, 92, 141, 0.1);
	border-radius: 22rpx;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 10rpx 28rpx rgba(255, 92, 141, 0.08);
}

.points-copy {
	flex: 1;
	min-width: 0;
}

.points-title {
	color: #202124;
	font-size: 15px;
	font-weight: 800;
	line-height: 1.3;
}

.points-desc {
	margin-top: 8rpx;
	color: #8c8f96;
	font-size: 12px;
	line-height: 1.35;
}

.points-badge {
	flex-shrink: 0;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	background: #eaf9f6;
	color: #34b6a6;
	font-size: 12px;
	font-weight: 800;
}

.points-badge--low {
	background: #fff0f5;
	color: #ff5c8d;
}

.prompt-card,
.result-note {
	box-sizing: border-box;
	border: 1rpx solid rgba(255, 92, 141, 0.08);
	border-radius: 24rpx;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 14rpx 34rpx rgba(255, 92, 141, 0.08);
}

.prompt-card {
	padding: 26rpx;
}

.field-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.field-title,
.section-title,
.note-title {
	color: #202124;
	font-size: 17px;
	font-weight: 800;
	line-height: 1.25;
}

.field-count {
	color: #a0a4ad;
	font-size: 12px;
	font-weight: 600;
}

.example-section {
	margin-top: 28rpx;
}

.example-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-top: 16rpx;
}

.example-chip {
	max-width: 100%;
	box-sizing: border-box;
	padding: 14rpx 18rpx;
	border-radius: 999rpx;
	background: #fff0f5;
	color: #ff5c8d;
	font-size: 13px;
	font-weight: 700;
	line-height: 1.3;
}

.example-chip--disabled {
	opacity: 0.62;
}

.generation-panel {
	box-sizing: border-box;
	margin-top: 28rpx;
	padding: 28rpx;
	border: 1rpx solid rgba(255, 92, 141, 0.12);
	border-radius: 28rpx;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 18rpx 42rpx rgba(255, 92, 141, 0.12);
}

.generation-head {
	display: flex;
	align-items: flex-start;
}

.generation-icon {
	flex-shrink: 0;
	width: 54rpx;
	height: 54rpx;
	border-radius: 50%;
	background: #fff0f5;
}

.generation-copy {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.generation-title {
	color: #202124;
	font-size: 17px;
	font-weight: 800;
	line-height: 1.3;
}

.generation-desc {
	margin-top: 6rpx;
	color: #858b96;
	font-size: 12px;
	line-height: 1.4;
}

.generation-badge {
	flex-shrink: 0;
	margin-left: 14rpx;
	padding: 9rpx 18rpx;
	border-radius: 999rpx;
	background: #fff0f5;
	color: #ff5c8d;
	font-size: 12px;
	font-weight: 800;
	line-height: 1;
}

.generation-progress {
	position: relative;
	overflow: hidden;
	height: 14rpx;
	margin-top: 24rpx;
	border-radius: 999rpx;
	background: #f5edf1;
}

.generation-progress__bar {
	position: relative;
	height: 100%;
	border-radius: inherit;
	background: #ff5c8d;
	transition: width 0.45s ease;
}

.generation-progress__bar::after {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 54rpx;
	border-radius: inherit;
	background: rgba(255, 188, 212, 0.75);
	content: "";
}

.generation-timeline {
	margin-top: 24rpx;
}

.generation-step {
	position: relative;
	display: flex;
	align-items: flex-start;
	min-height: 76rpx;
}

.generation-step::after {
	position: absolute;
	top: 42rpx;
	bottom: 8rpx;
	left: 17rpx;
	width: 2rpx;
	background: #efe4ea;
	content: "";
}

.generation-step:last-child::after {
	display: none;
}

.generation-step__mark {
	position: relative;
	z-index: 1;
	flex-shrink: 0;
	width: 34rpx;
	height: 34rpx;
	margin-top: 2rpx;
	border-radius: 50%;
	border: 4rpx solid #dce1e8;
	background: #ffffff;
	box-sizing: border-box;
}

.generation-step--done .generation-step__mark {
	border-color: #ff5c8d;
	background: #ff5c8d;
}

.generation-step--active .generation-step__mark {
	border: 10rpx solid #ffe2ed;
	background: #ff5c8d;
}

.generation-step__copy {
	min-width: 0;
	margin-left: 20rpx;
}

.generation-step__title {
	color: #555b66;
	font-size: 14px;
	font-weight: 800;
	line-height: 1.25;
}

.generation-step__desc {
	margin-top: 4rpx;
	color: #a3a8b2;
	font-size: 12px;
	line-height: 1.35;
}

.generation-step--done .generation-step__title {
	color: #202124;
}

.generation-step--active .generation-step__title {
	color: #ff5c8d;
}

.generation-step--active .generation-step__desc {
	color: #6f747d;
}

.draft-skeleton {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	margin-top: 8rpx;
	padding: 22rpx 24rpx;
	border: 1rpx solid #ffe3ee;
	border-radius: 20rpx;
	background: #fff8fb;
}

.draft-skeleton__label {
	flex-shrink: 0;
	color: #ff5c8d;
	font-size: 12px;
	font-weight: 800;
}

.draft-skeleton__lines {
	flex: 1;
	min-width: 0;
	margin-left: 30rpx;
}

.draft-skeleton__line {
	height: 12rpx;
	border-radius: 999rpx;
	background: #f4e8ee;
}

.draft-skeleton__line + .draft-skeleton__line {
	margin-top: 14rpx;
}

.draft-skeleton__line--short {
	width: 62%;
}

.result-note {
	display: flex;
	align-items: flex-start;
	margin-top: 30rpx;
	padding: 24rpx;
}

.note-icon {
	flex-shrink: 0;
	width: 62rpx;
	height: 62rpx;
	border-radius: 20rpx;
	background: #fff0f5;
}

.note-copy {
	min-width: 0;
	margin-left: 18rpx;
}

.note-desc {
	margin-top: 10rpx;
	color: #777b84;
	font-size: 13px;
	line-height: 1.5;
}

.bottom-actions {
	position: fixed;
	right: 24rpx;
	bottom: calc(30rpx + env(safe-area-inset-bottom));
	left: 24rpx;
	z-index: 8;
}

.generation-status {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 88rpx;
	padding: 18rpx 20rpx;
	border: 1rpx solid #ffe2ed;
	border-radius: 34rpx;
	background: rgba(255, 255, 255, 0.98);
	box-shadow: 0 14rpx 36rpx rgba(255, 92, 141, 0.16);
}

.generation-spinner {
	position: relative;
	flex-shrink: 0;
	width: 48rpx;
	height: 48rpx;
	border: 6rpx solid #ffd3e4;
	border-top-color: #ff5c8d;
	border-radius: 50%;
	animation: generation-spin 0.9s linear infinite;
	box-sizing: border-box;
}

.generation-status__copy {
	flex: 1;
	min-width: 0;
	margin-left: 18rpx;
}

.generation-status__title {
	color: #202124;
	font-size: 15px;
	font-weight: 800;
	line-height: 1.25;
}

.generation-status__desc {
	margin-top: 6rpx;
	color: #858b96;
	font-size: 12px;
	line-height: 1.35;
}

.generation-cancel {
	flex-shrink: 0;
	min-width: 72rpx;
	height: 42rpx;
	margin-left: 16rpx;
	padding: 0 18rpx;
	border-radius: 999rpx;
	background: #fff0f5;
	color: #ff5c8d;
	font-size: 12px;
	font-weight: 800;
}

@keyframes generation-spin {
	to {
		transform: rotate(360deg);
	}
}

:deep(.u-textarea) {
	border: 1rpx solid #eef0f4 !important;
	border-radius: 18rpx;
	background: #fbfbfc;
}
</style>
