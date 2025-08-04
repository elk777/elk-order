<template>
	<view>
		<up-tabbar @change="changeTab" :value="current" inactiveColor="#707070" activeColor="#2177b8">
			<up-tabbar-item v-for="tabItem in TABBAR_DATA" :key="tabItem.id" :text="tabItem.text"
				:badgeStyle="'top: 10px'">
				<template #active-icon>
					<image class="u-page__item__slot-icon" :src="tabItem.actIcon"></image>
				</template>
				<template #inactive-icon>
					<image class="u-page__item__slot-icon" :src="tabItem.icon"></image>
				</template>
			</up-tabbar-item>
		</up-tabbar>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		TABBAR_DATA
	} from '@/config/index.js'
	let current = ref(0); // tab选择的index
	/**
	 * @description: 底部标签点击事件
	 * @param {e}  标签index
	 */
	const changeTab = (e) => {
		uni.switchTab({
			url: TABBAR_DATA[e].pagePath
		})
	}
</script>

<style>
	.u-page__item__slot-icon {
		width: 25px;
		height: 25px;
	}
</style>