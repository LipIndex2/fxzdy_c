import G from "../../../core/comm/G";
import FGUIManager from "../../../core/fgui/FGUIManager";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager, redDotTrigger } from "../common/redDot/RedDotManager";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { EquipManager } from "./EquipManager";
import { UIEquipKey } from "./const/UIEquipConfig";
import { EquipAttrItem } from "./item/EquipAttrItem";
import { EquipAttrPage } from "./item/EquipAttrPage";
import { EquipVo } from "./vo/EquipVo";

/** 装备 */
export class EquipController extends BaseController {
    listenNotifications(): string[] {
        return [NotificationKey.EQUIP_WEAR_EQUIP, NotificationKey.EVENT_CHANGE_ITEMS2];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EQUIP_WEAR_EQUIP:
                this.wearEquip();
                G.GameTimer.once(300, this, this.checkAllEquipRedDot);
                // this.checkAllEquipRedDot();
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                this.updateEquipCount(args);
                // this.checkAllEquipRedDot();
                G.GameTimer.once(300, this, this.checkAllEquipRedDot);
                break;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
        FGUIManager.ins().bindScript("ui://equip/EquipAttrPage", EquipAttrPage); //装备属性页
        FGUIManager.ins().bindScript("ui://equip/EquipAttrItem", EquipAttrItem); //装备属性Item
    }

    /** 更新装备数量 */
    public updateEquipCount(args: Vo.reward.RewardResult[]) {
        for (let k in args) {
            let cfg: table.item.ItemConfig = TableManager.getDataById(table.item.ItemConfig, args[k].baseId);
            if (!cfg) return;
            if (cfg.type == "EQUIP") {
                EquipManager.ins().addEquip(args[k].contents);
            }
        }
    }

    private wearEquip() {
        UIManager.ins().close(UIEquipKey.EQUIP_DETAIL_PAGE);
    }

    /** =============================红点=================================== */

    //检查所有红点
    public checkAllEquipRedDot() {
        //判断是否解锁装备
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.EQUIP)) return;
        this.checkEquipListRedDot();
        this.checkEquipRedDot();
    }

    //红点绑定
    @redDotTrigger(RedDotKeys.Equip_list)
    public checkEquipListRedDot() {
        for (let i = 1; i <= 6; i++) {
            if (EquipManager.ins().posRedPoint(i)) {
                return true;
            }
        }
        return false;
    }

    public checkEquipRedDot() {
        let allEquip: EquipVo[] = EquipManager.ins().getAllEquip;
        for (let i = 0; i < allEquip.length; i++) {
            let equip: EquipVo = allEquip[i];
            RedDotManager.ins().setRedDot(RedDotKeys.Equip_item2, EquipManager.ins().isEquipBetter(equip.severId), [equip.severId]);
        }
    }
}
EquipController.ins().doInit();
