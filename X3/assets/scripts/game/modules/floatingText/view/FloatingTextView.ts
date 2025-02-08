import * as fgui from "fairygui-cc";
import { Tween } from "cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { tween } from "cc";
import NotificationKey from "../../../event/NotificationKey";
import { FloatingTextManager, FloatingTextType, TextData } from "../FloatingTextManager";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import GIns from "../../../GIns";
import { GotTextItem } from "../item/GotTextItem";
import { AttrTextItem } from "../item/AttrTextItem";
import { TipsTextItem } from "../item/TipsTextItem";
import { FightTextItem } from "../item/FightTextItem";
import { AreaTextItem } from "../item/AreaTextItem";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIFloatingTextKey } from "../const/UIFloatingTextConfig";

/**
 * 飘字界面
 */
@bindScript(UIFloatingTextKey.FLOATING_TEXT_MAIN_VIEW)
export class FloatingTextView extends UIWin {
    static pkgName: string = "floatingText";
    static viewName: string = "FloatingTextView";
    public _layer = EnumUIViewLayer.TIPS;

    //普通飘字队列
    private static readonly _commonTextMap: Map<number, TipsTextItem> = new Map();
    //普通队列序号
    private _commonIndex: number = 0;
    private _starCommonPosY = 0;

    //获取道具飘字队列
    private static readonly _itemTextMap: Map<number, GotTextItem> = new Map();
    //获取道具队列序号
    private _itemIndex: number = 0;
    private _starItemPosY = 0;

    //属性飘字队列
    private static readonly _attrTextMap: Map<number, AttrTextItem> = new Map();
    //属性队列序号
    private _attrIndex: number = 0;
    private _attrPosInitY: number = 0;
    private _starAttrPosY = 0;

    /**战力 */
    private _fightItem: FightTextItem;
    /**区域 */
    private _areaItem: AreaTextItem;

