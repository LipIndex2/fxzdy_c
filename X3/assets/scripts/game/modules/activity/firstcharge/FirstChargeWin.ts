import { VideoPlayer } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
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
import { FirstChargeAwardItem } from "./item/FirstChargeAwardItem";

/**
 * 首充弹窗
 */
export class FirstChargeWin extends UICommWin {
    static pkgName: string = "activityFirstCharge";
    static viewName: string = "FirstChargeWin";

    /** 首充vo */
    private _data: ActivityFirstChargeVo;

    private _modelNode: ModelNode;

    //页签
    private _tab: number = 0;

    //首充奖励cfg列表
    private _awardListCfg: table.activity.FirstCharge.FirstChargeConfig[];

    protected _isFirst: boolean = true
    protected _modelId: number = 0
    protected _firstChargeHeroId: number = 0
    protected _orderId: number = 0

    private get view(): ui.activityFirstCharge.FirstChargeWin {
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
                    this.updateData();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateData();
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
        this.view.pContent.centerPanel.list_award.itemRenderer = this.awardRenderer.bind(this);
        this.view.pContent.list_tab.itemRenderer = this.tabRenderer.bind(this);

        this.view.pContent.centerPanel.btn_buy.on(fgui.Event.CLICK, this.onClickBuyBtn, this);
        this.view.pContent.centerPanel.btnDemo.onClick(this.onClickDemo, this)

        let videoNode = this.view.pContent.centerPanel.btnDemo.videoNode as VideoNode
        videoNode.videoPlayer.node.on(VideoPlayer.EventType.CLICKED, this.onClickDemo, this)
    }

    protected setContentVisible(visible: boolean): void {
        this.view.pContent.topBg.visible = visible
        this.view.pContent.topTitle.visible = visible
        this.view.pContent.centerPanel.visible = visible
        this.view.pContent.list_tab.visible = visible
        this.view.pContent.centerPanel.list_award.visible = visible
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

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._isFirst) {
            this.view.pContent.getTransition('enter').play()
            this.setContentVisible(false)
            this.view.pContent.centerPanel.bubble.visible = false

            let activityId = ActivityModel.ins().getActivityIdByType(ServerEnums.ActivityType.FIRST_CHARGE);
            this._data = ActivityModel.ins().getActivityVoById(activityId);
            //@ts-ignore
            this._modelNode = this.view.pContent.modelNode as modelNode;
            // this._modelNode.setScale(4, 4);

            this.updateData();

            let spineStage = this.view.pContent.spineStage as ModelNode
            spineStage.loadByPath('spine/ui/chongzhitangchuang/shouchongtangchuang_xuanhuan')
            spineStage.playOrders([
                {
                    name: 'idle',
                    isLoop: true
                }
            ])
        }
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    private updateData() {
        if (this._data.tabCfgs.length > 1) {
            this.view.pContent.list_tab.numItems = this._data.tabCfgs.length;
        } else {
            this.view.pContent.list_tab.numItems = 0;
        }
        this.updateAward()
        this.updateUI();
    }

    //更新UI
    private updateUI(withAni: boolean = false) {
        //充值配置
        let chargeGoodsCfg = this._data.tabCfgs[this._tab];
        this.view.pContent.centerPanel.btn_buy.text = `${chargeGoodsCfg.price / 100}元`;
        this.view.pContent.centerPanel.btn_buy.visible = !this._data.isFirstChargeById(Number(chargeGoodsCfg.id));
        this.view.pContent.centerPanel.img_buy.visible = this._data.isFirstChargeById(Number(chargeGoodsCfg.id));

        //首充配置
        let firstChargeCfg = this._awardListCfg[0];
        //折扣
        if (firstChargeCfg.discount) {
            this.view.pContent.topBg.G_discount.visible = true;
            this.view.pContent.topBg.T_discount.text = `${firstChargeCfg.discount}%`;
        } else {
            this.view.pContent.topBg.G_discount.visible = false;
        }

        //展示英雄
        let heroVo = HeroManager.ins().getHeroVoByID(firstChargeCfg.heroId);
        this._firstChargeHeroId = heroVo?.heroCfg.id
        if (this._modelId != heroVo.heroCfg.showModelId) {
            this._modelId = heroVo.heroCfg.showModelId
            this._modelNode.loadByModelId(heroVo.heroCfg.showModelId);
            this._modelNode.playOrders([
                {
                    name: 'skill01',
                    isLoop: false,
                    callbackForComplete: () => {
                        if (this.view?.node?.isValid && this._isFirst) {
                            this._isFirst = false
                            this.setContentVisible(true)
                            this.view.pContent.getTransition('t0').play(() => {
                                if (this.view?.node?.isValid) {
                                    this.loadOtherSpine()
                                    this.updateBubbleTip()

                                }
                            })
                            this.view.pContent.centerPanel.getTransition('t0').play()
                            this.view.pContent.centerPanel.list_award._children.forEach((child) => {
                                (child as FirstChargeAwardItem).playEffect()
                            })
                        }
                    }
                },
                {
                    name: 'idle',
                    isLoop: true
                }
            ])
        }

        this.view.pContent.topBg.T_name.text = heroVo.heroCfg.name;
        this.view.pContent.topBg.list_star.numItems = heroVo.heroCfg.initStar;
        this.view.pContent.topBg.img_camp.icon = ItemUtils.getCampIcon(heroVo.heroCfg.camp);

        this.view.pContent.centerPanel.spineBtnLight.visible = this.view.pContent.centerPanel.btn_buy.visible

        if (this._isFirst == false) {
            this.updateBubbleTip(withAni)
        }
    }

