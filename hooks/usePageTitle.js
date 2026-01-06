/*
 * @Author: elk
 * @Date: 2026-01-06 16:26:41
 * @LastEditors: elk 
 * @LastEditTime: 2026-01-06 17:04:16
 * @FilePath: /hkt-applet/hooks/usePageTitle.js
 * @Description: 控制页面标题的hook函数
 */
import { onLoad } from '@dcloudio/uni-app';

export function usePageTitle(defaultTitle = '默认标题') {
  onLoad((options) => {
    console.log("🚀 ~ usePageTitle ~ options:", options)
    const title = options.title || defaultTitle;
    uni.setNavigationBarTitle({
      title
    });
  });
}
