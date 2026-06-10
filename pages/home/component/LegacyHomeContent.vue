<template>
	<view class="content">
		<!-- 背景图  60% -->
		<view class="home-bg pubFlex" :style="{backgroundImage: `url(${bgPath})`, paddingTop: 0 + 'px'  }">
			 <MainBodyVue v-if="isBody" />
			 <!-- 侧边导航工具栏 -->
			 <MainSideToolVue />
		</view>
		<!-- 模糊遮罩层 -->
		<view class="shade" />
		<!-- 标语 -->
		<view class="logo-label pubFlex">
			<view style="margin-left: 10px;">
				偏爱：你，和你点的那份
			</view>
			<MainBodyMiniVue v-if="!isBody"/>
		</view>
		<!-- 中间 模式切换按钮 -->
		<view style="width: 100%;">
			<MainBtnTypeVue />
		</view>

		<!-- 底部功能按钮 -->
		<view style="width: 100%;">
			<MainBaseFunVue />
		</view>
		<Tabbar :current='0'/>

		<!-- 皮肤弹出框 -->
		<SideToolSkinVue />
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';
import  Tabbar from  '@/components/Tabbar/index.vue'
import MainBodyVue from './MainBody.vue';
import MainBtnTypeVue from './MainBtnType.vue';
import MainBaseFunVue from './MainBaseFun.vue';
import MainSideToolVue from './MainSideTool.vue';
import SideToolSkinVue from './SideToolSkin.vue';
import MainBodyMiniVue from './MainBodyMini.vue';
import { useBodyMode } from '@/hooks/home/sideTool.js'
import { useHomeSkin } from '@/hooks/home/useHomeSkin.js'

const homeSkin = useHomeSkin();
const bgPath = homeSkin.bgPath;

// 启动bodyMode模式
const bodyMode = useBodyMode();
const isBody = bodyMode.isBody;

onShow(() => {
	homeSkin.initHomeSkin(true);
})

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
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			transition: background-image 0.25s ease;
		}
		.shade {
			width: 100%;
			height: 100px;
			position: absolute;
			background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
			top: 45%;
		}
		.logo-label {
			width: 100%;
			height: 35px;
			margin-top: 15px;
			color: $tinge-color;
			justify-content: space-between;
			z-index: 1;
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
