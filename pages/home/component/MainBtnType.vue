<template>
	<view class="mainbtntype-container pubFlex">
		<view class="pub-class" v-for="item of btnTypes" :key="item.id" :style="{backgroundImage: `url(${item.path})`}" >
			<view class="pub-label" :class="[item.style]">
				<view class="pub-title publcTextSize">{{item.title}}</view>
				<view class="pub-text  publcLabelSize">{{item.text}}
				<span><up-icon name="arrow-right" color="#fff" size="12" /></span>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	
	const btnTypes = ref([
		{
			id: 0, path: '/static/images/home/feed.png', title: '我是饲养员', text: '我要做菜', style: 'pub-left'
		},
		{
			id: 2, path: '/static/images/home/foodie.png', title: '我是吃货呀', text: '我要点餐', style: 'pub-right'
		}
	])
</script>

<style lang="scss">
	.mainbtntype-container {
		width: 100%;
		height: 100px;
		margin-top: 2vh;
		justify-content: space-around;
		.pub-class {
			position: relative;ition: relative;
			width: 45vw;
			height: 100%;
			border-radius: 20px;
			background-size: 100% 100%; /* 宽度100%，高度自适应 */
			background-repeat: no-repeat; /* 防止图片重复 */
			color: $fu-color;
			.pub-label {
				position: absolute;
				top: 55rpx;
				.pub-text {
					display: flex;
					align-items: center;
					margin-right: 12rpx;
				}
			}
			.pub-left {
				left: 22rpx;
			}
			.pub-right {
				left: 42rpx;
			}
			.pub-title {
				font-weight: 600;
			}
		}
	}
</style>