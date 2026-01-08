<!--
 * @Author: elk
 * @Date: 2026-01-07 11:20:00
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-08 16:39:16
 * @FilePath: /hkt-applet/components/Upload/index.vue
 * @Description: 通用上传组件
-->
<template>
	<view class="custom-upload" :style="customStyle">
    <!-- v-if="internalFileList.length === 0" -->
		<up-upload
			:action="action"
			:fileList="internalFileList"
			:maxCount="maxCount"
			:accept="accept"
			:sizeType="sizeType"
			:capture="capture"
			:compressed="compressed"
			:maxDuration="maxDuration"
			:camera="camera"
			:uploadIcon="uploadIcon"
			:uploadIconColor="uploadIconColor"
			:useBeforeRead="useBeforeRead"
			:previewFullImage="previewFullImage"
			:disabled="disabled"
			:imageMode="imageMode"
			:name="name"
			:deletable="deletable"
			:maxSize="maxSize"
			:extension="extension"
			:customStyle="uploadCustomStyle"
			@beforeRead="handleBeforeRead"
			@afterRead="handleAfterRead"
			@oversize="handleOversize"
			@clickPreview="handleClickPreview"
			@delete="handleDelete"
			@afterAutoUpload="handleAfterAutoUpload"
		>
			<!-- 将父组件的插槽内容作为 trigger 插槽传递给 u-upload 组件 -->
			<template class="pubColumnFlex" #trigger v-if="$slots.default">
				<slot></slot>
			</template>
			<template class="pubColumnFlex" #trigger v-else>
				<up-icon name="camera-fill" size="24"></up-icon>
				<view>上传文件</view>
			</template>
		</up-upload>
    <!-- 已上传文件列表 -->
    <!-- <view v-else>
      <view v-for="(file, index) in internalFileList" :key="file.url" class="uploaded-file">
        <view class="file-info">
          <up-image :src="file.url" :mode="imageMode" :preview-full-image="previewFullImage" />
        </view>
        <view class="delete-btn" @click="handleDelete(index)">删除</view>
      </view>
    </view> -->
  </view>
</template>

<script setup>
import { ref, watch } from "vue";

// 定义组件属性
const props = defineProps({
	// 上传接口地址
	action: {
		type: String,
		default: "",
	},
	// 文件列表
	fileList: {
		type: Array,
		default: () => [],
	},
	// 最大上传数量
	maxCount: {
		type: [Number, String],
		default: 9,
	},
	// 接受的文件类型
	accept: {
		type: String,
		default: "image",
	},
	// 图片或视频拾取模式
	capture: {
		type: [String, Array],
		default: ["album", "camera"],
	},
	// 选择文件的后缀名
	extension: {
		type: Array,
		default: () => [],
	},
	// 是否压缩视频
	compressed: {
		type: Boolean,
		default: true,
	},
	// 拍摄视频最长时间
	maxDuration: {
		type: Number,
		default: 60,
	},
	// 摄像头前后置
	camera: {
		type: String,
		default: "back",
	},
	// 上传图标
	uploadIcon: {
		type: String,
		default: "camera-fill",
	},
	// 上传图标颜色
	uploadIconColor: {
		type: String,
		default: "#D3D4D6",
	},
	// 是否开启文件读取前事件
	useBeforeRead: {
		type: Boolean,
		default: false,
	},
	// 是否显示内置预览功能
	previewFullImage: {
		type: Boolean,
		default: true,
	},
	// 是否禁用
	disabled: {
		type: Boolean,
		default: false,
	},
	// 图片裁剪模式
	imageMode: {
		type: String,
		default: "aspectFill",
	},
	// 标识符
	name: {
		type: String,
		default: "",
	},
	// 是否可删除
	deletable: {
		type: Boolean,
		default: true,
	},
	// 文件大小限制
	maxSize: {
		type: [Number, String],
		default: Number.MAX_VALUE,
	},
	// 自定义样式
	customStyle: {
		type: Object,
		default: () => {},
	},
	// 上传组件自定义样式
	uploadCustomStyle: {
		type: Object,
		default: () => {},
	},
	// 图片尺寸类型
	sizeType: {
		type: Array,
		default: () => ["original", "compressed"],
	},
});

// 定义组件事件
const emit = defineEmits([
	"update:fileList",
	"beforeRead",
	"afterRead",
	"oversize",
	"clickPreview",
	"delete",
	"afterAutoUpload",
]);

// 内部文件列表
const internalFileList = ref([...props.fileList]);

// 监听外部fileList变化，更新内部列表
watch(
	() => props.fileList,
	(newVal) => {
		internalFileList.value = [...newVal];
	},
	{ deep: true }
);

// 监听内部fileList变化，通知外部
watch(
	internalFileList,
	(newVal) => {
		console.log("🚀 ~ newVal:", newVal)
		emit("update:fileList", [...newVal]);
	},
	{ deep: true }
);

// 处理上传前事件
const handleBeforeRead = (file) => {
	emit("beforeRead", file);
	return true;
};

// 处理上传后事件
const handleAfterRead = ({ file }) => {
	console.log("🚀 ~ handleAfterRead ~ file:", file);
	emit("afterRead", file, internalFileList);
	// 如果是自动上传，不需要手动处理
	if (props.action) {
		return;
	}

	// 手动上传处理，模拟上传成功
	const tempFile = {
		url: file.url,
		thumb: file.path,
		name: file.name || "file",
		type: props.accept,
		isImage: props.accept === "image",
		isVideo: props.accept === "video",
		status: "success",
	};

	internalFileList.value.push(tempFile);
};

// 处理文件超出大小限制事件
const handleOversize = (file) => {
	emit("oversize", file);
	uni.showToast({
		title: `文件大小不能超过 ${props.maxSize / 1024 / 1024}MB`,
		icon: "none",
	});
};

// 处理点击预览事件
const handleClickPreview = (item, index) => {
	emit("clickPreview", item, index);
};

// 处理删除事件
const handleDelete = (index) => {
	console.log("🚀 ~ handleDelete ~ index:", index)
	internalFileList.value.splice(index, 1);
  console.log("🚀 ~ handleDelete ~ fileList:", props.fileList)
	emit("delete", index);
};

// 处理自动上传完成事件
const handleAfterAutoUpload = (data) => {
	emit("afterAutoUpload", data);
};
</script>

<style lang="scss" scoped>
.custom-upload {
	/* 自定义上传组件容器样式 */
	width: 100%;
	:deep(.u-upload__wrap) {
		/* 自定义上传组件内部样式 */

		.u-upload__wrap__preview {
			/* 自定义预览图片样式 */
			margin: 10rpx;
		}
	}
}
</style>
