import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TimeManager } from "../../../../core/time/TimeManager";
import { BattleManager } from "../../../comm/battle/BattleManager";
import BattleSetting from "../../../comm/battle/config/BattleSetting";
import PlayInstance from "../../../comm/world/PlayInstance";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { FGUIMaskUtils } from "../../../ui/common/mask/FGUIMaskUtils";
import { ModelNode } from "../../common/node/ModelNode";

/**
 * 战斗开始界面
 */
export class BattleStartView extends UICommWin {

    static pkgName: string = "commBattle";
    static viewName: string = "BattleStartView";

    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private _modelNode: ModelNode;

    private get view(): ui.commBattle.battleComp.BattleStartView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    public onInit(): void {
        G.Logger.debug(" onInit ")
        // FGUIMaskUtils.createBackgroundMask(this.view);
    }

    onClose() {

    }

    /***玩法的结束秒数 */
    private endTimeSec: number = 0;
    public onOpen(): void {
        // let tran = this.view.getTransition("t");
        // tran.play(this.onPlayEnd.bind(this));
        this._modelNode = this.view.modelNode as ModelNode;
        this._modelNode.loadByModelId(10010027, false)
        this._modelNode.setCompleteListener(this.onPlayEnd.bind(this));
        //有动画界面的话将结束时间的值重新设置
        if (GIns.battleMgr.mainScene.battleData) {
            this.endTimeSec = GIns.battleMgr.battleLogic.battleCfg.fightMaxSecond
            // 
        }
    }

    private onPlayEnd() {
        this.closeSelf()
        if (GIns.battleMgr.mainScene.battleData && this.endTimeSec) {
            GIns.battleMgr.mainScene.setBattleEndTime(TimeManager.serverNow + this.endTimeSec * 1000)
        }
        if (!BattleSetting.showTransferAnim)
            this.emit(NotificationKey.BATTLE_START);
    }
}