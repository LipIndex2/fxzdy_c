import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { ModelNode } from "../../../modules/common/node/ModelNode";
import { RedDotCom } from "../../../modules/common/redDot/redDotCom";
import { RedDotKeys } from "../../../modules/common/redDot/RedDotKeys";
import { MallModel } from "../../../modules/mall/model/MallModel";
import { EnumTabItemNameForClient } from "../const/EnumTabItemNameForClient";
import { MainPageManager } from "../MainPageManager";
import { ActivityController } from "../../../modules/activity/ActivityController";

/**主界面tab按钮组件*/
@bindFguiExtension("ui://main/MainPageTabBtn")
export class MainPageTabBtn extends fgui.GButton {
    static pkgName: string = "main";
    static viewName: string = "MainPageTabBtn";

    protected _config: table.mainpage.MainPageTabItemConfig = null;
    protected _timerKey: string = null;
    protected _endTime: number = 0;

    private get view(): ui.main.btn.MainPageTabBtn {
        return this as any;
    }

    public onInit() {
        this.view.onClick(this.onClickItem, this);
    }

    public onPreDispose(): void {
        this.removeTimer();
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer);
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
    }

    protected onTimer(): void {
        let diffTime: number = this._endTime - G.TimeManager.serverNow;
        if (diffTime <= 0) {
            diffTime = 0;
            this.removeTimer();
        }
        this.view.lbTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(diffTime);
    }

    protected updateEndTime(): number {
        this._endTime = 0;
        if (this._config.showEndTime == false) {
            //不显示倒计时
            return;
        }
        if (this._config?.nameForClient == EnumTabItemNameForClient.LIMIT_PACK) {
            //限购礼包需要展示倒计时
            this._endTime = MallModel.ins().minPopupEndTime;
            return;
        }
        if (this._config?.nameForClient == EnumTabItemNameForClient.SEASON) {
            //赛季
            this._endTime = GIns.seasonManager.getLeftTimeBySeasonId() + G.TimeManager.serverNow;
            return;
        }
        if (this._config?.nameForClient == EnumTabItemNameForClient.SEASON_SUB) {
            //赛季子活动
            const svo = GIns.seasonManager.getSubOpen();
            if (svo) {
                this._endTime = svo.endTime;
            }
            return;
        }
        if (this._config?.nameForClient == EnumTabItemNameForClient.ENTRANCE) {
            //活动通用倒计时
            if (this._config?.viewArge) {
                let firstVo = ActivityController.ins().getFirstOpenActvityVoForOpenId(Number(this._config.viewArge));
                if (firstVo) {
                    this._endTime = firstVo.getEndTimeMs();
                }
            }
            return;
        }
    }

    protected onClickItem(): void {
        MainPageManager.ins().clickTabItemByName(this._config);
    }

    protected updateRedDotForItem(redDot: RedDotCom, nameForClient: string): void {
        switch (nameForClient) {
            case EnumTabItemNameForClient.ENTRANCE:
                redDot.reset(RedDotKeys.Activity_entrance, [this._config.viewArge]);
                break;
            case EnumTabItemNameForClient.CHARGE:
                redDot.reset(RedDotKeys.Charge_enter);
                break;
            case EnumTabItemNameForClient.OPENCHARGE:
                redDot.reset(RedDotKeys.Activity_openCharge);
                break;
            case EnumTabItemNameForClient.PASS:
                redDot.reset(RedDotKeys.Pass_enter);
                break;
            case EnumTabItemNameForClient.BATTLE_PASS:
                redDot.reset(RedDotKeys.StarPass_enter);
                break;
            case EnumTabItemNameForClient.FIRST_CHARGE:
                redDot.reset(RedDotKeys.FirstCharge_enter);
                break;
            case EnumTabItemNameForClient.dailySale:
                redDot.reset(RedDotKeys.Charge_dailySale);
                break;
            case EnumTabItemNameForClient.ENTRANCE:
                redDot.reset(RedDotKeys.Activity_entrance, [this._config.viewArge]);
                break;
            case EnumTabItemNameForClient.DIAMOND_BANK:
                redDot.reset(RedDotKeys.DIAMOND_BANK);
                break;
            case EnumTabItemNameForClient.PREVIEW:
                redDot.reset(RedDotKeys.FunctionPreview);
                break;
            case EnumTabItemNameForClient.DOUBLE_WEEKLY:
                redDot.reset(RedDotKeys.DoubleWeekActivity_enter);
                break;
            case EnumTabItemNameForClient.SEASON:
                redDot.reset(RedDotKeys.Season);
                break;
            case EnumTabItemNameForClient.SEASON_SUB:
                const svo = GIns.seasonManager.getSubOpen();
                redDot.reset(RedDotKeys.Season_sub_entrance, [svo.activityId]);
                break;
            case EnumTabItemNameForClient.LIMIT_PACK:
                redDot.reset(RedDotKeys.LIMIT_PACK);
                break;
            case EnumTabItemNameForClient.REACH_STANDARD:
                for (let id of this._config.activityIds) {
                    if (id) {
                        let vo = GIns.activityModel.getActivityVoById(Number(id));
                        if (vo) {
                            redDot.reset(RedDotKeys.StandardActivity_enter, [Number(id)]);
                            break;
                        }
                    }
                }
                break;
            default:
                redDot.reset(RedDotKeys.Null);
                break;
        }
    }

    public setData(config: table.mainpage.MainPageTabItemConfig): void {
        this._config = config;
        this.view.title = config.showName;
        this.view.icon = config.iconNormalAssetPath;
        this.view.name = config.nameForClient;

        //特效更新
        this.updateEffect();
        //红点更新
        this.updateRedDotForItem(FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom), config.nameForClient);

        //数量展示更新
        let showCount: number = 0;
        if (config.nameForClient == EnumTabItemNameForClient.LIMIT_PACK) {
            //优先判断是否有奖励可领取
            if (MallModel.ins().hasFreePopupMall()) {
            } else showCount = MallModel.ins().popupDataMap.size;
        }
        if (showCount > 1) {
            this.view.pCount.visible = true;
            this.view.lbCount.text = showCount + "";
        } else {
            this.view.pCount.visible = false;
        }
        // this.view.pCount.visible = config.nameForClient == EnumTabItemNameForClient.LIMIT_PACK && MallModel.ins().popupDataMap.size > 1;

        //即将开启功能
        if (ServerEnums.SystemType[config.nameForClient] == ServerEnums.SystemType.PREVIEW) {
            this.view.lbComingSoon.visible = true;
            if (GIns.predictionMgr.getNextPreviewConfig()) {
                this.view.title = GIns.predictionMgr.getNextPreviewConfig().name;
                this.view.icon = GIns.predictionMgr.getNextPreviewConfig().icon;
            } else {
                this.view.title = `功能预告`;
                this.view.icon = GIns.predictionMgr.previewConfig[GIns.predictionMgr.previewConfig.length - 1].icon;
                this.view.lbComingSoon.visible = false;
            }
        } else {
            if (config.nameForClient == EnumTabItemNameForClient.SEASON_SUB) {
                //赛季子活动
                const svo = GIns.seasonManager.getSubOpen();
                if (svo) {
                    this.view.title = svo.cfg?.name;
                    this.view.icon = svo.cfg?.pathIcon;
                }
            }
            this.view.lbComingSoon.visible = false;
        }

        //倒计时刷新
        this.updateEndTime();
        if (this._endTime > 0) {
            this.view.lbTime.visible = true;
            this.addTimer();
        } else {
            this.view.lbTime.visible = false;
            this.removeTimer();
        }
    }

    /**更新特效*/
    public updateEffect() {
        let modelNode: ModelNode = this.view.modelNode as any;
        if (this._config.showEffect && this._config.modelId) {
            modelNode.loadByModelId(this._config.modelId);
        } else {
            modelNode.clear();
        }

        //图标特效
        let modelNodeBottom: ModelNode = this.view.modelNodeBottom as ModelNode;
        let modelNodeTop: ModelNode = this.view.modelNodeTop as ModelNode;
        if (this._config.showEffect && this._config.iconEffect) {
            if (this._config.iconEffect.low) {
                modelNodeBottom.loadByModelId(this._config.iconEffect.low);
            } else {
                modelNodeBottom.clear();
            }

            if (this._config.iconEffect.up) {
                modelNodeTop.loadByModelId(this._config.iconEffect.up);
            } else {
                modelNodeTop.clear();
            }
        } else {
            modelNodeBottom.clear();
            modelNodeTop.clear();
        }
    }
}
