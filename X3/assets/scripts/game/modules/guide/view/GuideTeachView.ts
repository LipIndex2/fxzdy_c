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
import { ModelNode } from "../../common/node/ModelNode";

export class GuideTeachView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideTeachView";
    protected _layer = EnumUIViewLayer.GUIDE;

    /** 当前阶段引导cfg */
    private _teachCfg: table.guide.GuideTeachConfig;

    private _groupCfgs: table.guide.GuideTeachConfig[];

    private _index = 0;

    /**是否是剧情类型步骤 */
    private _isPlotType: boolean;

    /**当前对话可结束的时间 */
    private _endTime: number;

    private _modelNode: ModelNode;

    private get view(): ui.guide.view.GuideTeachView {
        return this._view as any;
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onInit(): void {
        this._modelNode = this.view.modelNode as any;

        this.view.onClick(this.onClick, this);
    }

    protected onOpen(data: { groupId: number, isPlotType: boolean }): void {
        this._isPlotType = data.isPlotType;

        this.cancelAllTouches();
        this._groupCfgs = GuideTeachConfigDatas.ins().getConfigsByGroup(data.groupId) || [];
        this.checkNext();
    }

    private updateUI() {
        let view = this.view;
        if (!this._teachCfg) {
            console.log("教学组id不存在")
            return;
        }

        if (this._teachCfg.anim) {
            this._modelNode.loadByModelId(this._teachCfg.anim);
            view.img_Icon.visible = false;
            this._modelNode.visible = true;
        } else {
            view.img_Icon.icon = this._teachCfg.icon;
            view.img_Icon.visible = true;
            this._modelNode.visible = false;
        }
        view.T_text.text = this._teachCfg.text;
    }

    /**检测下段对话 */
    private checkNext() {
        this._teachCfg = this._groupCfgs[this._index++];
        if (this._teachCfg) {
            this.updateUI();
        } else {
            if (this._isPlotType) {
                GuideManager.ins().nextGuide();
            }
            this.closeSelf();
        }
    }

    private onClick() {
        if (TimeManager.serverNow < this._endTime) {
            return;
        }
        this.checkNext();
    }
}

UIScriptManager.bindScript(UIGuideConfig.GuideTeachView, GuideTeachView)