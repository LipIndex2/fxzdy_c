import { ServerEnums } from "../../../../../libs/extras/ServerEnums"

export interface IGuardShipBattleSelectBuff {
    /** 等级 */
    level: number
    /**备选数量*/
    optionalCount: number;
    /**可选组数*/
    selectGroupCount: number;
    /**已选组数*/
    selectCount: number
    buffIds: number[][]
}

export interface IGuardShipBattleConstCfg {
    /**怪物经验*/
    monsterExp: Map<number, number>
    /**最大可使用道具数量*/
    maxUseItemCnt: number
    /**等级配置表*/
    levelCfgs: table.guardship.GuardShipLevelConfig[]
    /**最大怪物上限 达到上限后不继续出怪了 0代表不限制*/
    maxMonsterCnt:number
}

export class GuardShipStuffEffect {
    /**当前经验增加比率，万分比*/
    expRatio: number
    /**多选一个Buff概率，万分比*/
    extraBuffRate: number
    /**Buff额外备选数量*/
    extraBuffOptionalCount: number
    /**道具额外掉落概率*/
    extraItemDropRate: number

    public reset(): void {
        this.expRatio = 0
        this.extraBuffRate = 0
        this.extraBuffOptionalCount = 0
        this.extraItemDropRate = 0
    }
}

/**
 * 守卫母舰战斗数据vo
 * */
export class GuardShipBattleVo {
    /**副本配置*/
    protected _instanceCfg: table.guardship.GuardShipInstanceConfig
    /**波次配置列表*/
    protected _roundCfgs: table.guardship.GuardShipRoundConfig[] = null
    /**当前等级下标*/
    protected _curLevelIdx: number
    protected _curLevelCfg: table.guardship.GuardShipLevelConfig
    protected _curRoundCfg: table.guardship.GuardShipRoundConfig
    protected _nextRoundCfg: table.guardship.GuardShipRoundConfig
    /**当前波次下标*/
    protected _curRoundIdx: number
    /**当前经验值*/
    protected _curExp: number

    /**静态配置初始化之后就不会改变的*/
    constCfg: IGuardShipBattleConstCfg
    /**服务器传过来的业务相关参数*/
    stuffEffect:GuardShipStuffEffect = new GuardShipStuffEffect()

    /**等待创建怪物*/
    waitCreateMonster: boolean;

    /**等待向服务器请求的经验值*/
    cacheAddExp: number = 0
    /**下一波延时时间*/
    nextRoundDelay: number
    /**触发buff选择列表 可能连续触发多次 所有用列表*/
    waitSelectBuffs: IGuardShipBattleSelectBuff[] = []
    /**当前已拥有道具id*/
    curPropIds: number[] = []
    /**boss怪物数量记录 key为resourceId(唯一性)*/
    bossMonsterCntMap: Map<number, number> = new Map()
    /**全部怪物数量记录 key为resourceId(唯一性)*/
    allMonsterCntMap: Map<number, number> = new Map()

    /**重置*/
    public reset(): void {
        this._instanceCfg = null
        this.nextRoundDelay = 0
        this._curExp = 0
        this.stuffEffect.reset()
        this.cacheAddExp = 0
        this.waitSelectBuffs.length = 0
        this.curPropIds.length = 0
        this.bossMonsterCntMap.clear()
        this.allMonsterCntMap.clear()
        this.waitCreateMonster = false
    }

    /**初始化*/
    public init(instaceCfg: table.guardship.GuardShipInstanceConfig, roundCfgs: table.guardship.GuardShipRoundConfig[]): void {
        this.reset()
        this._instanceCfg = instaceCfg
        this._roundCfgs = roundCfgs
        this._curLevelIdx = -1
        this.curLevelIdx = 0
        this._curRoundIdx = -2
        this.curRoundIdx = -1
    }

    public get battleConfigId(): number {
        return this._instanceCfg ? this._instanceCfg.battleConfigId : 0
    }

    /**当前关卡配置*/
    public get instanceCfg(): table.guardship.GuardShipInstanceConfig {
        return this._instanceCfg
    }

    /**当前经验值*/
    public get curExp(): number {
        return this._curExp
    }

    /**增加经验值*/
    protected set curExp(value: number) {
        if (this._curExp != value) {
            this._curExp = value
            while (this.isLevelMax() == false && this._curExp >= this.curLevelCfg?.minExp) {
                this.curLevelIdx++
            }
        }
    }

    /**增加经验值*/
    public addExp(value: number): void {
        let realAddExp = Math.floor(value + value * this.stuffEffect.expRatio / 1000)
        if (realAddExp != 0) {
            this.cacheAddExp += realAddExp
            this.curExp += realAddExp
        }
    }

    /**根据服务端数据重置经验*/
    public resetExpByServer(serverExp: number): void {
        let realAddExp = serverExp + this.cacheAddExp
        if (realAddExp != 0) {
            this.curExp = realAddExp
        }
    }

