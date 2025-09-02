<template>
	<view class="mainbody-container pubColumnFlex">
		<!-- 左右 饲养员  吃货 -->
		<view class="kind pubFlex">
			<view class="kind-head pubColumnFlex">
				<view class="kind-head-img">
					<up-image shape='circle' width="50px" height="50px"
						src='https://cdn.uviewui.com/uview/album/1.jpg'></up-image>
				</view>
				<view class="kind-name publcLabelSize">
					饲养员
				</view>
			</view>
			<view class="love-bounce">
				<up-image width="20px" height="20px" :src='imgPath'></up-image>
			</view>
			<view class="kind-head pubColumnFlex">
				<!-- 			<up-image shape='circle' width="50px" height="50px"
					src='https://cdn.uviewui.com/uview/album/1.jpg'></up-image> -->
				<view class="kind-head-unselected">
					<span class="unselected-plus"></span>
				</view>
				<view class="kind-name publcLabelSize">
					吃货
				</view>
			</view>
		</view>
		<!-- 吃饭时间  日历-->
		<view class="calendar">
			<view>我们在一起吃饭已经</view>
			<view class="calendar-days"><span class="calendar-days-span publcTitleSize">13</span>天</view>
			<view>2025/08/06 周三</view>
		</view>
		<!-- 邀请另一半开通按钮 -->
		<view class="invite">
			<up-button custom-style='border-color: #fff ' class="invite-btn" :plain="false" color='rgba(0,0,0,.15)'
				:icon="sofaIcon" shape='circle'>邀请另一半开通</up-button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue';

	const imgPath = ref('/static/images/aixin.png')
	const sofaIcon = ref('/static/images/love-sofa.svg')
</script>

<style lang="scss" scoped>
	.mainbody-container {
		color: #ffffff;
		padding: 0 20rpx;
		.kind {
			.kind-head {}

			.kind-head-img {
				border-radius: 50%;
				padding: 1px;
				border: 1px solid;
			}

			.kind-head-unselected {
				position: relative;
				width: 50px;
				height: 50px;
				padding: 1px;
				border: 1px solid $theme-color;
				background-color: #fff;
				border-radius: 50%;

				.unselected-plus {
					position: absolute;
					top: 10px;
					left: 10px;
					width: 100%;
					height: 100%;
					z-index: 1;
					background-image: url('/static/images/add.svg');
					background-repeat: no-repeat;
				}
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

		.love-bounce {
			margin: 0 30rpx;
			animation: love-bounce 5s ease-in-out infinite;
		}

		.calendar {
			margin: 30rpx 0;
			text-align: center;

			.calendar-days {
				margin: 30rpx 0;
			}

			.calendar-days-span {
				font-size: 52rpx;
			}
		}

		.invite {
			width: 450rpx;
			margin: 0 auto;

			.invite-btn {
				:deep(.u-button) {
					border-color: #ffffff !important;
				}
			}
		}

		@keyframes love-bounce {

			0%,
			100% {
				transform: translateY(0);
			}

			50% {
				transform: translateY(-10px);
			}
		}
	}
</style>