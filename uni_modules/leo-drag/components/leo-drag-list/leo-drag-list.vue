<template>
	<leo-list ref="leoListRef" @scroll="scroll" @getListApi="getListApi" :loadingMoreEnabled="loadingMoreEnabled" :refresherEnabled="refresherEnabled" :scrollable="scrollable" @getViewInfo="getViewInfo">
		<!-- 四位插槽 -->
		<template #top>
			<slot name="top"></slot>
		</template>
		<!-- <template #left>
			<slot name="left"></slot>
		</template> -->
		
		
		<!-- #ifdef MP-WEIXIN -->
		<template #list={dataList}>
			<leo-drag :supportLongpress="supportLongpress" @pressStart="pressStart" @getAreaStyle="getAreaStyle" @handleMoving="handleMoving" :dragDirection="dragDirection" :swapMode="true" @handleDragStart="handleDragStart" :column="1" ref="leoDragRef" id="leoDragRef" @getList="getList" :list="dataList">
				<template #content={data}>
					{{data.key}}
					<slot :data="data" name="content"></slot>
				</template>
			</leo-drag>
		</template>
		<!-- #endif -->
		
		
		
		
		<!-- #ifndef MP-WEIXIN -->
		<template #list={dataList}>
			<leo-drag :supportLongpress="supportLongpress" @pressStart="pressStart" @getAreaStyle="getAreaStyle" @handleMoving="handleMoving" :dragDirection="dragDirection" :swapMode="true" @handleDragStart="handleDragStart" :column="1" ref="leoDragRef" id="leoDragRef" @getList="getList" :list="dataList">
				<template #content={data}>
					<slot :data="data" name="content"></slot>
				</template>
			</leo-drag>
		</template>
		<!-- #endif -->
		<!-- <template #right>
			<slot name="right"></slot>
		</template> -->
		<template #bottom>
			<slot name="bottom"></slot>
		</template>
	</leo-list>
</template>

