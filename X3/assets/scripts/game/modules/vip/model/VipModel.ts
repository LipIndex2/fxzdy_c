import { DEBUG } from "cc/env";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ReportDataType } from "../../../../core/sdk/SdkBase";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import NotificationKey from "../../../event/NotificationKey";
import { ItemUtils } from "../../item/utils/ItemUtils";


export enum VipAdditionDescType {
    /**无图标*/
    Null = 0,
    /**新增特权*/
    New = 1,
    /**有提升的特权*/
    Raise = 2,
    /**已有特权*/
    Old
}

export class VipAdditionDesc {
    id: number
    /**类型 参考 VipAdditionDescType*/
    type: number
    /**具体描述文本*/
    desc: string
}

export interface VipAdditionChatColorRowData {
    color: string
    outline: string
}

/**vip加成颜色数据*/
export class VipAdditionChatColorData {
    lv: number
    colors: VipAdditionChatColorRowData[]
}

/**VIP加成数据*/
export class VipAdditionData {
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

    public clone(): VipAdditionData {
        let data = new VipAdditionData()
        this.values.forEach((value, key) => {
            data.values.set(key, value)
        })
        return data
    }
}

/**
 * vip模块定义信息
 * @author GameCreator
 */
export class VipModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 41

    protected _vipLv: number = 0
    protected _vipExp: number = 0
    protected _curCfg: table.vip.VipConfig = null
    protected _nextCfg: table.vip.VipConfig = null
    protected _nextLv: number = 0
    protected _nextMinExp: number = 0
    protected _maxVipLv: number = 0
    protected _allVipAdditionMap: Map<number, Map<number, VipAdditionData>> = new Map()
    protected _curAdditions: Map<number, VipAdditionData> = new Map()
    protected _additonDescMap: Map<number, VipAdditionDesc[]> = new Map()
    protected _ratioFromOrderMap: Map<string, number> = new Map()
    protected _chatColorMap: Map<number, VipAdditionChatColorData> = new Map()
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
        this.registerMsg(moduleId, -1, this.pushVipExpIncrease)
    }

    /**初始化数据 */
    public initData(vo: Vo.vip.VipLoginVo): void {
        this.clearData()
        if (this._allVipAdditionMap.size <= 0) {
            this._maxVipLv = 0
            let cfgs = G.TableManager.getAllData(table.vip.VipConfig)
            cfgs.forEach((value) => {
                let map: Map<number, VipAdditionData> = new Map()
                this._allVipAdditionMap.set(value.id, map)
                let lastAdditionDataMap = this._allVipAdditionMap.get(value.id - 1)
                if (lastAdditionDataMap) {
                    lastAdditionDataMap?.forEach((value, key) => {
                        map.set(key, value.clone())
                    })
                }
                value.additionIds?.forEach((id) => {
                    let additionCfg = G.TableManager.getDataById(table.vip.VipAdditionConfig, id)
                    if (additionCfg) {
                        let key = ServerEnums.VipAdditionType[additionCfg.type]
                        let additionData: VipAdditionData = null
                        if (map.has(key)) {
                            additionData = map.get(key)
                        } else {
                            additionData = new VipAdditionData()
                            map.set(key, additionData)
                        }
                        additionData.addValue(additionCfg.param, additionCfg.value)
                    }
                })
                if (value.id > this._maxVipLv) {
                    this._maxVipLv = value.id
                }
            })
        }
        // if (DEBUG) {
        //     this._allVipAdditionMap.forEach((value, key) => {
        //         console.log(`VIP${key}特权:`)
        //         value.forEach((value2, key2) => {
        //             value2.values.forEach((value3, key3) => {
        //                 console.log(`${ServerEnums.VipAdditionType[key2]}   param:${key3}, value:${value3}`)
        //             })
        //         })
        //     })
        // }

        this.updateData(vo.vipLevel, vo.vipExp)
    }

    public clearData(): void {
        this._vipLv = -1
        this._vipExp = 0
    }

    /*********************************数据处理*********************************/

    protected getAdditionMapKey(additionCfg: table.vip.VipAdditionConfig): string {
        return additionCfg.type + '_' + additionCfg.param
    }

    protected converAdditionValueTopMap(cfg: table.vip.VipConfig, map: Map<string, table.vip.VipAdditionConfig>): void {
        cfg?.additionIds?.forEach((id: number) => {
            let additionCfg = G.TableManager.getDataById(table.vip.VipAdditionConfig, id)
            if (additionCfg) {
                let key = this.getAdditionMapKey(additionCfg)
                map.set(key, additionCfg)
            }
        })
    }

    /**特权描述解析*/
    protected converAddtionDesc(cfg: table.vip.VipAdditionConfig): string {
        let desCfg = G.TableManager.getDataById(table.vip.VipAdditionDescConfig, cfg?.type)
        if (desCfg == null) {
            return ''
        }
        let desc = desCfg.descRich
        let type = ServerEnums.VipAdditionType[desCfg.type]
        let valueShow: string = cfg.valueShow ? cfg.valueShow : cfg.value
        if (type == ServerEnums.VipAdditionType.HANG_UP_REWARD
            || type == ServerEnums.VipAdditionType.ARENA_REWARD
            || type == ServerEnums.VipAdditionType.DAILY_BOSS_RANK_REWARD) {
            //奖励类需要读取道具信息
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.param)
            let itemName: string = itemCfg ? G.I18nManager.lang(itemCfg.name) : ''
            let color: string = ItemUtils.getTextColorText(itemCfg?.quality)
            if (color) {
                itemName = `<color=${color}>${itemName}</color>`
            }
            valueShow = (Number(valueShow) / 100).toString()//万分比需要除以100
            return G.I18nManager.lang(desc, itemName, valueShow)
        } else if (type == ServerEnums.VipAdditionType.SHOP_GOODS_ON_SHELVE) {
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.valueShow)
            let itemName: string = itemCfg ? G.I18nManager.lang(itemCfg.name) : ''
            let color: string = ItemUtils.getTextColorText(itemCfg?.quality)
            if (color) {
                itemName = `<color=${color}>${itemName}</color>`
            }
            return G.I18nManager.lang(desc, itemName)
        } else if (type == ServerEnums.VipAdditionType.CHAT_COLOR) {
            let showStr: string = cfg.valueShow
            let valueArr = StringUtils.strToArr(cfg.value)
            if (valueArr.length > 0 && valueArr[0].length >= 2) {
                let color = valueArr[0][0]
                let outline = valueArr[0][1]
                if (outline) {
                    showStr = `<outline color=${outline} width=2>${showStr}</outline>`
                }
                if (color) {
                    showStr = `<color=${color}>${showStr}</color>`
                }
            }
            return G.I18nManager.lang(desc, showStr)
        } else {
            return G.I18nManager.lang(desc, valueShow)
        }
    }

    /**当前vip等级*/
    public get vipLv(): number {
        return this._vipLv
    }

    /**当前vip经验*/
    public get vipExp(): number {
        return this._vipExp
    }

    /**是否vip满级*/
    public get isMaxVip(): boolean {
        return this._nextLv == this._vipLv
    }

    /**获取最大vip等级*/
    public get maxVipLv(): number {
        return this._maxVipLv
    }

    /**当前vip配置数据*/
    public get curCfg(): table.vip.VipConfig {
        return this._curCfg
    }

    /**下一级vip等级*/
    public get nextLv(): number {
        return this._nextLv
    }

    /**下一级vip配置数据*/
    public get nextCfg(): table.vip.VipConfig {
        return this._nextCfg
    }

    /**获取加成列表*/
    public get additions(): VipAdditionData[] {
        return Array.from(this._curAdditions.values())
    }

    /**获取vip经验和充值之间的兑换比例*/
    public getVipExpRatioFromOrder(currencyCode: string = 'CNY'): number {
        if (this._ratioFromOrderMap.has(currencyCode)) {
            return this._ratioFromOrderMap.get(currencyCode)
        }
        let key: string = 'VIP_SCORE_RATIO_' + currencyCode
        let cfg = G.TableManager.getDataById(table.order.ChargeConstantConfig, key)
        let ratio = cfg ? Number(cfg.content) : 1
        this._ratioFromOrderMap.set(currencyCode, ratio)
        return ratio
    }

    /**获取指定类型加成*/
    public getAddition(type: number, param: string = ''): string {
        if (this._curAdditions?.has(type)) {
            return this._curAdditions.get(type).getValue(param)
        }
        return ''
    }

    /**获取指定类型加成值*/
    public getAdditionToNumber(type: number, param: string = ''): number {
        return Number(this.getAddition(type, param))
    }

    /**获取指定vip等级的特权加成数据*/
    public getAdditionForLv(vipLv: number, type: number, param: string = ''): string {
        let addition = this._allVipAdditionMap.get(vipLv)
        if (addition?.has(type)) {
            return addition.get(type).getValue(param)
        }
        return ''
    }

    /**获取对应vip等级的颜色配置列表 没有数据返回null*/
    public getChatColors(lv: number): VipAdditionChatColorData {
        if (this._chatColorMap.has(lv)) {
            return this._chatColorMap.get(lv)
        }
        let addition = this.getAdditionForLv(lv, ServerEnums.VipAdditionType.CHAT_COLOR)
        let chatColor: VipAdditionChatColorData = {
            lv: lv,
            colors: []
        }
        if (addition) {
            let arr = addition.split(';')
            arr?.forEach((value, index) => {
                let arr2 = value.split(',')
                if (arr2.length >= 2) {
                    chatColor.colors.push({ color: arr2[0], outline: arr2[1] })
                }
            })
            if (chatColor.colors.length > 0) {
                this._chatColorMap.set(lv, chatColor)
                return chatColor
            }
        }
        return null
    }

    /**获取所有vip聊天颜色配置
     * @param maxLv 最大vip等级 0代表拿全部数据
    */
    public getAllChatColors(maxLv: number = 0): VipAdditionChatColorData[] {
        let realMaxLv = maxLv > 0 ? maxLv : this._maxVipLv
        let list: VipAdditionChatColorData[] = []
        for (let i = 1; i <= realMaxLv; i++) {
            let data = this.getChatColors(i)
            if (data) {
                list.push(data)
            }
        }
        return list
    }

    /**获取特权描述列表*/
    public getAdditionDescList(lv: number): VipAdditionDesc[] {
        if (lv <= 0 || lv > this._maxVipLv) {
            //数据不合法
            return []
        }
        if (this._additonDescMap.has(lv)) {
            return this._additonDescMap.get(lv)
        }
        let lastLv: number = lv - 1
        let curCfg = G.TableManager.getDataById(table.vip.VipConfig, lv)
        let curMap: Map<string, table.vip.VipAdditionConfig> = new Map()
        this.converAdditionValueTopMap(curCfg, curMap)
        let descList: VipAdditionDesc[] = []
        curMap?.forEach((cfg, key) => {
            let descData = new VipAdditionDesc()
            if (ServerEnums.VipAdditionType[cfg.type] != ServerEnums.VipAdditionType.CHAT_COLOR
                && this.getAdditionForLv(lastLv, ServerEnums.VipAdditionType[cfg.type], cfg.param)) {
                descData.type = VipAdditionDescType.Raise
            } else {
                descData.type = VipAdditionDescType.New
            }
            descData.id = cfg.id
            descData.desc = this.converAddtionDesc(cfg)
            descList.push(descData)
        })
        descList.sort((a, b) => {
            if (a.type != b.type) {
                return a.type - b.type
            } else {
                return a.id - b.id
            }
        })
        if (lv > 1) {
            //大于1级时 要展示一条固定特权描述
            let id: string = 'INCLUDE_LAST'
            let desCfg = G.TableManager.getDataById(table.vip.VipAdditionDescConfig, id)
            let des: VipAdditionDesc = {
                id: 999,
                type: VipAdditionDescType.Null,
                desc: G.I18nManager.lang(desCfg?.desc, lv - 1)
            }
            descList.push(des)
        }
        this._additonDescMap.set(lv, descList)
        return descList
    }

    /**更新vip数据*/
    protected updateData(lv: number, exp: number): void {
        let isLvChange: boolean = this._vipLv != lv
        let isExpChange: boolean = this._vipExp != exp
        this._vipExp = exp
        if (this._vipLv != lv) {
            this._vipLv = lv
            this._curCfg = G.TableManager.getDataById(table.vip.VipConfig, lv)
            let nextLv = this._vipLv + 1
            let nextCfg = G.TableManager.getDataById(table.vip.VipConfig, nextLv)
            if (nextCfg) {
                //有下一等级
                this._nextCfg = nextCfg
                this._nextLv = nextLv
            } else {
                //没有下一等级
                this._nextCfg = this._curCfg
                this._nextLv = this._vipLv
            }
            if (this._allVipAdditionMap.has(lv)) {
                this._curAdditions = this._allVipAdditionMap.get(lv)
            } else {
                this._curAdditions = new Map()
            }
        }
        if (isLvChange) {
            this.emit(NotificationKey.VIP_LV_CHANGE)
            this.emit(LoginNotificationKey.REPORT_DATA_TO_SDK, ReportDataType.upgradeVIP);
        }
        if (isExpChange) {
            this.emit(NotificationKey.VIP_EXP_CHANGE)
        }
    }

    /**根据经验获取vip等级*/
    public getVipLvByExp(exp: number): number {
        if (exp <= 0) {
            return 0
        }
        let lv = 0
        for (let i = 1; i < this._maxVipLv; i++) {
            let cfg = G.TableManager.getDataById(table.vip.VipConfig, i)
            if (cfg && cfg.minExp < exp) {
                lv = cfg.id
            } else {
                break
            }
        }
        return lv
    }

    /**获取可展示的最大等级*/
    public getMaxShowLv(curLv: number): number {
        let allCfgs = G.TableManager.getAllData(table.vip.VipConfig)
        let maxShowLv = 1
        for (let i = 0; i < allCfgs.length; i++) {
            let needLv = allCfgs[i].showNeedLv
            if (needLv <= curLv) {
                maxShowLv = allCfgs[i].id
            } else {
                break
            }
        }
        return maxShowLv
    }

    /*********************************协议发送*********************************/


    /*********************************协议监听*********************************/


    /*********************************协议推送*********************************/

    protected pushVipExpIncrease(rewardResults: Vo.reward.RewardResult[]): void {
        if (rewardResults?.length > 0) {
            let content = rewardResults[0].contents
            if (content?.hasOwnProperty('exp') && content?.hasOwnProperty('level')) {
                this.updateData(Number(content['level']), Number(content['exp']))
            }
        }
    }
}
