import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { INotification } from "../../../../../core/mvc/interface/INotification";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { IAdPlayVo } from "../../../ad/model/vo/IAdPlayVo";
import { NoOwnerItem } from "../../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../../common/btn/BtnChangGui1WithItem";
import { BtnConfirmViewOpenArgs } from "../../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../../common/i18n/CommonI18nKeys";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { UIStimulationConfig } from "../../const/UIStimulationConfig";
import { IStimulationAddition } from "../../model/vo/IStimulationAddition";
import { IStimulationData } from "../../model/vo/IStimulationData";
import { StimulationPosItem } from "../item/StimulationPosItem";

@bindFguiExtension('ui://stimulation/StimulationMainBottom')
export class StimulationMainBottom extends fgui.GComponent implements INotification {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationMainBottom";

    protected _data: IStimulationData = null;
    protected _recycleCfg: table.stimulation.StimulationRecycleConfig = null;
    protected _isSendAutoDispatch: boolean = false;
    protected _curAddition: IStimulationAddition = null;
    protected _nextAddition: IStimulationAddition = null;
    protected _nextLvCfg: table.stimulation.StimulationDeviceLevelConfig = null;
    protected _timerKey: string = null;
    protected _remainMins: number = 0;
    protected _skipCostItem: NoOwnerItem = new NoOwnerItem();
    /**是否正在显示确认框*/
    protected _isShowConfirm: boolean = false;


    private get view(): ui.stimulation.component.StimulationMainBottom {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.STIMULATION_DISPATCH_COMPLETE,
            NotificationKey.STIMULATION_DEVICE_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.STIMULATION_DISPATCH_COMPLETE:
                if (args == this._data?.vo?.id) {
                    if (this._isSendAutoDispatch) {
                        this._isSendAutoDispatch = false;
                        GIns.floatingTextMgr.showTips('一键派遣完成');
                    }
                }
                break;
            case NotificationKey.STIMULATION_DEVICE_UPDATE:
                if (args == 0 || args == this._data?.cfg?.cfg?.id) {
                    this.updateUI();
                }
                break;

        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this);

