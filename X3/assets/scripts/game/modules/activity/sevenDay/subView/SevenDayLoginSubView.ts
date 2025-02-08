import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ActivitySignInVo } from "db://assets/scripts/game/modules/activity/model/ActivitySignInVo";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { UIGainKeys } from "db://assets/scripts/game/modules/gain/const/UIGainKeys";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "db://assets/scripts/game/modules/common/redDot/redDotCom";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import G from "db://assets/scripts/core/comm/G";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import GIns from "db://assets/scripts/game/GIns";
import { UITransform } from "cc";
import { FGUIMaskUtils } from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { GainItemEffectUtils } from "../../../gain/view/GainItemEffectUtils";

@bindFguiExtension("ui://sevenDay/SevenDayLoginSubView")
export class SevenDayLoginSubView extends FGUI.GComponent implements INotification {
    /** 活动id */
    private _activityId: number;

    /** 签到vo */
    private _data: ActivitySignInVo;

    private _index: number;
    private _item: ui.sevenDay.item.SevenDayLoginItem;

    protected _hasRewardWithOpen: boolean = false;

    private get view(): ui.sevenDay.subView.SevenDayLoginSubView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK, NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_REQUEST_BACK, NotificationKey.CLOSE_ViEW, NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE: {
                if (args === this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateData();
                }
                break;
            }
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateData();
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UIGainKeys.GainItemPopUpView) {
                    //关闭的是恭喜获得
                    if (this._hasRewardWithOpen && this._data.hasAward() == false) {
                        // this.closeSelf()
                    }
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                let activityId = this._data.activityId;
                if (args === activityId) {
                    UIManager.ins().close(UIActivityKey.SevenDayMainView);
                }
                break;
        }
    }

    protected onConstruct() {
        this.view.pBtn.btn_get.on(FGUI.Event.CLICK, this.onGetClick, this);
        this.view.pCenter.list_award.itemRenderer = this.itemRendererForAward.bind(this);

        FguiScriptUtils.toMyScriptClass(this.view.pBtn.redDot, RedDotCom).reset(RedDotKeys.Activity_signIn_reward);

        FacadeManager.ins().registerNotification(this);
    }

    protected onPreDispose() {
        G.GameTimer.clearAll(this);
        FacadeManager.ins().removeNotification(this);

        this._activityId = 0;
        this._data = null;

        super.onPreDispose();
    }

    protected onInit(): void { }

    reset(activityId: number, isNeedMask: boolean = false): void {
        this._activityId = activityId;
        this._data = ActivityModel.ins().getActivityVoById(activityId);

        this._hasRewardWithOpen = this._data.hasAward();
        this.updateData();

        let spineModel = this.view.pCenter.spineModel as ModelNode;

        spineModel.loadByPath("spine/ui/7redenglv/quredenglu_zhanzhengzhiying");
        spineModel.playOrders([
            {
                name: "enter",
                isLoop: false,
            },
        ]);
        this.view.pCenter.iconTitle.visible = true;
        this.view.pCenter.getTransition("t0").play(() => {
            if (this.view?.node?.isValid) {
                spineModel.playOrders([
                    {
                        name: "idle",
                        isLoop: true,
                    },
                ]);
                this.loadTitleSpine();
            }
        });
    }

    protected loadTitleSpine(): void {
        let spineTitle = this.view.pCenter.spineTitle as ModelNode;
        spineTitle.setScale(3.3, 3.3);
        spineTitle.loadByPath("spine/ui/7redenglv/biaoti");
        spineTitle.setLoadCompleteListener(() => {
            if (this.view?.node?.isValid) {
                // this.view.pCenter.iconTitle.visible = false
            }
        });
        spineTitle.playOrders([
            {
                name: "idle",
                isLoop: true,
            },
        ]);
    }

    private updateData() {
        if (!this._data || this._data.isActivityOver()) {
            UIManager.ins().close(UIActivityKey.SevenDayLoginSubPage);
            return;
        }
        this.view.pCenter.list_award.numItems = this._data.signList.length;

        if (!this._data) {
            Logger.error(`七日签到 | 活动数据没有. `);
            return;
        }

        if (!this._data.hasAward()) {
            this.view.pBtn.redDot.visible = false;
            this.view.pBtn.btn_get.visible = false;
            this.view.pBtn.T_time.visible = true;
            if (this._data.activityVo.dailyRewardIds.length < 7) {
                this.updateTime();
                G.GameTimer.loop(1000, this, this.updateTime);
            } else {
                this.view.pBtn.T_time.text = `点击关闭`;
            }
        } else {
            this.view.pBtn.redDot.visible = true;
            this.view.pBtn.btn_get.visible = true;
            this.view.pBtn.T_time.visible = false;
        }
    }

    //刷新时间
    private updateTime() {
        let timeText = TimeUtils.formatTimeMsToDayHourMinuteSecond1(G.TimeManager.remainingRefreshTime);
        this.view.pBtn.T_time.text = `${timeText}后可领取`;
    }

    private itemRendererForAward(index: number, item: ui.sevenDay.item.SevenDayLoginItem): void {
        let signCfg = this._data.signList[index];
        item.T_day.text = signCfg.condition.toString();
        item.T_count.text = "x" + signCfg.dailyRewards[0].v;
        let cfg = ItemUtils.getItemConfigByItemId(signCfg.dailyRewards[0].k);
        item.Img_item.icon = cfg.iconPath;

        //签到状态
        item.getController("c1").selectedIndex = this._data.isCanGetAwardById(signCfg.id);

        //是否大奖
        item.getController("c2").selectedIndex = signCfg.isBagAward ? 1 : 0;
        if (signCfg.awardIcon) {
            item.img_icon.icon = signCfg.awardIcon;
        }
        if (signCfg.awardDesc) {
            item.T_desc.text = signCfg.awardDesc;
        }

        item.btn_item.onClick((event) => {
            if (this._data.isCanGetAwardById(signCfg.id) == 1) {
                this.onGetClick();
            } else {
                // event 点击道具
                G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, cfg, item.btn_item.node.getComponent(UITransform), signCfg.dailyRewards[0].v));
            }
        });

        item.spineFrameBig.visible = false;
        item.spineLightBig.visible = false;
        item.spineFrame.visible = false;
        item.spineLight.visible = false;
        if (item.getController("c1").selectedIndex == 1) {
            if (signCfg.isBagAward) {
                item.spineFrameBig.visible = true;
                let spineFrameBig = item.spineFrameBig as ModelNode;
                spineFrameBig.setScale(3.3, 3.3);
                spineFrameBig.loadByPath("spine/ui/7redenglv/7dayloop");
                spineFrameBig.playOrders([
                    {
                        name: "idle",
                        isLoop: true,
                    },
                ]);

                item.spineLightBig.visible = true;
                let spineLightBig = item.spineLightBig as ModelNode;
                spineLightBig.setScale(3.3, 3.3);
                spineLightBig.loadByPath("spine/ui/7redenglv/7daysaoguang");
                spineLightBig.playOrders([
                    {
                        name: "enteridle",
                        isLoop: true,
                    },
                ]);
            } else {
                item.spineFrame.visible = true;
                let spineFrame = item.spineFrame as ModelNode;
                spineFrame.setScale(3.3, 3.3);
                spineFrame.loadByPath("spine/ui/7redenglv/everydayloop");
                spineFrame.playOrders([
                    {
                        name: "idle",
                        isLoop: true,
                    },
                ]);

                item.spineLight.visible = true;
                let spineLight = item.spineLight as ModelNode;
                spineLight.setScale(3.3, 3.3);
                spineLight.loadByPath("spine/ui/7redenglv/everydaysaoguang");
                spineLight.playOrders([
                    {
                        name: "enteridle",
                        isLoop: true,
                    },
                ]);
            }
        }
    }

    // 签到按钮
    private onGetClick(): void {
        if (!this._data.hasAward()) {
            GIns.floatingTextMgr.showTips("今日已签到");
            return;
        }

        let data = {
            activityId: this._data.activityId,
            //领取全部
            itemId: "DAILY_id",
            hidePopWin: 2,
        } as ActivitySyncData;


        ActivityModel.ins().sendDrawItemReward(data);
    }
}