<script setup>
	import { ref,getCurrentInstance, nextTick, reactive, toRefs } from 'vue';
	
	const props = defineProps({
		supportLongpress:{		// 是否支持长按
			type: Boolean,
			default: true
		}
	})
	
	const emit = defineEmits(['touchTheTop','touchTheBottom','getListApi'])
	
	const leoDragRef = ref(null);		// leo组件
	const leoListRef = ref(null)		// z-paging组件
	
	let dataset = {};					// 内容区域的信息
	let refresherEnabled = ref(true);	// 是否允许刷新
	
	let dragDirection = ref('down');	// 拖拽方向： upward-向上， down-向下
	let lazyDragDirection = '';			// 拖拽方向： 延迟处理方向状态 - 专门用于判断触边状态的调整
	let dragY = 0;						// 记录拖拽时y轴的位置
	let dragX = 0;						// 记录拖拽时x轴的位置
	let dragElHeight = 0;				// 拖拽元素的高度
	
	let scrollable = ref(true);			// 是否支持滚动
	let loadingMoreEnabled = ref(true);	// 是否支持触底加载
	let scrollTop = 0;					// 滚动产生的顶部边距,需要扣除的顶部距离
	let maxHeight = 0;					// 拖拽的高度
	let scrollToYTimer = null;			// 滚动定时器
	let scrollToStatus = false;			// 触边滚动状态
	let scrollvalue = 0;				// 实际上滚动的值
	let throttleTimerScroll = throttle(timerScroll,1000);//节流函数
	function getListApi(e){
		emit('getListApi',e)
	}
	// 按下事件
	function pressStart(e){
		dragY = e.data.y;				// 触摸位置
		dragX = e.data.x;				// 触摸位置
		dragElHeight = e.data.height;	// 元素高度
	}
	// 拖动中
	function handleMoving(e){
		// 判断和赋值
		dragDirection.value = e.y > dragY?'down':'upward'; // 方向
		dragY = e.y;		// 记录y轴位置
		dragX = e.x;		// 记录x轴位置
		
		// 是否到了指定位置
		// 预计为总高度的5/1
		let touchValue = dataset.height/5;	// 触碰边缘的值
		let touchPoint = dragY-scrollTop;	// 触碰点
		if(!scrollToStatus){
			// 当非拖拽状态时，重新赋值向上还是向下 
			lazyDragDirection = dragDirection.value;
		}
		if(lazyDragDirection === 'down'){
			// 如果是向下，则还需要添加自身高度
			touchPoint+=dragElHeight;
			if(touchPoint >= dataset.height-touchValue){
				throttleTimerScroll(touchValue);
			} else{
				nonTouchingState();
			}
		} else if(lazyDragDirection === 'upward'){
			if(touchPoint <= touchValue){
				throttleTimerScroll(-touchValue);
			} else{
				nonTouchingState();
			}
		} else{
			nonTouchingState();
		}
	}
	// 非触边状态--重置触边
	function nonTouchingState(){
		clearTimeout(scrollToYTimer)
		scrollToStatus = false;
		lazyDragDirection = '';
	}
	// 拖拽结束
	function getList(e){
		refresherEnabled.value = true;
		scrollable.value = true;
		scrollToStatus = false;
		loadingMoreEnabled.value = true;
		clearTimeout(scrollToYTimer)
	}
	// 滚动中-需要记录滚动的距离
	function scroll(e){
		scrollTop = e.detail.scrollTop;
	}
	// 定时触发滚动
	function timerScroll(e){
		if(scrollToStatus) return;
		scrollToStatus = true;
		if(!scrollToStatus || refresherEnabled.value) return; // 非拖拽状态
		scrollToY(e);		// 触发滚动
		setTimerScroll(e);	// 回调
	}
	// 定时触发滚动
	function setTimerScroll(e){
		scrollToYTimer = setTimeout(()=>{
			if(!scrollToStatus || refresherEnabled.value) return; // 非拖拽状态
			scrollToY(e);		// 触发滚动
			setTimerScroll(e);	// 回调
		},720)
	}
	// 获取内容区域
	function getViewInfo(e){
		dataset = e;
	}
	// 获取视图高度
	function getAreaStyle(e){
		maxHeight = parseFloat(e.height);
	}
	
	// 允许拖拽状态--let-drag的emit触发
	function handleDragStart(i){
		refresherEnabled.value = false;
		scrollable.value = false;
		loadingMoreEnabled.value = false;
	}
	// 让父等触发拖拽
	function handleLongpress(i){
		leoDragRef.value.handleLongpress(i);
	}
	// 滚动触发
	function scrollToY(e){
		scrollable.value = true;
		let roll = e;
		if(lazyDragDirection === 'upward'){
			if(scrollTop <= 0){
				return; // 滚动条到顶了
			};
			if(roll < -scrollTop){
				// 需要滚动距离 < 顶部可滚动距离  - 则把剩余滚动值赋予roll
				emit('touchTheTop')
				roll = -scrollTop;	// scrollTop 目前滚动条位置 然后用负数 代替 实现到顶位置
			};
		} else if(lazyDragDirection === 'down'){
			// 窗口高度+目前滚动距离+需滚动距离 > 顶部可滚动距离  - 则把最大值赋给roll
			let maxScroll = dataset.height + scrollTop;
			let scrollDown = dataset.height + scrollTop + e; // 向下滚动 产生的最大值
			// 1. 剩余可滚动 + 窗口高度
			if(maxHeight - maxScroll < 2) {
				 // 如果产生的总滚动px小于2px ，那么不触发滚动
				return
			};
			if(scrollDown > maxHeight){
				// 可滚动距离是多少？
				emit('touchTheBottom')
				roll = maxHeight - maxScroll;
			}
		}
		nextTick(()=>{
			setTimeout(()=>{
				leoDragRef.value.changeScrollInfo({y:roll});		// 滚动产生的距离
			},30)
			leoListRef.value.scrollIntoViewByNodeTop(roll);	// 滚动
		})
	}
	
	// 节流函数
	function throttle(fn, interval, options = {leading: true,trailing: false}) {
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
	
	defineExpose({
		handleLongpress   // 暴漏函数
	})
</script>

<style scoped lang="scss">

</style>