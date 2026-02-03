<template>
    <view class="u-canvas"
        :id="rootId"
        :style="{
            width: useRootHeightAndWidth ? '100%' : 'auto',
            height: useRootHeightAndWidth ? '100%' : 'auto',
        }">
        <!-- #ifdef MP || H5 -->
        <canvas
            class="u-canvas__canvas"
            :id="cid"
            :canvas-id="cid"
            type="2d"
            :style="{ width: sizeLocal + unit, height: sizeLocal + unit }" />
        <!-- #endif -->

        <!-- #ifdef APP-PLUS -->
        <canvas
            class="u-canvas__canvas"
            :id="cid"
            :canvas-id="cid"
            :style="{ width: width + unit, height: height + unit }" />
        <!-- #endif -->

        <!-- #ifdef APP-NVUE -->
        <gcanvas class="u-canvas__canvas" ref="gcanvess"
            :style="{ width: width + unit, height: height + unit }">
        </gcanvas>
    </view>
</template>

<script>
// #ifdef APP-NVUE
// https://github.com/dcloudio/NvueCanvasDemo/blob/master/README.md
import {
    enable,
    WeexBridge,
	Image as GImage
} from '../../libs/util/gcanvas/index.js';
// #endif
// 20260201不能在data中存储canvas，否则会导致在微信小程序getContext获取不到canvas对象报错Cannot read property 'type'
let canvas = null
export default {
    name: "u-canvas",
    props: {
        cid: {
            type: String,
            default: () => {
				return `u-qrcode-canvas${Math.floor(Math.random() * 1000000)}`
			}
        },
        width: {
            type: [String, Number],
            default: 300
        },
        height: {
            type: [String, Number],
            default: 300
        },
        unit: {
            type: String,
            default: 'px'
        },
    },
    data() {
        return {
            rootId: `rootId${Number(Math.random() * 100).toFixed(0)}`,
            ganvas: null,
            canvasContext: null,
            widthLocal: this.width,
            heightLocal: this.height,
        };
    },
    methods: {
        /**
         * 获取节点
         * @param id 节点id
         * @param isCanvas 是否为Canvas节点
         * @return {Promise<unknown>}
         */
        async getCanvasNode(id, isCanvas = true) {
			let that = this
        	return new Promise((resolve, reject) => {
        		try {
        			// #ifdef APP-NVUE
        			setTimeout(() => {
        				/*获取元素引用*/
        				this.ganvas = this.$refs["gcanvess"]
        				/*通过元素引用获取canvas对象*/
        				let canvasNode = enable(this.ganvas, {
        				    bridge: WeexBridge
        				})
        				resolve(canvasNode)
        			}, 200)
        			// #endif
        			// #ifndef APP-PLUS-NVUE
                    const query = uni.createSelectorQuery().in(that).select(`#${id}`);
                    query.fields({
                            node: true,
                            size: true
                        })
                        .exec((res) => {
                            if (isCanvas) {
                                if (res[0]?.node) {
                                    resolve(res[0].node)
                                } else {
                                    resolve(false)
                                    console.error("获取节点出错", res)
                                }
                            } else {
                                resolve(res[0])
                            }
                        })
        			// #endif
        		} catch (e) {
        			console.error("获取节点失败", e)
        		}
        	})
        },
		getUPCanvasContext() {
			// #ifdef APP-PLUS
			return uni.createCanvasContext(this.cid, this);
			// #endif
			// #ifdef APP-PLUS-NVUE || MP || H5
			return canvas.getContext('2d');
			// #endif
		},
        /**
         * 使用根节点宽高 设置新的size
         * @return {Promise<void>}
         */
        async setNewSize(){
            const rootNode = await this.getCanvasNode(this.rootId, false);
            const { width , height } = rootNode;
            this.widthLocal = height
            this.heightLocal = width
        },
    },
    async mounted() {
        // 如果使用根节点的宽高 则 重新设置 size
        if(this.useRootHeightAndWidth){
            await this.setNewSize()
        }
    }
};
</script>