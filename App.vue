<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
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
	@import '@/common/common.scss'
</style>
