/**
 * @Description: 首页-角色切换按钮
 * @Author: elk
 * @Date: 2025-09-09 15:17:22
 * @LastEditors: 
 * @LastEditTime: 2025-09-09 15:17:22
 */

<template>
	<view class="mainbtntype-container pubFlex">
		<view @click="handelRoleCut(item)" class="role-card" :class="item.cardClass" v-for="item of btnTypes" :key="item.id">
			<view class="role-copy">
				<view class="role-title">{{item.title}}</view>
				<view class="role-subtitle">
					<text>{{item.text}}</text>
					<view class="role-arrow pubFlex">
						<up-icon name="arrow-right" color="#ffffff" size="14" />
					</view>
				</view>
			</view>
			<image class="role-illustration" :src="item.path" mode="aspectFit" />
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
	import { requireLogin } from '@/utils/auth.js';
	const userStore = useUserStore()
	const uToastRef = ref(null)

	const show = ref(false)
	const typeName = ref('');

	const btnTypes = ref([{
			id: 0,
			path: '/static/images/home/role-keeper.png',
			title: '我是饲养员',
			text: '上传菜单',
			cardClass: 'role-keeper',
			typeID: 0,
			type: '饲养员'
		},
		{
			id: 2,
			path: '/static/images/home/role-foodie.png',
			title: '我是吃货',
			text: '点餐下单',
			cardClass: 'role-foodie',
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
		return requireLogin(() => {
			if (userStore.userType === item.typeID) {
				uToastRef.value.show({
					type: 'default',
					title: '默认主题',
					message: `当前您已经是${item.type}角色啦`,
				})
				return true
			}
			show.value = true;
			typeName.value = item.type;
			userStore.setUserType(item.typeID);
			return true;
		}, {
			message: '请先登录后选择身份',
		});
	}
	const confirm = () => {
		show.value = false;
	}
</script>

<style lang="scss">
	.mainbtntype-container {
		width: 100%;
		height: 128px;
		margin-top: 0;
		padding: 0;
		box-sizing: border-box;
		justify-content: space-between;

		.role-card {
			position: relative;
			width: calc(50% - 8px);
			height: 100%;
			border-radius: 20px;
			overflow: hidden;
			color: #ffffff;
			box-shadow: 0 12px 22px rgba(255, 92, 141, 0.16);

			&::before {
				content: "";
				position: absolute;
				inset: 0;
				background:
					radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.32), transparent 42%),
					radial-gradient(circle at 86% 84%, rgba(255, 255, 255, 0.18), transparent 36%);
				z-index: 0;
			}

			.role-copy {
				position: relative;
				z-index: 2;
				padding: 21px 0 0 18px;
				max-width: 66%;
			}

			.role-title {
				font-size: 19px;
				line-height: 1.25;
				font-weight: 700;
				letter-spacing: 0;
				text-shadow: 0 2px 8px rgba(130, 70, 160, 0.18);
			}

			.role-subtitle {
				display: flex;
				align-items: center;
				margin-top: 12px;
				font-size: 14px;
				line-height: 1;
				font-weight: 600;
				white-space: nowrap;
				color: rgba(255, 255, 255, 0.94);
			}

			.role-arrow {
				width: 24px;
				height: 24px;
				margin-left: 6px;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.25);
				backdrop-filter: blur(8px);
			}

			.role-illustration {
				position: absolute;
				right: -10px;
				bottom: -4px;
				z-index: 1;
				width: 118px;
				height: 104px;
			}
		}

		.role-keeper {
			background: linear-gradient(135deg, #7b8cff 0%, #9b73ff 48%, #ce77ff 100%);

			.role-illustration {
				right: -12px;
				bottom: -1px;
				width: 122px;
				height: 110px;
			}
		}

		.role-foodie {
			background: linear-gradient(135deg, #ff5f9e 0%, #ff748e 54%, #ffad65 100%);

			.role-illustration {
				right: -20px;
				bottom: -2px;
				width: 134px;
				height: 112px;
			}
		}
	}

	.modalStyle {
		color: $theme-color;
	}
</style>
