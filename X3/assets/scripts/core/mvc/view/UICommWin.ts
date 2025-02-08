import * as fgui from "fairygui-cc";
import { UIWin } from "./UIWin";
import { ViewBlackBgComp } from "./comp/ViewBlackBgComp";
import { ViewEffectComp } from "./comp/ViewEffectComp";
import { ViewFlatEffectComp } from "./comp/ViewFlatEffectComp";

/**界面展开特效类型*/
export enum UIWinEffectType {
    /**没有弹窗动画（即界面自定义动画） */
    None = 0,
    /**缩放动画(默认)*/
    Scale = 1,
    /**平展动画*/
    Flat,
}
/**
 * 通用的UI窗口，带黑幕和打开特效
 */
export class UICommWin extends UIWin {
    /**多久后才能关闭 */
    protected _leastTime = 300;
    /**界面特效类型*/
    protected _effectType: UIWinEffectType = UIWinEffectType.Scale;

    /**是否有平展动画后面的光效*/
    protected _hasFlatLight: boolean = true;
    /**展开中心组合名称*/
    protected _flatCenterGroup: string = 'gCenter';
    protected _canCloseByBg: boolean = true

    /***组件初始化 */
    protected initComp(): void {
        this.addComp(new ViewBlackBgComp(this._leastTime, this._canCloseByBg));
        this.initEffectComp();
    }

    protected initEffectComp(): void {
        switch (this._effectType) {
            case UIWinEffectType.Scale:
                this.addComp(new ViewEffectComp([this._view]));
                break;
            case UIWinEffectType.Flat:
                this.addComp(new ViewFlatEffectComp(this._flatCenterGroup, this._hasFlatLight));
                break;
        }
    }

    public closeSelf(): void {
        if (this._effectType == UIWinEffectType.Flat) {
            //有关闭动画
            let effectComp: ViewFlatEffectComp = this.getComp(ViewFlatEffectComp) as ViewFlatEffectComp
            effectComp?.playCloseEffect()
        } else {
            super.closeSelf()
        }
    }
} 