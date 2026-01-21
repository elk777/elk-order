<template>
	<view class="leo-drag" id="leo-drag" ref="leoDragView" :style="[{'touch-action':isStopPropagation?'none':'auto'}]">
		<!-- touch-action: 阻止滚动 -->
		<movable-area :style="[getAreaStyle]" v-if="showArea">
			<movable-view v-if="isStopPropagation" v-for="(item, index) in showList" :animation="animation" :direction="direction" :key="item.key"
				:damping="damping" :x="item.x" :y="item.y" :disabled="longpress ? disabled : false"
				@longpress="controlLongpress(index)" @touchstart.stop="handleDragStart($event,index)" @change="handleMoving"
				@touchend="handleDragEnd" :style="[{'z-index':activeIndex === index?9:1},{top:activeIndex === index?scrollInfo.y+'px':0},getItemStyle,isList?{height:item.height+'px'}:{}]" class="base-drag-wrapper">
				<view  class="slotContent" ref="slotContent" :style="[slotContentStyle]" >
					<slot :data="{...item,index,activeIndex,moveToIndex}" name="content"></slot>
				</view>
				<view v-if="showPlaceholder(index)" class="placeholder" :style="{height:showList[activeIndex]?.height+'px',top:placeholderTopValue+'px'}">
					<slot name="placeholder"></slot>
				</view>
			</movable-view>
			<movable-view v-else v-for="(item, index) in showList" :animation="animation" :direction="direction" :key="item.key"
				:damping="damping" :x="item.x" :y="item.y" :disabled="longpress ? disabled : false"
				@longpress="controlLongpress(index)" @touchstart="handleDragStart($event,index)" @change="handleMoving"
				@touchend="handleDragEnd" :style="[{'z-index':activeIndex === index?9:1},{top:activeIndex === index?scrollInfo.y+'px':0},getItemStyle,isList?{height:item.height+'px'}:{}]" class="base-drag-wrapper">
				<view  class="slotContent" ref="slotContent" :style="[slotContentStyle]" >
					<slot :data="{...item,index,activeIndex,moveToIndex}" name="content"></slot>
				</view>
				<view v-if="showPlaceholder(index)" class="placeholder" :style="{height:showList[activeIndex]?.height+'px',top:placeholderTopValue+'px'}">
					<slot name="placeholder"></slot>
				</view>
			</movable-view>
		</movable-area>
		<!-- 可用于遮罩指引提示，考虑定位的zindex问题，所以使用插槽插进来 -->
		<slot name="custom"></slot>
	</view>
