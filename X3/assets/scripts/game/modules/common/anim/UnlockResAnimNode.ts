import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { Bezier2Tween } from "../../../../core/comp/Bezier2Tween";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { Handler } from "../../../../core/utils/Handler";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import G from "../../../../core/comm/G";
import { tween } from "cc";
import { Vec3 } from "cc";

/** 解锁动画*/
export class UnlockResAnimNode extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "UnlockResAnimNode";
    /**动画时长 */
    static tweenTime = 500;

    private _tw: Bezier2Tween = new Bezier2Tween();

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName) as UnlockResAnimNode;
    }

    private get view(): ui.comm.anim.UnlockResAnimNode {
        return this as any;
    }

    play(iconPath: string, curPos: { x: number, y: number }, targetPos: { x: number, y: number }, delayMs?: number) {
        let x = curPos.x + Math.random() * 20 - 10;
        let y = curPos.y + Math.random() * 20 - 10;
        let pos = MathUtils.getTwoPointCenter(x, y, targetPos.x, targetPos.y, 0.5);
        this.node.setPosition(x, y);
        this._tw.setPoint(x, y, pos.x, pos.y + 80, targetPos.x, targetPos.y);

        this.view.loader.icon = iconPath;
        if (delayMs) {
            this.view.visible = false;
            G.GameTimer.once(delayMs, this, this.doTween);
        } else {
            this.doTween();
        }
    }

    private doTween() {
        this.view.visible = true;
        this._tw.tween(UnlockResAnimNode.tweenTime / 1000, new Handler(this, this.onTweenUpdate), new Handler(this, this.onTweenComplete));
    }

    private onTweenUpdate(x: number, y: number) {
        this.node.setPosition(x, y);
    }

    private onTweenComplete() {
        tween(this.node).to(0.1, { scale: new Vec3(1.3, 1.3) }, { easing: "quadOut" }).call(() => {
            this.dispose();
        }).start();
    }

    public cancelTween(): void {
        this._tw.stop();
        this.dispose();
    }

    public onPreDispose() {
        G.GameTimer.clearAll(this);
    }
}