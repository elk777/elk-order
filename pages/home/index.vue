<template>
	<view class="content">
		<!-- 背景图  60% -->
		<view class="home-bg pubFlex"
			:style="{backgroundImage: `url(${bgPath})`, paddingTop: statusBarHeight + 'px'  }">
			<MainBodyVue v-if="isBody" />
			<!-- 侧边导航工具栏 -->
			<MainSideToolVue />
		</view>
		<!-- 模糊遮罩层 -->
		<view class="shade" />
		<!-- 标语 -->
		<view class="logo-label pubFlex">
			<view style="margin-left: 10px;">
				我只偏爱两样东西：你，和你点的那份
			</view>
			<MainBodyMiniVue v-if="!isBody" />
		</view>
		<!-- 中间 模式切换按钮 -->
		<view style="width: 100%;">
			<MainBtnTypeVue />
		</view>

		<!-- 底部功能按钮 -->
		<view style="width: 100%;">
			<MainBaseFunVue />
		</view>
		<Tabbar :current='0' />

		<!-- 皮肤弹出框 -->
		<SideToolSkinVue />
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import Tabbar from '@/components/Tabbar/index.vue'
	import MainBodyVue from './component/MainBody.vue';
	import MainBtnTypeVue from './component/MainBtnType.vue';
	import MainBaseFunVue from './component/MainBaseFun.vue';
	import MainSideToolVue from './component/MainSideTool.vue';
	import SideToolSkinVue from './component/SideToolSkin.vue';
	import MainBodyMiniVue from './component/MainBodyMini.vue';
	import {
		useBodyMode
	} from '@/hooks/home/sideTool.js';
	
	import { getUniTopNavHeight } from '@/utils/tool.js'
	const title = ref("uniapp")

	const bgPath = ref('/static/bj01.jpeg');

	// 获取状态栏的高度
	const statusBarHeight = ref(getUniTopNavHeight());

	// 启动bodyMode模式
	const bodyMode = useBodyMode();
	const isBody = bodyMode.isBody;
</script>

<style lang="scss" scoped>
	.content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.home-bg {
			width: 100vw;
			height: 50vh;
			backdrop-filter: 10rpx;
			margin: 0 auto;
		}

		.shade {
			width: 100%;
			height: 80px;
			position: absolute;
			// backdrop-filter: blur(20px);
			background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
			top: 51.5vh;
		}

		.logo-label {
			width: 100%;
			height: 35px;
			margin-top: 15px;
			color: $tinge-color;
			justify-content: space-between;
		}
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>