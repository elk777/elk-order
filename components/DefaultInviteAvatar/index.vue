<template>
	<view class="default-invite-avatar pubFlex" :style="{ width: size, height: size }">
		<view class="default-invite-plus"></view>
	</view>
</template>

<script setup>
defineProps({
	size: {
		type: String,
		default: '30px',
	},
});
</script>

<style lang="scss" scoped>
	.default-invite-avatar {
		position: relative;
		padding: 1px;
		border: 1px solid $theme-color;
		border-radius: 50%;
		background-color: #ffffff;
		box-sizing: border-box;
	}

	.default-invite-plus {
		width: 100%;
		height: 100%;
		background-image: url("/static/images/add.svg");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 55%;
	}
</style>
