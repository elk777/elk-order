	import base64Img from './base64Img';
	import { initVueI18n } from '@dcloudio/uni-i18n'
	import messages from '../i18n/index.js'
	const { t } = initVueI18n(messages);	
	
	export default {
		emits: ['scroll','getViewInfo','emptyData','dataErr','notLoggedIn','getListApi'],
		props: {
			emptyMsg:{			// 样式：空内容的文字
				type: [Object, String],
				default: () => {
					return ''
				}
			},
			butSy:{				// 样式：空内容的按钮
				type: [Object, String],
				default: () => {
					return ''
				}
			},
			scrollable: {			// 是否支持滚动
				type: Boolean,
				default: () => {
					return true
				}
			},
			dataType:{			// 父级接收类型--虚拟列表
				type: String,
				default: () => {
					return 'item'
				}
			},
			pageSize: {			// 每页请求数量
				type: [Number, String],
				default: () => {
					return 10
				}
			},
			isLogin:{			// 是否登录
				type: [Boolean],
				default: () => {
					return true
				}
			},
			refresherEnabled: {	// 是否允许刷新
				type: Boolean,
				default: () => {
					return true
				}
			},
			loadingMoreEnabled: {	// 是否允许触底加载
				type: Boolean,
				default: () => {
					return true
				}
			},
			notLoggedIn: {		// 未登录的提示内容
				type: Object,
				default: () => {
					return {
						msg: t('leo-drag.notLoggedIn'),
						but: t('leo-drag.toLogin')
					}
				}
			},
			emptyData: {		// 空数据的提示内容
				type: Object,
				default: () => {
					return {
						msg: t('leo-drag.noData'),
						but: t('leo-drag.getData')
					}
				}
			},
			dataErr: {			// 数据报错的提示内容
				type: Object,
				default: () => {
					return {
						msg: t('leo-drag.error'),
						but: t('leo-drag.getData')
					}
				}
			}
		},
		data() {
			return {
				dataList: [],			// v-model绑定的这个变量不要在分页请求结束中自己赋值！！！
				promiseState: {},		// promise的状态
				base64Img,				// 图片
				t,						// 国际化
				isGetListErr: false,	// 获取数据是否报错
				timerEndRefresh: null	// 自动关闭刷新状态
			}
		},
		mounted() {},
		methods: {
			scrollIntoViewByNodeTop(e){
				// e的值是基于视口高度滚动
				this.$refs.paging.scrollIntoViewByNodeTop(e,0,true);
			},
			scrollToY(e){
				// e的值是基于滚动条高度滚动
				this.$refs.paging.scrollToY(e,0,true);
			},
			// 下拉刷新或滚动到底部时会自动触发此方法。z-paging加载时也会触发
			queryList(pageNo, pageSize, type) {
				// type: 0.用户主动下拉刷新 1.通过reload触发(重置) 2.通过refresh(更新)触发 3.通过滚动到底部加载更多或点击底部加载更多触发
				// 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
				// 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
				// 模拟请求服务器获取分页数据，请替换成自己的网络请求
				if (!this.isLogin) return this.$refs.paging.complete(false);	// 未登录
				this.$emit("getListApi",{page:pageNo, size:pageSize, type, dataList:this.dataList, callback:(list,total)=>{
					this.$refs.paging.completeByTotal(list, total);	// 和complete用法一致, 第二参数需要传递数据库的总数量
				}})
			},
			// 虚拟列表获取数据方式
			virtualListChange(list){
				this.dataList = list;
			},
			// 重置列表
			reloadList(callback) {
				this.$nextTick(() => {
					if (this.$refs.paging) {
						// 重置列表，会重置分页
						this.$refs.paging.reload().then(res => {
							this.triggerCallback(callback, res);	// 刷新成功成功
						}).catch(err => {
							this.triggerCallback(callback, err)		// 重置列表失败
						})
					} else {
						this.triggerCallback(callback, {type: '获取$refs.paging失败'});
					}
				})
			},
			// 刷新列表-不重置分页
			upDataList(callback) {
				if (this.dataList.length <= 0) {
					this.reloadList(callback);		// 没有数据则调用 重置列表刷新
				} else {
					this.$nextTick(() => {
						// 刷新列表数据,不重置分页
						if (this.$refs.paging) {
							// 更新列表数据,不会重置分页
							this.$refs.paging.refresh().then(res => {
								this.triggerCallback(callback, res)		// 刷新数据成功
							}).catch(err => {
								this.triggerCallback(callback, err)		// 刷新数据失败
							})
						} else {
							this.triggerCallback(callback, {type: 'this.$refs.paging获取ref失败'})
						}
					})
				}
			},
			// 回调统一判断
			triggerCallback(callback, res = {}) {
				if (typeof(callback) === "function") {
					callback(res); // 回调函数
				}
			},
			// 强行终止下拉刷新---在刷新时,如果时间过久,或者其他原因导致下拉刷新没用关闭,则会自动关闭
			pagingEndRefresh(t) {
				clearTimeout(this.timerEndRefresh)
				this.timerEndRefresh = setTimeout(() => {
					this.$refs.paging.endRefresh(); // 终止下拉刷新状态
				}, t)
			},
			// 下拉刷新事件
			refresherStatusChange(e) {
				/**
				 * e = 0：进入默认状态，倒计时结束时  
				 * e = 1：松手立即刷新状态
				 * e = 2：刷新中
				 * e = 3：刷新成功
				 */
				if (e === 1) {
					// 2500毫秒后自动关闭刷新状态
					this.pagingEndRefresh(2500)
				}
				if (e === 2) {
					// 4000毫秒后自动关闭刷新状态
					this.pagingEndRefresh(4000)
				}
			},
			// 修改指定数据--获取数据成功后,允许在不请求数据更新列表
			changeListValue(item,id){
				for (let i = 0; i < this.dataList.length; i++) {
					let data = this.dataList[i];
					if(item[id] === data[id]){
						this.dataList[i] = {...this.dataList[i],...item}; // 修改指定数据
						break;
					}
				}
			},
			// 未登录的按钮事件
			notLoggedInClick() {
				this.$emit("notLoggedIn");
			},
			// 错误的按钮事件
			dataErrClick() {
				this.$emit("dataErr");
				this.reloadList()
			},
			// 空数据的按钮事件
			emptyDataClick() {
				this.$emit("emptyData");
				this.reloadList()
			},
			// 返回顶部事件
			backToTopClick() {
				if (this.$refs.paging) {
					this.$refs.paging._backToTopClick();
				}
			},
			// 内容高度变化时触发---获取内容窗口信息----获取可视区域数据--不包含滚动
			getViewInfo(e){
				this.$refs.paging._getNodeClientRect('.zp-paging-touch-view').then(res=>{
					this.$emit('getViewInfo',res[0]);		// 获取可视区域的信息
				})
			},
			// 滚动事件
			scroll(e) {
				this.$emit("scroll", e)
			},
			// 清空数据--有些页面是公用此组件，所以在切换前先清除数据
			clear() {
				this.$refs.paging && this.$refs.paging.complete([]);
			}
		}
	}
