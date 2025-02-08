import { Color } from "cc";
import * as fgui from "fairygui-cc";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { EquipItem } from "../../common/item/EquipItem";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { EquipManager, equipData } from "../EquipManager";
import { EquipVo } from "../vo/EquipVo";
import { Input } from "cc";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIEquipKey } from "../const/UIEquipConfig";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";

/** 穿戴装备界面 */
@bindScript(UIEquipKey.EQUIP_DETAIL_PAGE)
export class EquipDetailPage extends UICommWin {
    static pkgName: string = "equip";
    static viewName: string = "EquipDetailPage";

    private _posVoData: equipData;
    private _equipVo: EquipVo;

    private _equipVos: EquipVo[];

    private _item;

    /**展开动画类型*/
    protected _effectType: UIWinEffectType = UIWinEffectType.Flat;
    /**展开动画内容分组名称*/
    protected _flatCenterGroup: string = "gp_main";

    private get view(): ui.equip.page.EquipDetailPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EQUIP_WEAR_EQUIP, NotificationKey.EVENT_CHANGE_ITEMS2];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EQUIP_WEAR_EQUIP:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
                if (this._posVoData.equipId) {
                    this._equipVo = EquipManager.ins().getEquipVoById(this._posVoData.equipId);
                }
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        this.view.list_equip.itemRenderer = this.equipItem.bind(this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onBtnClick, this);
        // 触摸外部
        this.view.on(Input.EventType.TOUCH_END, this.onShowTips, this);
    }

    protected onOpen(posVoData: equipData): void {
        this._posVoData = posVoData;
        if (this._posVoData.equipId) {
            this._equipVo = EquipManager.ins().getEquipVoById(this._posVoData.equipId);
        }

        this._equipVos = EquipManager.ins().getEquipVosByPosId(this._posVoData.id);
        if (!this._equipVo) {
            this._equipVo = this._equipVos[0];
        }
        this.view.list_equip.numItems = this._equipVos.length;

        //绑定红点
        for (let i = 0; i < this.view.list_equip.numChildren; i++) {
            let item = this.view.list_equip.getChildAt(i) as EquipItem;
            let vo = this._equipVos[i];
            // @ts-ignore
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Equip_item2, [vo.severId]);
        }

        //不知道为什么进来会给y设置-144的偏移，在这里重置一下y轴
        this.view.y = 0;

        this.updateUI();
    }

    protected onClose(): void {}

    private updateUI() {
        let self = this.view;

        let data: equipData = {
            id: this._posVoData.id,
            /** 是否解锁 */
            isUnlock: this._posVoData.isUnlock,
            /** 装备id */
            equipId: this._equipVo.severId,
        };
        //@ts-ignore
        self.item.setData(data);

        //界面信息
        let itemCfg = TableManager.getDataById(table.item.ItemConfig, this._equipVo.equipCfg.id);
        self.T_name.text = itemCfg.name;
        const quality = itemCfg.quality;
        self.T_quality.text = ItemUtils.getTextByQuality(quality);
        
        QualityUtils.setFGUIFontColorByQuality(self.T_quality, quality);
        QualityUtils.setFGUIFontColorByQuality(self.T_name, quality);


        //@ts-ignore
        self.attrPage.setData(this._equipVo);

        let planId = EquipManager.ins().userPlanId;
        let wearEquip = EquipManager.ins().getEquipVosByPlanId(planId, this._equipVo.posId)[0];
        if (wearEquip && wearEquip.score !== this._equipVo.score) {
            if (wearEquip.score > this._equipVo.score) {
                self.T_score.color = Color.RED;
            } else {
                self.T_score.color = Color.GREEN;
            }
        } else {
            self.T_score.color = Color.WHITE;
        }
        self.T_score.text = this._equipVo.score + "";

        self.btn_get.visible = this._equipVo.planId > 0 ? false : true;
        self.T_getTips.visible = this._equipVo.planId > 0 ? true : false;
    }

    private equipItem(index: number, item: EquipItem) {
        let data: equipData = {
            id: this._posVoData.id,
            /** 是否解锁 */
            isUnlock: this._posVoData.isUnlock,
            /** 装备id */
            equipId: this._equipVos[index].severId,
        };
        item.setData(data);
        item.isCanTouch(false);

        if (!this._item && this._equipVo == this._equipVos[index]) {
            this._item = item;
            this._item.img_sel.visible = true;
        }
        item.onClick(() => {
            this._item.img_sel.visible = false;
            this._equipVo = this._equipVos[index];
            this._item = item;
            this._item.img_sel.visible = true;
            this.updateUI();
        }, this);
    }

    private onBtnClick() {
        EquipManager.ins().wearEquip(this._equipVo.severId);
    }

    private onShowTips(event: any) {
        const isIn1 = TouchUtils.isTouchInUi(event, this.view.attrPage.btn_Tips._uiTrans);
        const isIn2 = TouchUtils.isTouchInUi(event, this.view.attrPage.skillPage._uiTrans);
        if (!isIn1 && !isIn2) {
            this.view.attrPage.skillPage.visible = false;
        }
    }
}
