<h3 align="center" style="margin: 30px 0 30px;font-weight: bold;font-size:40px;">拖拽列表</h3>
<h3 align="center">可自动排序拖拽，或者脱至指定下标进行指定换位</h3>

## leo-drag 拖拽排序 说明

基于uniapp vue3,使用了movable-area和movable-view内置组件实现移动和过度动画，兼容APP-VUE、H5、MP-WEIXIN。
<div style="color:red">
 <span style="font-size:18px;font-weight:700">!</span> 注意： 在APP-NVUE中，初次加载组件会闪烁一下。不太推荐nvue;
</div>

## [gitee地址：https://gitee.com/lizt816/leo-drag](https://gitee.com/lizt816/leo-drag)

## 安装

#### **uni-app插件市场链接** —— [https://ext.dcloud.net.cn/plugin?id=19587](https://ext.dcloud.net.cn/plugin?id=19587)


## leo-drag简单DOM，更多请看下方API
- 提供简单的使用示例，更多请查看下方的demo

```html
    <!-- 如果使用v-model传递list，则拖动完毕自动更新数据位置，否则使用@getList事件获取到最新拖动的值 -->
	<leo-drag :column="3" ref="myDrop" @getList="getDropList" v-model:list="dragAndDrop">
        <template #content={data}>
            <!-- 根据data.activeIndex 判断是否为当前拖动的元素，自定义添加样式 -->
            <view class="drop" :style="[{'transform':data.index === data.activeIndex?'scale(1.05)':'scale(1)',}]">
                <view class="flex flex-center" style="background-color: aqua;">
                    <view class="ellipsis">
                        {{data.name}}123456789123456789123456789
                    </view>
                    <uni-icons class="flex-none" @touchstart="touchstart(data.index)" style="margin-left: auto;" type="bars" size="30"></uni-icons>
                </view>
            </view>
        </template>
    </leo-drag>
```

```js
export default {
    data() {
        return {
            dragAndDrop:[  // 列表数据
                {name:"元素1"},
                {name:"元素2"},
                {name:"元素3"},
                {name:"元素4"},
                {name:"元素5"},
                {name:"元素6"},
                {name:"元素7"},
            ],
        }
    },
    methods:{
        getDropList(list){
            // 拖拽完毕后获取到的数据
            console.log(list,"eeee")
        },
        touchstart(i){
            // 默认是长按才能拖动，可根据需求，通过触摸拖动元素
            this.$refs.myDrop.handleLongpress(i);
        },
        changeList(){
            // 如果新增或者删除了数据，请调用此函数
            let list = this.dragAndDrop; 
            this.$refs.myDrop.initList(list,true);
        }
    }
}

```
#### 增删
- 因为传递数据和组件数据进行了区分。
- 所以无论是添加或者删除，都需要调用this.$refs.myDrop.initList(list,true)方法重置列表。
- 保证数据的统一性

### 查看示例
- 导入后直接使用这个标签查看演示效果

```html
<!-- // 代码位于 uni_modules/leo-drag/compoents/leo-drag -->
<leo-drag />
```

## API

### Props

| 参数					| 说明															| 类型				| 默认值			|
| ----------------------|---------------------------------------------------------------|-------------------|---------------|
| list					| 列表数组，变化需要调用内部的initList函数化						| <em>Array</em>	| `[]`			|
| column				| 列数															| <em>Number</em>	| `1`			|
| height				| 可拖动区域的高度，默认是auto，将根据itemHeight适配高度				| <em>String</em>	| `auto`		|
| itemHeight			| 拖动元素的高度，默认是auto，会通过计算每个item的最高值决定整体的高度	| <em>String</em>	| `auto`		|
| damping				| 阻尼系数，用于控制x或y改变时的动画和过界回弹的动画，值越大移动越快 	| <em>Number</em>	| `20`			|
| direction				| 默认all，可选值：vertical(垂直)，horizontal(水平)				| <em>Boolean</em>	| `all`			|
| animation				| 拖动时开启动画													| <em>Boolean</em>	| `true`		|
| damping				| 用于控制x或y改变时的动画和过界回弹的动画							| <em>Number</em>	| `20`			|
| disabled				| 是否禁用														| <em>Boolean</em>	| `false`		|
| swapMode				| 替换模式：true:指定位置全部元素后移，false：拖拽到指定位置互换		| <em>Boolean</em>	| `false`		|
| slotContentStyle		| 自定义slotContent属性 自定义样式								| <em>Object</em>	| `{}`			|
| supportLongpress		| 是否支持长按拖拽												| <em>Boolean</em>	| `false`		|
| isStopPropagation		| 是否阻止冒泡													| <em>Boolean</em>	| `false`		|

