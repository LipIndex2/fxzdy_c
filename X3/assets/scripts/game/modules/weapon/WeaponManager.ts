import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { Attribute } from "../attr/AttrEnum";
import { AttrData, AttrManager } from "../attr/AttrManager";
import { HeroManager } from "../hero/HeroManager";
import { ItemUtils } from "../item/utils/ItemUtils";
import { WeaponI18nKeys } from "./const/WeaponI18nKeys";
import { WeaponVo } from "./vo/WeaponVo";


type WeaponVariableData = { id: number, baseId: number, star: number }
type WeaponIdChangeForHeroData = { oldData: WeaponVariableData, newData: WeaponVariableData }

/** 专武管理类 */
export class WeaponManager extends BaseSingleton {

    /** 所有武器vo数据 */
    private _allWeaponMap: Map<number, WeaponVo> = new Map();
    /** 所有武器vo数据列表 */
    private _allWeaponList: WeaponVo[] = []
    /** 所有武器vo数据 */
    private _allHeroWeaponMap: Map<number, WeaponVo> = new Map();
    /**是否出发排序*/
    protected _sortDirty: boolean = true

    /**最高星级*/
    protected _maxStar: number = 0

    constructor () {
        super();
    }

    public get maxStar(): number {
        if (this._maxStar <= 0) {
            let cfg: table.awakeweapon.AwakeWeaponConstantConfig = G.TableManager.getDataById(table.awakeweapon.AwakeWeaponConstantConfig, 'AWAKE_WEAPON:MAX_STAR')
            if (cfg) {
                this._maxStar = Number(cfg.content)
            } else {
                this._maxStar = 5
            }
        }
        return this._maxStar
    }

    public getWeaponTypeDes(type: string): string {
        let typeValue = ServerEnums.AwakeWeaponType[type]
        switch (typeValue) {
            case ServerEnums.AwakeWeaponType.GENERAL:
                return G.I18nManager.lang(WeaponI18nKeys.typeGeneral)
            case ServerEnums.AwakeWeaponType.EXCLUSIVE:
                return G.I18nManager.lang(WeaponI18nKeys.typeExclusive)
        }
        return ''
    }

    /**是否是专属*/
    public isExclusiveType(type: string): boolean {
        return ServerEnums.AwakeWeaponType[type] == ServerEnums.AwakeWeaponType.EXCLUSIVE
    }

    public getStarCfg(vo: WeaponVo): table.awakeweapon.AwakeWeaponStarConfig {
        let cfgList: table.awakeweapon.AwakeWeaponStarConfig[] = G.TableManager.getAllData(table.awakeweapon.AwakeWeaponStarConfig)
        let cfg: table.awakeweapon.AwakeWeaponStarConfig = cfgList?.find((value: table.awakeweapon.AwakeWeaponStarConfig) => {
            return value.quality == vo.itemCfg.quality && value.type == vo.cfg.type && value.star == vo.base.star + 1
        })
        return cfg
    }

    protected addAttrToMap(key: string, value: number, attrMap: Map<string, number>): Map<string, number> {
        let newVal: number = value
        if (attrMap?.has(key)) {
            newVal += attrMap.get(key)
        }
        attrMap.set(key, newVal)
        return attrMap
    }

    /**解析武器属性*/
    public converWeaponAttr(cfg: table.awakeweapon.AwakeWeaponConfig, star: number = 0): AttrData[] {
        let attrList: AttrData[] = []
        let attrMap: Map<string, number> = new Map()
        if (star > 0) {
            //有星级需要计算星级加成
            let nowStarAttrIndex = 0;
            for (let i = 1; i <= 5; i++) {
                if (star < i || !cfg[`star${i}Attrs`]) {
                    break;
                }
                nowStarAttrIndex = i;
            }
            let starAttrs = cfg[`star${nowStarAttrIndex}Attrs`];
            for (let key in starAttrs) {
                this.addAttrToMap(key, Number(starAttrs[key]), attrMap)
            }
        }
        else {
            for (let key in cfg.baseAttrs) {
                this.addAttrToMap(key, Number(cfg.baseAttrs[key]), attrMap)
            }
        }
        attrMap.forEach((value: number, key: string) => {
            let attr: AttrData = AttrManager.ins().convertDataFormat(key as Attribute, value)
            attrList.push(attr)
        })
        return attrList
    }

