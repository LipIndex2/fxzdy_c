import * as fgui from "fairygui-cc";
import { EquipManager, equipData } from "../../equip/EquipManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIEquipKey } from "../../equip/const/UIEquipConfig";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { TableManager } from "../../../../core/table/TableManager";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { EventClickItem } from "../../item/event/EventClickItem";
import { UITransform } from "cc";
import { EnumItemClickOpenType } from "../../backpack/const/EnumItemClickOpenType";
import GIns from "../../../GIns";

/** 装备item */
export class EquipItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "EquipItem";

    private _posVoData: equipData;

    private _openUI: string;

    private _isCanTouch: boolean = true;

    private get view(): ui.comm.item.EquipItem {
        return this as any;
    }

    onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);
    }

    setData(data: equipData, openUI?: string) {
        this._posVoData = data;
        this._openUI = openUI;
        this.updateUI();
    }

    private updateUI() {
        let self = this.view;

        //锁
        self.img_suo.visible = !this._posVoData.isUnlock;
        //等级
        self.T_level.visible = this._posVoData.isUnlock && this._posVoData.equipId ? true : false;

        self.img_di.visible = this._posVoData.equipId ? false : true;

        if (this._posVoData.equipId) {
            let equipVo = EquipManager.ins().getEquipVoById(this._posVoData.equipId);
            self.img_frame.icon = ItemUtils.getQualityIconResourcePath(equipVo.equipCfg.quality);
            self.T_level.text = "Lv" + equipVo.equipCfg.equipLevel;
            let itemCfg = TableManager.getDataById(table.item.ItemConfig, equipVo.id);
            self.img_item.icon = itemCfg.iconPath;
        } else {
            let itemCfg = TableManager.getDataById(table.item.ItemConfig, this._posVoData.cfgId);
            if (itemCfg) {
                self.img_item.icon = itemCfg.iconPath;
                let equipCfg = TableManager.getDataById(table.equip.EquipConfig, itemCfg.id);
                self.T_level.text = "Lv" + equipCfg.equipLevel;
                self.img_frame.icon = ItemUtils.getQualityIconResourcePath(equipCfg.quality);
            } else {
                self.img_frame.icon = "image/equip/wzb_frame";
            }
            self.img_di.icon = "image/equip/zb_" + this._posVoData.id;
        }
    }

    onBtnClick(event: fgui.Event) {
        if (!this._isCanTouch) return;
        if (!this._openUI) {
            let equipVo = EquipManager.ins().getEquipVoById(this._posVoData.equipId);
            let itemCfg = TableManager.getDataById(table.item.ItemConfig, equipVo.id);
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, itemCfg, this.view.node.getComponent(UITransform), this._posVoData.equipId, EnumItemClickOpenType.InBag));
            return;
        }

        if (!this._posVoData.isUnlock) {
            let cfg = TableManager.getDataById(table.equip.EquipPositionConfig, this._posVoData.id);
            if (cfg) {
                let lockTipStr = GIns.conditionMgr.getOpenConditionTips(cfg.unlockConditions)
                GIns.floatingTextMgr.showTips(lockTipStr);
            }
            return;
        }

        if (this._openUI == "EQUIP_DETAIL_PAGE") {
            if (EquipManager.ins().getEquipVosByPosId(this._posVoData.id).length > 0) {
                UIManager.ins().open(this._openUI, this._posVoData);
            } else {
                GIns.floatingTextMgr.showTips("暂无可穿戴装备！");
            }
            return;
        }
    }

    /** 是否开启点击效果 */
    isCanTouch(isCan: boolean) {
        this._isCanTouch = isCan;
    }

    /** 是否显示勾选 */
    isShowGou(isShow: boolean) {
        this.view.gp_gou.visible = isShow;
    }
}
