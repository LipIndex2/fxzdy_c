import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { EquipBagDetailPage } from "../page/EquipBagDetailPage";
import { EquipDetailPage } from "../page/EquipDetailPage";
import { EquipMainView } from "../view/EquipMainView";

/** 装备 */
export enum UIEquipKey {
    /** 装备主界面 */
    EQUIP_MAIN_VIEW = "EQUIP_MAIN_VIEW",
    /** 穿戴装备界面 */
    EQUIP_DETAIL_PAGE = "EQUIP_DETAIL_PAGE",
    /** 装备预览界面 */
    EquipBagDetailPage = "EquipBagDetailPage",
    /** 装备批量分解界面 */
    EquipRecycleWin = "EquipRecycleWin",
    /**当前装备属性预览*/
    EquipAttrWin = 'EquipAttrWin'
}
UIScriptManager.bindScript(UIEquipKey.EQUIP_MAIN_VIEW, EquipMainView);
UIScriptManager.bindScript(UIEquipKey.EquipBagDetailPage, EquipBagDetailPage);