    private get view(): ui.floatingText.FloatingTextView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_NEW_FLOATING_TEXT];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_NEW_FLOATING_TEXT:
                this.showByType(args);
                break;
        }
    }

    protected onInit() {
        this._attrPosInitY = this.view.attrItem.y;
        this.view.touchable = false;
    }

    protected onOpen(textData: TextData): void {
        this._starCommonPosY = this.view.commonItem.y;
        this._starItemPosY = this.view.itemItem.y;
        this._starAttrPosY = this.view.attrItem.y = this._attrPosInitY;

    }

    showByType(textData: TextData) {
        switch (textData.type) {
            case FloatingTextType.common:
                this.showTips(textData);
                break;
            case FloatingTextType.item:
                this.showItem(textData);
                break;
            case FloatingTextType.fight:
                this.showFight(textData);
                break;
            case FloatingTextType.area:
                this.showArea(textData);
                break;
            case FloatingTextType.attr:
                this.showAttr(textData);
                break;
        }
    }

    //普通飘字
    public showTips(textData: TextData) {
        this._commonIndex += 1;
        //整个队列往上走
        tween(this.view.commonItem)
            .to(0.1, { y: this._starCommonPosY - 55 * this._commonIndex })
            .start();

        let item = FloatingTextView._commonTextMap[this._commonIndex];
        let textItem: TipsTextItem;
        if (item) {
            textItem = item;
            Tween.stopAllByTarget(textItem);
        } else {
            textItem = TipsTextItem.create();
            FloatingTextView._commonTextMap[this._commonIndex] = textItem;
        }
        this.view.commonItem.addChild(textItem);
        textItem.visible = true;
        textItem.alpha = 1;
        textItem.setData(textData);
        textItem.y = this._commonIndex * 55 - 55;
        tween(textItem)
            .to(0.05, { scaleX: 1.1, scaleY: 1.1 })
            .to(0.1, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .to(0.1, { alpha: 0 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
                textItem.dispose();
                delete FloatingTextView._commonTextMap[this._commonIndex];
            })
            .start();
    }

    //战力飘字
    public showFight(textData: TextData) {
        GIns.floatingTextMgr.isShowFight = false;
        if (!this._fightItem) {
            this._fightItem = FightTextItem.create();
            this.view.fightItem.addChild(this._fightItem);
        }
        let textItem = this._fightItem;

        Tween.stopAllByTarget(textItem);
        textItem.scaleX = textItem.scaleY = 0;
        textItem.alpha = 1;
        textItem.visible = true;
        textItem.setData(textData);
        textItem.y = 0;
        textItem.x = 0;

        tween(textItem)
            .to(0.05, { scaleX: 1.1, scaleY: 1.1 })
            .to(0.1, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .to(0.1, { alpha: 0 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
                GIns.floatingTextMgr.isShowFight = true;
            })
            .start();
    }

    //获取道具飘字
    public showItem(textData: TextData) {
        this._itemIndex += 1;
        let itemHeight = 52;
        //整个队列往上走
        tween(this.view.itemItem)
            .to(0.1, { y: this._starItemPosY - this._itemIndex * itemHeight })
            .start();

        let item = FloatingTextView._itemTextMap[this._itemIndex];
        let textItem: GotTextItem;
        if (item) {
            textItem = item;
            Tween.stopAllByTarget(textItem);
        } else {
            textItem = GotTextItem.create();
            FloatingTextView._itemTextMap[this._itemIndex] = textItem;
        }
        this.view.itemItem.addChild(textItem);
        textItem.visible = true;
        textItem.alpha = 1;
        textItem.setData(textData);
        textItem.y = this._itemIndex * itemHeight - itemHeight;
        tween(textItem)
            .to(0.05, { scaleX: 1.1, scaleY: 1.1 })
            .to(0.1, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .to(0.1, { alpha: 0 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
                textItem.dispose();
                delete FloatingTextView._itemTextMap[this._itemIndex];
            })
            .start();
    }

    //区域名字飘字
    public showArea(textData: TextData) {
        if (!this._areaItem) {
            this._areaItem = AreaTextItem.create();
            this.view.areaItem.addChild(this._areaItem);
        }

        let textItem = this._areaItem;

        Tween.stopAllByTarget(textItem);
        textItem.alpha = 0;
        textItem.visible = true;
        textItem.setData(textData);
        textItem.y = 0;
        textItem.x = 0;

        tween(textItem)
            .to(0.3, { alpha: 1 })
            .delay(1)
            .to(0.3, { alpha: 0 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
            })
            .start();
    }

    protected onClose(): void {
    }

    //属性飘字
    public showAttr(textData: TextData) {
        if (textData.target) {
            let target = textData.target;
            let targetGlobalPos = target.parent.localToGlobal(0, target.y);
            let attrItemLocalPos = this.view.attrItem.parent.globalToLocal(0, targetGlobalPos.y);
            this.view.attrItem.y = attrItemLocalPos.y;
        } else {
            this.view.attrItem.y = this._attrPosInitY;
        }
        this._attrIndex += 1;
        // //整个队列往上走
        // tween(this.view.commonItem)
        //     .to(0.1, { y: this._starAttrPosY - (55 * this._attrIndex) })
        //     .start();

        let item = FloatingTextView._attrTextMap[this._attrIndex];
        let textItem: AttrTextItem;
        if (item) {
            textItem = item;
            Tween.stopAllByTarget(textItem);
        } else {
            textItem = AttrTextItem.create();
            FloatingTextView._attrTextMap[this._attrIndex] = textItem;
        }
        this.view.attrItem.addChild(textItem);
        textItem.visible = true;
        textItem.alpha = 0.5;
        textItem.scaleX = textItem.scaleY = 0.5;
        textItem.setData(textData);
        // textItem.y = (this._attrIndex * 55) - 55;

        tween(textItem)
            .to(0.1, { scaleX: 1.1, scaleY: 1.1, alpha: 1, y: -40 })
            .to(0.3, { scaleX: 1, scaleY: 1, y: -60 })
            .to(0.1, { alpha: 0, y: -100 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
                // textItem.dispose();
                // delete FloatingTextView._attrTextMap[this._attrIndex];
            })
            .start();
    }
}
