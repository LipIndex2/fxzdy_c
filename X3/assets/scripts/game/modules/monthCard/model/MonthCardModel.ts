import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { DateUtils } from "../../../../core/utils/DateUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BackpackManager } from "../../backpack/BackpackManager";
import { MonthCardI18nKeys } from "../const/MonthCardI18nKeys";

/**月卡数据*/
export interface MonthCardData {
    id: number
    cfg: table.monthcard.MonthCardConfig
    orderCfg: table.order.ChargeGoodsConfig
    itemVo?: Vo.monthcard.MonthCardItemVo
}

export class MonthCardAdditionDesc {
    id: number
    /**具体描述文本*/
    desc: string
    /**图片图集路径*/
    iconPath?: string
}

/**月卡加成数据*/
export class MonthCardAdditionData {
    public values: Map<string, string> = new Map()

    public addValue(param: string, value: string): void {
        if (!isNaN(Number(value))) {
            //是数字就累加
            let oldValue = 0
            if (this.values.has(param)) {
                oldValue = Number(this.values.get(param))
            }
            if (!isNaN(oldValue)) {
                oldValue += Number(value)
                this.values.set(param, oldValue + '')
            } else {
                this.values.set(param, value)
            }
            return
        }
        //非数字直接替换值
        this.values.set(param, value)
    }

    public getValue(param: string = ''): string {
        if (this.values.has(param)) {
            return this.values.get(param)
        }
        return ''
    }

    public getValueToNumber(param: string = ''): number {
        return Number(this.getValue(param))
    }

    public clear(): void {
        this.values.clear()
    }

    public clone(): MonthCardAdditionData {
        let data = new MonthCardAdditionData()
        this.values.forEach((value, key) => {
            data.values.set(key, value)
        })
        return data
    }
}

/**
 * 月卡模块定义信息
 * @author GameCreator
 */
