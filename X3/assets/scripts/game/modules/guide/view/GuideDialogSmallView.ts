import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";

import { UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { GuideDialogConfigDatas } from "../../../table/guide/GuideDialogConfigDatas";
import { GuideManager } from "../GuideManager";
import { ModelNode } from "../../common/node/ModelNode";
import { TimeManager } from "../../../../core/time/TimeManager";
import { Tween } from "cc";
import { tween } from "cc";
import NotificationKey from "../../../event/NotificationKey";
import { CacheMode } from "cc";
import { HtmlTextParser } from "cc";
import { AudioManager } from "../../../comm/mgr/AudioManager";

export class GuideDialogSmallView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideDialogSmallView";
    protected _layer = EnumUIViewLayer.GUIDE;

    protected adaptType = ViewAdaptType.TOP_BOTTOM;

    /** 对话cfg */
    private _textCfg: table.guide.GuideDialogConfig;

    private _groupCfgs: table.guide.GuideDialogConfig[];

    private _index = 0;

    private _talkerModel: ModelNode;
    private _talkerLoader: fgui.GLoader;

    /**是否是动态对话框 既动态位置 */
    private _isDynamics: boolean;

    /**是否是剧情类型步骤 */
    private _isPlotType: boolean;


    listenNotifications(): string[] {
        return [
            NotificationKey.GUIDE_CLEAN_PLOT_BY_GROUP_ID,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUIDE_CLEAN_PLOT_BY_GROUP_ID:
                if (this._groupCfgs[0]?.group === args) {
                    this.closeSelf();
                }
                break;
        }
    }


    private get view(): ui.guide.view.GuideDialogSmallView {
        return this._view as any;
    }

    protected onInit(): void {
        this._talkerModel = this.view.dialog.npcHead.talkerModel as any;
        this._talkerLoader = this.view.dialog.npcHead.talkerLoader;
        this._talkerModel.visible = false;
        this._talkerLoader.visible = false;
        this.view.dialog.T_text.text = "";
        this.view.dialog.T_text._richText.cacheMode = CacheMode.NONE;
    }

    protected onOpen(data: { groupId: number, isPlotType: boolean, isBlack: boolean }): void {
        this._isPlotType = data.isPlotType;
        this._groupCfgs = GuideDialogConfigDatas.ins().getConfigsByGroup(data.groupId) || [];
        this._textCfg = this._groupCfgs[0]; //先拿数据
        this._index = 0;

        if (!this._textCfg) {
            console.error(`找不到对话配置组${data.groupId}!!! `)
        }

        this.view.dialog.getController("type").selectedIndex = data.isBlack ? 1 : 0;
        this._isDynamics = data.isBlack;

        this.playStartAnim();

        if (data.isPlotType) {
            GuideManager.ins().nextGuide();
        }
    }

    /**对话框位置 */
    private getDialogPos() {
        if (this._textCfg) {
            let xMin = this.view.nodeRange.xMin;
            let width = this.view.nodeRange.width;
            let yMin = this.view.nodeRange.yMin;
            let height = this.view.nodeRange.height;

            let y: number;
            let x: number;

            let xPerc = (this._textCfg.xPercent || 0) / 100; //默认0 0是中间
            x = xMin + width * (xPerc + 0.5); //-50 +50 默认中间

            if (this._textCfg.yToBottom) {
                //距离底部距离
                y = this.view.height - this._textCfg.yToBottom;
            } else {
                let yPerc = (this._textCfg.yPercent || 0) / 100; //默认0
                y = yMin + height * yPerc;
            }

            return { x, y };
        }
        return null;
    }


    /**播放进入动效 */
    private playStartAnim() {
        let isPlayAnim = false;
        if (this._isDynamics) {
            //进入动画
            let pos = this.getDialogPos();
            if (pos) {
                let dialog = this.view.dialog;

                dialog.x = 100;
                dialog.y = pos.y;

                this._talkerModel.visible = false;
                this._talkerLoader.visible = false;
                this.view.dialog.T_text.text = "";

                this.updateNpc();

                tween(dialog).to(0.2, { x: pos.x }).call(() => {
                    this.checkNext();
                }).start();

                isPlayAnim = true;
            }
        }

        if (!isPlayAnim) {
            //无动画
            this.checkNext();
        }
    }

    private updateNpc() {
        this._talkerModel.visible = false;
        this._talkerLoader.visible = false;

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
    }

    private updateUI() {
        GameTimer.ins().clearAll(this);
        if (!this._textCfg) {
            console.error("对话组id不存在");
            this.closeSelf();
            return;
        }

        if (this._isDynamics) {
            let pos = this.getDialogPos();
            if (pos) {
                this.view.dialog.setPosition(pos.x, pos.y);
            }
        }

        this.updateNpc();

        //dialog.T_text.text = this._textCfg.text;
        this.playTypingAnimLoop(this._textCfg.text, 0);
        AudioManager.ins().playDialog(this._textCfg.sound)
        GameTimer.ins().once(this._textCfg.time || 2000, this, this.checkNext);
    }

    /**检测下段对话 */
    private checkNext() {
        this._textCfg = this._groupCfgs[this._index++];
        if (this._textCfg) {
            this.updateUI();
        } else {
            // AudioManager.ins().stopDialog();
            this.closeSelf();
        }
    }

    /**寻找xml描述符 */
    private checkXml(totalContent: string, index: number) {
        let str = totalContent.substring(index);
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
        Tween.stopAllByTarget(this.view.dialog);
    }
}

UIScriptManager.bindScript(UIGuideConfig.GuideDialogSmallView, GuideDialogSmallView);