/**
* @Description: 菜单分类组件
* @Author: elk
* @Date: 2025-09-10 16:37:02
* @LastEditors:
* @LastEditTime: 2025-09-10 16:37:02
*/
<template>
	<view class="catetab-container">
		<up-cate-tab class="cate-tab" :tabList="tabList" tabKeyName="title" itemKeyName="title">
			<template #pageItem="{pageItem}">
				<view class="w-full">
					<up-cell-group :border='false'>
						<up-cell :border='false'>
							<template #icon>
								<up-image :src="pageItem.cover" width="100px" height="100px"></up-image>
							</template>
							<template v-slot:title>
								<view>
									{{ pageItem.title }}
								</view>
							</template>
							<template v-slot:label>
								<view class="h-100 pt-1">
									<text class="text-md text-red">￥{{ pageItem.price }}</text>
								</view>
							</template>
							<template v-slot:value>
								<up-number-box></up-number-box>
							</template>
						</up-cell>
					</up-cell-group>
				</view>
			</template>
		</up-cate-tab>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	const tabList = ref([{
			title: '选项一',
			children: [{
				title: '水煮肉片',
				cover: 'https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png',
				price: 88
			}]
		},
		{
			title: '选项二',
			children: [{
				title: '酸菜鱼',
				cover: 'https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png',
				price: 99
			}]
		},
		{
			title: '选项三',
			children: [{
				title: '水煮肉片',
				cover: 'https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png',
				price: 88
			}]
		},
		{
			title: '选项四',
			children: [{
				title: '酸菜鱼',
				cover: 'https://s3.bmp.ovh/imgs/2024/12/16/35bc6d28ab1c8bc7.png',
				price: 99
			}]
		},
	]);
</script>

<style lang="scss" scoped>
	.catetab-container {
		width: 100%;
		height: calc(100vh - 150px);
		margin-top: 10px;
		.cate-tab {
			height: calc(100vh - 150px);
		}
	}
</style>