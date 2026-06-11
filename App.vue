<script>
	import { captureInvite, consumePendingInvite } from '@/utils/invite.js'

	export default {
		onLaunch: function(options) {
			// 冷启动：捕获分享链接携带的邀请码并暂存，等登录后再消费。
			captureInvite(options)
			consumePendingInvite()
		},
		onShow: function(options) {
			// 热启动：已登录用户点分享卡片再次进入时同样能捕获并绑定。
			captureInvite(options)
			consumePendingInvite()
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注入组件库css */
	@import "@/uni_modules/uview-plus/index.scss";
	/*每个页面公共css */
	@import '@/common/common.scss';
</style>
