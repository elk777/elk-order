/**
 * @Description: 首页-角色切换按钮
 * @Author: elk
 * @Date: 2025-09-09 15:17:22
 * @LastEditors: 
 * @LastEditTime: 2025-09-09 15:17:22
 */

<template>
	<view class="mainbtntype-container pubFlex">
		<view @click="handelRoleCut(item)" class="pub-class" v-for="item of btnTypes" :key="item.id"
			:style="{backgroundImage: `url(${item.path})`}">
			<view class="pub-label" :class="[item.style]">
				<view class="pub-title publcTextSize">{{item.title}}</view>
				<view class="pub-text  publcLabelSize">{{item.text}}
					<span><up-icon name="arrow-right" color="#fff" size="12" /></span>
				</view>
			</view>
		</view>
	</view>
	<!-- 类型一样的消息提示 -->
	<up-toast ref="uToastRef"></up-toast>
	<!-- 类型不一样时的状态框提示 -->
	<up-modal width='500rpx' :show='show' :showConfirmButton='false'>
		<template #default class="pubColumnFlex modalStyle">
			<view class="publcTitleSize">
				切换成功
			</view>
			<view style="margin-top: 15px;" class="publcTextSize">
				您已经成功切换成{{typeName}}角色了
			</view>
		</template>
		<template #confirmButton>
			<up-button color='#FF5C8D' shape='circle' @click="confirm">立即使用</up-button>
		</template>
	</up-modal>
</template>

<script setup>
	import {
		ref
	} from 'vue';
	import {
		useUserStore
	} from '@/stores/user.js'
	const userStore = useUserStore()
	const uToastRef = ref(null)

	const show = ref(false)
	const typeName = ref('');

	const btnTypes = ref([{
			id: 0,
			path: '/static/images/home/feed.png',
			title: '我是饲养员',
			text: '我要做菜',
			style: 'pub-left',
			typeID: 0,
			type: '饲养员'
		},
		{
			id: 2,
			path: '/static/images/home/foodie.png',
			title: '我是吃货呀',
			text: '我要点餐',
			style: 'pub-right',
			typeID: 1,
			type: '吃货'
		}
	])
	/**
	 * @description: 角色切换事件
	 * @param {:type} item: 按钮详细内容
	 * @return {:type} 
	 */
	const handelRoleCut = (item) => {
		if (userStore.userType === item.typeID) {
			uToastRef.value.show({
				type: 'default',
				title: '默认主题',
				message: `当前您已经是${item.type}角色啦`,
			})
			return
		}
		show.value = true;
		typeName.value = item.type;
		userStore.setUserType(item.typeID);
		console.log('item~~~~', item)
	}
	const confirm = () => {
		show.value = false;
	}
</script>

<style lang="scss">
	.mainbtntype-container {
		width: 100%;
		height: 100px;
		margin-top: 2vh;
		justify-content: space-around;

		.pub-class {
			position: relative;
			ition: relative;
			width: 45vw;
			height: 100%;
			border-radius: 20px;
			background-size: 100% 100%;
			/* 宽度100%，高度自适应 */
			background-repeat: no-repeat;
			/* 防止图片重复 */
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

	.modalStyle {
		color: $theme-color;
	}
</style>