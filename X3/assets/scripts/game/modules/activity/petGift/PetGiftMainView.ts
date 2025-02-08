import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { Logger } from "../../../../core/log/Logger";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemListComp } from "../../common/item/ItemListComp";
import { IAnimOrder, ModelNode } from "../../common/node/ModelNode";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { OrderModel } from "../../order/OrderModule";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityPetGiftVo } from "../model/ActivityPetGiftVo";
import { PetGiftConfigManager } from "./config/PetGiftConfigManager";
import { PetGiftDayBtn } from "./item/PetGiftDayBtn";
import { PetGiftPageBtn } from "./item/PetGiftPageBtn";

@bindScript(UIActivityKey.PetGiftMainView)
export class PetGiftMainView extends UICommWin {
    static pkgName: string = "petGift";
    static viewName: string = "petGiftMainView";

    // protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    // protected adaptType = ViewAdaptType.BOTTOM;

    private _modelNode: ModelNode;
    private _modelId: number = 0
    //礼包领取日期信息
    private _cfgDay: table.activity.PetGift.PetGiftConfig[];

    //活动id
    private _chooseDay: number;
    private _actId: number;
    private buyBtnEffect: ModelNode;

    protected _randomSpineAniNames: string[] = ['ctrl', 'move', 'skill01'];

    /**上次点击动画时间*/
    protected _lastClickSpineTime: number = 0;
    /**动画点击间隔*/
    protected _clickSpineInterval: number = 2000;
    /**自动动画间隔*/
    protected _autoSpineInterval: number = 10000;

    protected _bubbleTimerKey: string = null;