    /** 初始化武器信息 */
    public setWeaponData(vo: Vo.awakeweapon.AwakeWeaponLoginVo): void {
        this._allWeaponMap.clear()
        this._allHeroWeaponMap.clear()
        this.updateWeaponDatas(vo.weaponVos, true)
    }

    /**更新武器数据列表 返回更新的第一条数据*/
    public updateWeaponDatas(vos: Vo.awakeweapon.AwakeWeaponVo[], isInit: boolean = false): WeaponVo {
        let heroDataMap: Map<number, WeaponIdChangeForHeroData> = new Map()

        let weaponVos: WeaponVo[] = []
        vos.forEach((vo) => {
            this.recordHeroWeaponDataBefore(vo, heroDataMap)
            let weaponVo = this.updateWeaponData(vo)
            if (weaponVo) {
                weaponVos.push(weaponVo)
            }
            this.recordHeroWeaponDataAfter(vo, heroDataMap)
        })

        if (isInit == false && heroDataMap.size > 0) {
            //代表有角色的专武改变
            heroDataMap.forEach((value: WeaponIdChangeForHeroData, heroId: number) => {
                if (this.equalsWeaponVariableData(value.oldData, value.newData) == false) {
                    //代表武器变更
                    let heroVo = HeroManager.ins().getHeroVoByID(heroId)
                    if (heroVo) {
                        heroVo.updateFight()
                        // console.log('hero weapon change:', heroId, value.oldData, value.newData)
                        G.FacadeManager.emit(NotificationKey.WEAPON_CHANGE_FOR_HERO, heroId)
                    }
                }
            })
            heroDataMap.clear()
        }

        if (isInit == false && weaponVos.length > 0) {
            G.FacadeManager.emit(NotificationKey.WEAPON_ITEM_CHANGE, weaponVos)
        }
        return weaponVos.length > 0 ? weaponVos[0] : null
    }

    protected equalsWeaponVariableData(a: WeaponVariableData, b: WeaponVariableData): boolean {
        return a.baseId == b.baseId && a.star == b.star
    }

    protected createWeaponVariableData(vo: WeaponVo = null): WeaponVariableData {
        let data: WeaponVariableData = {
            id: 0,
            baseId: 0,
            star: 0
        }
        if (vo) {
            data.id = vo.base.id
            data.baseId = vo.base.baseId
            data.star = vo.base.star
        }
        return data
    }

    protected recordHeroWeaponDataBefore(vo: Vo.awakeweapon.AwakeWeaponVo,
        map: Map<number, WeaponIdChangeForHeroData>
    ): void {
        let heroWeapon: WeaponVo = this.getWeaponVo(vo.id)
        if (heroWeapon && heroWeapon.base.heroBaseId > 0) {
            map.set(heroWeapon.base.heroBaseId, {
                oldData: this.createWeaponVariableData(heroWeapon),
                newData: this.createWeaponVariableData()
            })
        }
    }

    protected recordHeroWeaponDataAfter(vo: Vo.awakeweapon.AwakeWeaponVo,
        map: Map<number, WeaponIdChangeForHeroData>
    ): void {
        let heroWeapon: WeaponVo = this.getWeaponForHero(vo.heroBaseId)
        if (heroWeapon) {
            let changeData: WeaponIdChangeForHeroData = map.get(heroWeapon.base.heroBaseId)
            if (changeData == null) {
                //没有旧数据 初始化
                changeData = { oldData: this.createWeaponVariableData(), newData: this.createWeaponVariableData() }
                map.set(heroWeapon.base.heroBaseId, changeData)
            }
            changeData.newData.id = heroWeapon.base.id
            changeData.newData.baseId = heroWeapon.base.baseId
            changeData.newData.star = heroWeapon.base.star
        }
    }

