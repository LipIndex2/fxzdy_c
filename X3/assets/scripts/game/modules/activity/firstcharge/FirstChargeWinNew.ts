import { VideoPlayer } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel, ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { VideoNode } from "../../common/node/VideoNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { DrawCardModel } from "../../drawcard/model/DrawCardModel";
import { HeroManager } from "../../hero/HeroManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { OrderModel } from "../../order/OrderModule";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityFirstChargeVo } from "../model/ActivityFirstChargeVo";

/**
 * 首充弹窗 新版
 */
@bindScript(UIActivityKey.FirstChargeWin)
export class FirstChargeWinNew extends UICommWin {
    static pkgName: string = "activityFirstChargeNew";
    static viewName: string = "FirstChargeWin";

    /** 首充vo */
    private _data: ActivityFirstChargeVo;
    //页签
    private _curIndex: number = -1

    protected _tabCfgs: table.order.ChargeGoodsConfig[] = []
    //首充奖励cfg列表
    private _awardListCfg: table.activity.FirstCharge.FirstChargeConfig[];
    protected _isFirst: boolean = true
    protected _spinePath: string = ''
    protected _firstChargeHeroId: number = 0
    protected _firstVideoId: number = 0
    protected _orderId: number = 0
    /**当前可领取天数下标*/
    protected _curDrawIndex: number = 0
    protected _nextDrawTime: number = 0
    /**奖励UI列表*/
    protected _rewardUIs: { list: fgui.GList, lbDay: fgui.GTextField }[] = []
    protected _isIndexChange: boolean = false
    protected _defaultIndex: number = 0

    protected _initModelX: number = 0
    protected _initModelY: number = 0

