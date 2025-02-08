import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableConstUtils } from "../../../../core/utils/TableConstUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeroManager } from "../../hero/HeroManager";
import { WeaponManager } from "../../weapon/WeaponManager";
import { IllustrationsController } from "../IllustrationsController";
import { IllustrationsConstCfg } from "./vo/IllustrationsConstCfg";

/**图鉴积分变更来源*/
export enum IllustrationsScoreChangeFrom {
    heroActive = 1,
    heroUpStar,
    weaponActive,
    weaponUpStar,
    petActive,
    petUpStar,
    allHero,
    allPet,
    allWeapon,
    allCollect,
}

/**积分变更数据*/
export interface IllustrationsScoreChangeData {
    /**英雄id或者武器id 看from来源*/
    id: number
    from: IllustrationsScoreChangeFrom
    /**变更积分值*/
    score: number
}

/**英雄图鉴数据*/
export interface IllustrationsHeroCfg {
    /**英雄配置数据*/
    cfg: table.hero.HeroConfig,
    /**当前积分状态(每次打开界面调用刷新)*/
    state?: IllustrationsScoreState
    /**当前展示分数*/
    score?: number
    /**当前星级(未获得就是-1)*/
    curStar?: number
    /**展示星级*/
    showStar?: number
}

/**武器图鉴数据*/
export interface IllustrationsWeaponCfg {
    /**武器配置*/
    cfg: table.awakeweapon.AwakeWeaponConfig
    /**武器对应道具配置*/
    itemCfg: table.item.ItemConfig
    /**当前积分状态(每次打开界面调用刷新)*/
    state?: IllustrationsScoreState
    /**当前展示分数*/
    score?: number
    /**当前星级(未获得就是-1)*/
    curStar?: number
}

/**宠物图鉴数据*/
export interface IllustrationsPetCfg {
    /**宠物配置*/
    cfg: table.pet.PetConfig
    /**宠物对应道具配置*/
    itemCfg: table.item.ItemConfig
    /**当前积分状态(每次打开界面调用刷新)*/
    state?: IllustrationsScoreState
    /**当前展示分数*/
    score?: number
    /**当前星级(未获得就是-1)*/
    curStar?: number
}

/**图鉴积分领取状态*/
export enum IllustrationsScoreState {
    /**不可领取*/
    NotDraw = 1,
    /**可领取*/
    CanDraw,
    /**已经全部领取完成*/
    DrewAll
}

/**
 * 图鉴模块定义信息
 * @author GameCreator
 */