    private get view(): ui.petGift.petGiftMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_GIFT_CHOOSE_DAY,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        switch (event) {
            case NotificationKey.PET_GIFT_CHOOSE_DAY:
                this.updateChooseDay(args);
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (!vo) {
                    this.closeSelf();
                }
                if (vo.isFinishBuy(vo.activityId)) {
                    this.closeSelf();
                } else {
                    this.reset();
                }
                break;
            case NotificationKey.CHARGE_COMPLETE:
                GIns.activityModel.sendActivity(this._actId);
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._actId && this._actId) {
                    this.closeSelf();
                }
                break

        }
    }

    private updateChooseDay(day: number) {
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.PET_GIFT`)
            return;
        }
        if (this._chooseDay == day) {
            //没改变不用刷新
            return;
        }
        this._chooseDay = day;
        this.reset();
    }


    /**重新设置 */
    private reset() {
        const view = this.view;
        view.btnList.numItems = this._cfgDay.length;
        view.tabList.numItems = this._cfgDay.length;
        // view.btnList.refreshVirtualList();

        //获取当前选中天数的配置
        const cfg = this._cfgDay.find(v => { return this._chooseDay == v.openDay });
        let goodscfg = TableManager.getDataById(table.order.ChargeGoodsConfig, cfg.chargeGoodsId);
        const id = cfg.id;
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        this.buyBtnEffect.visible = false;
        if (vo.isGiftOpen(id)) {
            view.buyBtn.visible = true;
            if (vo.isLimit(id)) {
                //到达最大值
                view.buyBtn.grayed = true;
                view.buyBtn.text = '已购买';
                view.buyBtn.enabled = false;
            } else {
                view.buyBtn.grayed = false;
                view.buyBtn.text = `${goodscfg.price / 100}元`;
                view.buyBtn.enabled = true;
                this.buyBtnEffect.visible = true;
            }
        } else {
            //没开放，按钮隐藏
            view.buyBtn.grayed = true;
            view.buyBtn.text = '未解锁';
            view.buyBtn.enabled = false;
        }

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(goodscfg.rewards);
        const itemListComp = FguiScriptUtils.toMyScriptClass(view.itemList, ItemListComp);
        itemListComp.reset(noOwnerItems);

        view.lbBuy.text = `活动第${cfg.severDay}天可购买`


        if (this._modelId != cfg.showModelId) {
            this._modelId = cfg.showModelId
            this._modelNode.loadByModelId(cfg.showModelId);
            this._modelNode.playOrders([
                {
                    name: 'idle',
                    isLoop: true
                }
            ])
        }

        const index = this._cfgDay.findIndex(v => { return this._chooseDay == v.openDay });
        view.btnList.scrollToView(index);
    }


    protected onInit(): void {
        let view = this.view;
        view.btnList.itemRenderer = this.itemRendererForDay.bind(this);
        view.buyBtn.onClick(this.onClickBuy, this);

        view.tabList.itemRenderer = this.itemRendererForTab.bind(this);

        view.btnSpine.onClick(this.onClickSpine, this);
        view.btnClose.onClick(this.closeSelf, this);
    }

    protected onTimer(): void {
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        const leftTimeMs = vo?.getLeftTime();
        this.view.lbCd.text = '活动倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);
    }

    private onClickBuy() {
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        if (vo.isActivityOver()) {
            return;
        }

        const cfg = this._cfgDay.find(v => { return this._chooseDay == v.openDay })
        OrderModel.ins().sendCreateOrder(cfg.chargeGoodsId);
    }

    protected onClickSpine(): void {
        let nowTime = G.TimeManager.serverNow;
        if (nowTime - this._lastClickSpineTime > this._clickSpineInterval) {
            this._lastClickSpineTime = nowTime;
            this.randomBubble();
            this.randomSpine();
        }
    }

    protected onOpen(actId: any, isReopen?: boolean): void {
        const vo: ActivityPetGiftVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.PET_GIFT) as ActivityPetGiftVo;
        if (!vo) {
            this.closeSelf();
        }
        this._actId = vo.activityId;
        //选中默认天数
        this._chooseDay = vo.getChooseDay(vo.activityId);
        this._cfgDay = PetGiftConfigManager.getDayInfoByActivityId(vo.activityId);
        this.view.btnList.numItems = this._cfgDay.length;
        this.view.tabList.numItems = this._cfgDay.length

        this._modelNode = this.view.modelNode as ModelNode;
        // this._modelNode.setScale(4, 4);
        this.buyBtnEffect = this.view.buyBtn.showEffectByModel(10010191, { fix: -3, fiy: -5, scaleY: 1.2 })
        G.GameTimer.loop(500, this, this.onTimer)
        this.reset();

        this.randomBubble();
    }

    protected randomBubble(): void {
        let allTalkCfgs = G.TableManager.getAllData(table.activity.PetGift.PetGiftTalkConfig);
        if (allTalkCfgs?.length > 0) {
            let randomIdx: number = Math.floor(allTalkCfgs.length * Math.random());
            let talkCfg = allTalkCfgs[randomIdx];
            this.view.bubbleTip.bgTip.visible = false
            this.view.bubbleTip.lbBubble.text = talkCfg.content;
            this.view.getTransition('bubble').play();

            G.GameTimer.callLater(this, () => {
                if (this.view?.node?.isValid) {
                    this.view.bubbleTip.bgTip.visible = true
                }
            })
        }
        if (this._bubbleTimerKey) {
            G.GameTimer.clearByKey(this._bubbleTimerKey);
            this._bubbleTimerKey = null;
        }
        this._bubbleTimerKey = G.GameTimer.once(this._autoSpineInterval, this, this.onBubbleTimer);
    }

    protected onBubbleTimer(): void {
        this._bubbleTimerKey = null;
        this.randomBubble();
    }

    protected randomSpine(): void {
        let aniOrders: IAnimOrder[] = [{ name: 'idle', isLoop: true }];
        if (this._randomSpineAniNames?.length > 0) {
            let randomIdx: number = Math.floor(this._randomSpineAniNames.length * Math.random());
            aniOrders.unshift({ name: this._randomSpineAniNames[randomIdx], isLoop: false });
        }

        this._modelNode.playOrders(aniOrders);
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this)
    }

    protected itemRendererForDay(index: number, item: PetGiftDayBtn) {
        const cfg = this._cfgDay[index];
        item.reset(cfg, this._chooseDay)
    }

    private itemRendererForTab(index: number, item: PetGiftPageBtn) {
        const cfg = this._cfgDay[index];
        item.reset(cfg, this._chooseDay)

    }
}