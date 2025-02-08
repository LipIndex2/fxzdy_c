import { Color } from "cc";
import G from "../../../core/comm/G";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { EquipItem } from "../common/item/EquipItem";
import { equipData, EquipManager } from "../equip/EquipManager";
import { EquipVo, EquipVoData } from "../equip/vo/EquipVo";
import { ItemUtils } from "../item/utils/ItemUtils";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";
import { EquipTipsAttrComp } from "./EquipTipsAttrComp";
import { Input } from "cc";
import { TouchUtils } from "../../../core/utils/TouchUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";

export interface EquipTipsViewOpenArgs {
    itemConfig: table.item.ItemConfig;
    equipVo?: EquipVo;
}

/**
 * 道具详情
 */
export class EquipTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "EquipTipsView";

    private get view(): ui.itemDetails.EquipTipsView {
        return this._view as any;
    }

    protected onInit(): void {
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);
    }

    public onOpen(args: EquipTipsViewOpenArgs, isReopen?: boolean): void {
        //界面信息
        let itemCfg = args.itemConfig;
        this.view.T_name.text = G.I18nManager.translate(itemCfg.name);
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, itemCfg.quality);
        const quality = itemCfg.quality;
        this.view.T_quality.text = ItemUtils.getTextByQuality(quality);

        QualityUtils.setFGUIFontColorByQuality(this.view.T_quality, quality);
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, quality);

        let equipCfg = TableManager.getDataById(table.equip.EquipConfig, itemCfg.id);

        let data: equipData = {
            id: equipCfg.position,
            /** 是否解锁 */
            isUnlock: true,
            cfgId: equipCfg.id,
        };
        if (args.equipVo) {
            FguiScriptUtils.toMyScriptClass(this.view.attrPage, EquipTipsAttrComp).setData(args.equipVo);
            data.equipId = args.equipVo.severId;
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.attrPage, EquipTipsAttrComp).setEquipSuitId(equipCfg.suitId);
            FguiScriptUtils.toMyScriptClass(this.view.attrPage, EquipTipsAttrComp).showNotEquipVoList(equipCfg);
        }

        let equipVo = new EquipVo();
        if (args.equipVo) {
            equipVo = args.equipVo;
        } else {
            let equipVoData: EquipVoData = {
                severId: null,
                id: equipCfg.id,
                initSecondAttrMap: {},
                secondAttrRandomIdMap: {},
                washedSecondAttrMap: {},
                planId: 0,
                data: null,
            };
            equipVo.setEquipVoData(equipVoData);
        }

        let planId = EquipManager.ins().userPlanId;
        let wearEquip = EquipManager.ins().getEquipVosByPlanId(planId, equipCfg.position)[0];
        if (wearEquip && wearEquip.score !== equipVo.score) {
            if (wearEquip.score > equipVo.score) {
                this.view.T_score.color = Color.RED;
            } else {
                this.view.T_score.color = Color.GREEN;
            }
        } else {
            this.view.T_score.color = Color.WHITE;
        }
        this.view.T_score.text = equipVo.score + "";
        FguiScriptUtils.toMyScriptClass(this.view.item, EquipItem).setData(data);
    }
    private onShowTips(event: any) {
        const isIn1 = TouchUtils.isTouchInUi(event, this.view.attrPage.btn_Tips._uiTrans);
        const isIn2 = TouchUtils.isTouchInUi(event, this.view.attrPage.skillPage._uiTrans);
        if (!isIn1 && !isIn2) {
            this.view.attrPage.skillPage.visible = false;
        }
    }
}
UIScriptManager.bindScript(UIViewItemDetailsKey.EquipTipsView, EquipTipsView);
