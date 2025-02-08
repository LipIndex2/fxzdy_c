import * as fgui from "fairygui-cc";
import NotificationKey from "../../../event/NotificationKey";
import { TableManager } from "../../../../core/table/TableManager";
import { FGUIMaskUtils } from "../../../ui/common/mask/FGUIMaskUtils";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { ModelNode } from "../node/ModelNode";
import G from "../../../../core/comm/G";
import { UICommonKey } from "../const/UICommonConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { BattleRecordManager } from "../../../comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { FightType } from "../../../comm/battle/enum/FightType";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";



/** 通用战斗失败 */
export class BattleResultWin extends UICommWin {
    static pkgName: string = "commBattle";
    static viewName: string = "BattleResultWin";


    private _data: BattleResultData;

    private get view(): ui.commBattle.battle.BattleResultWin {
        return this._view as any;
    }


    protected onInit(): void {
        // FGUIMaskUtils.createBackgroundMask(this.view);
        this.view.panel.list_jump.itemRenderer = this.jumpItem.bind(this);

        // 等动画播完
        setTimeout(() => {
            if (this.view?.node?.isValid) {
                this.view.bg.onClick(this.closeSelf, this);
            }
        }, 3200);

        this.view.panel.btnData.onClick(this.onCLickBtnData, this);
    }

    onCLickBtnData() {
        // 战斗数据
        BattleRecordManager.ins().showRecordView(this._data.fightType,true, );
    }

    protected onOpen(data: BattleResultData): void {
        if (!data) return;
        this._data = data;

        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath())
        modelNode.playOrders(
            [
                {
                    name: "unlocking2",
                    isLoop: false
                },
                {
                    name: "idle2",
                    isLoop: true
                },
            ]
        );
        this.view.getTransition("enter").play();

        this.updataUI()
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    private updataUI() {
        this.view.panel.labelTitle.text = this._data.labelTitle;
        this.view.panel.list_jump.numItems = this._data.jumpList.length;
    }

    private jumpItem(index: number, item: ui.comm.btn.JumpBtn) {
        let id = this._data.jumpList[index];
        let jumpCfg = TableManager.getDataById(table.jump.JumpConfig, id);

        item.icon = jumpCfg.mainPage;
        item.title = jumpCfg.pageName;

        item.onClick(() => {
            G.FacadeManager.emitNow(NotificationKey.MAP_SET_LAST_BY_FIGHT_TYPE, FightType.TRUNK_MAP);
            G.UIManager.open(UIMainKey.MAIN_PAGE);
            G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, id);
        })
    }

    protected handleCloseOtherUIPages():void {
        G.UIManager.close
    }

    protected onClose(): void {
        if (this._data.closeCllBack) this._data.closeCllBack();
    }
}

/** 战斗结算界面Data */
export interface BattleResultData {
    fightType: ServerEnums.FightType,
    /** title名字 */
    labelTitle: string,
    /** 跳转列表 */
    jumpList: number[],
    /** 关闭界面的回调 */
    closeCllBack: Function,
}

UIScriptManager.bindScript(UICommonKey.BattleResultWin, BattleResultWin);