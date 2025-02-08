import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";

/**商品数据*/
export interface MallData {
    id: number
    cfg: table.mall.MallGoodsConfig
    orderCfg: table.order.ChargeGoodsConfig
    costCfg: table.mall.MallCostRewardConfig
    buyNum: number
    adBuyNum: number
}

/**限时礼包数据*/
export interface MallPopupData {
    id: number
    endTime: number
    cfg: table.mall.MallPopupConfig
}

/**
 * 商城模块定义信息
 * @author GameCreator
 */
export class MallModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 44

    protected _allMallCfgMap: Map<number, MallData[]> = new Map()
    protected _allMallCfgFroIdMap: Map<number, MallData> = new Map()
    protected _allRefreshTimeMap: Map<number, Map<number, number>> = new Map()
    /**vip商品配置了vip等级限制 初始化处理了 防止后面反复遍历*/
    protected _allVipCfgMap: Map<number, MallData[]> = new Map()
    /**限时礼包数据*/
    protected _allPopupDatas: Map<number, MallPopupData> = new Map()
    /**最先消失的限时礼包时间*/
    public minPopupEndTime: number = 0
    constructor () {
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
        this.registerMsg(moduleId, 1, this.recGetMallInfo)
        this.registerMsg(moduleId, 2, this.recBuy)
        this.registerMsg(moduleId, -1, this.pushMallInfo)
        this.registerMsg(moduleId, -2, this.pushBuyGoods)
        this.registerMsg(moduleId, -3, this.pushPopupIdList)
    }

    /**初始化帐数据 */
    public initData(vo: Vo.mall.MallLoginVo): void {
        this.clearData()
        if (this._allMallCfgMap.size <= 0) {
            //初始化配置
            let cfgs = G.TableManager.getAllData(table.mall.MallGoodsConfig)
            cfgs.forEach((value) => {
                let type = value.type ? ServerEnums.MallGoodsType[value.type] : 0
                let datas: MallData[] = null
                if (this._allMallCfgMap.has(type)) {
                    datas = this._allMallCfgMap.get(type)
                } else {
                    datas = []
                    this._allMallCfgMap.set(type, datas)
                }
                let orderCfg = null
                let costCfg = null
                if (value.chargeGoodsId) {
                    orderCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, value.chargeGoodsId)
                } else {
                    costCfg = G.TableManager.getDataById(table.mall.MallCostRewardConfig, value.id)
                }
                let data: MallData = {
                    id: value.id,
                    cfg: value,
                    orderCfg: orderCfg,
                    costCfg: costCfg,
                    buyNum: 0,
                    adBuyNum: 0,
                }
                datas.push(data)
                this._allMallCfgFroIdMap.set(data.id, data)

                if (type == ServerEnums.MallGoodsType.VIP) {
                    let needVip = ConditionManager.ins().getConditionValue(value.buyConditions, EnumConditionType.VIP_LEVEL_GE)
                    let datas: MallData[] = null
                    if (this._allVipCfgMap.has(needVip)) {
                        datas = this._allVipCfgMap.get(needVip)
                    } else {
                        datas = []
                        this._allVipCfgMap.set(needVip, datas)
                    }
                    datas.push(data)
                }
            })
        }
        vo.mallVos.forEach((value) => {
            this.updateMallData(value, true)
        })
        this._allPopupDatas.clear()
        for (let key in vo.popupId2ExpiredTime) {
            let popupId = Number(key)
            this.addPopUpData(popupId, Number(vo.popupId2ExpiredTime[key]))
        }
        this.emit(NotificationKey.MALL_DATA_INIT_COMPLETE)
        this.checkLimitPackRed()
    }

    public clearData(): void {

    }

    /*********************************数据处理*********************************/

    protected checkPopups(): void {
        if (this._allPopupDatas.size > 0) {
            let hasChange: boolean = false
            let popupIds = Array.from(this._allPopupDatas.keys())
            popupIds.forEach((popupId) => {
                let data = this._allPopupDatas.get(popupId)
                if (this.isPopupSellOutAll(data)) {
                    this._allPopupDatas.delete(popupId)
                    hasChange = true
                }
            })
            if (hasChange) {
                this.emit(NotificationKey.MALL_POPUP_CHANGE)
            }
        }
        this.checkLimitPackRed()
    }

    /**新增限时礼包数据*/
    public addPopUpData(popupId: number, endTime: number): boolean {
        let cfg = G.TableManager.getDataById(table.mall.MallPopupConfig, popupId)
        if (cfg) {
            let data: MallPopupData = {
                id: popupId,
                endTime: endTime,
                cfg: cfg
            }
            if (this.isPopupSellOutAll(data) == false) {
                this._allPopupDatas.set(popupId, data)
                return true
            }
        }
        return false
    }

    /**更新商品数据*/
    public updateMallData(vo: Vo.mall.MallVo, isInit: boolean = false): void {
        let datas: MallData[] = this._allMallCfgMap.get(vo.id)
        if (datas) {
            datas.forEach((value: MallData) => {
                if (vo.goodsId2BuyNum.hasOwnProperty(value.id)) {
                    value.buyNum = vo.goodsId2BuyNum[value.id]
                } else {
                    value.buyNum = 0
                }
                if (vo.goodsId2AdvertBuyNum.hasOwnProperty(value.id)) {
                    value.adBuyNum = vo.goodsId2AdvertBuyNum[value.id]
                } else {
                    value.adBuyNum = 0
                }
            })
        }

        let timeMap: Map<number, number> = this._allRefreshTimeMap.get(vo.id)
        if (timeMap == null) {
            timeMap = new Map()
            this._allRefreshTimeMap.set(vo.id, timeMap)
        }
        timeMap.clear()
        for (let key in vo.limitType2RefreshTime) {
            timeMap.set(Number(key), vo.limitType2RefreshTime[key])
        }
        this.emit(NotificationKey.MALL_DATA_CHANGE_BY_TYPE, vo.id)
    }

    /**获取商品数据*/
    public getMallData(id: number): MallData {
        if (this._allMallCfgFroIdMap.has(id)) {
            return this._allMallCfgFroIdMap.get(id)
        }
        return null
    }

    /**获取指定类型商品列表
     * @type 商品类型
     * @limitBuyType 限购类型 -1代表是全量
    */
    public getMallListByType(type: number, limitBuyType: number = -1): MallData[] {
        let arr: MallData[] = []
        if (this._allMallCfgMap.has(type)) {
            arr = this._allMallCfgMap.get(type)
            if (limitBuyType != -1) {
                arr = arr.filter((value) => { return ServerEnums.MallGoodsLimitBuyType[value.cfg.limitBuyType] == limitBuyType })
            }
        }
        return arr
    }

    /**获取指定类型商品刷新时间
     * @type 商品类型
     * @limitBuyType 限购类型
    */
    public getMallRefreshTime(type: number, limitBuyType: number = -1): number {
        if (this._allRefreshTimeMap.has(type)) {
            let map: Map<number, number> = this._allRefreshTimeMap.get(type)
            if (map.has(limitBuyType)) {
                return map.get(limitBuyType)
            }
        }
        return 0
    }

    /**获取vip商品列表*/
    public getMallListForVip(vipLv: number): MallData[] {
        if (this._allVipCfgMap.has(vipLv)) {
            return this._allVipCfgMap.get(vipLv)
        }
        return []
    }

    /**商品是否已售罄*/
    public isSellOut(data: MallData): boolean {
        if (data?.cfg?.buyLimit > 0) {
            if (data.buyNum >= data.cfg.buyLimit) {
                return true
            }
        }
        return false
    }

    /**是否是免费商品*/
    public isFree(data: MallData): boolean {
        if (data?.costCfg) {
            return data.costCfg.costItems == null || data.costCfg.costItems.length <= 0;
        }
        return false;
    }

    /**是否有免费商品*/
    public hasFreeMall(type: number, limitBuyTypes: number[] = []): boolean {
        let arr = this._allMallCfgMap.get(type)
        let hasFree: boolean = false
        if (arr) {
            for (let i = 0; i < arr.length; i++) {
                if (limitBuyTypes?.length > 0 && limitBuyTypes.indexOf(ServerEnums.MallGoodsLimitBuyType[arr[i].cfg.limitBuyType]) == -1) {
                    continue
                }
                if (arr[i].costCfg && arr[i].costCfg.costItems == null && this.isSellOut(arr[i]) == false) {
                    hasFree = true
                    break
                }
            }
        }
        return hasFree
    }

    /**获取商品奖励列表*/
    public getMallReward(data: MallData): Array<{ k: any, v: any }> {
        if (data.orderCfg) {
            return data.orderCfg?.rewards
        } else if (data.costCfg) {
            return data.costCfg?.rewards
        }
        return []
    }

    /**获取所有限时礼包截止时间*/
    public get popupDataMap(): Map<number, MallPopupData> {
        return this._allPopupDatas
    }

    /**限时礼包是否领取完了*/
    public isPopupSellOutAll(data: MallPopupData): boolean {
        if (data.cfg && data.cfg.goodsIds.length > 0) {
            let lastMallId = data.cfg.goodsIds[data.cfg.goodsIds.length - 1]
            let lastMallData = this.getMallData(lastMallId)
            if (lastMallData && this.isSellOut(lastMallData) == false) {
                return false
            }
        }
        return true
    }

    /***检查限购礼包红点 */
    public checkLimitPackRed(): void {
        GIns.redDotMgr.setRedDot(RedDotKeys.LIMIT_PACK_FREE_REWARD_GET, this.hasFreePopupMall());
    }

    /**是否有免费的限时礼包未领取*/
    public hasFreePopupMall(): boolean {
        let hasFree: boolean = false;
        let arr = Array.from(this.popupDataMap.values());
        for (let i = 0; i < arr.length; i++) {
            let goodIds = arr[i].cfg?.goodsIds;
            if (goodIds) {
                for (let j = 0; j < goodIds.length; j++) {
                    let mallVo = this.getMallData(goodIds[j]);
                    if (mallVo && this.isSellOut(mallVo) == false) {
                        hasFree = this.isFree(mallVo);
                        break;
                    } else {
                        continue;
                    }
                }
            }
            if (hasFree) {
                break;
            }
        }
        return hasFree;
    }

    /*********************************协议发送*********************************/

    /**获取商城信息*/
    public sendGetMallInfo(c2s: Vo.mall.GetMallInfoC2S): void {
        this.send(this.MODULE, 1, c2s)
    }

    /**购买商品*/
    public sendBuy(c2s: Vo.mall.BuyC2S): void {
        this.send(this.MODULE, 2, c2s, c2s)
    }

    /*********************************协议监听*********************************/

    /**获取商城信息返回*/
    protected recGetMallInfo(data: Vo.mall.GetMallInfoS2C): void {
        if (data.code < 0) {
            return
        }
        this.updateMallData(data.content)
    }

    /**购买商品返回*/
    protected recBuy(data: Vo.mall.BuyS2C, c2s: Vo.mall.BuyC2S): void {
        if (data.code < 0) {
            return
        }
        let mallData: MallData = this.getMallData(data.content.goodsId)
        if (mallData) {
            mallData.buyNum++
            if (c2s.advert) {
                mallData.adBuyNum++
            }
            this.emit(NotificationKey.MALL_DATA_CHANGE_BY_ID, mallData)
        }
        if (data.content.costResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costResults)
        }
        if (data.content?.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
        }
        this.checkPopups()
    }

    /*********************************协议推送*********************************/

    /**推送商城信息*/
    protected pushMallInfo(mallVos: Vo.mall.MallVo[]): void {
        mallVos.forEach((value) => {
            this.updateMallData(value)
        })
    }

    /**推送购买商品*/
    protected pushBuyGoods(goodsId: number): void {
        let mallData: MallData = this.getMallData(goodsId)
        if (mallData) {
            mallData.buyNum++
            this.emit(NotificationKey.MALL_DATA_CHANGE_BY_ID, mallData)
            this.checkPopups()
        }
    }

    /**推送弹窗礼包Id列表*/
    protected pushPopupIdList(popupIds2ExpiredTime: object): void {
        let firstId: number = -1
        for (let key in popupIds2ExpiredTime) {
            if (firstId == -1) {
                firstId = Number(key)
            }
            this.addPopUpData(Number(key), Number(popupIds2ExpiredTime[key]))
        }
        this.emit(NotificationKey.MALL_POPUP_CHANGE)
        this.emit(NotificationKey.MALL_POPUP, firstId)
        this.checkLimitPackRed()
    }
}