    private get view(): ui.activityFirstChargeNew.FirstChargeWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.OPEN_ViEW,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateAll();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateAll();
                break;
            case NotificationKey.CHARGE_COMPLETE:
                if (args == this._orderId) {
                    //代表是首充返回
                    DrawCardModel.ins().context.firstChargeWaitSetUpHeroId = this._firstChargeHeroId
                }
                break
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.OPEN_ViEW:
                this.checkUIIsTop()
                break

        }
    }

    protected onInit(): void {
        this.view.pContent.listTab.itemRenderer = this.itemRendererForTab.bind(this)
        this.view.pContent.listTab.on(fgui.Event.CLICK_ITEM, this.onClickTab, this)
        this.view.pContent.listReward1.setVirtual()
        this.view.pContent.listReward2.setVirtual()
        this.view.pContent.listReward3.setVirtual()
        this.view.pContent.listReward1.itemRenderer = this.itemRendererForReward1.bind(this)
        this.view.pContent.listReward2.itemRenderer = this.itemRendererForReward2.bind(this)
        this.view.pContent.listReward3.itemRenderer = this.itemRendererForReward3.bind(this)

        this.view.pContent.btnBuy.onClick(this.onClickBuy, this)
        this.view.pContent.btnDraw.onClick(this.onClickDraw, this)
        this.view.pContent.btnDemo.onClick(this.onClickDemo, this)

        let videoNode = this.view.pContent.btnDemo.videoNode as VideoNode
        videoNode.videoPlayer.node.on(VideoPlayer.EventType.CLICKED, this.onClickDemo, this)

        this._rewardUIs = [
            { list: this.view.pContent.listReward1, lbDay: this.view.pContent.lbDay1 },
            { list: this.view.pContent.listReward2, lbDay: this.view.pContent.lbDay2 },
            { list: this.view.pContent.listReward3, lbDay: this.view.pContent.lbDay3 },
        ]

        this._initModelX = this.view.pContent.modelNode.x
        this._initModelY = this.view.pContent.modelNode.y
    }

    protected checkUIIsTop(): void {
        if (this._isFirst) {
            return
        }
        if (G.UIManager.isUiTop(UIActivityKey.FirstChargeWin)) {
            this.loadVideo()
        } else {
            this.clearVideo()
        }
    }

    protected onClickTab(item: ui.activityFirstChargeNew.component.FirstChargeTabBtn): void {
        let childIndex = this.view.pContent.listTab.getChildIndex(item)
        let index = this.view.pContent.listTab.childIndexToItemIndex(childIndex)
        this.setIndex(index)
    }

    protected itemRendererForTab(index: number, item: ui.activityFirstChargeNew.component.FirstChargeTabBtn): void {
        let cfg = this._data.tabCfgs[index];
        let price = cfg.price / 100;
        item.title = `${price}元`;
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.FirstCharge_tab, [cfg.id])
    }

    protected itemRendererForReward1(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._awardListCfg[0].rewards[index])
        let state = this._data.isCanGetAwardById(this._awardListCfg[0].id)
        this.itemRenrerHandler(item, state, this._awardListCfg[0].effects, index)
    }

    protected itemRendererForReward2(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._awardListCfg[1].rewards[index])
        let state = this._data.isCanGetAwardById(this._awardListCfg[1].id)
        this.itemRenrerHandler(item, state, this._awardListCfg[1].effects, index)
    }

    protected itemRendererForReward3(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._awardListCfg[2].rewards[index])
        let state = this._data.isCanGetAwardById(this._awardListCfg[2].id)
        this.itemRenrerHandler(item, state, this._awardListCfg[2].effects, index)
    }

    protected itemRenrerHandler(item: ItemFrameBtn, state: number, effects: any, index: number): void {
        item.setHaveGain(state == 2)
        if (this._isFirst == false && state != 2 && effects && effects[index]) {
            item.playOtherEffect(effects[index])
        } else {
            item.clearAnim()
        }
    }

    protected onClickBuy(): void {
        let cfg = this._tabCfgs[this._curIndex];
        if (!cfg || !this._data) return;

        if (this._data.isActivityOver()) {
            return;
        }
        //GmModel.ins().sendCharge(cfg.id.toString());
        this._orderId = Number(cfg.id)
        OrderModel.ins().sendCreateOrder(cfg.id);
    }

    protected onClickDraw(): void {
        let cfg = this._awardListCfg[this._curDrawIndex]
        if (!this._data.isFirstChargeById(+cfg.chargeGoodsId)) {
            GIns.floatingTextMgr.showTips("请先购买礼包");
            return;
        }

        ActivityModel.ins().sendDrawItemReward({ activityId: this._data.activityId, itemId: cfg.id.toString(), hidePopWin: 2 } as ActivitySyncData);
    }

    protected onClickDemo(): void {
        this.clearVideo()
        G.UIManager.open(UIActivityKey.FirstChargeDemoWin, { heroId: this._firstChargeHeroId, videoId: this._firstVideoId })
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._isFirst) {
            this.view.pContent.getTransition('enter').play(() => {
                this._isFirst = false;
                this.loadOtherSpine();
                this.checkUIIsTop();
                this.updateAward();
            })
            let activityId = ActivityModel.ins().getActivityIdByType(ServerEnums.ActivityType.FIRST_CHARGE);
            this._data = ActivityModel.ins().getActivityVoById(activityId);
            if (!this._data) {
                //没有活动数据
                this.closeSelf()
                return
            }

            this.initDefaultIndex()
            this.updateTab()
            this.setIndex(this._defaultIndex);
        }
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    protected initDefaultIndex(): void {
        this._defaultIndex = 0
        let tabCfgs = this._data.tabCfgs
        if (tabCfgs?.length > 0) {
            for (let i = 0; i < tabCfgs.length; i++) {
                let awardListCfg = this._data.getSceneCfgByType(tabCfgs[i].id.toString());
                let index = awardListCfg.findIndex((value) => this._data.isCanGetAwardById(value.id) != 2)
                if (index != -1) {
                    this._defaultIndex = i
                    break
                }
            }
        }
    }

    protected setIndex(index: number): void {
        if (this._curIndex != index) {
            this._curIndex = index
            this._isIndexChange = true
            this.updateAward()
            this.updateUI()
            if (this._isFirst == false) {
                this.loadOtherSpine()
                this.loadVideo()
            }
        }
    }

    protected updateAll(): void {
        this.updateTab()
        this.updateAward()
        this.updateUI()
    }

    private updateTab() {
        this._tabCfgs = this._data.tabCfgs
        if (this._tabCfgs.length > 1) {
            this.view.pContent.listTab.numItems = this._tabCfgs.length;
            this.view.pContent.listTab.selectedIndex = this._curIndex > 0 ? this._curIndex : this._defaultIndex
        } else {
            this.view.pContent.listTab.numItems = 0;
            this.view.pContent.getController('tab').selectedIndex = 0
        }
    }

    //更新奖励
    private updateAward() {
        let id = this._tabCfgs[this._curIndex];
        this._awardListCfg = this._data.getSceneCfgByType(id.id.toString());
        this._rewardUIs.forEach((ui, index) => {
            if (index < this._awardListCfg.length) {
                ui.list.numItems = this._awardListCfg[index].rewards?.length
                ui.lbDay.text = `第${index + 1}天`
            } else {
                ui.list.numItems = 0
                ui.lbDay.text = ''
            }
        })
    }

    //更新UI
    private updateUI() {
        //首充配置
        let curChargeCfg = this._awardListCfg[0];
        this._firstChargeHeroId = curChargeCfg.heroId
        this._firstVideoId = curChargeCfg.videoId

        //
        let showName: string = ''
        if (curChargeCfg.itemId) {
            let cfg = G.TableManager.getDataById(table.item.ItemConfig, curChargeCfg.itemId)
            if (cfg) {
                showName = cfg.name
            }
        } else {
            let heroVo = HeroManager.ins().getHeroVoByID(curChargeCfg.heroId);
            showName = heroVo ? heroVo.heroCfg.name : ''
        }
        let heroVo = HeroManager.ins().getHeroVoByID(curChargeCfg.heroId);
        this.view.pContent.lbName.text = showName
        this.view.pContent.lbDes.text = curChargeCfg.bubbleTip ? curChargeCfg.bubbleTip : ''
        this.view.pContent.listStar.numItems = heroVo ? heroVo.heroCfg.initStar : 5;
        this.view.pContent.campLoader.icon = ItemUtils.getCampIcon(heroVo.heroCfg.camp);

        let modelNode = this.view.pContent.modelNode as ModelNode
        if (this._spinePath != curChargeCfg.spine) {
            this._spinePath = curChargeCfg.spine
            modelNode.loadByPath(this._spinePath)
            let scale = curChargeCfg.spineScale > 0 ? curChargeCfg.spineScale : 1
            modelNode.setScale(scale, scale)
        }
        if (curChargeCfg.spinePosOffset && curChargeCfg.spinePosOffset.length >= 2) {
            modelNode.x = this._initModelX + curChargeCfg.spinePosOffset[0]
            modelNode.y = this._initModelY + curChargeCfg.spinePosOffset[1]
        } else {
            modelNode.x = this._initModelX
            modelNode.y = this._initModelY
        }
        this.view.pContent.btnDemo.bgLoader.icon = curChargeCfg.videoBg

        if (this._isIndexChange) {
            let aniNames = curChargeCfg.spineOrders?.split(';')
            if (aniNames.length > 0) {
                let orders = []
                aniNames.forEach((aniName, i) => {
                    orders.push({ name: aniName, isLoop: i == aniNames.length - 1 })
                })
                modelNode.playOrders(orders)
            }
            this._isIndexChange = false
        }

        //更新按钮状态
        let stateCtrl = this.view.pContent.getController('state')
        //0未购买 1未领取 2下次领取倒计时 3领取完成全部
        let state = -1
        let drawIndex: number = -1
        let nextTime: number = 0
        for (let i = 0; i < this._awardListCfg.length; i++) {
            let rewardState = this._data.isCanGetAwardById(this._awardListCfg[i].id)
            if (rewardState == 3) {
                //未购买
                state = 0
                break
            }
            if (rewardState == 0) {
                //待领取 就是还没到领取时间
                state = 2
                drawIndex = i
                let totalLoginDays = G.TimeManager.serverHaveOpenDay;
                let diffTime = (this._awardListCfg[i].day - totalLoginDays) * 24 * 3600 * 1000
                //次日五点更新
                nextTime = G.TimeManager.todayZero + diffTime + G.TimeManager.refreshClock * 3600 * 1000
                break
            }
            if (rewardState == 1) {
                //当前可领取
                state = 1
                drawIndex = i
                break
            }
        }
        this._curDrawIndex = drawIndex
        this._nextDrawTime = nextTime
        if (state == -1) {
            //全面的都不符合条件 就代表全都领取完了
            state = 3
        }
        stateCtrl.selectedIndex = state
        G.GameTimer.clearAll(this)
        switch (state) {
            case 0:
                //充值配置
                let chargeGoodsCfg = this._tabCfgs[this._curIndex];
                this.view.pContent.btnBuy.title = `${chargeGoodsCfg.price / 100}元`;
                break
            case 2:
                G.GameTimer.loop(500, this, this.onTimer)
                this.onTimer()
                break

        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow
        let diffTime: number = Math.max(0, this._nextDrawTime - nowTime)
        this.view.pContent.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(diffTime) + '后可领取'
        if (diffTime <= 0) {
            //时间到了刷新活动
            G.GameTimer.clearAll(this)
            GIns.activityModel.sendCurrentActivities()
        }
    }

    protected loadOtherSpine(): void {
        let spineBtnLight = this.view.pContent.spineBtnLight as ModelNode
        spineBtnLight.loadByPath('spine/ui/chongzhitangchuang/yigoumai_saoguang_upper')
        spineBtnLight.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])

        let spineStar = this.view.pContent.spineStar as ModelNode
        spineStar.loadByPath('spine/ui/chongzhitangchuang/xingxing_saoguang_upper')
        spineStar.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])
    }

    protected loadVideo(): void {
        let curChargeCfg = this._awardListCfg[0];
        let videoNode = this.view.pContent.btnDemo.videoNode as VideoNode
        let cfg = G.TableManager.getDataById(table.video.VideoConfig, curChargeCfg.videoId)
        // videoNode.nativeScale = 1.51
        videoNode.play(cfg)
    }

    protected clearVideo(): void {
        let videoNode = this.view.pContent.btnDemo.videoNode as VideoNode
        videoNode.clearVideo()
    }
}