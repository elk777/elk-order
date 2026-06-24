<!--
 * @Author: elk
 * @Date: 2026-01-07 11:20:00
 * @LastEditors: elk 
 * @LastEditTime: 2026-02-10 10:29:47
 * @FilePath: /hkt-applet/components/Upload/index.vue
 * @Description: 通用上传组件
-->
<template>
	<view class="custom-upload" :style="computedStyles">
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
	</view>
</template>
<script>
// 专门用来放页面级配置
export default {
	options: { styleIsolation: "shared" }, // 微信小程序样式隔离关闭
};
</script>
<script setup>
import { ref, watch, computed } from "vue";
import { normalizeMediaUrl } from "@/utils/media.js";

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
	// slot 内容自定义样式
	slotStyle: {
		type: Object,
		default: () => ({}),
	},
	// 上传后预览图片样式
	previewStyle: {
		type: Object,
		default: () => ({}),
	},
	// 图片尺寸类型
	sizeType: {
		type: Array,
		default: () => ["original", "compressed"],
	},
	// 是否显示边框
	showBorder: {
		type: Boolean,
		default: true,
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
const internalFileList = ref(normalizeFileList(props.fileList));
console.log("🚀 ~ internalFileList:", internalFileList)

// 监听外部fileList变化，更新内部列表
watch(
  () => props.fileList,
  (newVal) => {
    // 确保newVal是数组类型
    const normalizedVal = normalizeFileList(newVal);
    // 只有当内容真正变化时才更新
    if (JSON.stringify(normalizedVal) !== JSON.stringify(internalFileList.value)) {
      internalFileList.value = [...normalizedVal];
    }
  },
  { deep: true }
);

// 监听内部fileList变化，通知外部
// watch(
// 	internalFileList,
// 	(newVal) => {
// 		console.log("🚀 ~ newVal:", newVal);
// 		emit("update:fileList", [...newVal]);
// 	},
// 	{ deep: true }
// );

// 计算 CSS 变量
const computedStyles = computed(() => {
	const styles = {};
	// 转换 slot 样式为 CSS 变量
	if (props.slotStyle) {
		Object.entries(props.slotStyle).forEach(([key, value]) => {
			const cssKey = `--slot-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
			styles[cssKey] = value;
		});
	}
	// 转换预览图片样式为 CSS 变量
	if (props.previewStyle) {
		Object.entries(props.previewStyle).forEach(([key, value]) => {
			const cssKey = `--preview-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
			styles[cssKey] = value;
		});
	}
	// 控制边框显示
	if (!props.showBorder && !styles["--slot-border"]) {
		styles["--slot-border"] = "none";
	}
	return styles;
});

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
		url: normalizeMediaUrl(file.url),
		thumb: normalizeMediaUrl(file.path),
		name: file.name || "file",
		type: props.accept,
		isImage: props.accept === "image",
		isVideo: props.accept === "video",
		status: "success",
	};

	internalFileList.value.push(tempFile);
	// 手动通知父组件
	emit("update:fileList", [...internalFileList.value]);
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
	console.log("🚀 ~ handleDelete ~ index:", index);
	internalFileList.value.splice(index, 1);
	console.log("🚀 ~ handleDelete ~ fileList:", props.fileList);
	emit("delete", index);
	// 手动通知父组件
	emit("update:fileList", [...internalFileList.value]);
};

// 处理自动上传完成事件
const handleAfterAutoUpload = (data) => {
	emit("afterAutoUpload", data);
};

function normalizeFileList(fileList) {
	if (!Array.isArray(fileList)) return [];
	return fileList.filter(Boolean).map((file) => ({
		...file,
		url: normalizeMediaUrl(file.url || file.path || file.thumb || ""),
		thumb: normalizeMediaUrl(file.thumb || file.url || file.path || ""),
	}));
}
</script>

<style lang="scss" scoped>
@import "@/common/upload.scss";
.custom-upload {
	/* 自定义上传组件容器样式 */
	width: 100%;
	// 自定义上传组件容器样式
	:deep(.upload-slot) {
		width: var(--slot-width, 100vw) !important;
		height: var(--slot-height, 150px) !important;
	}
	// 自定义上传组件上传按钮样式
	:deep(.u-upload) {
		width: var(--slot-width, 100%) !important;
		height: var(--slot-height, 150px) !important;
		border: var(--slot-border, 1px dashed $gray-color) !important;
		border-radius: var(--slot-border-radius, 0) !important;
	}
	:deep(.u-upload .u-popup) {
		display: none;
	}
	:deep(.u-upload__wrap) {
		width: var(--slot-width, 100%) !important;
		height: var(--slot-height, 150px) !important;
		justify-content: var(--slot-justify-content, center) !important;
		align-items: var(--slot-align-items, center) !important;
	}
	// 上传成功后，预览区域的样式
	:deep(.u-upload__wrap__preview) {
		width: var(--preview-width, 100%) !important;
		height: var(--preview-height, auto) !important;
		margin: var(--preview-margin, 0px) !important;
	}
	// 上传成功后，预览图片的样式
	:deep(.u-upload__wrap__preview__image) {
		width: var(--preview-width, 100%) !important;
		height: var(--preview-height, 150px) !important;
	}
}
</style>
