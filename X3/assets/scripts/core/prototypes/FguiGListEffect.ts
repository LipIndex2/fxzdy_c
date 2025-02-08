import { tween, Tween } from "cc";
import * as fgui from "fairygui-cc";

/**GListUI特效类型*/
export enum GListEffectType {
    /**没有特效*/
    None = 0,
    /**淡入特效*/
    FADE_IN = 1,
    /**自定义特效*/
    Custom = 2
}

/**列表特效参数*/
export interface GListEffectParams {
    /**特效延时*/
    delay: number;
    /**特效间隔*/
    interval?: number;
    /**特效开始下标 (默认从刷新的第一个开始)*/
    starIndex?: number;
    /**特效结束下标 (默认从刷新的最后一个结束)*/
    endIndex?: number;
}

export class FguiGListEffect {
    /**淡入特效*/
    public static fadeIn(index: number, item: fgui.GObject, delay: number, params:GListEffectParams): Tween<fgui.GObject> {
        Tween.stopAllByTarget(item)
        item.alpha = 0;
        let interval:number = params?.interval ? params.interval : 0.05;
       
        let realDelay: number = index * interval - delay;
        if (params?.delay) {
            realDelay += params?.delay;
        }
        realDelay = Math.max(0, realDelay);
        // console.log('fadeIn', index, interval, delay, realDelay)
        if (realDelay > 0) {
            return tween(item).delay(realDelay).to(0.3, { alpha: 1 }).start();
        }
        return tween(item).to(0.3, { alpha: 1 }).start();
    }
}