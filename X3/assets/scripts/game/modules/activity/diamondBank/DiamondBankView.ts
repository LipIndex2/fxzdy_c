import G from "../../../../core/comm/G";
import {bindScript} from "../../../../core/comm/UIScriptManager";
import {UICommWin} from "../../../../core/mvc/view/UICommWin";
import {TimeUtils} from "../../../comm/utils/TimeUtils";
import {ServerEnums} from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import type {BtnConfirmViewOpenArgs} from "../../common/confirm/BtnConfirmView";
import {UICommonKey} from "../../common/const/UICommonConfig";
import {CommonI18nKeys} from "../../common/i18n/CommonI18nKeys";
import {ItemUtils} from "../../item/utils/ItemUtils";
import {UIActivityKey} from "../const/UIActivityConfig";
import * as fgui from "fairygui-cc";
import {ActivityDiamondBankVo} from "../model/ActivityDiamondBankVo";
import {ItemListComp} from "../../common/item/ItemListComp";
import {FguiScriptUtils} from "../../../../core/utils/FguiScriptUtils";
import type {ActivitySyncData} from "../../../comm/activity/model/ActivityModel";
import {ActivityI18nKeys} from "../const/ActivityI18nKeys";
import NotificationKey from "../../../event/NotificationKey";
import {EnumConditionType} from "../../condition/enum/EnumConditionType";
import {RuleController} from "../../rule/RuleController";
import {EnumRuleKeys} from "../../rule/enums/EnumRuleKeys";
import {RedDotKeys} from "../../common/redDot/RedDotKeys";
import {RedDotCom} from "../../common/redDot/redDotCom";
import {EnumRedDotReadType} from "../../common/redDot/enums/EnumRedDotReadType";

enum EDrawState {
    initState = 0,  //初始状态
    canDraw = 1,    //有可领取星钻
    waitDraw = 2,   //没有可领取的，显示倒计时
}

@bindScript(UIActivityKey.DiamondBankView)
export class DiamondBankView extends UICommWin {
    static pkgName: string = "activityDiamondBank";
    static viewName: string = "DiamondBankView";

    //活动id
    private _actId: number
    //星钻小图标
    private _xingZuanIconPath: string
    //购买的解锁礼包数据
    private _giftCfg: table.order.ChargeGoodsConfig

    private _timerKey: string
    private _drawState: EDrawState
    private _lastDrawNum: number

