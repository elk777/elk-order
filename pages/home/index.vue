<template>
	<view class="content">
		<!-- 背景图  60% -->
		<view class="home-bg">
			
		 <MainBodyVue></MainBodyVue>
		</view>
		
		<!--  -->
		<!-- <image class="logo" src="/static/bj01.jpeg"></image> -->
		
		<Tabbar :current='0'/>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import  Tabbar from  '@/components/Tabbar/index.vue'
import MainBodyVue from './component/MainBody.vue';
const title = ref("uniapp")
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		.home-bg {
			width: 100vw;
			height: 60vh;
			background-image: url('/static/bj01.jpeg');
			backdrop-filter: 10rpx;
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
