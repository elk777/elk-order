<template>
	<view class="mainbody-container pubColumnFlex">
		<!-- 左右 饲养员  吃货 -->
		<view class="kind pubFlex">
			<view class="kind-head pubColumnFlex">
				<up-image shape='circle' width="50px" height="50px" src='https://cdn.uviewui.com/uview/album/1.jpg'></up-image>
				<view class="kind-name publcLabelSize">
					饲养员
				</view>
			</view>
			<up-image style="margin: 0 20rpx;" width="20px" height="20px" :src='imgPath'></up-image>
			<view class="kind-head pubColumnFlex">
				<up-image shape='circle' width="50px" height="50px" src='https://cdn.uviewui.com/uview/album/1.jpg'></up-image>
				<view class="kind-name publcLabelSize">
					吃货
				</view>
			</view>
		</view>
		<!-- 吃饭时间  日历-->
		<view class="">
			<view>我们在一起吃饭已经</view>
			<view><span>3</span>天</view>
			<view>2025/08/06 周三</view>
		</view>
		<!-- 邀请另一半开通按钮 -->
		<up-button shape='circle'>邀请另一半开通</up-button>
	</view>
</template>

<script setup>
	import {ref} from 'vue';
	
	const imgPath = ref('/static/images/aixin.png')
</script>

<style lang="scss" scoped>
	.mainbody-container {
		color:  #ffffff;
		.kind {
			.kind-head {
				
			}
			.kind-name {
				width: 130rpx;
				margin-top: 30rpx;
				background-color: #ffffff;
				text-align: center;
				border-radius: 25rpx;
				padding: 10rpx 0rpx;
				color: $theme-color;
			}
		}
	}
	
</style>