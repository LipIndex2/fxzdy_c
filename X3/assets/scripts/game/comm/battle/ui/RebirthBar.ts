import { tween } from "cc";
import * as fgui from "fairygui-cc";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { WorldManager } from "../../world/WorldManager";
import { Tween } from "cc";
import BattleSetting from "../config/BattleSetting";
import FGUICocosNodeComponent from "../../../../core/fgui/com/FGUICocosNodeComponent";
import { BattleUtils } from "../BattleUtils";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/**复活倒计时 */
@bindFguiExtension("ui://comm/RebirthItem")
export class RebirthItem extends FGUICocosNodeComponent {
    static pkgName: string = "comm";
    static viewName: string = "RebirthItem";

    // private _tween: Tween<fgui.GImage>;

    private get view(): ui.comm.hp.RebirthItem {
        return this as any;
    }

    constructor () {
        super();
    }

    public setTime(now: number, time: number) {
        // if (this._tween) {
        //     this._tween.stop();
        // }

        this.visible = true;

        this.view.img_ax.fillAmount = now / time;
        // this._tween = null;
        // this._tween = tween(this.view.img_ax).to(time / 1000, { fillAmount: 1 }).call(this.endTween.bind(this));
        // this._tween.start();
    }

    public stop() {
        // if (this._tween) {
        //     this._tween.stop();
        //     this._tween = null;
        this.visible = false;
        // }
    }

    private endTween() {
        this.visible = false;
    }

    protected onPreDispose() {
        // if (this._tween) {
        //     this._tween.stop();
        // }
    }
}

/**复活进度 */
export class RebirthBar {
    private _owner: BattleUnit;
    private _bar: RebirthItem;
    private rebirthMaxTime: number

    constructor (owner: BattleUnit) {
        this._owner = owner;
    }

    private createItem() {
        this._bar = fgui.UIPackage.createObject(RebirthItem.pkgName, RebirthItem.viewName) as RebirthItem;
        WorldManager.ins().effectLayer.addChild(this._bar.node);
    }

    /**死亡 */
    public onDie(rebirthMaxTime: number) {
        if (!BattleSetting.isCanTimeRebirth) return;

        if (!this._bar) this.createItem();
        this.rebirthMaxTime = BattleUtils.getFrameByTime(rebirthMaxTime)
        this._bar.setTime(0, rebirthMaxTime);

        let pos = this._owner.pos;
        this.setPosition(pos.x, pos.y);
    }

    public updateRebirthBar(rebirthTime: number): void {
        if (this._bar)
            this._bar.setTime(this.rebirthMaxTime - rebirthTime, this.rebirthMaxTime);
    }

    /**复活 */
    public onRebirth() {
        if (this._bar) {
            this._bar.stop();
        }
    }

    public hide() {
        if (this._bar) {
            this._bar.stop();
        }
    }

    public setPosition(x: number, y: number) {
        if (this._bar?.visible) {
            this._bar.node.setPosition(x, y + this._owner.modelHeight);
        }
    }

    /**销毁 */
    dispose() {
        if (this._bar && !this._bar.isDisposed) {
            this._bar.dispose();
        }
    }
}
