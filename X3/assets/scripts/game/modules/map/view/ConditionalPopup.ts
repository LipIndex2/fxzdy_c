import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import * as fgui from "fairygui-cc";
import { UIView } from "../../../../core/mvc/view/UIView";
import { UIMapKey } from "../const/UIMapConfig";
import { Renderer, renderer } from "cc";
import { Handler } from "../../../../core/utils/Handler";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FormationManager } from "../../formation/FormationManager";
import { HangUpModel } from "../../hangup/model/HangUpModel";
import { BackpackManager } from "../../backpack/BackpackManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ConditionManager } from "../../condition/ConditionManager";
import { TableManager } from "../../../../core/table/TableManager";
import { tween } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { JumpManager } from "../../jump/JumpManager";
import GIns from "../../../GIns";


@bindScript(UIMapKey.MAP_CONDITIONALPOPUP)
export class ConditionalPopup extends UICommWin {
    static pkgName: string = "map";
    static viewName: string = "ConditionalPopup";

    private _openVerifys: Array<Array<any>> = [];

    private _cfg: table.map.MapBuildingConfig;

    private get view(): ui.map.view.ConditionalPopup {
        return this._view as any;
    }

    public onInit(): void {
        this.view.list.itemRenderer = this.itemInfo.bind(this);
    }

    public onOpen(cfg: table.map.MapBuildingConfig): void {
        this._cfg = cfg;
        this.updateInfo();
    }

    private updateInfo() {
        this._openVerifys = this._cfg.openVerify || [];
        this.view.list.numItems = this._openVerifys.length;
    }


    private itemInfo(index: number, item: ui.map.item.Conditional_item) {
        let openVerify = this._openVerifys[index];

        const isCanSee: boolean = ConditionManager.ins().checkCondition([openVerify]);
        if (isCanSee) {
            item.getController("c1").selectedIndex = 1;
        } else {
            item.getController("c1").selectedIndex = 0;
            let _x = item.x;
            let _y = 95 * index;
            tween(item)
                .to(0.1, { x: _x + 10, y: _y + 10 })
                .to(0.1, { x: _x - 10, y: _y - 10 })
                .to(0.1, { x: _x + 10, y: _y + 10 })
                .to(0.1, { x: _x - 10, y: _y - 10 })
                .to(0.1, { x: _x + 10, y: _y + 10 })
                .to(0.1, { x: _x - 10, y: _y - 10 })
                .to(0.1, { x: _x, y: _y })
                .start();
        }
        item.T_des.text = ConditionUtils.getConditionsAllTxtByType([openVerify])[0];
        let cfg = TableManager.getDataById(table.condition.ConditionConfig, openVerify[0]);
        item.goBtn.visible = !!cfg?.jumpId;
        if (item.goBtn.visible) {
            item.goBtn.clearClick();
            item.goBtn.onClick(this.jumpFunction.bind(this, cfg.jumpId), this);
        }

        // const oneConditionArray = openVerify;
        // let condition = oneConditionArray[0];
        // let param = oneConditionArray[1];
        // let target = oneConditionArray[2];
        // switch (condition) {
        //     case "PLAYER_LEVEL_GE":
        //         item.T_des.text = `达到${target}级解锁`;
        //         break;
        //     case "PASS_TRUNK_INSTANCE":
        //         let trunkTaskCfg = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, param);
        //         item.T_des.text = `达到${trunkTaskCfg.showLevelId}主线进度解锁`;
        //         break;
        //     case "UNLOCK_BUILDING":
        //         let buildingCfg = TableManager.getDataById(table.map.MapBuildingConfig, param);
        //         item.T_des.text = `解锁${buildingCfg.name}建筑`;
        //         break;
        // }
    }

    jumpFunction(jumpId: number) {
        GIns.jumpManager.jumpById(jumpId);
        this.closeSelf();
    }
}