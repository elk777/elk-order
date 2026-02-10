<!--
 * @Author: elk
 * @Date: 2025-07-21 21:58:48
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-09 14:05:06
 * @FilePath: /hkt-applet/pages/my/index.vue
 * @Description: 我的页面
-->
<template>
	<view class="my-container">
		<NavbarMini />
		<!-- 用户信息模块 -->
		<User class="user-container" />
		<!-- 邀请绑定模块 -->
		<Couple />
		<!-- 功能列表模块 -->
		<FunList />
		<!-- 底部tabbar模块 -->
		<Tabbar :current="3" />
	</view>
</template>

<script setup>
import NavbarMini from "@/components/NavbarMini/index.vue";
import Tabbar from "@/components/Tabbar/index.vue";
import User from "./component/User.vue";
import Couple from "./component/Couple.vue";
import FunList from "./component/FunList.vue";
</script>

<style lang="scss" scoped>
.my-container {
	position: relative;
	.user-container {
		position: absolute;
		top: 8.5vh;
		width: 100%;
		box-sizing: border-box;
	}
}
</style>
