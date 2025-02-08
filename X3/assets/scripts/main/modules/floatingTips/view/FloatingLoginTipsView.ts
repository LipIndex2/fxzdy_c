import * as fgui from "fairygui-cc";
import { Tween } from "cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { tween } from "cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIFloatingLoginTipsKey } from "../const/UIFloatingLoginTipsConfig";
import LoginNotificationKey from "../../LoginNotificationKey";

/**
 * 飘字界面
 */
export class FloatingLoginTipsView extends UIWin {
    static pkgName: string = "floatingLoginTips";
    static viewName: string = "FloatingLoginTipsView";
    public _layer = EnumUIViewLayer.TIPS;

    //普通飘字队列
    private static readonly _commonTextMap: Map<number, fgui.GComponent> = new Map();
    //普通队列序号
    private _commonIndex: number = 0;
    private _starCommonPosY = 0;

    private get view(): ui.floatingLoginTips.FloatingLoginTipsView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            LoginNotificationKey.FLOATING_LOGIN_TIPS
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.FLOATING_LOGIN_TIPS:
                this.showTips(args);
        }
    }

    protected onOpen(tipsStr: string): void {
        this._starCommonPosY = this.view.commonItem.y;
        this.showTips(tipsStr);
    }

    //普通飘字
    public showTips(tipsStr: string) {
        this._commonIndex += 1;
        //整个队列往上走
        tween(this.view.commonItem)
            .to(0.1, { y: this._starCommonPosY - (55 * this._commonIndex) })
            .start();

        let textItem = fgui.UIPackage.createObject('floatingLoginTips', 'FloatingLoginTipsItem') as ui.floatingLoginTips.item.FloatingLoginTipsItem;
        FloatingLoginTipsView._commonTextMap[this._commonIndex] = textItem;

        this.view.commonItem.addChild(textItem);
        textItem.visible = true;
        textItem.alpha = 1;
        textItem.y = (this._commonIndex * 55) - 55;
        textItem.x = 257;
        textItem.height = 55;
        textItem.T_tips.text = tipsStr;
        tween(textItem)
            .to(0.05, { scaleX: 1.1, scaleY: 1.1 })
            .to(0.1, { scaleX: 1, scaleY: 1 })
            .delay(1)
            .to(0.1, { alpha: 0 })
            .call(() => {
                Tween.stopAllByTarget(textItem);
                textItem.dispose();
                delete FloatingLoginTipsView._commonTextMap[this._commonIndex];
            })
            .start();
    }

    protected onClose(): void {
    }

}

UIScriptManager.bindScript(UIFloatingLoginTipsKey.FloatingLoginTipsView, FloatingLoginTipsView);