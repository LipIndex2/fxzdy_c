import { ViewEffectComp } from "./ViewEffectComp";
import { UiTweenMgr } from "../../../comm/UiTweenMgr";

/**
 * 界面特效组件
 */
export class ViewPageEffectComp extends ViewEffectComp {
    public static className = "ViewPageEffectComp";

    public onOpen(): void {
        this.removeAllTween();
        for (let i = 0; i < this.mcList.length; i++) {
            let tweenObj = UiTweenMgr.ins().tween1(this.mcList[i])
            this.tweenList.push(tweenObj)
            // let pivotX = this.mcList[i].pivotX;
            // let pivotY = this.mcList[i].pivotY;
            // let mc = this.mcList[i]
            // mc.pivotX = mc.pivotY = 0.5;
            // let tweenObj = tween(mc)
            //     .to(0.1, { scaleX: 1.1, scaleY: 1.1 })
            //     .to(0.1, { scaleX: 0.9, scaleY: 0.9 })
            //     .to(0.1, { scaleX: 1.06, scaleY: 1.06 })
            //     .to(0.1, { scaleX: 0.95, scaleY: 0.95 })
            //     .to(0.1, { scaleX: 1.02, scaleY: 1.02 })
            //     .to(0.1, { scaleX: 1, scaleY: 1 })
            //     .call(() => {
            //         if (!mc.isDisposed) {
            //             mc.pivotX = pivotX;
            //             mc.pivotY = pivotY;
            //         }
            //     })
            //     .start()
            // this.tweenList.push(tweenObj)
        }
    }
}