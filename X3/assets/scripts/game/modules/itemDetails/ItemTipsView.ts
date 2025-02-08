import UIScriptManager from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import * as fgui from "fairygui-cc";
import { BackpackManager } from "../backpack/BackpackManager";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";
import { TableManager } from "../../../core/table/TableManager";
import { JumpManager } from "../jump/JumpManager";
import G from "../../../core/comm/G";
import { ConditionManager } from "../condition/ConditionManager";
import { ItemTipsUtils } from "./ItemTipsUtils";
import { UIManager } from "../../../core/mvc/UIManager";
import { ItemUtils } from "../item/utils/ItemUtils";
import { QualityUtils } from "../common/quality/QualityUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { UIHeroKey } from "../hero/const/UIHeroConfig";
import GIns from "../../GIns";
import { IHeroInfoPreviewWinOpenArgs } from "../hero/view/HeroInfoPreviewWin";

export interface ItemTipsViewOpenArgs {
    itemConfig: table.item.ItemConfig;
}

export class ItemTipsViewItem extends fgui.GComponent {
    // 物品来源配置
    private itemComeFromConfig: table.item.ItemComeFromConfig;

    private get view(): ui.itemDetails.ItemTipsViewItem {
        return this as any;
    }

    public onInit(): void {
        this.view.goBtn.onClick(this.onClickJump, this);
    }

    private onClickJump() {
        const jumpId = this.itemComeFromConfig?.jumpId;
        if (!jumpId) {
            console.warn("没有跳转id ");
            return;
        }

        const isOk = ConditionManager.ins().checkCondition(this.itemComeFromConfig.unlockCondition, true, true);
        if (isOk) JumpManager.ins().jumpById(jumpId);
        UIManager.ins().close(UIViewItemDetailsKey.ItemDetails);
        UIManager.ins().close(UIViewItemDetailsKey.ItemNotEnoughView);
    }

    public updateView(itemComeFromConfig: table.item.ItemComeFromConfig) {
        this.itemComeFromConfig = itemComeFromConfig;
        // 标题
        this.view.nameLab.text = G.I18nManager.translate(itemComeFromConfig.title);

        this.view.goBtn.visible = false;
        const jumpId = this.itemComeFromConfig?.jumpId;
        if (jumpId) {
            this.view.goBtn.visible = true;
        }

        this.view.otherBox.visible = false;
        if (itemComeFromConfig.otherDescParm) {
            this.view.otherBox.visible = true;
            this.view.desLab.text = this.itemComeFromConfig.otherDesc;
            let parmObjs = ItemTipsUtils.getTipsValue(itemComeFromConfig.otherDescParm);

            for (let i = 0; i < 2; i++) {
                let key = i + 1;
                this.view["item" + key].visible = false;
                if (parmObjs[i]) {
                    this.view["item" + key].visible = true;
                    this.view["itemIcon" + key].visible = parmObjs[i].icon ? true : false;
                    if (parmObjs[i].icon) this.view["itemIcon" + key].icon = parmObjs[i].icon;
                    this.view["numLab" + key].text = parmObjs[i].value;
                }
            }
        }

        // 描述
        // this.view.desc.text = G.I18nManager.translate(itemComeFromConfig.desc);
        // // 右侧的锁定提示内容
        // this.view.lockTips.text = G.I18nManager.translate(itemComeFromConfig.lockTips);
    }
}

/**
 * 道具详情
 */
export class ItemTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "ItemTipsView";

    private itemArr: table.item.ItemComeFromConfig[];

    private _cfg: table.item.ItemConfig;

    private get view(): ui.itemDetails.ItemTipsView {
        return this._view as any;
    }

    public onInit(): void {
        // 道具获取方式
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.itemRendererForGetWayRow.bind(this);

        this.view.img_fdj.on(fgui.Event.CLICK, this.onClickFDJ, this);
    }

    public onClose(): void { }

    public onOpen(args: ItemTipsViewOpenArgs, isReopen?: boolean): void {
        // this.view.nameLab.color = ItemUtils.getTextColor(args.itemConfig.quality);
        this.view.img_fdj.visible = false;
        if (args.itemConfig.type == "HERO_FRAGMENT") {
            this.view.img_fdj.visible = true;
        }
        this._cfg = args.itemConfig;
        this.view.nameLab.text = args.itemConfig.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.nameLab, args.itemConfig.quality);
        this.view.numLab.setVar("num", BackpackManager.ins().getItemCountByItemId(args.itemConfig.id).toString()).flushVars();
        this.view.desLab.text = args.itemConfig.desc;
        this.view.numLab.ensureSizeCorrect();
        this.itemArr = [];
        const itemComeFromConfigArray = TableManager.getAllData(table.item.ItemComeFromConfig);
        for (let i = 0; i < itemComeFromConfigArray.length; i++) {
            if (itemComeFromConfigArray[i].itemId == args.itemConfig.id) this.itemArr.push(itemComeFromConfigArray[i]);
        }
        if (this.itemArr.length > 0) {
            this.view.otherBox.visible = true;
            this.view.itemList.numItems = this.itemArr.length;
        } else {
            this.view.otherBox.visible = false;
            this.view.bg.height = this.view.desLab.y - this.view.bg.y + this.view.desLab.height + 30;
        }
    }

    private itemRendererForGetWayRow(index: number, view: ItemTipsViewItem) {
        const itemComeFromConfig = this.itemArr[index];
        view.updateView(itemComeFromConfig);
    }

    private onClickFDJ() {
        // this._cfg
        if (this._cfg.type == "HERO_FRAGMENT") {
            let heroCfg = GIns.heroMgr.getHeroIdByFragmentId(this._cfg.id);
            UIManager.ins().open(UIHeroKey.HERO_INFO_PREVIEW_WIN, [{ heroId: heroCfg.id } as IHeroInfoPreviewWinOpenArgs]);
        }
    }
}
UIScriptManager.bindScript(UIViewItemDetailsKey.ItemDetails, ItemTipsView);