    /**当前等级下标*/
    public get curLevelIdx(): number {
        return this._curLevelIdx
    }

    /**当前等级下标*/
    public set curLevelIdx(value: number) {
        if (this._curLevelIdx != value) {
            this._curLevelIdx = value
            if (this._curLevelIdx >= 0 && this._curLevelIdx < this.constCfg.levelCfgs?.length) {
                this._curLevelCfg = this.constCfg.levelCfgs[this._curLevelIdx]
            } else {
                this._curLevelCfg = null
            }
        }
    }

    /**当前等级配置*/
    public get curLevelCfg(): table.guardship.GuardShipLevelConfig {
        return this._curLevelCfg
    }

    /**上一个等级配置*/
    public get lastLevelCfg(): table.guardship.GuardShipLevelConfig {
        if (this.curLevelIdx > 0 && this.curLevelIdx <= this.constCfg.levelCfgs?.length) {
            return this.constCfg.levelCfgs[this.curLevelIdx - 1]
        }
        return null
    }

    /**当前波次下标*/
    public get curRoundIdx(): number {
        return this._curRoundIdx
    }

    /**当前波次下标*/
    public set curRoundIdx(value: number) {
        if (this._curRoundIdx != value) {
            this._curRoundIdx = value
            if (this._curRoundIdx >= 0 && this._curRoundIdx < this._roundCfgs?.length) {
                this._curRoundCfg = this._roundCfgs[this._curRoundIdx]
            } else {
                this._curRoundCfg = null
            }
            if (this._curRoundIdx >= -1 && this._curRoundIdx < this._roundCfgs?.length - 1) {
                this._nextRoundCfg = this._roundCfgs[this._curRoundIdx + 1]
            } else {
                this._nextRoundCfg = null
            }
        }
    }

    /**当前波次配置*/
    public get curRoundCfg(): table.guardship.GuardShipRoundConfig {
        return this._curRoundCfg
    }

    /**下一波波次配置*/
    public get nextRoundCfg(): table.guardship.GuardShipRoundConfig {
        return this._nextRoundCfg
    }

    /**所有波次配置*/
    public get roundCfgs(): table.guardship.GuardShipRoundConfig[] {
        return this._roundCfgs
    }

    /**是否是boss波次*/
    public isBossRound(): boolean {
        return this.curRoundCfg != null && ServerEnums.GuardShipRoundType[this.curRoundCfg.roundType] == ServerEnums.GuardShipRoundType.BOSS
    }

    /**是否满足下一波召唤条件*/
    public isNextRoundCommingTime(): boolean {
        return this.nextRoundCfg != null && this.nextRoundDelay >= this.nextRoundCfg.delayTime
    }

    /**是否是最后一回合*/
    public isLastRound(): boolean {
        return this.curRoundIdx >= this.roundCfgs.length - 1
    }

    /**是否还有波次*/
    public hasRound(): boolean {
        return this.curRoundIdx < this.roundCfgs.length - 1
    }

    /**是否经验满了*/
    public isLevelExpFull(): boolean {
        return this.curExp >= this.curLevelCfg.minExp
    }

    /**是否满级*/
    public isLevelMax(): boolean {
        return this.curLevelIdx >= this.constCfg.levelCfgs.length - 1
    }

    /**添加怪物*/
    public addMonster(resourceId: number, isBoss: boolean = false, count: number = 1): void {
        let cnt = 0
        if (this.allMonsterCntMap.has(resourceId)) {
            cnt = this.allMonsterCntMap.get(resourceId)
        }
        cnt += count
        this.allMonsterCntMap.set(resourceId, cnt)
        if (isBoss) {
            cnt = 0
            if (this.bossMonsterCntMap.has(resourceId)) {
                cnt = this.bossMonsterCntMap.get(resourceId)
            }
            cnt += count
            this.bossMonsterCntMap.set(resourceId, cnt)
        }
    }

    /**删除怪物*/
    public deleteMonster(resourceId: number, count: number = 1): void {
        if (this.bossMonsterCntMap.has(resourceId)) {
            let cnt = this.bossMonsterCntMap.get(resourceId)
            cnt -= count
            if (cnt > 0) {
                this.bossMonsterCntMap.set(resourceId, cnt)
            } else {
                this.bossMonsterCntMap.delete(resourceId)
            }
        }
        if (this.allMonsterCntMap.has(resourceId)) {
            let cnt = this.allMonsterCntMap.get(resourceId)
            cnt -= count
            if (cnt > 0) {
                this.allMonsterCntMap.set(resourceId, cnt)
            } else {
                this.allMonsterCntMap.delete(resourceId)
            }
        }
    }

    /**是否已经没有BOSS了*/
    public hasNoBoss(): boolean {
        return this.bossMonsterCntMap.size <= 0 && this.waitCreateMonster == false
    }

    /**是否已经没有怪物了*/
    public hasNoMonster(): boolean {
        return this.allMonsterCntMap.size <= 0 && this.waitCreateMonster == false
    }
}