import { v2 } from "cc";
import { Logger, LogType } from "../../../core/log/Logger";
import { TableManager } from "../../../core/table/TableManager";
import AreaTriggersManager from "../../tiledMap/trigger/AreaTriggersManager";
import { MapManager } from "../../tiledMap/MapManager";
import { FormationManager } from "../formation/FormationManager";
import { ItemModel } from "../item/model/ItemModel";
import { TrunkTaskModel } from "../task/model/TrunkTaskModel";
import { GuideVerifyType } from "./const/GuideEnum";
import { GuideModel } from "./model/GuideModel";
import { IVec2Like } from "cc";
import { IGuideVerifyArgs } from "./const/IGuideVerifyArgs";
import GIns from "../../GIns";

export class GuideConditions {
    /** 判断是否满足条件   触发引导 || 完成引导 */
    static checkGuideCondition(finishCondition: Array<any>, verify: IGuideVerifyArgs | null, cfg?: table.guide.GuideConfig) {
        if (!finishCondition) return false;

        let type: string = finishCondition[0];

        if (!verify) {
            //允许的无验证条件类型
            if (!(type == GuideVerifyType.LEVEL ||
                type == GuideVerifyType.HAS_ITEM ||
                type == GuideVerifyType.TRIGGER ||
                type == GuideVerifyType.UNLOCK_BUILDING ||
                type == GuideVerifyType.ENTER_BUILDING ||
                type == GuideVerifyType.ENTER_WORLD ||
                type == GuideVerifyType.PASS_STAGE ||
                type == GuideVerifyType.TASK)) return false;
        } else if (type != verify.type) {
            //参数类型不匹配
            return false;
        }

        let args = verify?.args;
        let param1 = finishCondition[1]; //参数一
        let param2 = finishCondition[2]; //参数二

        let isTrue = false;
        switch (type) {
            case GuideVerifyType.LEVEL:
                let level = param2;
                isTrue = level <= FormationManager.ins().getCommonLevel();
                break;
            case GuideVerifyType.TRIGGER:
                let pos = (args as IVec2Like) || MapManager.ins().getMapPos();
                let triggerId = param1;
                let isInside = param2;
                if (isInside) {
                    //在范围内
                    isTrue = AreaTriggersManager.ins().isInside(triggerId, v2(pos.x, pos.y));
                } else {
                    //在范围外
                    isTrue = AreaTriggersManager.ins().isOutside(triggerId, v2(pos.x, pos.y));
                }
                break;
            case GuideVerifyType.VIEW:
                if (!args) return false;
                if (!param2) return false;
                if (args[0] == param1 && args[1] == param2) isTrue = true;
                break;
            case GuideVerifyType.HAS_ITEM:
                // args: <itemId, count>
                let itemId = param1;
                let itemNum = param2;
                let item = ItemModel.ins().getItemById(itemId);
                if (!item) return false;
                isTrue = item.count >= itemNum;
                break;
            case GuideVerifyType.UNLOCK_BUILDING:
                let unlockId = param2;
                // if (!args) return false;
                isTrue = GIns.mapModel.isUnlockBuildingById(unlockId);
                break;
            case GuideVerifyType.ENTER_WORLD:
                let mapId = param2;
                isTrue = mapId == MapManager.ins().getMapID();
                break;
            case GuideVerifyType.TASK:
                // 主线任务
                let currentTask = TrunkTaskModel.ins().getCurrentTask();
                let taskId = TrunkTaskModel.ins().getCurrentTaskId();

                if (param1 === 4 && TrunkTaskModel.ins().isPass(taskId)) {
                    isTrue = true;
                } else if (param1 == currentTask?.State && param2 == taskId) {
                    isTrue = true;
                }
                break;
            case GuideVerifyType.BUTTON:
                if (!args) return false;
                isTrue = param2 == args;
                break;
            case GuideVerifyType.ENTER_BUILDING:
                let buildingID = args || MapManager.ins().focusBuilding?.buildingId;
                isTrue = param2 === buildingID;
                break;
            case GuideVerifyType.PASS_STAGE:
                isTrue = GIns.hangUpModel.isPass(param2);
                break;
            case GuideVerifyType.OPEN_FUNCTION:
                if (!args) return false;
                // let cfg: table.verify.PlayerSystemOpenConfig = args;
                isTrue = param2 == args.id;
                break;
        }

        return isTrue;
    }

    /** 主动检测是否可以触发引导(可以触发就触发) */
    static selfVerify(id: number) {
        if (!id) return;
        let cfg = TableManager.getDataById(table.guide.GuideConfig, id);

        let isTrue = false;
        if (!cfg.triggerCondition) return true; //没有触发条件,默认触发

        let type = cfg.triggerCondition[0];
        switch (type) {
            case GuideVerifyType.LEVEL:
            case GuideVerifyType.HAS_ITEM:
            case GuideVerifyType.TRIGGER:
            case GuideVerifyType.TASK:
            case GuideVerifyType.UNLOCK_BUILDING:
            case GuideVerifyType.ENTER_WORLD:
            case GuideVerifyType.PASS_STAGE:
                isTrue = this.checkGuideCondition(cfg.triggerCondition, null);
                break;
            case GuideVerifyType.ENTER_BUILDING:
                isTrue = this.checkGuideCondition(cfg.triggerCondition, null);
                break;
        }
        return isTrue;
    }

    /** 主动检测是否可以完成引导(可以完成就触发完成) */
    static selfFinish(id: number) {
        if (!id) return;
        let cfg = TableManager.getDataById(table.guide.GuideConfig, id);
        let isTrue = false;
        if (!cfg.finishCondition) return false; //没有完成条件,默认不完成
        switch (cfg.finishCondition[0]) {
            case GuideVerifyType.ENTER_WORLD:
                isTrue = this.checkGuideCondition(cfg.finishCondition, null);
                break;
        }
        return isTrue;
    }
}