### Events
| 事件名											| 说明																			| 参数									| 
| ----------------------------------------------|-------------------------------------------------------------------------------|---------------------------------------|
| @getList										| 拖拽后返回的新数据																| list									| 
| @getViewStyle									| 获取item宽高																	| Object								|
| @getAreaStyle									| 获取可拖拽区域宽高																| Object								|
| @getItemHeight								| 获取item高度																	| Object								|
| @handleDragEnd								| 拖拽结束事件																	| 										|
| this.$refs.leoDrag.initList(newList,false)	| 初始化时调用，当height为auto时，需要传递第二个参数为true							| 参数1：新数组;  参数2：是否更新高度		|
| this.$refs.leoDrag.updataList(newList)		| 更新数据：注意，新增数据和删除数据都不应该调用此函数，并且此函数不会更新每个item的高度	| 参数1：新数组;							|





# scroll组件：列表拖拽滚动
- leo-list是基于 <a href="https://ext.dcloud.net.cn/plugin?id=3935"> z-paging组件</a> 进行二次封装; 感谢z-paging组件作者提供如此优秀插件！
- 以下是拖拽滚动的demo，列表下拉刷新和请求数据都在@getListApi中封装好,通过callback回调传入列表list和总数据total即可;
- 注意： leo-list组件与leo-drag插件组合使用的话不推荐用于长列表拖拽; 会出现卡顿问题！！！
- 如果想设置每个元素的间隔，请在leo-list的slotContentStyle中设置padding
- 如果有问题请下载demo查看pages/index/scroll.vue;
- 除了内容和请求API其他地方都请使用上方模板;
- 为了避免和混入(mixins)冲突，内部函数都使用了leo-前缀，请避免使用leo-前缀命名;
- leo-list插件是基于<a href="https://ext.dcloud.net.cn/plugin?id=3935"> z-paging组件</a> 封装; 如有需求请结合<a href="https://z-paging.zxlee.cn/start/intro.html"> z-paging组件文档</a> 适当修改leo-list插件的内容；


```html
    <!-- 此处写法固定，此处是基于z-paging组件进行封装滚动 -->
	<leo-list ref="leoListRef" @scroll="leo_list_scroll" @getListApi="leo_getListApi" :loadingMoreEnabled="leo_loadingMoreEnabled" :refresherEnabled="leo_refresherEnabled" :scrollable="leo_scrollable" @getViewInfo="leo_getViewInfo">
		<template #list={dataList}>
			<leo-drag :slotContentStyle="{'padding':'10rpx'}" :supportLongpress="false" @pressStart="leo_pressStart" @getAreaStyle="leo_getAreaStyle" @handleMoving="leo_handleMoving" :dragDirection="leo_dragDirection" :swapMode="true" @handleDragStart="leo_handleDragStart" :column="1" ref="leoDragRef" id="leoDragRef" @getList="leo_getList_end" :list="dataList">
				<template #content={data}>
					<!-- 在这里自定义内容**以下是模拟高度不一致的情况 -->
					<view class="drop flex flex-y flex-1">
                        你的内容
					</view>
				</template>
				<template #placeholder>
					<view class="drop" style="padding: 0 10rpx;height: 100%;">
						<view class="" style="background-color: #007aff;height: 100%;">
							占位
						</view>
					</view>
				</template>
			</leo-drag>
		</template>
	</leo-list>
```

```js
    import leoDragList from "@/uni_modules/leo-drag/components/leo-drag/js/leo-drag-list.js"
    export default{
        mixins:[leoDragList],  // 需要引入内部通用函数
        data(){
            return{
                leo_edge:8,		// 边缘6/1位置触发滚动； 此值不传默认为8/1； 注意： 经过测试发现最佳是8，值越小：小程序可能会出现滚动时不出现动画的情况；
            }
        },
        methods:{
            // 获取列表-下拉刷新或者是触底加载都已封装好；只需要传入list和总长度即可
            leo_getListApi(ler_data){
                // 模拟api请求:ler_data中会包含size和page；请根据后端要求自己定义；
                setTimeout(()=>{
                    let lists = [];
                    for (var i = ler_data.dataList.length; i < ler_data.dataList.length+10; i++) {
                        lists.push({name:i})
                    }
                    // 需要传递请求回来的列表和总条数
                    ler_data.callback(lists, 300);	// 和complete用法一致, 第二参数需要传递数据库的总数量
                },200)
            }
        }
}

```



## 打赏

如果你觉得本插件，解决了你的问题，赠人玫瑰，手留余香。  
![](https://static-mp-58f7adcd-871a-4bc2-938a-410f616340e7.next.bspapp.com/myImg/wx.jpg)
![](https://static-mp-58f7adcd-871a-4bc2-938a-410f616340e7.next.bspapp.com/myImg/zfb.jpg)
