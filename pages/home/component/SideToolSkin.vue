/**
* @Description: 侧边导航栏-皮肤弹出框
* @Author: elk
* @Date: 2025-08-28 16:13:58
* @LastEditors:
* @LastEditTime: 2025-08-28 16:13:58
*/

<template>
	<view class="skin-pop">
		<up-popup :safeAreaInsetTop='true' :pageInline='false' :indicator="false" :show="show" @close="close" mode="top">
			<view class="skin-pop-container">
				<view class="skin-pop-title">挑选一张你喜欢的壁纸吧~</view>
				<!-- 本地图片列表 -->
				<view style="width: 100vw;">
					<up-scroll-list :indicator='false'>
						<view class="pop-imags" v-for="item in wallpapers" :key="item.id" @click="handleApply(item)">
							<up-image :radius='10' :width="100" :height="180" :src="item.thumb" mode="aspectFill"></up-image>
							<view v-if="isSelected(item)" class="skin-active pubFlex">
								<up-icon name="checkbox-mark" color="#ffffff" size="18"></up-icon>
							</view>
							<view class="skin-name">{{ item.name }}</view>
						</view>
					</up-scroll-list>
				</view>
				<view class="shade" />
				<!-- 自定义图片上传 -->
				<view class="pubFlex skin-pop-upload" @click="handleUpload">
					<up-icon v-if="uploading" name="reload" size="22" color="#FF5C8D"></up-icon>
					<up-image v-else width="30" height="20" src="/static/images/home/img.svg"></up-image>
					<view>{{ uploading ? '上传中' : '自定义上传' }}</view>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<script setup>
	import {
		useSkinPop
	} from '@/hooks/home/sideTool.js';
	import {
		HOME_SKIN_MEDIA_TYPES,
		HOME_SKIN_VIDEO_LIMIT_SECONDS,
		useHomeSkin
	} from '@/hooks/home/useHomeSkin.js';

	const homeSkin = useHomeSkin();
	const wallpapers = homeSkin.wallpapers;
	const uploading = homeSkin.uploading;
	const skinPop = useSkinPop();
	let show = skinPop.isOpen;

	function close() {
		skinPop.close();
	}

	function isSelected(item) {
		return homeSkin.selectedSkin.value?.id === item.id;
	}

	function handleApply(item) {
		homeSkin.applySkin(item);
		close();
	}

	async function handleUpload() {
		if (uploading.value) return;
		const mediaType = await chooseUploadType();
		if (!mediaType) return;

		const skin = await homeSkin.chooseCustomSkin(mediaType);
		if (skin) {
			close();
		}
	}

	function chooseUploadType() {
		return new Promise((resolve) => {
			uni.showActionSheet({
				itemList: ['上传图片', `上传视频（${HOME_SKIN_VIDEO_LIMIT_SECONDS}秒内）`],
				success: (res) => {
					resolve(res.tapIndex === 1 ? HOME_SKIN_MEDIA_TYPES.VIDEO : HOME_SKIN_MEDIA_TYPES.IMAGE);
				},
				fail: () => resolve(''),
			});
		});
	}
</script>

<style lang="scss" scoped>
	.skin-pop {
		width: 100%;
		height: 100%;
		
		.pop-reset {
			display: block;
		}
		.skin-pop-container {
			padding-bottom: 12px;
		}
		.skin-pop-title {
			padding: 10px 0 0 15px;
			color: $tinge-color;
			font-size: 14px;
		}
		.pop-imags {
			position: relative;
			border-radius: 10px;
			margin: 15px 14px 18px;
			width: 100px;
			flex-shrink: 0;
		}
		.skin-active {
			position: absolute;
			right: 8px;
			top: 8px;
			width: 28px;
			height: 28px;
			border-radius: 50%;
			background: $theme-color;
		}
		.skin-name {
			margin-top: 8px;
			color: $tinge-color;
			font-size: 12px;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.skin-pop-upload {
			justify-content: flex-end;
			color: $theme-color;
			padding-right: 15px;
			gap: 4px;
		}
		.shade {
			width: 100%;
			height: 80px;
			position: absolute;
			background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8), transparent);
			bottom: 10%;
		}
	}
</style>
