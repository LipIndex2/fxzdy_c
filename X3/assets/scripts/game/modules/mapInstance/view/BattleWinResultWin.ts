import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import NotificationKey from "../../../event/NotificationKey";
import { FGUIMaskUtils } from "../../../ui/common/mask/FGUIMaskUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import G from "../../../../core/comm/G";
import { MapInstanceManager } from "../MapInstanceManager";
import { UIMapInstanceKey } from "../const/UIMapInstanceConfig";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ItemFrame } from "db://assets/scripts/game/modules/common/item/ItemFrame";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";


/**
 * 副本boss - 胜利
 */

@bindScript(UIMapInstanceKey.BattleWinResultWin)
export class BattleWinResultWin extends UICommWin {

    static pkgName: string = "mapInstance";
    static viewName: string = "BattleWinResultWin";


    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;


    // 通关道具奖励
    private _awardItemArray: Array<Vo.reward.RewardResult> = [];

    private get view(): ui.mapInstance.view.BattleWinResultWin {
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

        // FGUIMaskUtils.createBackgroundMask(this.view);

        this.view.panel.btnData.onClick(this.onClickBtnData, this)

        // wait 4spine 动画
        setTimeout(() => {
            this.view.bg.onClick(this.onTouchOutSide, this);
        }, 3200)

        this.view.panel.list_award.itemRenderer = this.awardItem.bind(this);

        this.view.panel.btnData.onClick(this.onClickBtnData, this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.MAP_INSTANCE, true);
    }

    protected onOpen(data: Array<Vo.reward.RewardResult>) {
        this._awardItemArray = data
        this.view.panel.list_award.numItems = this._awardItemArray.length;
        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath())
        modelNode.playOrders(
            [
                {
                    name: "unlocking1",
                    isLoop: false
                },
                {
                    name: "idle1",
                    isLoop: true
                },
            ]
        );

        this.view.getTransition("enter").play();
    }

    private onTouchOutSide(event: fgui.Event) {
        G.FacadeManager.emit(NotificationKey.LOADING_VIEW_SHOW);
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        G.UIManager.close(UIMapInstanceKey.MapInstanceView);
        // G.FacadeManager.emit(NotificationKey.EXIT_BATTLE);
        MapInstanceManager.ins().mapInstanceId = null;
        this.closeSelf()
    }

    /** 道具item */
    private awardItem(index: number, item: ItemFrame) {
        let itemData = this._awardItemArray[index];
        item.updateData(itemData.baseId, itemData.amount);
    }

    onClose() {

    }


}