import * as fgui from "fairygui-cc";
import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { GuideManager } from "../GuideManager";
import { GuidePlotType, GuideType, GuideVerifyType } from "../const/GuideEnum";
import G from "../../../../core/comm/G";
import { MapManager } from "../../../tiledMap/MapManager";
import { MapLayerKey, MoveCameraType } from "../../../tiledMap/MapEnum";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { ModelNode } from "../../common/node/ModelNode";
import { UIManager } from "../../../../core/mvc/UIManager";

import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { GuideUtils } from "../GuideUtils";
import { UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { Logger, LogType } from "../../../../core/log/Logger";
import { TimeManager } from "../../../../core/time/TimeManager";
import { GuideTouchRangeItem } from "../item/GuideTouchRangeItem";
import { GuideMaskItem } from "../item/GuideMaskItem";
import { Rect } from "cc";
import { NodeUtils } from "../../../../core/utils/NodeUtils";
import GIns from "../../../GIns";
import { GuideConditions } from "../GuideConditions";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

export class GuideMainView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideMainView";
    protected _layer = EnumUIViewLayer.GUIDE;

    /** 当前阶段引导cfg */
    private _cfg: table.guide.GuideConfig;

    /** 是否强引导 */
    private _isForce: boolean = false;

    /**点击动画 */
    private _touchAnim: GuideTouchRangeItem;
    /**点击蒙版 */
    private _touchMask: GuideMaskItem;

    /**最快点击结束时间 */
    private _fastClickEndTime: number = 0;

    /**当前的剧情Id */
    private _curPlotGroupId: number = -1;

    private _delayShowPassTime = 5000;

    private get view(): ui.guide.view.GuideMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.GUIDE_NEXT, NotificationKey.GUIDE_END, NotificationKey.GUIDE_GM_END, NotificationKey.GUIDE_FOCUS_END];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUIDE_NEXT:
                if (this._cfg && args != this._cfg.group) return;
                this.nextGuide();
                break;
            case NotificationKey.GUIDE_END:
                if (this._cfg && args != this._cfg.group) return;
                this.closeView();
                break;
            case NotificationKey.GUIDE_GM_END:
                this.closeSelf();
                break;
            case NotificationKey.GUIDE_FOCUS_END:
                if (!this._cfg?.finishCondition) {
                    //无完成条件
                    let type = GuideType[this._cfg.type];
                    if (type == GuideType.FOCUS_POS || type == GuideType.ARROW_POS) {
                        this.stepCompleted();
                    }
                }
        }
    }
    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onInit(): void {
        fgui.GRoot.inst.on(fgui.Event.TOUCH_BEGIN, this.onClick, this);

        this.view.passBtn.onClick(this.onClickPass, this);

        this._touchAnim = this.view.touchNode as any;
        this._touchMask = this.view.maskItem as any;

        this._touchAnim.hide();
        this._touchMask.hide();
    }

    protected onOpen(): void {
        this._cfg = GuideManager.ins().guideCfg;
        this.updateUI();
    }

    //引导分类
    private updateUI() {
        GameTimer.ins().clearAll(this);
        this.view.passBtn.visible = false;
        //是否可以战斗
        if (this._cfg.battle == "FALSE") {
            GIns.battleMgr.stopFightAi();
        } else {
            GIns.battleMgr.openFightAi();
        }

        this._fastClickEndTime = TimeManager.serverNow + 200;

        if (!this.checkIsCompletedCondition()) {
            this.updateTypeUI();
        } else {
            this.stepCompleted();
        }
    }

    /**检测位置是否有改变 */
    checkItemRectChange(item: fgui.GComponent, rect: Rect) {
        let oldRect = rect;
        let checkKey = GameTimer.ins().frameLoop(1, this, () => {
            if (NodeUtils.isValidNode(item.node)) {
                let newRect = GuideUtils.getUIRect(item);
                if (newRect && !newRect.equals(oldRect)) {
                    this._touchMask.updateRect(newRect);
                    this._touchAnim.updateRect(newRect);
                    oldRect = newRect;
                }
            } else {
                /**@see updateUI() 会移除全部定时器*/
                GameTimer.ins().clearByKey(checkKey);
            }
        });
    }

    onClickPass() {
        GuideManager.ins().pass();
    }

    showPassBtn() {
        this.view.passBtn.visible = GuideManager.ins().isCanPass();
    }

    updateMask(type: GuideType) {
        //强引导屏蔽点击
        this._isForce = this._cfg.isForce;

        if (type == GuideType.TOUCH && this._cfg.UI) {
            let finishCondition = this._cfg.finishCondition;
            let btnType = finishCondition && finishCondition[0] === GuideVerifyType.BUTTON ? finishCondition[2] : null;
            let item = GuideUtils.getUIClickItem(this._cfg.UI, this._cfg.item, btnType);
            let rect = GuideUtils.getUIRect(item);
            if (!rect) {
                this._isForce = false;
                this._touchAnim.hide();
                this._touchMask.hide(); //允许点击
                return;
            }

            this.view.localToGlobalRect(rect.x, rect.y, rect.width, rect.height, rect);

            this._touchMask.show(this._cfg, rect);
            this._touchAnim.show(this._cfg, rect);

            this.checkItemRectChange(item, rect);
        } else if (type == GuideType.DELAY && this._isForce) {
            this._touchMask.maskTouch();
            this._touchAnim.hide();
        } else {
            this._touchAnim.hide();
            this._touchMask.hide(); //允许点击
        }

        if (this._touchMask.visible) {
            GameTimer.ins().once(this._delayShowPassTime, this, this.showPassBtn);
        }
    }

    /**点击屏蔽 */
    setTouchMask(type: GuideType, isForce: boolean) {
        if (isForce) {
            this.cancelAllTouches();
        }

        this.updateMask(type);

        GameTimer.ins().once(100, this, () => {
            this.view.opaque = false; //点击穿透
        });
    }

    updateTypeUI() {
        let type = GuideType[this._cfg.type];
        let isMask = false;
        switch (type) {
            case GuideType.FOCUS_POS:
                //引导中，但是可以自由操作，移动到指定位置之后继续引导
                GuideUtils.focusPos(this._cfg.typeParam, true, false, NotificationKey.GUIDE_FOCUS_END);
                break;
            case GuideType.DELAY:
                isMask = this._cfg.isForce;
                this.delayType();
                break;
            case GuideType.ARROW_POS:
                //完成条件均是依赖finishCondition ！！！
                GuideUtils.focusPos(this._cfg.typeParam, false, true, NotificationKey.GUIDE_FOCUS_END);
                break;
            case GuideType.TOUCH:
                isMask = this._cfg.isForce;
                break;
            case GuideType.CREATE_MONSTER:
                UIManager.ins().open(UIGuideConfig.GuideCreateMonsterView, { guideCfgId: this._cfg.id });
                break;
            case GuideType.WAIT:
            case GuideType.PLOT:
                break;
        }

        this.setTouchMask(type, isMask);

        /**所有类型都可以播放剧情 */
        this.updatePlot(type);
    }

    /**播放剧情
     * @param isMainStep 是否根据播放情况卡下一步
     */
    updatePlot(stepType: GuideType) {
        this._curPlotGroupId = -1; //无剧情
        if (this._cfg.plot) {
            let isPlotType = stepType === GuideType.PLOT;
            let keys = Object.keys(this._cfg.plot);
            let plotType = keys[0];
            let groupId = this._cfg.plot[plotType];

            Logger.green(LogType.MODEL, plotType + "/" + groupId);

            switch (plotType) {
                case GuidePlotType.DIALOG:
                    UIManager.ins().open(UIGuideConfig.GuideDialogView, { groupId, isPlotType });
                    break;
                case GuidePlotType.TIPS:
                case GuidePlotType.TIPS_BLACK:
                    this._curPlotGroupId = groupId;
                    UIManager.ins().open(UIGuideConfig.GuideDialogSmallView, { groupId, isPlotType, isBlack: plotType == GuidePlotType.TIPS_BLACK });
                    break;
                case GuidePlotType.TEACH:
                    UIManager.ins().open(UIGuideConfig.GuideTeachView, { groupId, isPlotType });
                    break;
            }
        }
    }

    /**检测是否已完成当前步骤 */
    checkIsCompletedCondition() {
        if (this._cfg.finishCondition) {
            return GuideConditions.checkGuideCondition(this._cfg.finishCondition, null, this._cfg);
        }
        return false;
    }

    /** 延迟执行 */
    private delayType() {
        //GameTimer.ins().clearAll(this);
        let time = this._cfg.typeParam[0];
        if (time <= 0) {
            this.stepCompleted();
        } else {
            GameTimer.ins().once(time * 1000, this, () => {
                this.stepCompleted();
            });
        }
    }

    //遮罩点击
    private onClick() {
        if (!this._isForce && this._fastClickEndTime < TimeManager.serverNow) {
            if (GuideType[this._cfg.type] === GuideType.TOUCH) {
                this.stepCompleted();
            }
        }
    }

    /**步骤完成 */
    private stepCompleted() {
        let cfg = GuideManager.ins().guideCfg;
        if (cfg && cfg.id === this._cfg.id) {
            GuideManager.ins().nextGuide();
        }
    }

    //清理上一步引导UI
    private closeLastStepGuide() {
        //判断是否有事件需要触发
        switch (this._cfg.type) {
            case GuideType.FOCUS_POS:
                let layer = MapManager.ins().getLayerByType(MapLayerKey.GUIDE_LAYER);
                if (layer) layer.node.active = false;
                G.FacadeManager.emitNow(NotificationKey.TASK_GUIDE_END);
                break;
            case GuideType.ARROW_POS:
                G.FacadeManager.emitNow(NotificationKey.TASK_GUIDE_END);
                break;
            case GuideType.TOUCH:
                if (this._curPlotGroupId > 0) {
                    G.FacadeManager.emitNow(NotificationKey.GUIDE_CLEAN_PLOT_BY_GROUP_ID, this._curPlotGroupId);
                }
                break;
        }

        this._touchAnim.hide();
        this._touchMask.hide();
        this.view.opaque = true;
    }

    //下一步引导
    private nextGuide() {
        //当前引导结束处理
        this.closeLastStepGuide();
        this._cfg = GuideManager.ins().guideCfg;
        if (this.checkIsCompletedCondition()) {
            this.stepCompleted();
        } else {
            if (this._cfg) {
                this.updateUI();
            } else {
                this.closeSelf();
            }
        }
    }

    private closeView() {
        this.closeLastStepGuide();
        DebugUtils.isDebugMode() && console.log("===============结束引导================");
        this.closeSelf();
    }

    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }
}

UIScriptManager.bindScript(UIGuideConfig.GUIDE_MAIN_VIEW, GuideMainView);
