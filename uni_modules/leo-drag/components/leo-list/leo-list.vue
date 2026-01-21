<template>
	<view class="content">
		<!-- 参数文档地址：https://z-paging.zxlee.cn/api/props/refresher.html -->
		<!-- 这里加view是为了统一小程序，避免以外错误。小程序会自动添加一个view -->
		<!-- 参数的配置都在z-paging > js > modules中 -->
		<z-paging @refresherStatusChange="refresherStatusChange" :scrollable="scrollable"
			:default-page-size="pageSize" :loading-more-enabled="loadingMoreEnabled" @scroll="scroll" lower-threshold="30rpx" empty-view-fixed
			:refresher-complete-delay="500" auto-show-back-to-top show-empty-view-reload :system-loading-mask="false"
			:refresher-enabled="refresherEnabled" v-model="dataList" @emptyViewReload="emptyDataClick"
			ref="paging" @query="queryList" @contentHeightChanged="getViewInfo">
			<!-- 
				watch-touch-direction-change：是否监听触摸行为
				@touchDirectionChange：触摸行为，往上还是往下
				@refresherStatusChange： 下拉刷新状态
				default-page-size： 默认分页
				loading-more-enabled： 开启触底加载
				lower-threshold： 触底加载的的触发距离
				empty-view-fixed： 空数据是否充满z-paging
				refresher-complete-delay： 刷新成功后结束时间
				auto-show-back-to-top： 开启返回顶部的按钮
				show-empty-view-reload： 是否显示空数据图重新加载按钮
				system-loading-mask： 显示系统Loading时是否显示透明蒙层，防止触摸穿透
				refresher-enabled： 是否开启下拉刷新-拖拽的时候不允许调用刷新功能，否则拖拽下拉的时候就会触发刷新
				emptyViewReload： 点击空数据的按钮
				@query： 触发加载数据
			-->
			<!-- 四位插槽 -->
			<template #top>
				<slot name="top"></slot>
			</template>
			<template #left>
				<slot name="left"></slot>
			</template>
			<template #right>
				<slot name="right"></slot>
			</template>
			<template #bottom>
				<slot name="bottom"></slot>
			</template>

			<!-- 把数据传递上去 -->
			<slot name="list" :dataList="dataList"></slot>

			<!-- 加载动画 -->
			<template #loading>
				<view style="height: 100%;width: 100%;" class="flex flex-y flex-center-center">
					<!-- 只会加载一次 -->
					<view class="loading">
						<view v-for="e in 12" :key="e" class="item"></view>
					</view>
					<view style="color: #6543ef;padding-top: 20rpx;font-size: 35rpx; letter-spacing: 1px;">
						{{t('leo-drag.loading')}}
					</view>
				</view>
			</template>

			<!-- 自定义刷新结束 -->
			<template #refresherComplete>
				<view v-if="!isLogin" class="flex flex-center-center" style="height: 100%;padding-top: 18rpx;">
					<uni-icons style="margin: 0rpx 5rpx 0 0;" type="close" size="18"></uni-icons>
					<text style="font-size: 30rpx;">{{t('leo-drag.logOn')}}</text>
				</view>
				<view v-else-if="isGetListErr" class="flex flex-center-center" style="height: 100%;padding-top: 18rpx;">
					<uni-icons style="margin: 0rpx 5rpx 0 0;" type="close" size="18"></uni-icons>
					<text style="font-size: 30rpx;">{{t('leo-drag.loadFail')}}</text>
				</view>
				<view v-else class="flex flex-center-center" style="height: 100%;padding-top: 18rpx;">
					<image style="width: 34rpx;height: 34rpx; margin: 0rpx 4rpx 0 0;" :src="base64Img.base64Success">
					</image>
					<text style="font-size: 30rpx;">{{t('leo-drag.loadSuccess')}}</text>
				</view>
			</template>

			<!-- 没数据的情况 -->
			<template #empty={isLoadFailed}>
				<!-- 自定义空数据 -->
				<view v-if="!isLogin" class="flex flex-y flex-center-center">
					<!-- 没登录 -->
					<image style="width: 280rpx;height: 280rpx;" :src="base64Img.base64Error"></image>
					<view class="emptyMsg" :style="[emptyMsg]">
						{{ notLoggedIn.msg }}
					</view>
					<text @click="notLoggedInClick" class="but" :style="[butSy]">{{notLoggedIn.but}}</text>
				</view>
				<!-- 数据错误 -->
				<view v-else-if="isLoadFailed" class="flex flex-y flex-center-center">
					<image style="width: 240rpx;height: 240rpx;" :src="base64Img.base64Error"></image>
					<view class="emptyMsg" :style="[emptyMsg]" v-html="dataErr.msg"></view>
					<text @click="dataErrClick" class="but" :style="[butSy]">{{ dataErr.but }}</text>
				</view>
				<!-- 空数据 -->
				<view v-else class="flex flex-y flex-center-center">
					<image style="width: 240rpx;height: 240rpx;" :src="base64Img.base64Empty"></image>
					<view class="emptyMsg" :style="[emptyMsg]" v-html="emptyData.msg"></view>
					<text @click="emptyDataClick" class="but" :style="[butSy]" >{{ emptyData.but }}</text>
				</view>
			</template>
		</z-paging>
	</view>
