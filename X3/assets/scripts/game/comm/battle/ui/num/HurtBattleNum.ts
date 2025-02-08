import { tween } from "cc";
import { Bezier2Tween } from "../../../../../core/comp/Bezier2Tween";
import { Handler } from "../../../../../core/utils/Handler";
import { BattleNum } from "./BattleNum";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";


@bindFguiExtension("ui://battleNum/HurtNum")
export class HurtBattleNum extends BattleNum {
    private bezier2Tween: Bezier2Tween
    private isFlip: boolean
    private damageScaleType: number

    protected get view(): ui.battleNum.num.HurtNum {
        return this as any;
    }

    setParam(arg: any[]): void {
        this.isFlip = arg[0];
        this.damageScaleType = arg[1];
    }

    protected tweenHandler(): void {
        this.alpha = 1;
        this.view.scaleY = this.view.scaleX = 1 * BattleNum.ScaleValue;
        this.bezier2Tween = new Bezier2Tween()
        let pos = this.node.getPosition()
        let scale = this.isFlip ? 1 : -1;
        if (this.damageScaleType == 2) {
            this.view.scaleY = this.view.scaleX = 1.4 * BattleNum.ScaleValue;
        }
        else if (this.damageScaleType == 3) {
            this.view.scaleY = this.view.scaleX = 2.2 * BattleNum.ScaleValue;
        }
        this.bezier2Tween.setPoint(pos.x, pos.y, pos.x + 40 * scale, pos.y + 60, pos.x + 80 * scale, pos.y - 20);
        this.bezier2Tween.tween(0.6, new Handler(this, (x: number, y: number) => {
            if (this.node.isValid)
                this.node.setPosition(x, y);
        }), new Handler(this, () => {
            this.onPlayEnd();
        }))
        tween().target(this.view).to(0.1, { scaleY: 1 * BattleNum.ScaleValue, scaleX: 1 * BattleNum.ScaleValue }).start();
        tween().target(this).delay(0.2).to(0.4, { alpha: 0 }).start();
        // this.setScale(2, 2)
    }

    protected onRmove(): void {
        super.onRmove();
        if (this.bezier2Tween)
            this.bezier2Tween.stop()
    }
}