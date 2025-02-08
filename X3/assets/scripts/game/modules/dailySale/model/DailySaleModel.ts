import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { DateUtils } from "../../../../core/utils/DateUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";

/**每日特惠配置信息*/
export interface DailySaleCfgData {
    cfg?: table.dailysale.DailySaleConfig
    freeCfg?: table.dailysale.DailySaleFreeRewardConfig
    orderCfg?: table.order.ChargeGoodsConfig
}

/**每日特惠配置数据*/
export interface DailySaleGroupCfgData {
    /**组id*/
    groupId: number
    /**免费礼包配置*/
    freeCfg: DailySaleCfgData
    /**打包购买礼包配置*/
    packCfg: DailySaleCfgData
    /**每日礼包列表*/
    otherCfgs: DailySaleCfgData[]
}

/**每日特惠购买天数配置*/
export interface DailySaleDayData {
    /**组id*/
    groupId: number
    /**开启时间*/
    startDayTime?: number
    /**当前是购买打包礼包的第几天*/
    curDay?: number
    /**各个礼包的购买天数*/
    days?: Map<number, number>
}

/**
 * 每日特惠模块定义信息
 * @author GameCreator
 */
export class DailySaleModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 43

    protected _cfgGroupMap: Map<number, DailySaleGroupCfgData> = new Map()
    protected _allCfgMap: Map<number, DailySaleCfgData> = new Map()
    protected _curGroupId: number = 0


    //当前购买的所有礼包id（DailySaleConfig.xlsx表的id）
    //免费礼包领取后，也存这里
    protected _curBuyIds: Set<number> = new Set()

    constructor() {
        super()
        this.regist()
    }

    public static getModule(): number {
        return this.ins().MODULE
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE
        this.registerMsg(moduleId, 1, this.recGetSaleInfo)
        this.registerMsg(moduleId, 2, this.recReceiveSaleReward)
        // this.registerMsg(moduleId, 3, this.recReceiveAllSaleRewards)
        this.registerMsg(moduleId, -1, this.pushDailySaleInfo)
        this.registerMsg(moduleId, -2, this.pushBuySale)
    }

    /**初始化帐数据 */
    public initData(vo: Vo.dailysale.DailySaleVo): void {
        this.clearData()

        if (this._cfgGroupMap.size <= 0) {
            let cfgs = G.TableManager.getAllData(table.dailysale.DailySaleConfig)
            cfgs.forEach((value) => {
                let cfgData: DailySaleGroupCfgData = null
                if (this._cfgGroupMap.has(value.groupId)) {
                    cfgData = this._cfgGroupMap.get(value.groupId)
                } else {
                    cfgData = {
                        groupId: value.groupId,
                        freeCfg: null,
                        packCfg: null,
                        otherCfgs: [],
                    }
                    this._cfgGroupMap.set(value.groupId, cfgData)
                }
                let freeCfg: table.dailysale.DailySaleFreeRewardConfig = null
                let orderCfg: table.order.ChargeGoodsConfig = null
                let targetCfg: DailySaleCfgData = null
                if (ServerEnums.DailySaleType[value.type] == ServerEnums.DailySaleType.FREE) {
                    //免费礼包
                    freeCfg = G.TableManager.getDataById(table.dailysale.DailySaleFreeRewardConfig, value.id)
                    targetCfg = { cfg: value, freeCfg: freeCfg }
                    cfgData.freeCfg = targetCfg
                } else if (ServerEnums.DailySaleType[value.type] == ServerEnums.DailySaleType.PACK_GOODS) {
                    //打包价礼包
                    orderCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, value.chargeGoodsId)
                    targetCfg = { cfg: value, orderCfg: orderCfg }
                    cfgData.packCfg = targetCfg
                } else {
                    orderCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, value.chargeGoodsId)
                    targetCfg = { cfg: value, orderCfg: orderCfg }
                    cfgData.otherCfgs.push(targetCfg)
                }
                this._allCfgMap.set(targetCfg.cfg.id, targetCfg)
                if (this._curGroupId == 0) {
                    this._curGroupId = value.groupId
                }
            })
        }
        this.updateAllDatas(vo)
    }

    public clearData(): void {

    }

    /*********************************数据处理*********************************/

    /**当前组id 目前写死第一组数据 后期再扩展*/
    public get curGroupId(): number {
        return this._curGroupId
    }

    /**获取配置数据*/
    public getCfgData(id: number): DailySaleCfgData {
        return this._allCfgMap.get(id)
    }

    /**获取一组配置数据*/
    public getGroupCfgData(groupId: number): DailySaleGroupCfgData {
        return this._cfgGroupMap.get(groupId)
    }


    /**是否领取免费礼包 */
    public hasDrewFreeGift(id: number): boolean {
        let hasDrewFreeReward = this._curBuyIds.has(id)
        return hasDrewFreeReward
    }

    /**是否已购买指定礼包 */
    public hasBuyGift(id: number): boolean {
        let hasBuy = this._curBuyIds.has(id)
        return hasBuy
    }

    /**是否购买了普通礼包*/
    public hasBuyNormal(groupId: number): boolean {
        let otherCfgs = this.getGroupCfgData(groupId)?.otherCfgs
        if (otherCfgs) {
            for (let i = 0; i < otherCfgs.length; i++) {
                if (this.hasBuyGift(otherCfgs[i].cfg.id)) {
                    return true
                }
            }
        }
        return false
    }

    /**是否已购买打包礼包*/
    public hasBuyPackGift(groupId: number){
        let groupCfg = this.getGroupCfgData(groupId)
        let hasBuyPack = this._curBuyIds.has(groupCfg.packCfg.cfg.id)
        return hasBuyPack
    }

    /**全量数据更新*/
    protected updateAllDatas(data: Vo.dailysale.DailySaleVo): void {
        this._curBuyIds.clear()
        for (let key in data.groupId2SaleIds) {
            let idArr = data.groupId2SaleIds[key]
            idArr.forEach((id) => {
                this._curBuyIds.add(id)
            })
        }

        this.emit(NotificationKey.DAILY_SALE_CHANGE, 0)
    }

    /*********************************协议发送*********************************/

    /**获取每日特惠信息*/
    public sendGetSaleInfo(): void {
        this.send(this.MODULE, 1, {})
    }

    /**领取每日特惠奖励*/
    public sendReceiveSaleReward(c2s: Vo.dailysale.ReceiveSaleRewardC2S): void {
        this.send(this.MODULE, 2, c2s, c2s)
    }

    // /**一键领取每日特惠奖励*/
    // public sendReceiveAllSaleRewards(c2s: Vo.dailysale.ReceiveAllSaleRewardsC2S): void {
    //     this.send(this.MODULE, 3, c2s, c2s)
    // }

    /*********************************协议监听*********************************/

    /**获取每日特惠信息返回*/
    protected recGetSaleInfo(data: Vo.dailysale.GetSaleInfoS2C): void {
        if (data.code < 0) {
            return
        }
        this.updateAllDatas(data.content)
    }

    /**领取每日特惠奖励返回*/
    protected recReceiveSaleReward(data: Vo.dailysale.ReceiveSaleRewardS2C, c2s: Vo.dailysale.ReceiveSaleRewardC2S): void {
        if (data.code < 0) {
            return
        }
        let cfgData = this.getCfgData(c2s.saleId)
        if (cfgData) {
            this.emit(NotificationKey.DAILY_SALE_CHANGE, cfgData.cfg.groupId)
            this._curBuyIds.add(c2s.saleId)
        }

        if (data.content?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content);
        }
    }

    /**一键领取每日特惠奖励返回*/
    // protected recReceiveAllSaleRewards(data: Vo.dailysale.ReceiveAllSaleRewardsS2C, c2s: Vo.dailysale.ReceiveAllSaleRewardsC2S): void {
    //     if (data.code < 0) {
    //         return
    //     }
    //     let groupCfgData = this.getGroupCfgData(c2s.groupId)
    //     if (groupCfgData) {
    //         let dayData = this.getAndCreateDayData(groupCfgData.groupId)
    //         if (dayData) {
    //             let ids: number[] = groupCfgData.otherCfgs?.map((value) => value.cfg.id)
    //             ids.push(groupCfgData.freeCfg?.cfg?.id)
    //             ids.push(groupCfgData.packCfg?.cfg?.id)
    //             ids.forEach((id) => {
    //                 let oldDay: number = 0
    //                 if (dayData.days.has(id)) {
    //                     oldDay = dayData.days.get(id)
    //                 }
    //                 oldDay++
    //                 dayData.days.set(id, oldDay)
    //             })
    //             this.emit(NotificationKey.DAILY_SALE_CHANGE, groupCfgData.groupId)
    //         }
    //     }
    //     if (data.content?.rewardResults?.length > 0) {
    //         this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
    //     }
    // }

    /*********************************协议推送*********************************/

    /**推送每日特惠信息*/
    protected pushDailySaleInfo(vo: Vo.dailysale.DailySaleVo): void {
        this.updateAllDatas(vo)
    }

    /**推送购买信息*/
    protected pushBuySale(saleId: number): void {
        let cfgData = this.getCfgData(saleId)
        if (cfgData) {
            this._curBuyIds.add(saleId)
            this.emit(NotificationKey.DAILY_SALE_CHANGE, cfgData.cfg.groupId)
        }
    }
}