</template>

<script>
	import mixin from '../leo-drag/js/leo-mixin.js'
	export default {
		mixins: [mixin],
	}
</script>

<style scoped lang="scss">
	.emptyMsg {
		font-size: 36rpx;
		color: #555;
		width: 560rpx;
		text-align: center;
	}

	.but {
		min-width: 360rpx;
		text-align: center;
		margin-top: 30rpx;
		padding: 8rpx 70rpx;
		background-color: #1e7aff;
		color: #fff;
		font-size: 36rpx;
		border-radius: 60rpx;
	}
	
	.loading{
		position: relative;
		width: 80rpx;
		height: 80rpx;
		&>.item {
			position: absolute;
			left: 50%;
			top: 50%;
			margin-top: -10rpx;
			width: 50%;
			height: 20rpx;
			transform-origin: left center;
			&::after {
				content: "";
				position: absolute;
				right: 0;
				top: 0;
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				background-color: #6543ef;
				animation: dotscale 1.2s linear infinite;
				animation-delay: var(--animation-delay);
			}
			&:nth-child(1) {
				transform: rotate(360deg);
				--animation-delay: 0s;
			}
			
			&:nth-child(2) {
				transform: rotate(330deg);
				--animation-delay: -0.1s;
			}
			
			&:nth-child(3) {
				transform: rotate(300deg);
				--animation-delay: -0.2s;
			}
			
			&:nth-child(4) {
				transform: rotate(270deg);
				--animation-delay: -0.3s;
			}
			
			&:nth-child(5) {
				transform: rotate(240deg);
				--animation-delay: -0.4s;
			}
			
			&:nth-child(6) {
				transform: rotate(210deg);
				--animation-delay: -0.5s;
			}
			
			&:nth-child(7) {
				transform: rotate(180deg);
				--animation-delay: -0.6s;
			}
			
			&:nth-child(8) {
				transform: rotate(150deg);
				--animation-delay: -0.7s;
			}
			
			&:nth-child(9) {
				transform: rotate(120deg);
				--animation-delay: -0.8s;
			}
			
			&:nth-child(10) {
				transform: rotate(90deg);
				--animation-delay: -0.9s;
			}
			
			&:nth-child(11) {
				transform: rotate(60deg);
				--animation-delay: -1s;
			}
			
			&:nth-child(12) {
				transform: rotate(30deg);
				--animation-delay: -1.1s;
			}
		}
	}
	
	@keyframes dotscale {
		0% {
			transform: scale(1);
			// filter: hue-rotate(0deg);
		}
	
		100% {
			transform: scale(0);
			// filter: hue-rotate(360deg);
		}
	}
	
	.flex {
	   display: -webkit-box;  /* Safari 6.1+ */
	   display: -ms-flexbox;  /* IE 10 */
	   display: flex;
		flex-direction: row !important;
	  &-y {
	    flex-direction: column !important;
	  }
	
	  &-start {
	    align-content: flex-start !important;
	  }
	
	  &-top {
	    align-items: flex-start !important;
	  }
	
	  &-bottom {
	    align-items: flex-end !important;
	  }
	
	  &-center {
	    align-items: center !important;
	  }
	
	  &-baseline {
	    align-items: baseline !important;
	  }
	
	  &-center-center {
	    align-items: center !important;
	    justify-content: center !important;
	  }
	
	  &-content-end {
	    justify-content: flex-end !important;
	  }
	
	  &-content-center {
	    justify-content: center !important;
	  }
	
	  &-between {
	    justify-content: space-between !important;
	  }
	
	  &-around {
	    justify-content: space-around !important;
	  }
	
	  &-evenly {
	    justify-content: space-evenly !important;
	  }
	
	  &-wrap {
	    flex-wrap: wrap !important;
	  }
	
	  &-children-center {
	    align-self: center !important;
	  }
	
	  &-flex1 {
	    flex: 1;
	  }
	
	  @for $i from 1 through 10 {
	    & .flex-#{$i} {
	      flex: $i;
	    }
	  }
	
	  // 
	  &-none {
	    flex: none
	  }
	}
</style>