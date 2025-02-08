import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { WeightObject } from "../../../core/utils/WeightUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { FormationVo } from "../formation/vo/FormationVo";

const COMMON = 'COMMON'

/**
 * 守卫母舰管理类 主要用于随机buff和掉落
*/
export class GuardShipManager extends BaseSingleton {
    protected _isInitBuffs: boolean = false
    protected _isInitUseItems: boolean = false
    protected _buffMap:Map<string, table.guardship.GuardShipSkillConfig[]> = new Map()

    protected _allPoolTypeMap:Map<string, boolean> = new Map()
    /**当前随机buff池类型*/
    protected _poolTypes:string[] = []

    /**等级品质权重*/
    protected _lvWeight:WeightObject<number> = new WeightObject<number>()
    /**buff权重*/
    protected _buffWeight:WeightObject<number> = new WeightObject<number>()
    /**道具掉落权重*/
    protected _itemWeight:WeightObject<number> = new WeightObject<number>()
    /**怪物掉落概率*/
    protected _dropRatioMap:Map<number, number> = new Map()
    

    // 初始化时
    protected onInit(): void {
        this.initBuffs()
        this.initUseItems()
    }


    protected onDestroy(): void {
    }

    protected getBuffKey(cfg:table.guardship.GuardShipSkillConfig):string {
        let poolType = cfg.poolType ? cfg.poolType : COMMON
        return this.getBuffKeyByPoolType(poolType, cfg.poolValue)
    }

    protected getBuffKeyByPoolType(poolType:string, poolValue:number):string {
        return poolType + '_' + poolValue
    }

    protected initBuffs():void {
        if (this._isInitBuffs == false) {
            this._buffMap.clear()
            this._allPoolTypeMap.clear()
            let allCfgs = G.TableManager.getAllData(table.guardship.GuardShipSkillConfig)
            allCfgs.forEach((cfg) => {
                let key = this.getBuffKey(cfg)
                let arr = []
                if (this._buffMap.has(key)) {
                    arr = this._buffMap.get(key)
                } else {
                    arr = []
                    this._buffMap.set(key, arr)
                }
                arr.push(cfg)
                if (cfg.poolType) {
                    this._allPoolTypeMap.set(cfg.poolType, true)
                }
            })
            this._isInitBuffs = true
        }
    }

    protected initUseItems():void {
        if (this._isInitUseItems == false) {
            this._dropRatioMap.clear()
            this._itemWeight.reset()
            let dropCfg = G.TableManager.getDataById(table.guardship.GuardShipConstantConfig, 'GUARD_SHIP:DROP_RATE')
            let dropObj: object = {}
			if (dropCfg) {
				try {
					dropObj = JSON.parse(dropCfg.content)
				} catch (e) {
					console.log('解析字段GUARD_SHIP:DROP_RATE错误')
				}
			}
            for (let key in dropObj) {
                this._dropRatioMap.set(ServerEnums.MonsterType[String(key)], dropObj[key])
            }

            let allItemCfgs = G.TableManager.getAllData(table.guardship.GuardShipUseItemConfig)
            let noneWeight:number = 0
            allItemCfgs.forEach((cfg) => {
                this._itemWeight.add(cfg.id, cfg.dropRate)
                noneWeight += 10000 - cfg.dropRate
            })
            if (noneWeight > 0) {
                this._itemWeight.add(0, noneWeight)
            }
            this._isInitUseItems = true
        }
    }

    /**初始化buff随机池*/
    public initBuffPool(formation: FormationVo): void {
        // this.initBuffs()
        this._poolTypes.length = 0
        this._poolTypes.push(COMMON)
        let maxCnt:number = 0
        let allCareer = formation?.getCareerCount(0)
        allCareer?.forEach((value) => {
            let poolType = ServerEnums.Career[value.type]
            if (this._allPoolTypeMap.has(poolType)) {
                if (maxCnt < value.num) {
                    maxCnt = value.num
                }
            }
        })
        allCareer?.forEach((value) => {
            let poolType = ServerEnums.Career[value.type]
            if (this._allPoolTypeMap.has(poolType) && value.num == maxCnt) {
                this._poolTypes.push(poolType)
            }
        })
    }

    /**获取随机buff列表*/
    public getBuffIdsForLevel(level:number, count:number = 3):number[] {
        let buffIds:number[] = []
        let lvCfg = G.TableManager.getDataById(table.guardship.GuardShipLevelConfig, level)
        if (lvCfg) {
            this._lvWeight.reset()
            lvCfg.qualityWeight?.forEach((value) => {
                this._lvWeight.add(value.k, value.v)
            })
            let poolValue:number = this._lvWeight.extractOne()
            let battleBuffVo = GIns.guardShipModel.battleBuffVo
            this._buffWeight.reset()
            this._poolTypes?.forEach((poolType) => {
                let key = this.getBuffKeyByPoolType(poolType, poolValue)
                if (this._buffMap.has(key)) {
                    let arr = this._buffMap.get(key)
                    arr?.forEach((value) => {
                        if (battleBuffVo.isBuffMax(value.id) == false) {
                            this._buffWeight.add(value.id, value.weight)
                        }
                    })
                }
            })
            /**最多找10次 找不到就算了*/
            let extractCount:number = 10
            while (buffIds.length <= 0 && extractCount >= 0) {
                buffIds = this._buffWeight.extract(count)
                extractCount--
            }
            if (extractCount < 0) {
                console.log('找不到buff', buffIds)
            }
        }
        return buffIds
    }

    /**一个怪物当做只掉落一个*/
    public getDropIdByMonster(monsterType:ServerEnums.MonsterType):number {
        // this.initUseItems()
        let itemId:number = 0;
        // //测试掉落率调整为50%
        // if (Math.random() < 0.5) {
        //     itemId = Math.floor(Math.random() * 7) + 7001
        // }
        if (this._dropRatioMap.has(monsterType)) {
            let dropRatio = this._dropRatioMap.get(monsterType)
            dropRatio += GIns.guardShipModel.battleVo.stuffEffect.extraItemDropRate
            let random = Math.floor(Math.random() * 10000) + 1
            if (random <= dropRatio) {
                //代表掉落
                itemId = this._itemWeight.extractOne()
            }
        }
        return itemId
    }
}