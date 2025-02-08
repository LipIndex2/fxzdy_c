import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import * as fgui from "fairygui-cc";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { MapModel } from "../../../tiledMap/model/MapModule";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { BackpackManager } from "../../../modules/backpack/BackpackManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ModelNode } from "../../../modules/common/node/ModelNode";
import { HangUpUtils } from "../../../modules/hangup/utils/HangUpUtils";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import G from "../../../../core/comm/G";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { JumpManager } from "../../../modules/jump/JumpManager";
import { NoOwnerItem } from "../../../modules/backpack/vo/NoOwnerItem";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ResurgenceViewOpenArgs } from "db://assets/scripts/game/ui/resurgence/structs/ResurgenceViewOpenArgs";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommonKey } from "../../../modules/common/const/UICommonConfig";
import { FightType } from "../../../comm/battle/enum/FightType";

/** 复活弹窗 */
export class ResurgenceView extends UICommWin {
    static pkgName: string = "resurgence2";
    static viewName: string = "resurgenceView";

    /**地图复活消耗  道具id:消耗数量; */
    static REBIRTH_TEAM_COSTS = "MAP:REBIRTH_TEAM_COSTS";
    private _fightType!: ServerEnums.FightType;

    private get view(): ui.resurgence2.resurgenceView {
        return this._view as any;
    }

    /**消耗 */
    private cost: { k: any; v: any }[];

    listenNotifications(): string[] {
        return [NotificationKey.TEAM_REBIRTH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.TEAM_REBIRTH:
                this.closeSelf();
                break;
        }
    }

    protected onInit(): void {
        this.view.btn_back.on(fgui.Event.CLICK, this.backMainClick, this);
        this.view.btn_res.on(fgui.Event.CLICK, this.resClick, this);

        let costStr = TableManager.getDataById(table.map.MapConstantConfig, ResurgenceView.REBIRTH_TEAM_COSTS).content;
        this.cost = StringUtils.toObject1Arr(costStr);
        let item = NoOwnerItem.createByConfigKv(this.cost[0]);

        this.view.btn_res.T_num.text = item.count.toString();
        this.view.btn_res.imLoader.url = item.getIconPath();

        const modelNode = this.view.modelNode as ModelNode;

        modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath());
        modelNode.playOrders([
            {
                name: "unlocking2",
                isLoop: false,
            },
            {
                name: "idle2",
                isLoop: true,
            },
        ]);
        this.view.touchable = false;
        this.view.getTransition("ani").play(() => {
            this.view.touchable = true;
        });

        this.view.btnData.onClick(this.onClickBattleData0, this);
        let num = this.view.list.numItems;
        for (let i = 0; i < num; i++) {
            let item = this.view.list.getChildAt(i);
            item.onClick(() => {
                this.onClickJump(i);
            }, this);
        }
    }

    protected onOpen(data: ResurgenceViewOpenArgs) {
        this._fightType = data.fightType;
        if (this._fightType == FightType.TRUNK_MAP) this.view.btnData.visible = false;
    }

    private onClickJump(index: number) {
        switch (index) {
            case 0:
                JumpManager.ins().jumpByEnum(ServerEnums.SystemType.HERO);
                break;
            case 1:
                JumpManager.ins().jumpByEnum(ServerEnums.SystemType.RECRUIT);
                break;
            case 2:
                JumpManager.ins().jumpByEnum(ServerEnums.SystemType.EQUIP);
                break;
        }
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData0() {
        G.Logger.debug(" onClickNextLevel0 ");

        // 战斗数据
        BattleRecordManager.ins().showRecordView(this._fightType, false);
    }

    /** 复活 */
    private resClick() {
        if (BackpackManager.ins().isCanPayTheseItemArrayByConfig(this.cost, true)) {
            MapModel.ins().sendRebirthTeam();
        }
    }

    /** 回城 */
    private backMainClick() {
        this.emit(NotificationKey.TEAM_REBIRTH);
        UIManager.ins().open(UICommonKey.TransferAnimByAirshipWin);
        if (UIManager.ins().isOpened(UICommonKey.BtnConfirmView)) {
            UIManager.ins().close(UICommonKey.BtnConfirmView);
        }
        this.emit(NotificationKey.TEAM_DIE_BACK, this._fightType);
        this.closeSelf();
    }

    // closeSelf(){
    //     UIManager.ins().close(UIResurgenceConfig.ResurgenceView);
    // }
}
