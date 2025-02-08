import G from "../../../../core/comm/G";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { ActivityModel, ActivitySyncData } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ActivityMallConfigManager } from "db://assets/scripts/game/modules/mall/config/ActivityMallConfigManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { EnumActivityRespType } from "db://assets/scripts/game/comm/activity/enums/EnumActivityRespType";
import GIns from "db://assets/scripts/game/GIns";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";


// 关联所有购买配置
export interface ActivityMallBuyConfigData {
    cfg: table.activity.Mall.ActivityMallGoodsConfig
    orderCfg?: table.order.ChargeGoodsConfig
    costCfg?: table.activity.Mall.ActivityMallCostRewardConfig
}

/**
 * 黑市
 */
export class ActivityMallModelVo extends BaseActivityVo {

    private _goodIdToBuyCountMap: Map<number, number> = new Map();
    private _goodIdToAdBuyCountMap: Map<number, number> = new Map();
    private _typeToRefreshTimeMsMap: Map<number, number> = new Map();

    // 关联所有购买配置 
    private _goodConfigArray: ActivityMallBuyConfigData[];


    public get activityVo(): Vo.mall.MallVo {
        return this.content as any;
    }


    onServerResp(type: EnumActivityRespType,
                 serverRespObj: any | null,
                 req: ActivitySyncData
    ) {


        if (type == EnumActivityRespType.BUY || type == EnumActivityRespType.GAIN_ITEM) {
            Logger.game("购买黑市道具", req);

            const goodIdStr = req.itemId;
            const goodId = Number.parseInt(goodIdStr);
            this._goodIdToBuyCountMap.merge(goodId, 1, (v1, v2) => v1 + v2);

            FacadeManager.ins().emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
        }
    }

    onInitDone() {

        const mallVo = this.activityVo;
        if (!mallVo) {
            return;
        }

        this._goodIdToBuyCountMap = MapUtils.fromObject(mallVo.goodsId2BuyNum,
            it => Number(it),
            it => Number(it)
        );
        this._goodIdToAdBuyCountMap = MapUtils.fromObject(mallVo.goodsId2AdvertBuyNum,
            it => Number(it),
            it => Number(it)
        );
        this._typeToRefreshTimeMsMap = MapUtils.fromObject(mallVo.limitType2RefreshTime,
            it => Number(it),
            it => Number(it)
        );

    }

    /**更新活动内容-->>活动对应的vo数据 */
    public updateInfo(info: Object): void {
        this.content = info;
        this.onInitDone();
        G.FacadeManager.emit(NotificationKey.ACTIVITY_UPDATE, this.activityId);
    }


    /** 获取配置列表 */
    public get goodConfigArray(): ActivityMallBuyConfigData[] {
        if (!this._goodConfigArray) {
            this._goodConfigArray = []
            let activityId = this.activityId;
            let allCfgs = G.TableManager.getAllData(table.activity.Mall.ActivityMallGoodsConfig)
            allCfgs?.forEach((cfg) => {
                if (cfg.activityId == activityId) {
                    let cfgData: ActivityMallBuyConfigData = {
                        cfg: cfg,
                    }
                    if (cfg.chargeGoodsId) {
                        cfgData.orderCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, cfg.chargeGoodsId)
                    } else {
                        cfgData.costCfg = G.TableManager.getDataById(table.activity.Mall.ActivityMallCostRewardConfig, cfg.id)
                    }
                    this._goodConfigArray.push(cfgData)
                }
            })
        }
        return this._goodConfigArray;
    }

    /**活动是否过期 */
    public isActivityOver(): boolean {

        if (!(this.endTime > G.TimeManager.serverNow)) {
            return true;
        }

        // const isDone = this.isDone();
        // if (isDone) {
        //     return isDone;
        // }


        // return this.isAllBuy();
        return false;

    }


    public isShowRed(): boolean {
        let goodConfigArray = this.goodConfigArray;
        let hasRedDot:boolean = false;
        for (let i = 0; i < goodConfigArray.length; i++) {
            let goodsId:number = goodConfigArray[i].cfg.id;
            if (this.isFree(goodsId) && this.isBuyMax(goodsId) == false) {
                hasRedDot = true;
                break;
            }
        }
        return hasRedDot;
    }

    sendBuy(goodId: number) {
        ActivityModel.ins().sendBuyGoods({
            activityId: this.activityId,
            itemId: `${goodId}`,
            times: 1,
            hidePopWin: 2
        } as ActivitySyncData)
    }

    sendFree(goodId: number) {
        ActivityModel.ins().sendDrawItemReward({
            activityId: this.activityId,
            itemId: `${goodId}`,
            times: 1,
            hidePopWin: 2
        } as ActivitySyncData)
    }

    isBuyMax(goodId: number): boolean {
        const maxBuyCount = ActivityMallConfigManager.getMaxBuyCount(goodId);
        return this._goodIdToBuyCountMap.getOrDefault(goodId, 0) >= maxBuyCount;
    }

    getBuyCount(goodId: number): number {
        return this._goodIdToBuyCountMap.getOrDefault(goodId, 0);
    }

    isFree(goodId: number): boolean {
        return ActivityMallConfigManager.isFree(goodId);
    }

    refreshRedDot() {
        for (let goodId of this._goodIdToBuyCountMap.keys()) {
            if (this.isBuyMax(goodId)) {
                GIns.redDotMgr.setRedDot(RedDotKeys.BlackShop_Good, false);
                continue
            }
            const isFree = this.isFree(goodId);
            GIns.redDotMgr.setRedDot(RedDotKeys.BlackShop_Good, isFree);
        }
    }

    isAllBuy(): boolean {
        let isAllBuy = true;
        if (MapUtils.isEmpty(this._goodIdToBuyCountMap)) {
            return false;
        }
        for (let goodId of this._goodIdToBuyCountMap.keys()) {
            if (this.isBuyMax(goodId)) {
                continue
            }
            isAllBuy = false;
            break;
        }
        return isAllBuy;
    }
}