    /**更新单个武器信息 不能直接调用 需要调用updateWeaponDatas*/
    protected updateWeaponData(vo: Vo.awakeweapon.AwakeWeaponVo): WeaponVo {
        let data: WeaponVo = this._allWeaponMap.get(vo.id)
        let oldBaseId: number = -1
        let oldStar: number = -1
        let oldHero: number = -1
        if (data != null) {
            oldBaseId = data.base.baseId
            oldStar = data.base.star
            oldHero = data.base.heroBaseId
            data.base = vo
        } else {
            data = new WeaponVo()
            data.base = vo
            this._allWeaponMap.set(data.base.id, data)
        }

        if (oldBaseId != data.base.baseId) {
            //基础变了 需要重新拿配置文件
            let weaponCfg: table.awakeweapon.AwakeWeaponConfig = G.TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, data.base.baseId)
            if (weaponCfg) {
                data.cfg = weaponCfg
            }
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, data.base.baseId)
            if (itemCfg) {
                data.itemCfg = itemCfg
            }
            if (data.cfg == null || data.itemCfg == null) {
                this._allWeaponMap.delete(data.base.id)
                return null
            }
        }


        if (oldStar != data.base.star) {
            //武器星级改变需要重新计算属性
            data.attrs = this.converWeaponAttr(data.cfg, data.base.star)
            if (data.base.star < this.maxStar) {
                //未升到最高星 计算下一级的属性
                data.nextAttrs = this.converWeaponAttr(data.cfg, data.base.star + 1)
            }
        }
        if (oldHero != data.base.heroBaseId) {
            //穿戴目标改变
            this._allHeroWeaponMap.delete(oldHero)
            if (data.base.heroBaseId > 0) {
                this._allHeroWeaponMap.set(data.base.heroBaseId, data)
            }
        }
        this._sortDirty = true
        return data
    }

    public addWeapon(vo: Vo.awakeweapon.AwakeWeaponVo): void {
        this.updateWeaponDatas([vo])
    }

    public deleteWeapon(id: number): WeaponVo {
        let data: WeaponVo = this._allWeaponMap.get(id)
        if (data != null) {
            this._allWeaponMap.delete(data.base.id)
            if (data.base.heroBaseId > 0) {
                this._allHeroWeaponMap.delete(data.base.heroBaseId)
            }
            this._sortDirty = true
            G.FacadeManager.emit(NotificationKey.WEAPON_ITEM_CHANGE, [data])
            return data
        }
        return null
    }

    /**更新武器锁定状态*/
    public updateWeaponLockState(id: number): WeaponVo {
        let data: WeaponVo = this._allWeaponMap.get(id)
        if (data != null) {
            data.base.locked = !data.base.locked
            return data
        }
        return null
    }

    public getWeaponVo(id: number): WeaponVo {
        if (this._allWeaponMap.has(id)) {
            return this._allWeaponMap.get(id)
        }
        return null
    }

    /**根据配置id拿一个武器数据*/
    public getWeaponVoByBaseId(baseId: number): WeaponVo {
        let arr = Array.from(this._allWeaponMap.values())
        return arr.find((value) => value.base.baseId == baseId)
    }

    /**根据配置id拿最高星武器*/
    public getMaxStarWeaponVoByBaseId(baseId: number): WeaponVo {
        let arr = Array.from(this._allWeaponMap.values())
        arr = arr.filter((value) => value.base.baseId == baseId)
        if (arr.length > 0) {
            arr.sort((a, b) => {
                return b.base.star - a.base.star
            })
            return arr[0]
        }
        return null
    }

    public isHaveWeaponByItemId(itemId: number): boolean {
        return this.getWeaponVoByBaseId(itemId) != null
    }

    /**获取背包武器列表*/
    public getBagWeapons(): WeaponVo[] {
        if (this._allWeaponList.length != this._allWeaponMap.size || this._sortDirty) {
            this._sortDirty = false
            this._allWeaponList = Array.from(this._allWeaponMap.values())
            this._allWeaponList.sort((a, b) => {
                if (a.base.heroBaseId == 0 && b.base.heroBaseId != 0) {
                    //优先装配
                    return 1
                } else if (a.base.heroBaseId != 0 && b.base.heroBaseId == 0) {
                    //优先装配
                    return -1
                } else {
                    //装配和未装配武器 同样的排序规则
                    if (a.base.star != b.base.star) {
                        //优先高星级
                        return b.base.star - a.base.star
                    } else {
                        //其次按照id降序
                        return b.base.baseId - a.base.baseId
                    }
                }

            })
        }
        return this._allWeaponList
    }

    /**武器是否满足升星条件*/
    public isWeaponCanUpStar(vo: WeaponVo): boolean {
        if (vo && vo.base.star < this.maxStar) {
            let curStarCfg = this.getStarCfg(vo)
            let comsumeWeapons = this.getConsumeWeapons(vo)
            if (comsumeWeapons.length < curStarCfg.consumeSameCount) {
                return false
            }
            if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(curStarCfg?.costItems, false)) {
                return true
            }
        }
        return false
    }

    /**获取可升星武器列表*/
    public getCanUpWeapons(): WeaponVo[] {
        let alls = this.getBagWeapons()
        let arr = alls.filter((value) => value.base.star < this.maxStar)
        return arr
    }

    /**获取可穿戴的空闲装备 根据类型区分*/
    public getCanWearIdleWeapons(heroId: number, type: number = 0): WeaponVo[] {
        let alls = this.getBagWeapons()
        let arr = alls.filter((value) => {
            if (!value.base.heroBaseId) {
                //没有穿戴者
                if (type == ServerEnums.AwakeWeaponType.EXCLUSIVE) {
                    return ServerEnums.AwakeWeaponType[value.cfg.type] == ServerEnums.AwakeWeaponType.EXCLUSIVE && value.cfg.heroBaseId == heroId
                } else {
                    return ServerEnums.AwakeWeaponType[value.cfg.type] == ServerEnums.AwakeWeaponType.GENERAL || value.cfg.heroBaseId == heroId
                }
            }
        })
        return arr
    }

    /**获取可穿戴武器列表*/
    public getCanWearWeapons(heroId: number): WeaponVo[] {
        let alls = this.getBagWeapons()
        let arr = alls.filter((value) => value.cfg.type == 'GENERAL' || value.cfg.heroBaseId == heroId)
        arr.sort((a, b) => {
            if (a.base.heroBaseId == heroId) {
                //优先排序当前装备
                return -1
            } else if (b.base.heroBaseId == heroId) {
                //优先排序当前装备
                return 1
            } else {
                if (a.cfg.heroBaseId != b.cfg.heroBaseId) {
                    //优先专武
                    return b.cfg.heroBaseId - a.cfg.heroBaseId
                } else if (a.base.star != b.base.star) {
                    //优先高星级
                    return b.base.star - a.base.star
                } else {
                    return b.base.baseId - a.base.baseId
                }
            }
        })
        return arr
    }

    /**获取英雄当前穿戴的武器*/
    public getWeaponForHero(heroId: number): WeaponVo {
        if (this._allHeroWeaponMap.has(heroId)) {
            return this._allHeroWeaponMap.get(heroId)
        }
        return null
    }

    /**获取升星消耗同类武器列表*/
    public getConsumeWeapons(target: WeaponVo): WeaponVo[] {
        let arr: WeaponVo[] = []
        this._allWeaponMap.forEach((value: WeaponVo) => {
            if (value == target) {
                return
            }
            if (value.base.locked || value.base.heroBaseId > 0) {
                //已锁定和已装备的过滤
                return
            }
            if (value.base.baseId == target.base.baseId) {
                arr.push(value)
            }
        })
        //按照星级排序
        arr.sort((a: WeaponVo, b: WeaponVo) => {
            return a.base.star - b.base.star
        })
        return arr
    }

    /**获取回退的道具数量*/
    public getBackWeaponCnt(target: WeaponVo): number {
        let backCnt: number = 0
        let star: number = target.base.star
        let cfgList: table.awakeweapon.AwakeWeaponStarConfig[] = G.TableManager.getAllData(table.awakeweapon.AwakeWeaponStarConfig)
        while (star > 0) {
            let cfg: table.awakeweapon.AwakeWeaponStarConfig = cfgList?.find((value: table.awakeweapon.AwakeWeaponStarConfig) => {
                return value.quality == target.itemCfg.quality && value.type == target.cfg.type && value.star == star
            })
            if (cfg) {
                backCnt += cfg.consumeSameCount
            }
            star--
        }

        return backCnt
    }
}