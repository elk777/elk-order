<template>
	<!-- 底部按钮功能 今天吃啥  获取积分 等-->
	<view class="base-fun pubFlex">
		<view class="fun pubColumnFlex" v-for="fun of baseFuns" :key="fun.id">
			<up-image :show-loading="true" :src="fun.icon" width="45px" height="45px"></up-image>
			<view class="fun-title">
				{{fun.title}}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	const baseFuns = ref([{
			id: 0,
			icon: '/static/images/home/eat.svg',
			title: '今天吃啥'
		},
		{
			id: 1,
			icon: '/static/images/home/inte.svg',
			title: '获取积分'
		},
		{
			id: 2,
			icon: '/static/images/home/inte.svg',
			title: '好友做客'
		},
		{
			id: 3,
			icon: '/static/images/home/inte.svg',
			title: '敬请期待'
		}
	])
</script>

<style lang="scss">
	.base-fun {
		width: 100%;
		height: 100%;
		justify-content: space-around;
		margin-top: 15px;
		.fun {
			width: 90px;
			height: 100px;
			background-color: #fff;
			border-radius: 10px;
			// background-color: beige;
		}
	}
</style>