    protected updateBubbleTip(withAni: boolean = false): void {
        //首充配置
        let firstChargeCfg = this._awardListCfg[0];
        this.view.pContent.centerPanel.bubble.visible = this.view.pContent.centerPanel.btn_buy.visible && firstChargeCfg?.bubbleTip != ''
        if (this.view.pContent.centerPanel.bubble.visible) {
            this.view.pContent.centerPanel.bubble.lbBubble.text = firstChargeCfg?.bubbleTip
            this.view.pContent.centerPanel.bubble.bgBubble.visible = false
            G.GameTimer.callLater(this, () => {
                if (this.view?.node?.isValid) {
                    this.view.pContent.centerPanel.bubble.bgBubble.visible = true
                }
            })
            if (withAni) {
                this.view.pContent.centerPanel.getTransition('t1').play()
            } else {
                this.view.pContent.centerPanel.bubble.setScale(1, 1)
            }
        }
    }

    protected loadOtherSpine(): void {
        let spineTopBg = this.view.pContent.topBg.spineTopBg as ModelNode
        spineTopBg.loadByPath('spine/ui/chongzhitangchuang/huanxing_lower')
        spineTopBg.playOrders([
            {
                name: 'idle',
                isLoop: true
            }
        ])

        let spineBottomBg = this.view.pContent.centerPanel.spineBottomBg as ModelNode
        spineBottomBg.loadByPath('spine/ui/chongzhitangchuang/bianyuan_saoguang_upper')
        spineBottomBg.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])

        let spineDiscount = this.view.pContent.topBg.spineDiscount as ModelNode
        spineDiscount.loadByPath('spine/ui/chongzhitangchuang/chaozhi_saoguang_upper')
        spineDiscount.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])

        let spineTitle = this.view.pContent.topBg.spineTitle as ModelNode
        spineTitle.loadByPath('spine/ui/chongzhitangchuang/chaoqiangsheji_lower')
        spineTitle.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])

        let spineStar = this.view.pContent.topBg.spineStar as ModelNode
        spineStar.loadByPath('spine/ui/chongzhitangchuang/xingxing_saoguang_upper')
        spineStar.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])
        let spineBtnLight = this.view.pContent.centerPanel.spineBtnLight as ModelNode
        spineBtnLight.loadByPath('spine/ui/chongzhitangchuang/yigoumai_saoguang_upper')
        spineBtnLight.playOrders([
            {
                name: 'enteridle',
                isLoop: true
            }
        ])

        this.loadVideo()
    }

    protected loadVideo(): void {
        // let videoNode = this.view.pContent.centerPanel.btnDemo.videoNode as VideoNode
        // let url = 'video/hero/demo_' + this._firstChargeHeroId
        // videoNode.nativeScale = 1.27
        // videoNode.play(url)
    }

    protected clearVideo(): void {
        let videoNode = this.view.pContent.centerPanel.btnDemo.videoNode as VideoNode
        videoNode.clearVideo()
    }

    //更新奖励
    private updateAward() {
        let id = this._data.tabCfgs[this._tab];
        this._awardListCfg = this._data.getSceneCfgByType(id.id.toString());
        this.view.pContent.centerPanel.list_award.numItems = this._awardListCfg.length;
    }

    private awardRenderer(index: number, item: FirstChargeAwardItem) {
        let cfg = this._awardListCfg[index];
        item.updateData(this._data, cfg);
    }

    //tab列表 
    private tabRenderer(index: number, item: ui.activityFirstCharge.btn.buyTabBtn) {
        if (index == this._tab) {
            item.selected = true;
        }

        let cfg = this._data.tabCfgs[index];
        let price = cfg.price / 100;
        item.T_price.text = `${price}元`;
        //是否已购买
        item.img_buy.visible = this._data.isFirstChargeById(Number(cfg.id));
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.FirstCharge_tab, [cfg.id])
        let self = this;
        item.onClick(() => {
            if (self._tab != index) {
                self._tab = index;
                self.updateAward();
                self.updateUI(true);
            }
        }, this);
    }

    private onClickBuyBtn() {
        let cfg = this._data.tabCfgs[this._tab];
        if (!cfg || !this._data) return;

        if (this._data.isActivityOver()) {
            return;
        }
        //GmModel.ins().sendCharge(cfg.id.toString());
        this._orderId = Number(cfg.id)
        OrderModel.ins().sendCreateOrder(cfg.id);
    }

    protected onClickDemo(): void {
        this.clearVideo()
        // G.UIManager.open(UIActivityKey.FirstChargeDemoWin, this._firstChargeHeroId)
    }
}
// UIScriptManager.bindScript(UIActivityKey.FirstChargeWin, FirstChargeWin);