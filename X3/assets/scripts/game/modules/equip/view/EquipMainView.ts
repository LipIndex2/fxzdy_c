import { Tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import { ModelNode } from "../../common/node/ModelNode";
import { FightManager, systemFight } from "../../fight/FightManager";
import { FormationManager } from "../../formation/FormationManager";
import { EquipManager } from "../EquipManager";
import { UIEquipKey } from "../const/UIEquipConfig";
import { EquipWearItem } from "../item/EquipWearItem";

/** 装备主界面 */
export class EquipMainView extends UIPage {
    static pkgName: string = "equip";
    static viewName: string = "EquipMainView";

    /** 装备战力 */
    private _fight: number;
    /**穿戴item列表*/
    protected _items: EquipWearItem[] = []

    private get view(): ui.equip.view.EquipMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EQUIP_WEAR_EQUIP];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EQUIP_WEAR_EQUIP:
                this.updateFight();
                this.playLvUpAni();
                break;
        }
    }

    protected onInit(): void {
        let self = this.view;
        self.footer.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);
        self.btn_wear.on(fgui.Event.CLICK, this.wearClick, this);
        self.btn_recycle.on(fgui.Event.CLICK, this.recycleClick, this);
        self.btnRule.onClick(this.onClickRule, this)

        this._items = [
            FguiScriptUtils.toMyScriptClass(this.view.item1, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item2, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item3, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item4, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item5, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item6, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item7, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item8, EquipWearItem),
            FguiScriptUtils.toMyScriptClass(this.view.item9, EquipWearItem)
        ]
    }

    protected onOpen(args: any): void {
        this.updateUI();
        this.view.getTransition('t0').play()
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.T_fight);
    }

    protected onClickRule(): void {
        G.UIManager.open(UIEquipKey.EquipAttrWin)
    }

    private updateUI() {
        let self = this.view;

        let posVos = FormationManager.ins().getAllPosData();

        let addFight = FightManager.ins().getSystemFight(posVos, systemFight.EQUIP);
        if (this._fight && this._fight !== addFight) {
            Tween.stopAllByTarget(this.view.T_fight);
            // let addNum = addFight - this._fight;
            // this.fightTween(addNum / 10, 10);
            this._fight = addFight;
            self.T_fight.text = StringUtils.getFightStr(this._fight);
        } else {
            this._fight = addFight;
            self.T_fight.text = StringUtils.getFightStr(this._fight);
        }


        this._items.forEach((item, index) => {
            item.setData(EquipManager.ins().allPosData[index], index)
        })
    }

    private fightTween(addNum: number, num: number) {
        if (addNum == 0) return;

        // tween(this.view.T_addFight)
        //     .delay(0.02)
        //     .call(() => {
        //         if (addNum > 0) {
        //             this.view.T_addFight.text = `(+${Math.round((this._fight += addNum))})`;
        //             this.view.T_addFight.color = Color.GREEN;
        //         } else {
        //             this.view.T_addFight.text = `(-${Math.round((this._fight += addNum))})`;
        //             // this.view.T_addFight.color = Color.RED;
        //         }
        //         num--;
        //         if (num > 0) {
        //             this.fightTween(addNum, num);
        //         } else {
        //             this._fight = Math.round(this._fight);
        //             this.view.T_addFight.text = `(+${this._fight})`;
        //             this.view.T_addFight.color = Color.GREEN;
        //         }
        //     })
        //     .start();
    }

    private updateFight() {
        let posVos = FormationManager.ins().getAllPosData();
        FightManager.ins().updateSystemFight(posVos, systemFight.EQUIP);
        this.updateUI();
    }

    private wearClick() {
        EquipManager.ins().wearAllEquip();
    }

    private recycleClick() {
        G.UIManager.open(UIEquipKey.EquipRecycleWin);
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.modelNode as ModelNode;
        aniNode.loadByPath("spine/ui/shengjibiaoxian/shengjibiaoxian1_upper");
        aniNode.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
    }
}