</template>
<script>
	// #ifdef APP-NVUE
	const dom = uni.requireNativePlugin('dom') // 引入原生插件
	// #endif
	export default {
		name:'leo-drag',
		emits: ['getAreaStyle','getItemStyle','pressStart','handleDragStart','handleMoving','handleDragEnd','getList','update:list','getItemHeight'],
		props: {
			slotContentStyle:{	// 自定义slotContent的样式，列表的每个父级样式
				type:Object,
				default: () => {}
			},
			list: {		// 列表
				type: Array,
				default: () => []
			},
			column: {	// 每行显示多少数量，如果是单项(column：1),可根据自定义高度动态变化，并且可拖拽滚动列表；
				type: Number,
				default: 1
			},
			height: {	// 可拖拽的区域宽度，auto 为根据子级高度(itemHeight)计算
				type: String,
				default: 'auto'
			},
			itemHeight: {// 每个子元素的高度，为auto时，计算最高元素
				type: String,
				default: 'auto'
			},
			direction: {	// 可拖动方向
				type: String,
				default: 'all',
				validator: value => {
					return ['all', 'vertical', 'horizontal', 'none'].includes(value);
				}
			},
			dragDirection: {  // 目前拖动方向 upward-向上， down-向下
				type: String,
				default: 'down'
			},
			animation: { 	// 拖动时开启动画
				type: Boolean,
				default: true
			},
			damping: {		// 用于控制x或y改变时的动画和过界回弹的动画
				type: Number,
				default: 20
			},
			swapMode:{			// 替换模式：true:位置后排，false：两位替换
				type: Boolean,
				default: true
			},
			longpress: {	// 是否禁用
				type: Boolean,
				default: true
			},
			supportLongpress: {	// 是否支持长按
				type: Boolean,
				default: false
			},
			isStopPropagation: {	// 是否阻止事件冒泡: 可用于判断是否拖拽状态
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				showList: [],		// 显示的数据；最终都会根据cloneList赋值
				cloneList: [],		// 为了不影响视图突兀变化，使用cloneList代替showList的数据下标变化；cloneList的数据会比showList优先变化
				disabled: true,		// 是否允许拖动
				activeIndex: -1,	// 当前拖动的item
				moveToIndex: -1,	// 当前拖动的item > 拖动到那一块： 也就是下一块item
				oldIndex: -1,		// 上一块item的位置
				tempDragInfo: {		// 计算拖动的值
					x: '',
					y: ''
				},
				oldPosition:{y:0},	// 触边时滚动位置
				itemMaxHeight: "80px",
				width:'100%',
				showArea: false,		// 在nvue，会出现空白或者部分元素不显示的问题
				viewMaxHeight:80,		// 全部视图高度，仅在isList === true时，使用
				activeY:0,				// 获得下标的y轴
				scrollInfo:{x:0,y:0},	// 滚动产生的信息
			}
		},
		watch:{
			"list":{
				handler(){
					let list = this.deepCopy(this.list) || [];
					// 先拿到新增数据，因为是从父级侦听获取数据，并且是向后添加数据，所以需要使用剪切
					if(list.length > this.showList.length){
						list.splice(0,this.showList.length);
						list = [...this.showList,...list];
						this.initList(list,true);
					} else{
						// 如果小于显示长度 说明刷新或者删除了说明元素，这个时候应该更新列表
						this.$nextTick(()=>{
							this.initList(list,true);
						})
					}
				},
				deep:true,
				immediate:true
			}
		},
		computed: {
			// 拿到活动下标的高度
			placeholderTopValue(){
				let height = 0;
				try{
					if(this.showList && this.showList[this.activeIndex]){
						height = -this.showList[this.activeIndex].height;
					}
				}catch(e){
					console.log("eee",e)
				}
				return height;
			},
			// 单独一排: 则不需要计算
			isList(){
				let is = false;
				// #ifndef APP-NVUE
				is = this.column === 1;		// 说明是列表
				// #endif
				return is;
			},
			// 给拖动区域设置宽高
			getAreaStyle() {
				// 给可拖动区域设置宽高
				const width = this.getRealWidth(this.width);
				let height = this.height;
				if(height === 'auto'){
					// 长度/横排的数量 * 高度 = 总高度； 不能使用viewMaxHeight的高度，因为这是根据每个item的高度分别增加的，而不是根据 最高的item增加的。
					height = this.isList ? this.viewMaxHeight : Math.ceil(this.showList.length / this.column) * this.getItemHeight;
				}
				let style = {
					width: width + 'px',
					height:  height + 'px',
				};
				this.$emit("getAreaStyle",style)
				return style;
			},
			// 给item设置高度和宽度
			getItemStyle() {
				let itemHeightWidth = {
					width: this.getItemWidth + 'px',
					height: this.getItemHeight + 'px',
				};
				this.$emit("getItemStyle",itemHeightWidth)
				return itemHeightWidth;
			},
			// 设置每个item的高度。如果是列表(isList === true)则忽略 --- 默认获取最高的item
			getItemHeight() {
				// 获取item的高度
				// parseFloat的用法：
				// parseFloat("3.14");          // 3.14
				// parseFloat("  42.7  ");      // 42.7，前后的空格会被忽略
				// parseFloat("3.14abc");        // 3.14，遇到字母停止解析
				// parseFloat("abc3.14");        // NaN，开头是字母，无法解析
				// parseFloat("100");            // 100，整数也被成功解析为浮点数
				// parseFloat("0.5");            // 0.5
				// parseFloat("1e3");            // 1000，科学计数法
				let value = this.itemHeight === 'auto'?parseFloat(this.itemMaxHeight):parseFloat(this.itemHeight);
				this.$emit("getItemHeight",value);
				return value;
			},
			// 设置item的宽度。
			getItemWidth() {
				// 获取item的宽度
				const width = this.getRealWidth(this.width);
				return (parseFloat(width) / this.column).toFixed(2);
			},
		},
		created() {
			// this.initList(this.showList, true);  // 新数据和是否需要重新设置高度,数据更新请在外部调用：this.$refs.leoDrag.initList(newList, true);
			// 拖动请在外部使用@touchstart 事件 调用：this.$refs.leoDrag.handleLongpress(index);
			this.showList = this.deepCopy(this.list) || [];
		},
		mounted() {
			this.setLeoDrag();
		},
		methods: {
			// 显示占位
			showPlaceholder(i){
				// 位于底部或者指定位置等于活动位置时,都不会显示占位
				let isShow = false;
				if(this.moveToIndex > this.activeIndex){
					// 指定下标位置大于活动下标，i-1; 目的是为了用指定位置的下一级判断占位
					if(this.moveToIndex === (i-1)){
						isShow = true;
					}
					// else if(this.moveToIndex === this.showList.length-1){
					// 	if(this.moveToIndex === i){
					// 		isShow = true;  // 是否位于底部
					// 	}
					// }
				} else if(this.moveToIndex === this.activeIndex){
					return false; // 位置不变时
				} else if(this.moveToIndex < this.activeIndex){
					if(this.moveToIndex === i){
						isShow = true;
					}
				}
				return isShow;
			},
			// 长按事件
			controlLongpress(i){
				if(this.supportLongpress){
					this.handleLongpress(i);
				}
			},
			//长按事件或者在外部直接调用，才允许拖动
			handleDragStart(enent,index) {
				// // 哪个开始活动
				// this.activeIndex = index;
				// // 记录一下旧的下标
				// this.oldIndex = index;
				this.$emit('pressStart',{enent,data:this.cloneList[index]})
			},
			// 允许拖动状态
			handleLongpress(index) {
				this.disabled = false;
				// 哪个开始活动
				this.activeIndex = index;
				// 记录一下旧的下标
				this.oldIndex = index;
				this.$emit('handleDragStart',index)
			},
			// 滚动时，改动列表的y轴
			changeScrollInfo(detail){
				// 滚动触碰边缘触发
				this.scrollInfo.y += detail.y;
				let index = this.activeIndex;
				// this.cloneList = this.deepCopy(this.showList);
			},
			// 拖拽--开始-摁下触发
			//拖拽中
			handleMoving(e) {
				if (e.detail.source !== 'touch') return;
				let {x,y} = e.detail;
				
				if(this.isList){
					// 如果是列表需要添加滚动产生的边距
					y = y + this.scrollInfo.y; 
					
					this.oldPosition.y = y;
				}
				this.changeListPosition({x,y})
			},
			// 改变列表位置
			changeListPosition({x=0,y=0,type}){
				// x 手指按下拖动，产生的位置，超出了item的宽度，那么就改变下标，包括y轴。
				let currentX = Math.floor((x + this.getItemWidth / 2) / this.getItemWidth); 
				let currentY = Math.floor((y + this.getItemHeight / 2) / this.getItemHeight);
				// moveToIndex：通过计算横排数量，偏移量（ x，y ），得出下标位置
				this.moveToIndex = Math.min(currentY * this.column + currentX, this.cloneList.length - 1); // 滑到了哪个位置
				// 如果是列表的情况 -- 触碰元素的边缘就检测到下标
				if(this.isList){
					// 列表的情况, 无需考虑x轴;  通过y轴和列表的高度来判断;
					let currentH = 0;
					for (let i = 0; i < this.cloneList.length; i++) {
						currentH += this.cloneList[i].height;
						if(this.dragDirection === 'down'){
							// 往下的情况下 ---- 当前活动的下标的高度( 也就是拖动的底部 )碰到下一个元素时； 赋值下标
							/*
								下一个下标的5/1；位置触发
								如果到了最后一个时，让下一个触发的高度变成当前拖动到指定位置的高度，避免照成到达了底部后下标位置有差异的问题；
							**/ 
							let nextH = this.cloneList[i+1]? this.cloneList[i+1].height / 5 : currentH ;
							if(currentH > (y+this.cloneList[this.activeIndex].height - nextH)){
								this.moveToIndex = i;
								break;
							}
						} else{
							// 往上拖拽时 ---- 当前活动的下标( 也就是拖动的顶部 )碰到上一个元素时； 赋值下标
							let theH = this.cloneList[i-1]? this.cloneList[i-1].height / 5 : 0 ;	// 下一个下标的5/1；位置触发
							if(currentH > (y+theH)){
								this.moveToIndex = i;
								break;
							}
						}
					}
				}
				if (this.oldIndex !== this.moveToIndex && this.oldIndex !== -1 && this.moveToIndex !== -1) {
					// 排序替换
					const newList = this.deepCopy(this.cloneList);			// cloneList的数据会比showList优先变化
					const replaceList = this.deepCopy(this.cloneList);		// cloneList的数据会比showList优先变化
					let splicItem = newList.splice(this.activeIndex,1)[0];	// 删除指定下标，并且返回删除的数据
					newList.splice(this.moveToIndex, 0,splicItem);			// 被移入的下标数据替换成刚刚删除的下标数据
					if(this.swapMode){
						if(this.isList){
							// 需要先吧高度先替换掉---
							replaceList.splice(this.moveToIndex, 0, ...replaceList.splice(this.activeIndex, 1));
						}
						// 替换位置
						this.showList.forEach((item, index) => {
							if (index !== this.activeIndex) {
								let itemIndex = newList.findIndex(val => val.dropId === item.dropId);
								// 在修改轴和y轴时，需要先吧height改变，因为列表的y轴就是根据height赋值的。
								let position = this.getPosition(itemIndex,replaceList);
								if(index === 7){
									console.log("itemIndex",itemIndex)
									console.log("position[1]",position[1])
								}
								item.x = position[0];
								item.y = position[1];
							}
						});
					} else{
						// 两点换位
						replaceList[this.activeIndex].height = this.showList[this.moveToIndex].height;
						replaceList[this.moveToIndex].height = this.showList[this.activeIndex].height;
						
						this.showList.forEach((item, index) => {
							if(this.isList){
								if(this.dragDirection === 'down'){
									if(index > this.activeIndex && index < this.moveToIndex){
										// 在这个期间的高度和y都需要变化
										[item.x, item.y] = this.getPosition(index,replaceList);
									}
								} else if(index < this.activeIndex && index > this.moveToIndex){
									// 在这个期间的高度和y都需要变化
									[item.x, item.y] = this.getPosition(index,replaceList);
								}
							}
							// 说明需要把不需要换位的下标替回来
							if(index === this.oldIndex){
								[item.x, item.y] = this.getPosition(this.oldIndex,replaceList);
							}
							// 当前移动的下标和目标下标互换位置
							if(index === this.moveToIndex){
								[item.x, item.y] = this.getPosition(this.activeIndex,replaceList);
							}
						});
					}
					this.oldIndex = this.moveToIndex;
				}
				
				let list = this.deepCopy(this.showList);
				this.$emit("handleMoving",{list,x,y})
			},
			//拖拽结束
			handleDragEnd(e) {
				setTimeout(()=>{
					this.scrollInfo = {x:0,y:0};
					if (this.disabled) return;  // 为点击不能出发
					if (this.moveToIndex !== -1 && this.activeIndex !== -1 && this.moveToIndex !== this.activeIndex) {
						// 拖动了的话，并且目标位置和活动位置不一样，才来这里
						if(this.swapMode){
							this.cloneList.splice(this.moveToIndex, 0, ...this.cloneList.splice(this.activeIndex, 1));
						} else{
							let active = this.cloneList[this.activeIndex];	// 当前下标
							let move = this.cloneList[this.moveToIndex];	// 目标下标
							// 替换
							this.cloneList[this.activeIndex] = move;
							this.cloneList[this.moveToIndex] = active;
						}
					}
					this.initList(this.cloneList);
					const endList = this.showList.map(item => this.omit(item));
					const list = this.deepCopy(this.cloneList);
					this.$emit("update:list",endList);	// vue3 的更新方法
					this.$emit("getList",endList);	// 更新列表
					this.$emit('handleDragEnd',{list})	// 结束拖拽
					 
					this.activeIndex = -1;
					this.oldIndex = -1;
					this.moveToIndex = -1;
					this.disabled = true;
				})
			},
			//获取当前的位置
			getPosition(index,list = this.cloneList) {
				// 通过计算重新算换 偏移单位。
				let x = (index % this.column) * this.getItemWidth;
				let y = 0;
				if(this.isList){
					// 如果是 单项数据时，不需要通过getItemHeight来排，而是需要根据每个item的高度自动填充
					for (let i = 0; i < list.length; i++) {
						if(index === i) break;
						y += list[i].height;
					}
				} else{
					// 根据最高的item来决定整体的高度
					y = Math.floor(index / this.column) * this.getItemHeight;
				}
				return [x, y];
			},
			// 初始化
			initList(list = [],changeheight = false) {
				const newList = this.deepCopy(list);
				// 给每个item添加一x，y和key
				this.showList = newList.map((item, index) => {
					const [x, y] = this.getPosition(index);
					let data = {
						...item,
						x,
						y,
						dropId:index+1
					}
					let key = "slot"+Math.random() + index;
					// 如果x轴和y轴没变，那么不用更新key来刷新状态
					if(x === item?.x && y === item?.y ){
						if(this.activeIndex !== index){
							// 非当前点击的下标和目标下标的下标不需要生成新的key
							key = item.key;
						}
					}
					// 判断拖动位置的元素是那个
					data.key = key;
					return data;
				});
				this.cloneList = this.deepCopy(this.showList);
				this.$nextTick(()=>{
					this.showArea = true;
				})
				if (changeheight && this.itemHeight === "auto") {
					// 获取到最高的item
					this.$nextTick(() => {
						setTimeout(async () => {
							// #ifdef APP-NVUE
							this.showArea = false;
							let max = 0;
							for (let i = 0; i < this.$refs['slotContent'].length; i++) {
								// 循环 需要异步处理
								await new Promise((resolve, reject) => {
									let viewMaxHeight = 0;
									dom.getComponentRect(this.$refs['slotContent'][i], res => {
										let size = res.size;
										if(this.isList){
											this.cloneList[i].height = size.height;
										}
										viewMaxHeight+=size.height
										if (size.height > max) {
											max = size.height;
										}
										resolve();
									})
									this.viewMaxHeight = viewMaxHeight;
								})
							}
							this.itemMaxHeight = max + "px";
							this.$nextTick(() => {
								this.initList(this.cloneList)
							})
							// #endif
							// #ifndef APP-NVUE
							const query = uni.createSelectorQuery().in(this);
							query.selectAll(".slotContent").boundingClientRect((data) => {
								let domList = JSON.parse(JSON.stringify(data))
								let max = 0;
								let viewMaxHeight = 0;
								
								for (let i = 0; i < domList.length; i++) {
									let height = domList[i].height;
									if(this.isList){
										this.cloneList[i].height = height;
									}
									viewMaxHeight+=height
									if (height > max) {
										max = height;
									}
								}
								this.viewMaxHeight = viewMaxHeight;  // 内容区域总高度
								this.itemMaxHeight = max + "px";
								this.initList(this.cloneList)
							}).exec();
							// #endif
						}, 0)
					})
				}
			},
			// 数据的长度不变的情况下-更新数据-减少加载带来的画面卡顿
			updataList(list){
				// 注意做好拖拽时规避 更新
				if(this.isStopPropagation) return;  // 拖拽中状态不可更新数据
				const newList = this.deepCopy(list);
				for (let i = 0; i < newList.length; i++) {
					this.showList[i] = {...this.showList[i],...newList[i]}
				}
				this.cloneList = this.deepCopy(this.showList);
			},
			// 克隆数据
			deepCopy(source) {
				return JSON.parse(JSON.stringify(source));
			},
			// 省略初始化时添加的 x，y和key等参数
			omit(obj, args = ['x', 'y', 'key','dropId','height']) {
				if (!args) return obj;
				const newObj = {};
				const isString = typeof args === 'string';
				const keys = Object.keys(obj).filter(item => {
					if (isString) {
						return item !== args;
					}
					return !args.includes(item);
				});
			 
				keys.forEach(key => {
					if (obj[key] !== undefined) newObj[key] = obj[key];
				});
				return newObj;
			},
			// 因为可能获取的宽度是0，需要需要重调
			setLeoDrag(size = 5) {
				if (size < 0) return;
				
				// #ifdef APP-NVUE
				dom.getComponentRect(this.$refs['leoDragView'], res => {
					let data = res.size;
					this.getViewCallback(data,size);
				})
				// #endif
				
				// #ifndef APP-NVUE
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select(".leo-drag").boundingClientRect((data) => {
						this.getViewCallback(data,size);
					}).exec();
				})
				// #endif
			},
			// 初次获取元素宽高后
			getViewCallback(data,size){
				if (!data || data.width < 50) {
					setTimeout(()=>{
						size = size - 1;
						this.setLeoDrag(size);
					},300)
					return
				}
				this.width = data.width;
				this.$nextTick(()=>{
					this.initList(this.showList, true); // 初始化 dom
				})
			},
			//获取实际的宽度
			getRealWidth(w) {
				let width = w + "";
				if (width.includes('%')) {
					const windowWidth = uni.getSystemInfoSync().windowWidth;
					width = windowWidth * (parseFloat(width) / 100);
				}
				return width;
			}
		}
	}
</script>
 
<style lang="scss" scoped>
	.base-drag-wrapper {
		opacity: 1;
		z-index: 1;
		color: #212121;
		display: flex;
		align-items: center;
		transition: top 0.4s;
		
		flex-wrap: wrap;
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
	}
	.slotContent{
		display: flex;
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
		
		:deep(){
			// 微信小程序会多嵌一层view--综合一起设置
			&>view{
				width: 100%;
				flex: 1;
			}
		}
	}
	.placeholder{
		position: absolute;
		width: 100%;
		height: 100%;
		animation:animationShows .51s linear;
	}
	@keyframes animationShows{		0%   {opacity: 0;}
		20%  {opacity: 0;}		100% {opacity: 1;}	}
	
	
	
	.leo-drag{
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
	}
	.loading {
		color: pink;
	}
</style>