        this.view.listPos.itemRenderer = this.itemRendererForPos.bind(this);
        this.view.btnAuto.onClick(this.onClickAuto, this);
        this.view.btnRecycle.onClick(this.onClickRecycle, this);
        this.view.btnUp.onClick(this.onClickUp, this);
        this.view.listPos.on(fgui.Event.CLICK_ITEM, this.onClickPos, this);
        this.view.btnAd.onClick(this.onClickAd, this);
        this.view.btnSkip.onClick(this.onClickSkip, this);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
        G.FacadeManager.removeNotification(this);
    }

    protected itemRendererForPos(index: number, item: StimulationPosItem): void {
        item.setData(this._data, index);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(1000, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let remainTime = Math.max(0, this._data.vo.nextLevelTime - G.TimeManager.serverNow);
        if (remainTime <= 0) {
            this.removeTimer();
        }
        this.view.lbTime.text = `设备升级中：` + TimeUtils.formatTimeMsToPositiveTimeText(remainTime);
        let remianMins = Math.ceil(remainTime / 60000);
        if (this._remainMins != remianMins) {
            this._remainMins = remianMins;
            let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnSkip, BtnChangGui1WithItem);
            if (this._nextLvCfg?.skipWaitCostItemsPerMinute?.length > 0) {
                let cost = this._nextLvCfg?.skipWaitCostItemsPerMinute[0];
                this._skipCostItem.itemId = cost.k;
                this._skipCostItem.count = cost.v * remianMins;
                btnComp.reset('一键完成', this._skipCostItem);
            } else {
                //默认值
                btnComp.reset('一键完成', NoOwnerItem.create(1, 0));
            }
        }
    }

    //自动布阵
    protected onClickAuto(): void {
        if (this._data.posMap.get(0).isUnlock == false) {
            //没有解锁的栏位
            GIns.floatingTextMgr.showTips('未解锁派遣栏位');
            return
        }
        let heroList = GIns.stimulationMgr.getHeroListForAutoDispatch(this._data.vo.id);
        if (heroList?.length <= 0) {
            //没有符合条件的英雄
            GIns.floatingTextMgr.showTips('没有符合派遣条件的英雄');
            return
        }
        let oldHeroIds = [];
        for (let key in this._data.vo.dispatchIndex2HeroBaseId) {
            oldHeroIds[Number(key)] = this._data.vo.dispatchIndex2HeroBaseId[key];
        }
        let newHeroIds = [];
        let dispatchIndex2HeroBaseId = {};
        this._data.posMap.forEach((data) => {
            if (data.isUnlock && data.id < heroList.length) {
                dispatchIndex2HeroBaseId[data.id] = heroList[data.id].baseId;
                newHeroIds[data.id] = heroList[data.id].baseId
            }
        })
        if (oldHeroIds.toString() == newHeroIds.toString()) {
            //派遣数据没有变化
            GIns.floatingTextMgr.showTips('当前已是最佳派遣阵容');
            return
        }
        this._isSendAutoDispatch = true;
        GIns.stimulationModel.sendDispatch({ deviceId: this._data.vo.id, dispatchIndex2HeroBaseId: dispatchIndex2HeroBaseId })
    }

    //升级
    protected onClickUp(): void {
        if (this._nextLvCfg && !GIns.conditionMgr.checkCondition(this._nextLvCfg.unlockConditions, true, true)) {
            //不满足升级条件
            return;
        }
        let btnUp = FguiScriptUtils.toMyScriptClass(this.view.btnUp, BtnChangGui1WithItem);
        if (!btnUp.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(btnUp.getNoPayTip())
            return
        }

        GIns.stimulationModel.sendUpLevel({ deviceId: this._data.vo.id })
    }

    protected onClickRecycle(): void {
        if (this._recycleCfg == null) {
            return
        }
        if (!GIns.conditionMgr.checkCondition(this._recycleCfg.unlockConditions, false, true)) {
            return
        }
        G.UIManager.open(UIStimulationConfig.StimulationRecycleWin, this._data.cfg.cfg.itemId);
    }

    protected onClickPos(item: StimulationPosItem): void {
        if (item.posData.isUnlock == false) {
            let tipStr: string = GIns.stimulationMgr.getUnlockTipForLv(item.deviceData.cfg.cfg.id, item.posData.needLv);
            GIns.floatingTextMgr.showTips(tipStr);
            return
        }
        G.UIManager.open(UIStimulationConfig.StimulationDispatchWin, item.deviceData.cfg.cfg.id);
    }

    protected onClickAd(): void {
        if (this.view.btnAd.grayed) {
            GIns.floatingTextMgr.showTips('本次升级已进行过加速');
            return;
        }
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.STIMULATION_DEVICE_UP_LEVEL,
            extra: this._data.cfg.cfg.id
        };
        G.FacadeManager.emit(NotificationKey.AD_START_PLAY, args);
    }

    protected onClickSkip(): void {
        let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnSkip, BtnChangGui1WithItem);
        if (btnComp.isCanPay(true) == false) {
            GIns.floatingTextMgr.showTips(btnComp.getNoPayTip());
            return;
        }
        let content = `是否加速升级`;
        if (this._skipCostItem) {
            content = `是否消耗${this._skipCostItem.count}${G.I18nManager.lang(this._skipCostItem.getItemName())}加速升级`
        }
        this._isShowConfirm = true;
        G.UIManager.open(UICommonKey.BtnConfirmWarnView, {
            title: CommonI18nKeys.tipsForConfirm,
            content: content,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            onBtnYes: () => {
                GIns.stimulationModel.sendSkipUpLevelWait({ deviceId: this._data.cfg.cfg.id });
            },
            closeCb: () => {
                this._isShowConfirm = false;
            }
        } as BtnConfirmViewOpenArgs);

    }

    protected updateDispatchUI(): void {
        this.view.listPos.numItems = this._data.posMap.size;
    }

    protected updateLvUI(): void {
        this._curAddition = GIns.stimulationMgr.getAdditionMap(this._data, this._data.vo.level);
        this._nextAddition = GIns.stimulationMgr.getAdditionMap(this._data, this._data.vo.level + 1);
        this._nextLvCfg = null;
        if (this._nextAddition) {
            //下一级配置
            this._nextLvCfg = GIns.stimulationModel.getLvCfg(this._data.vo.id, this._data.vo.level + 1);
            if (this._data.vo.nextLevel > 0) {
                //当前正在升级
                this.view.getController('state').selectedIndex = 3;
                this.view.btnAd.title = `加速${GIns.stimulationModel.constCfg.upLevelAdDeductMinutes}分钟`;
                this._remainMins = -1;
                this.addTimer();

                let remainTimes = GIns.adModel.getRemainAdTimes(this._data.vo.nextLevelAdTimes, ServerEnums.AdvertType.STIMULATION_DEVICE_UP_LEVEL);
                if (remainTimes <= 0) {
                    this.view.btnAd.grayed = true;
                } else {
                    this.view.btnAd.grayed = false;
                }
            } else if (!GIns.conditionMgr.checkCondition(this._nextLvCfg.unlockConditions, true)) {
                //不满足升级条件
                this.view.getController('state').selectedIndex = 2;
                this.view.lbUnlock.text = GIns.conditionMgr.getOpenConditionTips(this._nextLvCfg.unlockConditions);
                this.removeTimer();
            } else {
                //可升级
                this.view.getController('state').selectedIndex = 0;
                let costItems = this._nextLvCfg?.costItems;
                let btnUp = FguiScriptUtils.toMyScriptClass(this.view.btnUp, BtnChangGui1WithItem);
                btnUp.reset('升级', NoOwnerItem.createByConfigKv(costItems[0]));
                this.removeTimer();
            }

            this.view.lbLvNext.text = (this._data.vo.level + 1) + '';
            this.view.lbCapacityAdd.text = '+' + (this._nextAddition.capacity - this._data.vo.capacity);
            this.view.lbSpeedAdd.text = '+' + GIns.stimulationMgr.getSpeedShowStr(this._data, this._nextAddition.itemAmountPerHour - this._curAddition.itemAmountPerHour, false);
        } else {
            this.view.getController('state').selectedIndex = 1;
            this.removeTimer();
        }

        this.view.lbLv.text = this._nextAddition ? `等级：${this._data.vo.level}` : `等级：${this._data.vo.level} MAX`;
        this.view.lbCapacity.text = `储量：${this._data.vo.capacity}`;
        this.view.lbSpeed.text = `效率：${GIns.stimulationMgr.getSpeedShowStr(this._data, this._curAddition.itemAmountPerHour)}`;

        if (this._recycleCfg) {
            if (!GIns.conditionMgr.checkCondition(this._recycleCfg.unlockConditions, false)) {
                //未解锁回收
                this.view.btnRecycle.getController('state').selectedIndex = 0;
            } else {
                this.view.btnRecycle.getController('state').selectedIndex = 1;
            }
        }

        if (this._isShowConfirm && this.view.getController('state').selectedIndex != 3) {
            //没有加速了 如果还在确认框 就关闭
            G.UIManager.close(UICommonKey.BtnConfirmWarnView);
        }
    }

    protected updateUI(isInit: boolean = false): void {
        this.updateDispatchUI();
        this.updateLvUI();
    }

    public setData(data: IStimulationData): void {
        if (this._data != data) {
            this._data = data;
            this._recycleCfg = GIns.stimulationModel.getRecycleCfg(this._data.cfg.cfg.itemId);
            this.view.btnRecycle.visible = this._recycleCfg != null;
            this.updateUI();
            FguiScriptUtils.toMyScriptClass(this.view.btnAd.redDot, RedDotCom).reset(RedDotKeys.Stimulation_Ad, [data.cfg.cfg.id]);
        }
    }

}