export class MonthCardModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 45

    protected _dataMap: Map<number, MonthCardData> = new Map()
    protected _datas: MonthCardData[] = []
    protected _gainDailyFreeReward: boolean = false
    protected _freeRewards: { k: any, v: any }[] = []
    protected _constIds: number[] = []
    protected _additonDescMap: Map<number, MonthCardAdditionDesc[]> = new Map()
    protected _curAdditions: Map<number, MonthCardAdditionData> = new Map()
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
        this.registerMsg(moduleId, 1, this.recGetCardVo)
        this.registerMsg(moduleId, 2, this.recReceiveDailyFreeReward)
        this.registerMsg(moduleId, 3, this.recReceiveAllRewards)
        this.registerMsg(moduleId, 4, this.recReceiveDailyRewards)
        this.registerMsg(moduleId, 5, this.recActive);

        this.registerMsg(moduleId, -1, this.pushCardVo)
        this.registerMsg(moduleId, -2, this.pushBuyCard)
        this.registerMsg(moduleId, -3, this.pushBuyItemVo)
    }

    /**初始化帐数据 */
    public initData(vo: Vo.monthcard.MonthCardVo): void {
        this.clearData()
        if (this._dataMap.size <= 0) {
            //初始化配置
            let cfgs = G.TableManager.getAllData(table.monthcard.MonthCardConfig)
            cfgs.forEach((value) => {
                let data: MonthCardData = {
                    id: value.id,
                    cfg: value,
                    orderCfg: G.TableManager.getDataById(table.order.ChargeGoodsConfig, value.chargeGoodsId),
                    itemVo: null
                }
                this._dataMap.set(value.id, data)
            })
            this._datas = Array.from(this._dataMap.values())
        }
        this._curAdditions.clear()
        this.updateAllDatas(vo)
    }

    public clearData(): void {

    }

    /*********************************数据处理*********************************/
    /**是否已领取免费奖励*/
    public get gainDailyFreeReward(): boolean {
        return this._gainDailyFreeReward
    }

    /**特权卡数据列表*/
    public get datas(): MonthCardData[] {
        return this._datas
    }

    /**免费奖励*/
    public get freeRewards(): { k: any, v: any }[] {
        if (this._freeRewards.length > 0) {
            return this._freeRewards
        }
        let rewardCfg = G.TableManager.getDataById(table.monthcard.MonthCardConstantConfig, 'MONTH_CARD:DAILY_FREE_REWARDS')
        if (rewardCfg) {
            this._freeRewards = StringUtils.toObject1Arr(rewardCfg.content)
        }
        return this._freeRewards
    }

    /**获取激活月卡列表 */
    // public get aCostIds(): number[] {
    //     if (this._constIds.length > 0) {
    //         return this._constIds;
    //     }
    //     const config = G.TableManager.getDataById(table.monthcard.MonthCardConfig, ServerEnums.MonthCardType.MONTH);
    //     const activeCosts = config.activeCosts;
    //     activeCosts.forEach(v => {
    //         this._constIds.push(v.k);
    //     })
    //     return this._constIds;
    // }

    /**获取包含指定加成的月卡列表*/
    public getCardsByAdditions(additionTypes: ServerEnums.MonthCardAdditionType[]): MonthCardData[] {
        let arr: MonthCardData[] = [];
        this._datas?.forEach((value) => {
            if (this.isCardHasAdditions(value, additionTypes)) {
                arr.push(value);
            }
        })
        return arr;
    }

    /**月卡是否有某种加成*/
    public isCardHasAdditions(cardData: MonthCardData, additionTypes: ServerEnums.MonthCardAdditionType[]): boolean {
        let hasAddition: boolean = false;
        if (cardData) {
            for (let i = 0; i < cardData?.cfg?.additionIds.length; i++) {
                let additionCfg = G.TableManager.getDataById(table.monthcard.MonthCardAdditionConfig, cardData?.cfg?.additionIds[i])
                if (additionCfg) {
                    if (additionTypes.indexOf(ServerEnums.MonthCardAdditionType[additionCfg.type]) != -1) {
                        hasAddition = true;
                        break;
                    }
                }
            }
        }
        return hasAddition;
    }

    /**是否满足道具激活 */
    // public isEnough(): boolean {
    //     const config = G.TableManager.getDataById(table.monthcard.MonthCardConfig, ServerEnums.MonthCardType.MONTH);
    //     const activeCosts = config.activeCosts;
    //     for (var i = 0; i < activeCosts.length; i++) {
    //         const k = activeCosts[i].k;
    //         const c = BackpackManager.ins().getItemCountByItemId(+k);
    //         if (c < activeCosts[i].v) {
    //             return false;
    //         }
    //     }
    //     return true;

    // }

    /**是否是激活道具 */
    // public isActItem(id): boolean {
    //     const ids = this.aCostIds;
    //     if (ids && ids.indexOf(id) != -1) {
    //         return true;
    //     }
    //     return false;

    // }


    /**是否是否可以用道具激活 */
    // public canUseItem() {
    //     let data = this.datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == ServerEnums.MonthCardType.MONTH)
    //     const remianDays = this.getRemainDays(data);
    //     const validDays = data.cfg.validDays;
    //     const maxDaysLimit = data.cfg.maxDaysLimit;
    //     const enough = MonthCardModel.ins().isEnough();
    //     if (enough && maxDaysLimit - remianDays >= validDays) {
    //         return true;
    //     }
    // }

    /***是否可以激活 */
    public canUseItem() {
        let data = this.datas.find((value) => ServerEnums.MonthCardType[value.cfg.type] == ServerEnums.MonthCardType.MONTH)
        const remianDays = this.getRemainDays(data);
        const validDays = data.cfg.validDays;
        const maxDaysLimit = data.cfg.maxDaysLimit;
        const enough = data.itemVo?.chargeMoney >= data.cfg.activeChargeMoney;
        if (enough && maxDaysLimit - remianDays >= validDays) {
            return true;
        }
    }

    /**获取月卡数据*/
    public getData(id: number): MonthCardData {
        if (this._dataMap.has(id)) {
            return this._dataMap.get(id)
        }
        return null
    }

    /**获取指定类型加成*/
    public getAddition(type: number, param: string = ''): string {
        if (this._curAdditions.has(type)) {
            return this._curAdditions.get(type).getValue(param)
        }
        return null
    }

    /**获取指定类型加成值*/
    public getAdditionToNumber(type: number, param: string = ''): number {
        return Number(this.getAddition(type, param))
    }

    /**获取特权描述列表*/
    public getAdditionDescList(data: MonthCardData): MonthCardAdditionDesc[] {
        if (this._additonDescMap.has(data.id)) {
            return this._additonDescMap.get(data.id)
        }
        let curMap: Map<number, table.monthcard.MonthCardAdditionConfig> = new Map()
        this.converAdditionValueTopMap(data.cfg, curMap)
        let descList: MonthCardAdditionDesc[] = []
        curMap?.forEach((cfg, key) => {
            let descData = new MonthCardAdditionDesc()
            descData.id = cfg.id
            descData.desc = this.converAdditionDesc(cfg)
            descList.push(descData)
        })
        //额外添加一份每日领取和及时奖励
        let rewardDescList = this.converRewardAdditionDesList(data)
        descList = rewardDescList.concat(descList)
        this._additonDescMap.set(data.id, descList)

        return descList
    }

    /**是否已激活*/
    public isActive(data: MonthCardData): boolean {
        if (data.itemVo == null) {
            return false
        }
        return data.itemVo.endTime > G.TimeManager.serverNow
    }

    /**是否激活*/
    public isAciveById(id: number): boolean {
        let data = this._dataMap.get(id)
        if (data) {
            return this.isActive(data)
        }
        return false
    }

    /**是否激活*/
    public isAciveByType(type: ServerEnums.MonthCardType): boolean {
        let data = this._datas?.find((value) => ServerEnums.MonthCardType[value.cfg.type] == type)
        if (data) {
            return this.isActive(data)
        }
        return false
    }

    /**剩余天数*/
    public getRemainDays(data: MonthCardData): number {
        if (this.isActive(data) == false) {
            return 0
        }
        let endTime = data.itemVo.endTime
        let curDay = DateUtils.getCurrentTimeMsByHour(G.TimeManager.serverNow, 0)
        let remainDays = DateUtils.dayCount(curDay, endTime)
        return remainDays
    }

    /**是否已领取奖励*/
    public hasDrewReward(data: MonthCardData): boolean {
        if (data.itemVo == null) {
            return false
        }
        let startTime = DateUtils.getCurrentTimeMsByHour(data.itemVo.startTime, 0)
        let curDay = DateUtils.dayCount(startTime, G.TimeManager.serverNow)
        let drawDay = data.itemVo.receivedDays
        if (drawDay >= curDay) {
            return true
        } else {
            return false
        }
    }

    /**是否有奖励没领取*/
    public hasReward(): boolean {
        if (this.gainDailyFreeReward == false) {
            return true
        }
        for (let i = 0; i < this.datas.length; i++) {
            if (this.isActive(this.datas[i]) && this.hasDrewReward(this.datas[i]) == false) {
                return true
            }
        }
        return false
    }

    protected updateAllConditions(): void {
        this._curAdditions.clear()
        this._dataMap.forEach((data) => {
            if (this.isActive(data)) {
                data.cfg?.additionIds?.forEach((id: number) => {
                    let additionCfg = G.TableManager.getDataById(table.monthcard.MonthCardAdditionConfig, id)
                    if (additionCfg) {
                        let key = ServerEnums.MonthCardAdditionType[additionCfg.type]
                        let additionData: MonthCardAdditionData = null
                        if (this._curAdditions.has(key)) {
                            additionData = this._curAdditions.get(key)
                        } else {
                            additionData = new MonthCardAdditionData()
                            this._curAdditions.set(key, additionData)
                        }
                        additionData.addValue(additionCfg.param, additionCfg.value)
                    }
                })
            }
        })
    }

    /**更新全部数据*/
    protected updateAllDatas(vo: Vo.monthcard.MonthCardVo): void {
        this._gainDailyFreeReward = vo.gainDailyFreeReward
        vo.cardItemVos.forEach((value) => {
            this.updateData(value, false)
        })
        this.updateAllConditions()
        this.emit(NotificationKey.MONTHCARD_DATA_CHANGE, 0)
    }

    /**更新单个特权卡数据*/
    protected updateData(vo: Vo.monthcard.MonthCardItemVo, withEvent: boolean = true): MonthCardData {
        let data = this._dataMap.get(vo.cardId)
        if (data) {
            data.itemVo = vo
            if (withEvent) {
                this.emit(NotificationKey.MONTHCARD_DATA_CHANGE, data.id)
            }
        }
        return data
    }

    protected converRewardAdditionDesList(data: MonthCardData): MonthCardAdditionDesc[] {
        let descList: MonthCardAdditionDesc[] = []

        if (data.orderCfg) {
            //奖励描述
            descList = descList.concat(this.converRewardToAdditionDes(data.cfg.rewards, data, 'REWARDS'))
        }
        descList = descList.concat(this.converRewardToAdditionDes(data.cfg.dailyRewards, data, 'DAILY_REWARDS'))
        return descList
    }

    protected converRewardToAdditionDes(rewards: { k: any, v: any }[], data: MonthCardData, additionType: string): MonthCardAdditionDesc[] {
        let descList: MonthCardAdditionDesc[] = []
        let type = ServerEnums.MonthCardType[data.cfg.type]
        let desCfg = G.TableManager.getDataById(table.monthcard.MonthCardAdditionDescConfig, additionType)
        let desc = desCfg?.descRich ? desCfg.descRich : ''
        rewards?.forEach((value) => {
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, value.k)
            if (itemCfg && value.v > 0) {
                let lastIndex = itemCfg.smallIconPath.lastIndexOf('/')
                if (lastIndex != -1) {
                    let itemIcon = itemCfg.smallIconPath.substring(lastIndex + 1)
                    let descData = new MonthCardAdditionDesc()
                    descData.id = data.id
                    let itemImgStr = ` <img src='${itemIcon}' width='30' height='30'/> `
                    let countColor = type == ServerEnums.MonthCardType.MONTH ? '#4BF0FF' : '#FFED2A'
                    descData.desc = G.I18nManager.lang(desc, itemImgStr, value.v, countColor)
                    descData.iconPath = itemCfg.smallIconPath.substring(0, lastIndex)
                    descList.push(descData)
                }
            }
        })
        return descList
    }

    protected converAdditionValueTopMap(cfg: table.monthcard.MonthCardConfig, map: Map<number, table.monthcard.MonthCardAdditionConfig>): void {
        cfg?.additionIds?.forEach((id: number) => {
            let additionCfg = G.TableManager.getDataById(table.monthcard.MonthCardAdditionConfig, id)
            if (additionCfg) {
                map.set(additionCfg.id, additionCfg)
            }
        })
    }

    /**特权描述解析*/
    protected converAdditionDesc(cfg: table.monthcard.MonthCardAdditionConfig): string {
        let desCfg = G.TableManager.getDataById(table.monthcard.MonthCardAdditionDescConfig, cfg?.type)
        if (desCfg == null) {
            return ''
        }
        let desc = desCfg.descRich
        let type = ServerEnums.MonthCardAdditionType[desCfg.type]
        let valueShow: number = Number(cfg.value);
        if (type == ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_HANG_UP_TIME_ADDITION) {
            //分钟显示为小时
            valueShow = Math.floor(valueShow / 60)
        } else if (type == ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_REWARD_ADDITION) {
            //万分比改为百分比
            valueShow = Math.floor(valueShow / 100)
        }
        return G.I18nManager.lang(desc, valueShow)
    }

    /*********************************协议发送*********************************/

    /**获取特权卡信息*/
    public sendGetCardVo(): void {
        this.send(this.MODULE, 1, {})
    }

    /**领取免费奖励*/
    public sendReceiveDailyFreeReward(): void {
        this.send(this.MODULE, 2, {})
    }

    /**一键领取所有奖励*/
    public sendReceiveAllRewards(): void {
        this.send(this.MODULE, 3, {})
    }

    /**领取每日奖励*/
    public sendReceiveDailyRewards(c2s: Vo.monthcard.ReceiveDailyRewardsC2S): void {
        this.send(this.MODULE, 4, c2s)
    }

    /**
     * 激活特权卡
     * 模块号：45	指令号：5
     */
    public sendActive(c2s: Vo.monthcard.ActiveC2S): void {
        this.send(this.MODULE, 5, c2s);
    }

    /*********************************协议监听*********************************/

    /**获取特权卡信息返回*/
    protected recGetCardVo(data: Vo.monthcard.GetCardVoS2C): void {
        if (data.code < 0) {
            return
        }
        this.updateAllDatas(data.content)
    }

    /**领取免费奖励返回*/
    protected recReceiveDailyFreeReward(data: Vo.monthcard.ReceiveDailyFreeRewardS2C): void {
        if (data.code < 0) {
            return
        }
        if (data.content?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content);
        }
        this._gainDailyFreeReward = true
        this.emit(NotificationKey.MONTHCARD_DATA_CHANGE)
    }

    /**一键领取所有奖励返回*/
    protected recReceiveAllRewards(data: Vo.monthcard.ReceiveAllRewardsS2C): void {
        if (data.code < 0) {
            return
        }
        if (data.content?.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
        }
        this.updateAllDatas(data.content.cardVo)
    }

    /**领取每日奖励返回*/
    protected recReceiveDailyRewards(data: Vo.monthcard.ReceiveDailyRewardsS2C): void {
        if (data.code < 0) {
            return
        }
        if (data.content?.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
        }
        this.updateData(data.content.cardItemVo)
    }


    /**
     * 激活特权卡
     * 模块号：45	指令号：5
     */
    public recActive(data: Vo.monthcard.ActiveS2C): void {
        if (data.code < 0) {
            return
        }
        const content = data.content;
        // const costItemResults = content.costItemResults;
        // if (costItemResults?.length > 0) {
        //     G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults);
        // }
        this.updateData(data.content)
    }

    /*********************************协议推送*********************************/

    /**推送特权卡信息*/
    protected pushCardVo(cardVo: Vo.monthcard.MonthCardVo): void {
        this.updateAllDatas(cardVo)
    }

    /**推送购买特权卡信息*/
    protected pushBuyCard(buyVo: Vo.monthcard.MonthCardBuyVo): void {
        if (buyVo.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, buyVo.rewardResults);
        }
        let data = this.updateData(buyVo.cardItemVo)
        this.updateAllConditions()
        this.emit(NotificationKey.MONTHCARD_BUY_COMPLETE, data)
        if (data.cfg.activeChargeMoney) {
            //激活成功
            GIns.floatingTextMgr.showTips(MonthCardI18nKeys.act2);
        }
    }

    /**推送特权卡条目信息，MonthCardItemVo，特权卡条目信息*/
    protected pushBuyItemVo(cardVo: Vo.monthcard.MonthCardItemVo): void {
        this.updateData(cardVo)
    }
}