    private get view(): ui.activityDiamondBank.DiamondBankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.DIAMOND_BANK_ON_INIT_END,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DIAMOND_BANK_ON_INIT_END:
                this.updateStorageNum()
                this.updateLockStateAndBoughtTip()
                break
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._actId && this._actId) {
                    this._lastDrawNum = 0; //不重置0的话，有些情况下倒计时结束，bar跟领取按钮没刷新
                    this.updateStorageNum()
                    this.updateLockStateAndBoughtTip()
                }
                break
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._actId && this._actId) {
                    let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId)
                    if (!actVo || actVo.isDone()) {
                        this.closeSelf()
                    }
                }
                break
        }
    }


    protected onInit(): void {
        let view = this.view;
        view.getBtn.on(fgui.Event.CLICK, this.onGetReward, this)
        view.btnRule.on(fgui.Event.CLICK, this.onShowRule, this)
        view.gotoChargeBtn.on(fgui.Event.CLICK, () => {
            this.showunlockRewardTip()
        })
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        GIns.redDotMgr.markRead(EnumRedDotReadType.LOGIN_ONCE, RedDotKeys.DIAMOND_BANK_WEAK_TIP);
        let view = this.view
        let {TableManager} = G
        this._actId = GIns.activityModel.getActivityIdByType(ServerEnums.ActivityType.DIAMOND_BANK)
        if (!this._actId) {
            this.closeSelf()
            return
        }

        let actCfg = TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._actId)
        this._giftCfg = TableManager.getDataById(table.order.ChargeGoodsConfig, actCfg.chargeGoodsId)

        let cfg = TableManager.getDataById(table.activity.ActivityConstant.ActivityConstantConfig, "ACTIVITY:DIAMOND_BANK_ITEM_ID")
        if (cfg) {
            let bankItemId = Number(cfg.content)
            let a = ItemUtils.getItemConfigByItemId(bankItemId)
            this._xingZuanIconPath = a?.smallIconPath
        }

        view.goldIcon.icon = this._xingZuanIconPath

        view.addRate.text = G.I18nManager.lang(ActivityI18nKeys.rate, actCfg.diamondNum)

        this.updateLockStateAndBoughtTip()
        this.updateStorageNum()

        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(1000, this, this._update)
        }
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    //刷新已存储跟领取信息
    private updateStorageNum() {
        let view = this.view
        let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId)
        let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._actId)
        let diamondBankVo = actVo.activityVo

        //已存储，累计总产出的星钻
        // diamondBankVo.diamondNum vo存储的不一定是最新的，本地计算最新的值
        let diamondNum = actVo.calculateCurDiamondNum()
        view.storageNum.text = String(diamondNum)

        view.barStorage.max = actCfg.maxDiamondNum
        view.barStorage.value = diamondNum
        view.drawNum.text = String(diamondBankVo.totalDrawDiamondNum)
        view.storageInfo.text = `${diamondNum}/${actCfg.maxDiamondNum}`

        let unlock = diamondBankVo.boughtUnlock || GIns.conditionMgr.checkCondition(actCfg.conditions)
        this._drawState = EDrawState.initState
        if (unlock) {
            if (diamondNum > 0) {
                this._drawState = EDrawState.canDraw
            } else {
                this._drawState = EDrawState.waitDraw
            }
        }
        view.getController("drawState").selectedIndex = this._drawState

    }

    //刷新购买提醒跟领取锁定
    private updateLockStateAndBoughtTip() {
        let view = this.view
        let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId)
        let diamondBankVo = actVo.activityVo
        let giftState = 0
        if (diamondBankVo.boughtUnlock == false) {
            const noOwnerItems = ItemUtils.parseKvArrayToItemArray(this._giftCfg.rewards)
            const itemListComp = FguiScriptUtils.toMyScriptClass(this.view.rewards, ItemListComp)
            itemListComp.reset(noOwnerItems)

            view.unlockLbl.text = G.I18nManager.lang(ActivityI18nKeys.bought2unlock, this._giftCfg.price / 100)
        }

        //是否满足解锁领取条件
        let isUnlock: boolean
        let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._actId)
        if (diamondBankVo.boughtUnlock) {
            isUnlock = true //购买礼包解锁
        } else {
            isUnlock = GIns.conditionMgr.checkCondition(actCfg.conditions)
            if (isUnlock == false) {
                //未到到解锁条件
                let trunkId = GIns.conditionMgr.getConditionValue(actCfg.conditions, EnumConditionType.PASS_TRUNK_INSTANCE)
                let cfg = G.TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, trunkId)
                if (trunkId && cfg) {
                    view.tips.text = G.I18nManager.lang(ActivityI18nKeys.unlockTip, cfg.showLevelId)
                }
                giftState = 1
            } else {
                giftState = 2
            }
        }
        let red: RedDotCom = (view.getBtn.redDot as any)
        if (isUnlock) {
            red.reset(RedDotKeys.DIAMOND_BANK_REWARD);
        } else {
            red.reset(RedDotKeys.DIAMOND_BANK_LOCK_REWARD);
        }
        view.lock.visible = !isUnlock
        view.tips.visible = !isUnlock

        //购买解锁礼包后才不显示购买
        view.unlockTip.visible = !diamondBankVo.boughtUnlock

        view.getController("giftState").selectedIndex = giftState
    }

    //领取奖励
    private onGetReward() {
        let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId)
        let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._actId)
        let diamondBankVo = actVo.activityVo
        if (actCfg && diamondBankVo) {
            let isNormalUnlock = GIns.conditionMgr.checkCondition(actCfg.conditions)
            if (isNormalUnlock == false && diamondBankVo.boughtUnlock == false) {
                //没购买解锁礼包也没达到解锁条件的就提示购买
                this.showunlockRewardTip()
                return
            }

            let voParam: ActivitySyncData = {
                activityId: this._actId,
                itemId: null,
                hidePopWin: 2
            }
            GIns.activityModel.sendDrawItemReward(voParam)
        }
    }

    //充值解锁
    private showunlockRewardTip() {
        let i18nContent: string
        let actCfg = G.TableManager.getDataById(table.activity.DiamondBank.DiamondBankConfig, this._actId)
        let conditionOk = GIns.conditionMgr.checkCondition(actCfg.conditions)
        if (conditionOk) {
            //达到指定关卡就提示解锁奖励
            i18nContent = ActivityI18nKeys.bought2unlockRewardTip
        } else {
            //未达到指定关卡就提示购买解锁
            i18nContent = ActivityI18nKeys.bought2unlockTIp
        }
        let uiParam: BtnConfirmViewOpenArgs = {
            title: CommonI18nKeys.tipsForConfirm,
            content: G.I18nManager.lang(i18nContent, this._giftCfg.price / 100),
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            onBtnYes: () => {
                GIns.orderModel.sendCreateOrder(this._giftCfg.id)
            }
        }
        G.UIManager.open(UICommonKey.BtnConfirmWarnView, uiParam);
    }

    private onShowRule() {
        RuleController.ins().openRule(EnumRuleKeys.DIAMOND_BANK, this.view.btnRule)
    }

    private _update() {
        let delay = GIns.diamondBankCtr.productionRemaionTime()
        if (this._drawState == EDrawState.waitDraw) {
            //倒计时提醒玩家还有多久可领取
            delay = Math.min(delay, GIns.diamondBankCtr.producePeriod)
            let str = TimeUtils.formatTimeMsToDayHourMinuteSecond1(delay)
            this.view.waitDrawDesc.text = G.I18nManager.lang(ActivityI18nKeys.drawTips, str)

        }

        //有新的领取的时候刷新最新领取数目
        if (delay > GIns.diamondBankCtr.producePeriod - 2000) {
            let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId)
            let diamondNum = actVo.calculateCurDiamondNum()
            if (this._lastDrawNum !== diamondNum) {
                this._lastDrawNum = diamondNum
                this.updateStorageNum()
            }
        }

        //剩余时间
        let actVo: ActivityDiamondBankVo = GIns.activityModel.getActivityVoById(this._actId);
        this.view.existTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(actVo.getLeftTime());


        
    }
}