export class IllustrationsModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 23

    protected _constCfg: IllustrationsConstCfg = null

    /**当前奖励等级*/
    protected _rewardLv: number = 0
    /**当前积分*/
    protected _score: number = 0
    /**当前英雄领取状态 数据不存在就是未激活 0星代表激活了 但是没升星*/
    protected _heroStarMap: Map<number, number> = new Map()
    /**当前武器领取状态 数据不存在就是未激活 0星代表激活了 但是没升星*/
    protected _weaponStarMap: Map<number, number> = new Map()
    /**当前宠物领取状态 数据不存在就是未激活 0星代表激活了 但是没升星*/
    protected _petStarMap: Map<number, number> = new Map()
    /**英雄配置列表*/
    protected _heroCfgs: IllustrationsHeroCfg[] = []
    /**武器配置列表*/
    protected _weaponCfgs: IllustrationsWeaponCfg[] = []
    /**宠物配置列表*/
    protected _petCfgs: IllustrationsPetCfg[] = []
    /**激活和升星积分配置*/
    protected _scoreCfgMap: Map<string, number> = new Map()

    /**图鉴英雄阵容最小值*/
    public minHeroCamp: number = 1
    /**图鉴英雄阵容最大值*/
    public maxHeroCamp: number = 4

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
        this.registerMsg(moduleId, 1, this.recDrawActiveHeroScore)
        this.registerMsg(moduleId, 2, this.recDrawHeroUpStarScore)
        this.registerMsg(moduleId, 3, this.recDrawActiveAwakeWeaponScore)
        this.registerMsg(moduleId, 4, this.recDrawAwakeWeaponUpStarScore)
        this.registerMsg(moduleId, 5, this.recDrawLevelReward)
        this.registerMsg(moduleId, 6, this.recDrawPetUpStarScore)
        this.registerMsg(moduleId, 7, this.recDrawActivePetScore)

        this.registerMsg(moduleId, 10, this.onOneKeyHeroScore)
        this.registerMsg(moduleId, 11, this.onOneKeyWeaponScore)
        this.registerMsg(moduleId, 12, this.onOneKeyPetScore)
        this.registerMsg(moduleId, 13, this.onOneKeyCollectScore)
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_ACTIVER,
        ]
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_ACTIVER:
                this.sortPetCfgs()
                break
        }
    }

    /**初始化帐数据 */
    public initData(vo: Vo.illustrations.IllustrationsLoginVo): void {
        this.clearData()
        if (this._constCfg == null) {
            let heroStr = TableConstUtils.getConstConfig(table.illustrations.IllustrationsConstantConfig, 'ILLUSTRATIONS:ONLY_SHOW_WHEN_ACTIVE_HEROID')
            let heros: number[] = []
            if (heroStr) {
                heros = heroStr.split(';').map(Number)
            }

            let qualityStr = TableConstUtils.getConstConfig(table.illustrations.IllustrationsConstantConfig, 'ILLUSTRATIONS:ONLY_SHOW_WHEN_ACTIVE_QUAILTYS')
            let qualitys: number[] = []
            if (qualityStr) {
                qualitys = qualityStr.split(';').map(Number)
            }

            this._constCfg = {
                onlyShowWhenActiveHeros: heros,
                onlyShowWhenActiveQuailtys: qualitys
            }
        }
        this._score = vo.score
        this._rewardLv = vo.drawRewardLevel

        //角色星级记录
        vo.activeHeroBaseIds?.forEach((value) => {
            this._heroStarMap.set(value, 0)
        })
        for (let id in vo.heroUpStarMap) {
            this._heroStarMap.set(Number(id), Number(vo.heroUpStarMap[id]))
        }

        //武器星级记录
        vo.activeAwakeWeaponBaseIds?.forEach((value) => {
            this._weaponStarMap.set(value, 0)
        })
        for (let id in vo.awakeWeaponUpStarMap) {
            this._weaponStarMap.set(Number(id), Number(vo.awakeWeaponUpStarMap[id]))
        }

        //宠物星级记录
        vo.activePetBaseIds?.forEach((value) => {
            this._petStarMap.set(value, 0)
        })
        for (let id in vo.petUpStarMap) {
            this._petStarMap.set(Number(id), Number(vo.petUpStarMap[id]))
        }

        //构建图鉴列表
        if (this._heroCfgs.length == 0) {
            let cfgs = G.TableManager.getAllData(table.hero.HeroConfig);
            cfgs.forEach((cfg) => {
                let data: IllustrationsHeroCfg = {
                    cfg: cfg
                }
                this._heroCfgs.push(data)
            })
            this.sortHeroCfgs()
        }
        if (this._weaponCfgs.length == 0) {
            let weaponCfgs = G.TableManager.getAllData(table.awakeweapon.AwakeWeaponConfig)
            weaponCfgs.forEach((cfg) => {
                let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.id)
                if (itemCfg) {
                    let data: IllustrationsWeaponCfg = {
                        cfg: cfg,
                        itemCfg: itemCfg
                    }
                    this._weaponCfgs.push(data)
                }
            })
        }
        // this.sortWeaponCfgs() //updateAllWeaponStateAndScore会调用排序

        if (this._petCfgs.length == 0) {
            let petCfgs = G.TableManager.getAllData(table.pet.PetConfig)
            petCfgs.forEach((cfg) => {
                let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, cfg.id)
                if (itemCfg) {
                    let data: IllustrationsPetCfg = {
                        cfg: cfg,
                        itemCfg: itemCfg
                    }
                    this._petCfgs.push(data)
                }
            })
        }

        //构建积分配置数据
        if (this._scoreCfgMap.size == 0) {
            let cfgs = G.TableManager.getAllData(table.illustrations.IllustrationsScoreConfig)
            cfgs.forEach((value) => {
                this._scoreCfgMap.set(`${value.type}_${value.param.split(',').join('_')}`, value.score)
            })
        }
        this.updateAllHeroStateAndScore()
        this.updateAllWeaponStateAndScore()
        this.updateAllPetStateAndScore()
        this.emit(NotificationKey.ILLUSTRATIONS_INIT_COMPLETE)
    }

    public clearData(): void {
        this._rewardLv = 0
        this._score = 0
        this._heroStarMap.clear()
        this._weaponStarMap.clear()
    }

    /*********************************数据处理*********************************/

    public get constCfg(): IllustrationsConstCfg {
        return this._constCfg
    }

    /**是否只激活后展示*/
    public isHeroShowOnlyActive(heroId: number): boolean {
        if (this._constCfg?.onlyShowWhenActiveHeros?.indexOf(heroId) != -1) {
            return true
        }
    }

    /**是否只激活后展示*/
    public isWeaponShowOnlyActive(cfg: IllustrationsWeaponCfg): boolean {
        if (this._constCfg?.onlyShowWhenActiveQuailtys?.indexOf(cfg.itemCfg.quality) != -1) {
            return true
        }
    }

    /**英雄列表排序*/
    public sortHeroCfgs(): void {
        this._heroCfgs.sort((a, b) => {
            if (a.cfg.quality != b.cfg.quality) {
                return b.cfg.quality - a.cfg.quality
            } else {
                return b.cfg.id - a.cfg.id
            }
        })
    }

    /**武器列表排序*/
    public sortWeaponCfgs(): void {
        this._weaponCfgs.sort((a, b) => {
            let starA = -1
            let starB = -1
            if (this._weaponStarMap.has(a.cfg.id)) {
                starA = this._weaponStarMap.get(a.cfg.id)
            }
            if (this._weaponStarMap.has(b.cfg.id)) {
                starB = this._weaponStarMap.get(b.cfg.id)
            }
            if ((starA == -1 || starB == -1) && starA != starB) {
                //有一个武器未激活 激活的排在前面
                return starB - starA
            } else if (starA == -1 && starB == -1) {
                //都未激活
                let canActiveA = WeaponManager.ins().getWeaponVoByBaseId(a.cfg.id) != null
                let canActiveB = WeaponManager.ins().getWeaponVoByBaseId(b.cfg.id) != null
                if (canActiveA != canActiveB) {
                    //可激活放在前面
                    return canActiveA ? -1 : 1
                }
            }
            if (a.itemCfg.quality != b.itemCfg.quality) {
                //品质高的排前面
                return b.itemCfg.quality - a.itemCfg.quality
            } else {
                return a.cfg.id - b.cfg.id
            }
        })
    }

    /**宠物列表排序*/
    public sortPetCfgs(): void {
        let context = GIns.petModel.petContext, backpackMgr = GIns.backpackMgr
        this._petCfgs.sort((a, b) => {
            // 排序规则：已激活>可激活>未激活 品质高>品质低；星灵ID小>星灵ID大
            let cfgA = a.cfg, cfgB = b.cfg
            let sa: number, sb: number
            let activeStarA = this.getPetStar(cfgA.id)
            let activeStarB = this.getPetStar(cfgB.id)
            if (activeStarA > -1) {
                //已激活
                sa = 1
            } else {
                let petVoA = context.getDataByCfgId(a.cfg.id)
                if (petVoA && petVoA.active) {
                    //可激活
                    sa = 2
                } else {
                    //未激活
                    sa = 3
                }

            }

            if (activeStarB > -1) {
                sb = 1
            } else {
                let petVoB = context.getDataByCfgId(b.cfg.id)
                if (petVoB && petVoB.active) {
                    sb = 2
                } else {
                    sb = 3
                }
            }

            // 已激活>可激活>未激活
            if (sa != sb) {
                return sa - sb
            }

            //品质高>品质低
            if (cfgA.quality != cfgB.quality) {
                return cfgB.quality - cfgA.quality
            }

            //星灵ID小>星灵ID大
            return cfgA.id - cfgB.id

        })
    }

    /**更新全部英雄的状态和积分*/
    public updateAllHeroStateAndScore(): void {
        this._heroCfgs.forEach((value) => {
            this.updateHeroStateAndScore(value)
        })
    }

    /**更新单个英雄的状态和积分*/
    public updateHeroStateAndScore(data: IllustrationsHeroCfg): void {
        let heroVo = HeroManager.ins().getHeroVoByID(data.cfg.id)
        let curStar = -1
        if (heroVo?.heroVoData?.isActivate) {
            curStar = heroVo.star
        }
        let activeStar = this.getHeroStar(data.cfg.id)
        let showStar = Math.max(heroVo ? heroVo.heroCfg.initStar : 0, activeStar)
        //默认不可领取
        let state = IllustrationsScoreState.NotDraw
        let score = this.getHeroNextScore(data)
        if (score == 0) {
            //代表奖励领取完了
            state = IllustrationsScoreState.DrewAll
        } else {
            if (activeStar == -1) {
                //未激活状态
                if (curStar > 0) {
                    //可激活
                    state = IllustrationsScoreState.CanDraw
                }
            } else if (activeStar == 0) {
                //刚激活
                if (curStar > data.cfg.initStar) {
                    //已升星
                    state = IllustrationsScoreState.CanDraw
                }
            } else if (activeStar < curStar) {
                //升星了
                state = IllustrationsScoreState.CanDraw
            }
        }
        data.curStar = curStar
        data.showStar = showStar
        data.score = score
        data.state = state
    }

    /**更新单个英雄的状态和积分*/
    public updateHeroStateAndScoreById(heroId: number): void {
        let data = this._heroCfgs.find((value) => value.cfg.id == heroId)
        if (data) {
            this.updateHeroStateAndScore(data)
        }
    }

    /**更新全部武器的状态和积分*/
    public updateAllWeaponStateAndScore(): void {
        this._weaponCfgs.forEach((value) => {
            this.updateWeaponStateAndScore(value)
        })
        this.sortWeaponCfgs()
    }

    /**更新单个武器的状态和积分*/
    public updateWeaponStateAndScore(data: IllustrationsWeaponCfg): void {
        let weaponVo = WeaponManager.ins().getMaxStarWeaponVoByBaseId(data.cfg.id)
        let curStar = weaponVo ? weaponVo.base.star : -1
        let activeStar = this.getWeaponStar(data.cfg.id)

        //默认不可领取
        let state = IllustrationsScoreState.NotDraw
        let score = this.getWeaponNextScore(data)
        if (score == 0) {
            //代表没有奖励可领取了
            state = IllustrationsScoreState.DrewAll
        } else {

            if (activeStar == -1) {
                //未激活状态
                if (curStar >= 0) {
                    //可激活
                    state = IllustrationsScoreState.CanDraw
                }
            } else if (activeStar < curStar) {
                //升星了
                state = IllustrationsScoreState.CanDraw
            }
        }
        data.curStar = curStar
        data.score = score
        data.state = state
    }

    /**更新单个武器的状态和积分*/
    public updateWeaponStateAndScoreById(weaponId: number): void {
        let data = this._weaponCfgs.find((value) => value.cfg.id == weaponId)
        if (data) {
            this.updateWeaponStateAndScore(data)
        }
    }

    /**更新全部宠物的状态和积分*/
    public updateAllPetStateAndScore(): void {
        this._petCfgs.forEach((value) => {
            this.updatePetStateAndScore(value)
        })
        this.sortPetCfgs()
    }

    /**更新单个宠物的状态和积分*/
    public updatePetStateAndScore(data: IllustrationsPetCfg): void {
        let petVo = GIns.petModel.petContext.getDataByCfgId(data.cfg.id)
        let curStar = petVo?.star || -1
        let activeStar = this.getPetStar(data.cfg.id)

        //默认不可领取
        let state = IllustrationsScoreState.NotDraw
        let score = this.getPetNextScore(data)
        if (score == 0) {
            //代表奖励领完了
            state = IllustrationsScoreState.DrewAll
        } else {
            if (activeStar == -1) {
                //未激活状态
                if (petVo.active) {
                    //可激活
                    state = IllustrationsScoreState.CanDraw
                }
            } else if (activeStar < curStar) {
                //升星了
                state = IllustrationsScoreState.CanDraw
            }
        }

        data.curStar = curStar
        data.score = score
        data.state = state
    }

    /**更新单个宠物的状态和积分*/
    public updatePetStateAndScoreById(petCfgId: number): void {
        let data = this._petCfgs.find((value) => value.cfg.id == petCfgId)
        if (data) {
            this.updatePetStateAndScore(data)
        }
    }

    protected getHeroActiveScoreKey(quality: number): string {
        return `ACTIVE_HERO_${quality}`
    }

    protected getHeroUpStarScoreKey(quality: number, star: number): string {
        return `HERO_UP_STAR_${quality}_${star}`
    }

    protected getWeaponActiveScoreKey(quality: number): string {
        return `ACTIVE_AWAKE_WEAPON_${quality}`
    }

    protected getWeaponUpStarScoreKey(quality: number, star: number): string {
        return `AWAKE_WEAPON_UP_STAR_${quality}_${star}`
    }

    protected getPetActiveScoreKey(quality: number): string {
        return `ACTIVE_PET_${quality}`
    }

    protected getPetUpStarScoreKey(quality: number, star: number): string {
        return `PET_UP_STAR_${quality}_${star}`
    }

    /**获取英雄图鉴列表*/
    public get heros(): IllustrationsHeroCfg[] {
        return this._heroCfgs
    }

    /**获取武器图鉴列表*/
    public get weapons(): IllustrationsWeaponCfg[] {
        return this._weaponCfgs
    }

    /**获取宠物提交列表*/
    public get pets(): IllustrationsPetCfg[] {
        return this._petCfgs
    }

    /**当前积分*/
    public get score(): number {
        return this._score
    }

    /**当前已领取奖励等级*/
    public get rewardLv(): number {
        return this._rewardLv
    }

    public getScoreByKey(key: string): number {
        if (this._scoreCfgMap.has(key)) {
            return this._scoreCfgMap.get(key)
        }
        return 0
    }

    /**获取英雄下一级解锁或者升星积分*/
    public getHeroNextScore(heroCfg: IllustrationsHeroCfg): number {
        let curStar = this.getHeroStar(heroCfg.cfg.id)
        let key: string = ''
        if (curStar == -1) {
            //代表未激活 展示激活积分
            key = this.getHeroActiveScoreKey(heroCfg.cfg.quality)
        } else {
            if (curStar == 0) {
                //代表只有激活没有升星
                curStar = heroCfg.cfg.initStar
            }
            key = this.getHeroUpStarScoreKey(heroCfg.cfg.quality, curStar + 1)
        }
        return this.getScoreByKey(key)
    }

    /**获取武器下一级解锁或者升星积分*/
    public getWeaponNextScore(waponCfg: IllustrationsWeaponCfg): number {
        let curStar = this.getWeaponStar(waponCfg.cfg.id)
        let key: string = ''
        if (curStar == -1) {
            //代表未激活 展示激活积分
            key = this.getWeaponActiveScoreKey(waponCfg.itemCfg.quality)
        } else {
            key = this.getWeaponUpStarScoreKey(waponCfg.itemCfg.quality, curStar + 1)
        }
        return this.getScoreByKey(key)
    }
    /**获取武器下一级解锁或者升星积分*/
    public getPetNextScore(petCfg: IllustrationsPetCfg): number {
        let curStar = this.getPetStar(petCfg.cfg.id)
        let key = ""
        if (curStar == -1) {
            //代表未激活，展示激活积分
            key = this.getPetActiveScoreKey(petCfg.itemCfg.quality)
        } else {
            key = this.getPetUpStarScoreKey(petCfg.itemCfg.quality, curStar + 1)
        }
        return this.getScoreByKey(key)
    }

    /**获取当前已领取的英雄星级 尚未激活返回-1*/
    public getHeroStar(heroId: number): number {
        if (this._heroStarMap.has(heroId)) {
            return this._heroStarMap.get(heroId)
        }
        return -1
    }

    /**获取当前已领取的武器星级 尚未激活返回-1*/
    public getWeaponStar(weaponId: number): number {
        if (this._weaponStarMap.has(weaponId)) {
            return this._weaponStarMap.get(weaponId)
        }
        return -1
    }

    /**获取当前已领取的宠物星级 尚未激活返回-1*/
    public getPetStar(petCfgId: number): number {
        if (this._petStarMap.has(petCfgId)) {
            return this._petStarMap.get(petCfgId)
        }
        return -1
    }

    /**获取图鉴item背景url*/
    public getItemBgUrl(quality: number): string {
        let url = 'ui://illustrations/bg_quality1'
        switch (quality) {
            case 2:
                url = 'ui://illustrations/bg_quality1'
                break
            case 3:
                url = 'ui://illustrations/bg_quality2'
                break
            case 4:
                url = 'ui://illustrations/bg_quality3'
                break
            case 5:
                url = 'ui://illustrations/bg_quality4'
                break
            case 6:
                url = 'ui://illustrations/bg_quality5'
                break
            case 7:
                url = 'ui://illustrations/bg_quality6'
                break
            case 8:
                url = 'ui://illustrations/bg_quality7'
                break
        }
        return url
    }

    /*********************************协议发送*********************************/

    /**领取激活英雄的积分*/
    public sendDrawActiveHeroScore(c2s: Vo.illustrations.DrawActiveHeroScoreC2S): void {
        this.send(this.MODULE, 1, c2s)
    }

    /**领取英雄升星积分*/
    public sendDrawHeroUpStarScore(c2s: Vo.illustrations.DrawHeroUpStarScoreC2S): void {
        this.send(this.MODULE, 2, c2s)
    }

    /**领取激活武器的积分*/
    public sendDrawActiveAwakeWeaponScore(c2s: Vo.illustrations.DrawActiveAwakeWeaponScoreC2S): void {
        this.send(this.MODULE, 3, c2s)
    }

    /**领取武器升星积分*/
    public sendDrawAwakeWeaponUpStarScore(c2s: Vo.illustrations.DrawAwakeWeaponUpStarScoreC2S): void {
        this.send(this.MODULE, 4, c2s)
    }

    /**领取图鉴等级奖励*/
    public sendDrawLevelReward(c2s: Vo.illustrations.DrawLevelRewardC2S): void {
        this.send(this.MODULE, 5, c2s)
    }

    /**领取宠物升星积分*/
    public sendDrawPetUpStarScore(c2s: Vo.illustrations.DrawPetUpStarScoreC2S): void {
        this.send(this.MODULE, 6, c2s)
    }
    /**领取宠物激活积分*/
    public sendDrawActivePetScore(c2s: Vo.illustrations.DrawActivePetScoreC2S): void {
        this.send(this.MODULE, 7, c2s)
    }

    /**一键领取英雄积分*/
    public sendOneKeyHeroScore(): void {
        this.send(this.MODULE, 10)
    }

    /**一键领取激活武器的积分*/
    public sendOneKeyWeaponScore(): void {
        this.send(this.MODULE, 11)
    }

    /**一键领取激活宠物的积分*/
    public sendOneKeyPetScore(): void {
        this.send(this.MODULE, 12)
    }

    /**一键领取激活收藏品的积分*/
    public sendOneKeyCollectScore(): void {
        this.send(this.MODULE, 13)
    }

    /*********************************协议监听*********************************/

    /**领取激活英雄的积分返回*/
    protected recDrawActiveHeroScore(data: Vo.illustrations.DrawActiveHeroScoreS2C): void {
        if (data.code < 0) {
            return
        }
        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._heroStarMap.set(data.content.drawHeroBaseId, 0)
        this.updateHeroStateAndScoreById(data.content.drawHeroBaseId)
        this.emit(NotificationKey.ILLUSTRATIONS_HERO_CHANGE, data.content.drawHeroBaseId)
        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.drawHeroBaseId,
            from: IllustrationsScoreChangeFrom.heroActive,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**领取英雄升星积分返回*/
    protected recDrawHeroUpStarScore(data: Vo.illustrations.DrawHeroUpStarScoreS2C): void {
        if (data.code < 0) {
            return
        }
        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._heroStarMap.set(data.content.heroBaseId, data.content.maxStar)
        this.updateHeroStateAndScoreById(data.content.heroBaseId)
        this.emit(NotificationKey.ILLUSTRATIONS_HERO_CHANGE, data.content.heroBaseId)
        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.heroBaseId,
            from: IllustrationsScoreChangeFrom.heroUpStar,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**领取激活武器的积分返回*/
    protected recDrawActiveAwakeWeaponScore(data: Vo.illustrations.DrawActiveAwakeWeaponScoreS2C): void {
        if (data.code < 0) {
            return
        }
        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._weaponStarMap.set(data.content.drawWeaponBaseId, 0)
        this.updateWeaponStateAndScoreById(data.content.drawWeaponBaseId)
        this.sortWeaponCfgs()
        this.emit(NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE, data.content.drawWeaponBaseId)
        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.drawWeaponBaseId,
            from: IllustrationsScoreChangeFrom.weaponActive,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**领取武器升星积分返回*/
    protected recDrawAwakeWeaponUpStarScore(data: Vo.illustrations.DrawAwakeWeaponUpStarScoreS2C): void {
        if (data.code < 0) {
            return
        }
        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._weaponStarMap.set(data.content.weaponBaseId, data.content.maxStar)
        this.updateWeaponStateAndScoreById(data.content.weaponBaseId)
        this.sortWeaponCfgs()
        this.emit(NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE, data.content.weaponBaseId)
        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.weaponBaseId,
            from: IllustrationsScoreChangeFrom.weaponUpStar,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**领取图鉴等级奖励返回*/
    protected recDrawLevelReward(data: Vo.illustrations.DrawLevelRewardS2C): void {
        if (data.code < 0) {
            return
        }
        this._rewardLv = data.content.drawRewardLevel
        if (data.content.rewardResults?.length > 0) {
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, data.content.rewardResults);
        }
        this.emit(NotificationKey.ILLUSTRATIONS_REWARD_LV_CHANGE, this._rewardLv)
    }

    /**领取宠物升星积分返回*/
    protected recDrawPetUpStarScore(data: Vo.illustrations.DrawPetUpStarScoreS2C) {
        if (data.code < 0) {
            return
        }

        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._petStarMap.set(data.content.petBaseId, data.content.maxStar)
        this.updatePetStateAndScoreById(data.content.petBaseId)
        this.sortPetCfgs()
        this.emit(NotificationKey.ILLUSTRATIONS_PET_CHANGE, data.content.petBaseId)

        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.petBaseId,
            from: IllustrationsScoreChangeFrom.petUpStar,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**领取宠物激活积分返回*/
    protected recDrawActivePetScore(data: Vo.illustrations.DrawActivePetScoreS2C) {
        if (data.code < 0) {
            return
        }

        let addScore: number = data.content.score - this._score
        this._score = data.content.score
        this._petStarMap.set(data.content.drawPetBaseId, 0)
        this.updatePetStateAndScoreById(data.content.drawPetBaseId)
        this.sortPetCfgs()
        this.emit(NotificationKey.ILLUSTRATIONS_PET_CHANGE, data.content.drawPetBaseId)
        let scoreData: IllustrationsScoreChangeData = {
            id: data.content.drawPetBaseId,
            from: IllustrationsScoreChangeFrom.petActive,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }


    /**一键领取英雄积分*/
    private onOneKeyHeroScore(data: Vo.illustrations.OneKeyDrawHeroScoreS2C): void {
        if (data.code < 0) {
            return
        }

        let addScore: number = data.content.score - this._score
        this._score = data.content.score

        for (let i = 0; i < data.content.activeHeroBaseIds.length; i++) {
            this._heroStarMap.set(+data.content.activeHeroBaseIds[i], 0)
            this.updateHeroStateAndScoreById(+data.content.activeHeroBaseIds[i])
        }

        for (let heroId in data.content.heroUpStarMap) {
            this._heroStarMap.set(+heroId, data.content.heroUpStarMap[heroId])
            this.updateHeroStateAndScoreById(+heroId)
        }

        IllustrationsController.ins().checkAllHeroRedDot()

        this.emit(NotificationKey.ILLUSTRATIONS_ONE_KEY)
        let scoreData: IllustrationsScoreChangeData = {
            id: 0,
            from: IllustrationsScoreChangeFrom.allHero,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**一键领取激活武器的积分*/
    private onOneKeyWeaponScore(data: Vo.illustrations.OneKeyDrawAwakeWeaponScoreS2C): void {
        if (data.code < 0) {
            return
        }

        let addScore: number = data.content.score - this._score
        this._score = data.content.score


        for (let i = 0; i < data.content.activeAwakeWeaponBaseIds.length; i++) {
            this._weaponStarMap.set(+data.content.activeAwakeWeaponBaseIds[i], 0)
            this.updateWeaponStateAndScoreById(+data.content.activeAwakeWeaponBaseIds[i])
        }

        for (let heroId in data.content.awakeWeaponUpStarMap) {
            this._weaponStarMap.set(+heroId, data.content.awakeWeaponUpStarMap[heroId])
            this.updateWeaponStateAndScoreById(+heroId)
        }
        // this._weaponStarMap.set(data.content.drawWeaponBaseId, 0)
        // this.updateWeaponStateAndScoreById(data.content.drawWeaponBaseId)
        this.sortWeaponCfgs()

        IllustrationsController.ins().checkAllWeaponRedDot()
        this.emit(NotificationKey.ILLUSTRATIONS_ONE_KEY)

        let scoreData: IllustrationsScoreChangeData = {
            id: 0,
            from: IllustrationsScoreChangeFrom.allWeapon,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**一键领取激活宠物的积分*/
    private onOneKeyPetScore(data: Vo.illustrations.OneKeyDrawPetScoreS2C): void {
        if (data.code < 0) {
            return
        }

        let addScore: number = data.content.score - this._score
        this._score = data.content.score

        for (let i = 0; i < data.content.activePetBaseIds.length; i++) {
            this._petStarMap.set(+data.content.activePetBaseIds[i], 0)
            this.updatePetStateAndScoreById(+data.content.activePetBaseIds[i])
        }

        for (let heroId in data.content.petUpStarMap) {
            this._petStarMap.set(+heroId, data.content.petUpStarMap[heroId])
            this.updatePetStateAndScoreById(+heroId)
        }

        // this._petStarMap.set(data.content.petBaseId, data.content.maxStar)
        // this.updatePetStateAndScoreById(data.content.petBaseId)
        this.sortPetCfgs()
        // this.emit(NotificationKey.ILLUSTRATIONS_PET_CHANGE, data.content.petBaseId)
        IllustrationsController.ins().checkAllPetRedDot()
        this.emit(NotificationKey.ILLUSTRATIONS_ONE_KEY)

        let scoreData: IllustrationsScoreChangeData = {
            id: 0,
            from: IllustrationsScoreChangeFrom.allPet,
            score: addScore
        }
        this.emit(NotificationKey.ILLUSTRATIONS_SCORE_CHANGE, scoreData)
    }

    /**一键领取激活收藏品的积分*/
    private onOneKeyCollectScore(data: Vo.illustrations.OneKeyDrawCollectiblesScoreS2C): void {
        if (data.code < 0) {
            return
        }
    }

    /*********************************协议推送*********************************/
}
