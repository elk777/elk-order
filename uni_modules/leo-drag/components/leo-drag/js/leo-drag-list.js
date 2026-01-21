export default{
	data(){
		return {
			leo_dataset:{},
			leo_refresherEnabled:true,
			leo_dragDirection:'down',			// 拖拽方向： upward-向上， down-向下
			leo_lazyDragDirection:'',			// 拖拽方向： 延迟处理方向状态 - 专门用于判断触边状态的调整
			leo_dragY:0,						// 记录拖拽时y轴的位置
			leo_dragX:0,						// 记录拖拽时x轴的位置
			leo_dragElHeight:0,					// 拖拽元素的高度
			
			leo_scrollable:true,				// 是否支持滚动
			leo_loadingMoreEnabled:true,		// 是否支持触底加载
			leo_scrollTop:0,					// 滚动产生的顶部边距,需要扣除的顶部距离
			leo_maxHeight:0,					// 拖拽的高度
			leo_scrollToYTimer:null,			// 滚动定时器
			leo_scrollToStatus:false,			// 触边滚动状态
			leo_throttleTimerScroll:null,		//节流函数
		}
	},
	onLoad() {
		this.leo_throttleTimerScroll = this.leo_throttle(this.leo_timerScroll,1000);
	},
	methods:{
		// 按下事件
		leo_pressStart(e){
			this.leo_dragY = e.data.y;				// 触摸位置
			this.leo_dragX = e.data.x;				// 触摸位置
			this.leo_dragElHeight = e.data.height;	// 元素高度
		},
		// 拖动中
		leo_handleMoving(e){
			// 判断和赋值
			this.leo_dragDirection = e.y > this.leo_dragY?'down':'upward'; // 方向
			this.leo_dragY = e.y;		// 记录y轴位置
			this.leo_dragX = e.x;		// 记录x轴位置
			
			// 是否到了指定位置
			// 预计为总高度的5/1
			let edge = this.leo_edge || 8;
			let touchValue = this.leo_dataset.height/edge;	// 触碰边缘的值
			let touchPoint = this.leo_dragY-this.leo_scrollTop;	// 触碰点
			if(!this.leo_scrollToStatus){
				// 当非拖拽状态时，重新赋值向上还是向下 
				this.leo_lazyDragDirection = this.leo_dragDirection;
			}
			if(this.leo_lazyDragDirection === 'down'){
				// 如果是向下，则还需要添加自身高度
				touchPoint+=this.leo_dragElHeight;
				if(touchPoint >= this.leo_dataset.height-touchValue){
					if(!this.leo_throttleTimerScroll){
						this.leo_throttleTimerScroll = this.leo_throttle(this.leo_timerScroll,1000);
					}
					this.leo_throttleTimerScroll(touchValue);
				} else{
					this.leo_nonTouchingState();
				}
			} else if(this.leo_lazyDragDirection === 'upward'){
				if(touchPoint <= touchValue){
					if(!this.leo_throttleTimerScroll){
						this.leo_throttleTimerScroll = this.leo_throttle(this.leo_timerScroll,1000);
					}
					this.leo_throttleTimerScroll(-touchValue);
				} else{
					this.leo_nonTouchingState();
				}
			} else{
				this.leo_nonTouchingState();
			}
		},
		// 非触边状态--重置触边
		leo_nonTouchingState(){
			clearTimeout(this.leo_scrollToYTimer)
			this.leo_scrollToStatus = false;
			this.leo_lazyDragDirection = '';
		},
		// 拖拽结束
		leo_getList_end(e){
			this.leo_refresherEnabled = true;
			this.leo_scrollable = true;
			this.leo_scrollToStatus = false;
			this.leo_loadingMoreEnabled = true;
			clearTimeout(this.leo_scrollToYTimer)
		},
		// 滚动中-需要记录滚动的距离
		leo_list_scroll(e){
			this.leo_scrollTop = e.detail.scrollTop;
		},
		// 定时触发滚动
		leo_timerScroll(e){
			if(this.leo_scrollToStatus) return;
			this.leo_scrollToStatus = true;
			if(!this.leo_scrollToStatus || this.leo_refresherEnabled) return; // 非拖拽状态
			this.leo_continuous_scrolling(e);		// 触发滚动
			this.leo_setTimerScroll(e);	// 回调
		},
		// 定时触发滚动
		leo_setTimerScroll(e){
			clearTimeout(this.leo_scrollToYTimer)
			this.leo_scrollToYTimer = setTimeout(()=>{
				if(!this.leo_scrollToStatus || this.leo_refresherEnabled) return; // 非拖拽状态
				this.leo_continuous_scrolling(e);		// 触发滚动
				this.leo_setTimerScroll(e);	// 回调
			},500)
		},
		// 获取内容区域
		leo_getViewInfo(e){
			this.leo_dataset = e;
		},
		// 获取视图高度
		leo_getAreaStyle(e){
			this.leo_maxHeight = parseFloat(e.height);
		},
		// 允许拖拽状态--let-drag的emit触发
		leo_handleDragStart(i){
			this.leo_refresherEnabled = false;
			this.leo_scrollable = false;
			this.leo_loadingMoreEnabled = false;
		},
		// 让父等触发拖拽
		leo_changeDisabled(i){
			this.$refs.leoDragRef.handleLongpress(i);
		},
		// 滚动触发
		leo_continuous_scrolling(e){
			this.leo_scrollable = true;
			let roll = e;
			if(this.leo_lazyDragDirection === 'upward'){
				if(this.leo_scrollTop <= 0){
					return; // 滚动条到顶了
				};
				if(roll < -this.leo_scrollTop){
					// 需要滚动距离 < 顶部可滚动距离  - 则把剩余滚动值赋予roll
					// 到顶了
					roll = -this.leo_scrollTop;	// scrollTop 目前滚动条位置 然后用负数 代替 实现到顶位置
				};
			} else if(this.leo_lazyDragDirection === 'down'){
				// 窗口高度+目前滚动距离+需滚动距离 > 顶部可滚动距离  - 则把最大值赋给roll
				let maxScroll = this.leo_dataset.height + this.leo_scrollTop;
				let scrollDown = this.leo_dataset.height + this.leo_scrollTop + e; // 向下滚动 产生的最大值
				// 1. 剩余可滚动 + 窗口高度
				
				if(this.leo_maxHeight - maxScroll < 2) {
					 // 如果产生的总滚动px小于2px ，那么不触发滚动
					return
				};
				if(scrollDown > this.leo_maxHeight){
					// 可滚动距离是多少？
					// this.$emit('touchTheBottom')
					// 到底了
					roll = this.leo_maxHeight - maxScroll;
				}
			}
			this.$nextTick(()=>{
				setTimeout(()=>{
					this.$refs.leoDragRef.changeScrollInfo({y:roll});// 滚动产生的距离
				},30)
				this.$refs.leoListRef.scrollIntoViewByNodeTop(roll);	// 滚动
			})
		},
		// 节流函数
		leo_throttle(fn, interval, options = {leading: true,trailing: false}) {
		  // 1.记录上一次的开始时间
		  const { leading,trailing} = options
		  let lastTime = 0
		  let timer = null
		 
		  // 2.事件触发时, 真正执行的函数
		  const _throttle = function (...args) {
			return new Promise((resolve, reject) => { //promise方式返回返回值
			  // 2.1.获取当前事件触发时的时间
			  const nowTime = new Date().getTime()
			  if (!lastTime && !leading) lastTime = nowTime
		 
			  // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
			  const remainTime = interval - (nowTime - lastTime)
			  if (remainTime <= 0) {
				if (timer) {
				  clearTimeout(timer)
				  timer = null
				}
		 
				// 2.3.真正触发函数
				const result = fn.apply(this, args)
				resolve(result)
				// 2.4.保留上次触发的时间
				lastTime = nowTime
				return
			  }
		 
			  if (trailing && !timer) {
				timer = setTimeout(() => {
				  const result = fn.apply(this, args)
				  resolve(result)
				  timer = null
				  lastTime = !leading ? 0 : new Date().getTime()
				}, remainTime)
			  }
			})
		  }
		 
		  _throttle.cancel = function () {
			if (timer) clearTimeout(timer)
			timer = null
			lastTime = 0
		  }
		 
		  return _throttle
		}
	}
}