import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { GuideManager } from "../GuideManager";
import { GuideType } from "../const/GuideEnum";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";

import { TimeManager } from "../../../../core/time/TimeManager";
import { UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import { GuideDialogConfigDatas } from "../../../table/guide/GuideDialogConfigDatas";
import { ModelNode } from "../../common/node/ModelNode";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { AudioManager } from "../../../comm/mgr/AudioManager";

export class GuideDialogView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideDialogView";
    protected _layer = EnumUIViewLayer.GUIDE;

    /** 当前阶段引导cfg */
    private _textCfg: table.guide.GuideDialogConfig;

    private _groupCfgs: table.guide.GuideDialogConfig[];

    private _index = 0;

    private _talkerModel: ModelNode;
    private _talkerLoader: fgui.GLoader;

    /**是否是剧情类型步骤 */
    private _isPlotType: boolean;

    /**当前对话可结束的时间 */
    private _endTime: number;

    private get view(): ui.guide.view.GuideDialogView {
        return this._view as any;
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onInit(): void {
        this.view.onClick(this.onClick, this);

        this._talkerModel = this.view.dialog.npcHead.talkerModel as any;
        this._talkerLoader = this.view.dialog.npcHead.talkerLoader;
        this._talkerModel.visible = false;
        this._talkerLoader.visible = false;
    }

    protected onOpen(data: { groupId: number, isPlotType: boolean }): void {
        this._isPlotType = data.isPlotType;

        this.cancelAllTouches();
        this._groupCfgs = GuideDialogConfigDatas.ins().getConfigsByGroup(data.groupId) || [];

        this._textCfg = this._groupCfgs[0]; //先拿数据
        if (!this._textCfg) {
            console.error(`找不到对话配置组${data.groupId}!!! `)
        }

        this.checkNext();
    }

    //引导分类
    private updateUI() {
        GameTimer.ins().clearAll(this);
        if (!this._textCfg) {
            console.error("对话组id不存在");
            this.closeSelf();
            return;
        }

        this._endTime = (this._textCfg.time || 0) + TimeManager.serverNow;

        if (this._textCfg.npcModel) {
            //spine
            this._talkerModel.loadByModelId(this._textCfg.npcModel);
            this._talkerModel.visible = true;
            if (this._textCfg.npcPos) {
                this._talkerModel.setPosition(this._textCfg.npcPos[0] || 0, this._textCfg.npcPos[1] || 0);
            } else {
                this._talkerModel.setPosition(0, 0);
            }
        } else if (this._textCfg.npcHead) {
            //loader
            this._talkerLoader.icon = this._textCfg.npcHead;
            this._talkerLoader.visible = true;
            if (this._textCfg.npcPos) {
                this._talkerLoader.setPosition(this._textCfg.npcPos[0] || 0, this._textCfg.npcPos[1] || 0);
            } else {
                this._talkerLoader.setPosition(0, 0);
            }
        }
        //view.T_text.text = this._textCfg.text;
        this.playTypingAnimLoop(this._textCfg.text, 0);
        AudioManager.ins().playDialog(this._textCfg.sound)
    }

    /**检测下段对话 */
    private checkNext() {
        this._textCfg = this._groupCfgs[this._index++];
        if (this._textCfg) {
            this.updateUI();
        } else {
            if (this._isPlotType) {
                GuideManager.ins().nextGuide();
            }
            // AudioManager.ins().stopDialog();
            this.closeSelf();
        }
    }

    private onClick() {
        if (TimeManager.serverNow < this._endTime) {
            return;
        }
        this.checkNext();
    }

    /**寻找xml描述符 */
    private checkXml(totalContent: string, index: number) {
        let str = totalContent.substring(index, totalContent.length);
        let match = str.match(/^<[A-Za-z]+=[A-Za-z0-9]+>/); //开始
        if (!match || match.length == 0) {
            match = str.match(/^<\/[A-Za-z]+>/); //结尾
        }
        if (match && match.length > 0) {
            return index + match[0].length;
        }
        return index;
    }

    /**
     * 打字机动画
     * @param totalContent 全部内容
     * @param runTime 运行时间
     * @param speed 
     */
    private playTypingAnimLoop(totalContent: string, index: number) {
        index = this.checkXml(totalContent, index) + 1;
        if (index <= totalContent.length) {
            this.view.dialog.T_text.text = totalContent.substring(0, Math.min(index, totalContent.length));
            GameTimer.ins().frameOnce(1, this, () => {
                this.playTypingAnimLoop(totalContent, index);
            });
        }
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }
}

UIScriptManager.bindScript(UIGuideConfig.GuideDialogView, GuideDialogView);