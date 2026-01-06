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
            <view style="width: 40%; margin-right: 10px;">
                <up-button type="primary" shape="circle" :iconColor="COLOURS['gray-color']" :color="COLOURS['gray-color']">取消</up-button>
            </view>
            <view style="width: 60%;">
                <up-button type="primary" shape="circle" :loading="loading" @click="handelSubmit" :iconColor="COLOURS['theme-color']" :color="COLOURS['theme-color']">
                    {{ btnText }}
                </up-button>
            </view>
		</view>
	</view>
</template>
<script setup>
import { ref } from 'vue'
import { COLOURS } from "@/config/index.js";
const props = defineProps({
	btnText: {
		type: String,
		default: '提交'
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['submit'])

const handelSubmit = () => {
	emit('submit')
}
</script>

<style scoped lang="scss">
.bottom-btn-container {
    z-index: 10;
    border-top: 1px solid $gray-color;
    width: 100%;
    height: 80px;
    background-color: #ffffff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    .bottom-btn {
        padding: 12px 15px 10px;
    }
}
</style>
 
