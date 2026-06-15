<!--
 * @Author: elk
 * @Date: 2026-01-06 14:20:58
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-06 15:34:47
 * @FilePath: /hkt-applet/pages/recipe/component/BottomBtn.vue
 * @Description: 底部按钮组件
-->
 <template>
	<view class="bottom-btn-container">
		<view class="bottom-btn pubFlex">
            <view class="bottom-btn__cancel">
                <up-button type="primary" shape="circle" :color="COLOURS['gray-color']" @click="handelCancel">取消</up-button>
            </view>
            <view class="bottom-btn__submit">
                <up-button type="primary" shape="circle" :loading="loading" @click="handelSubmit" :iconColor="COLOURS['theme-color']" :color="COLOURS['theme-color']">
                    {{ btnText }}
                </up-button>
            </view>
		</view>
	</view>
</template>
<script setup>
import { COLOURS } from "@/config/index.js";
defineProps({
	btnText: {
		type: String,
		default: '提交'
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['submit', 'cancel'])

const handelSubmit = () => {
	emit('submit')
}

const handelCancel = () => {
	emit('cancel')
}
</script>

<style scoped lang="scss">
.bottom-btn-container {
    z-index: 10;
    border-top: 1px solid rgba(255, 92, 141, 0.08);
    width: 100%;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -14rpx 34rpx rgba(30, 30, 30, 0.06);
    backdrop-filter: blur(10px);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    .bottom-btn {
        box-sizing: border-box;
        width: 100%;
        padding: 20rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
    }
    .bottom-btn__cancel {
        width: 38%;
        min-width: 0;
        margin-right: 20rpx;
    }
    .bottom-btn__submit {
        flex: 1;
        min-width: 0;
    }
}
</style>
 
