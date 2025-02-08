import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import { GuideManager } from "../GuideManager";
import { GuideType } from "../const/GuideEnum";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";

import { TimeManager } from "../../../../core/time/TimeManager";
import { UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import { GuideTeachConfigDatas } from "../../../table/guide/GuideTeachConfigDatas";
import { GuideUtils } from "../GuideUtils";
import NotificationKey from "../../../event/NotificationKey";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";

export class GuideCreateMonsterView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideEmptyView";
    protected _layer = EnumUIViewLayer.GUIDE;

    /**配置 */
    private _cfg: table.guide.GuideConfig;


    listenNotifications(): string[] {
        return [
            NotificationKey.CREATE_GUIDE_MONSTERS,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CREATE_GUIDE_MONSTERS:
                this.monsterFadeIn();
                break;
        }
    }


    private get view(): ui.guide.view.GuideTeachView {
        return this._view as any;
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onInit(): void {
    }

    protected onOpen(data: { guideCfgId: number }): void {
        this._cfg = TableManager.getDataById(table.guide.GuideConfig, data.guideCfgId);
        if (this._cfg.isForce) {
            this.cancelAllTouches();
        }
        this.view.touchable = this._cfg.isForce;
        GuideUtils.createMonsters(this._cfg.typeParam);
    }

    private monsterFadeIn() {
        BattleExpandManager.ins().guideMonsterFadeInByIds(this._cfg.typeParam);
        let time = this._cfg.typeParam.length * 200 + 800;
        GameTimer.ins().once(time, this, this.fadeInEnd);
    }

    private fadeInEnd() {
        GuideManager.ins().nextGuide();
        this.closeSelf();
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }
}

UIScriptManager.bindScript(UIGuideConfig.GuideCreateMonsterView, GuideCreateMonsterView)