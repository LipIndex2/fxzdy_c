import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import G from "db://assets/scripts/core/comm/G";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { AttrEffectUtils } from "db://assets/scripts/game/modules/attr/utils/AttrEffectUtils";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TalentConfigManager } from "db://assets/scripts/game/modules/talent/config/TalentConfigManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import TalentType = ServerEnums.TalentType;
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import GIns from "../../../GIns";
import { AttrConfigManager } from "../../attr/config/AttrConfigManager";
import { Attribute } from "../../attr/AttrEnum";

/**
 * 玩家天赋状态
 */
export class TalentContext implements INotification {
    // 已经升级过的天赋 id
    private _lvUpTalentIdSet: Set<number> = new Set();
    // 最大行id
    private _maxRowId: number = 0;

    // 最大到达的天赋
    private _maxRowIdForSmall: number = 0;
    private _maxRowIdForBig: number = 0;

    // 解锁的羁绊id Set
    private _unlockFetterIdSet: Set<number> = new Set();

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_CHANGE_ITEMS, NotificationKey.MAP_BUILDING_UNLOCK];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.MAP_BUILDING_UNLOCK:
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.refreshRedDot();
                break;
            }
        }
    }

    @LogBusiness("[天赋] 状态数据初始化")
    static from(initVo: Vo.talent.TalentLoginVo): TalentContext {
        const talentContext = new TalentContext();
        if (!initVo) {
            return talentContext;
        }

        talentContext.reset(initVo);

        return talentContext;
    }

    private reset(initVo: Vo.talent.TalentLoginVo): TalentContext {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);

        const lvUpTalentIdSet = initVo.activeTalentIds?.toDataStream()?.toSet() || new Set();

        this._maxRowId = 1;
        this._maxRowIdForSmall = 0;
        this._maxRowIdForBig = 0;
        for (let talentId of lvUpTalentIdSet) {
            if (!lvUpTalentIdSet.has(talentId)) {
                return null;
            }
            const config = TableManager.getDataById(table.talent.TalentConfig, talentId);
            if (!config) {
                return null;
            }

            const fetterIds = config.fetterIds as number[];
            if (ArrayUtils.isNotEmpty(fetterIds)) {
                for (let fetterId of fetterIds) {
                    this._unlockFetterIdSet.add(fetterId);
                }
                //初始化不用弹窗
                //G.FacadeManager.emit(NotificationKey.FETTER_UNLOCK_NEW, fetterIds);
            }

            const type = ServerEnums.TalentType[config.talentType];
            const rowId = config.rowId;

            // 小天赋

            if (type == ServerEnums.TalentType.NORMAL) {
                if (rowId > this._maxRowIdForSmall) {
                    this._maxRowIdForSmall = rowId;
                }
            }
            // 大天赋
            if (type == ServerEnums.TalentType.ADVANCED) {
                if (rowId > this._maxRowIdForBig) {
                    this._maxRowIdForBig = rowId;
                }
            }

            // 通用最大
            if (rowId > this._maxRowId) {
                this._maxRowId = rowId;
            }
        }
        this._lvUpTalentIdSet = lvUpTalentIdSet;

        return this;
    }

    /**
     * 升级过的天赋id
     */
    getLvUpTalentIdArray(): Set<number> {
        return this._lvUpTalentIdSet;
    }

    /**
     * 是否升级过这个天赋
     * @param talentId
     */
    isHaveLvUpTalent(talentId: number): boolean {
        return this._lvUpTalentIdSet.has(talentId);
    }

    /**
     * 添加升级过的天赋id
     * @param talentId
     */
    addTalentId(talentId: number) {
        if (talentId == 0) {
            return;
        }
        this._lvUpTalentIdSet.add(talentId);
        const config = TableManager.getDataById(table.talent.TalentConfig, talentId);
        if (!config) {
            return;
        }
        // 刷属性战斗力
        G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        //没有地方获取战力,所以总战力没有更新,上面的事件只是刷新英雄的战力,而不是直接飘战力
        G.GameTimer.once(100, this, () => {
            G.FacadeManager.emit(NotificationKey.FIGHT_RECALCULATE_ALL_HERO);
        });

        const fetterIds = config.fetterIds as number[];
        if (ArrayUtils.isNotEmpty(fetterIds)) {
            for (let fetterId of fetterIds) {
                this._unlockFetterIdSet.add(fetterId);
            }
            G.FacadeManager.emit(NotificationKey.FETTER_UNLOCK_NEW, talentId);
        }

        // 大天赋id
        const type = ServerEnums.TalentType[config.talentType];
        const rowId = config.rowId;

        // 小天赋
        if (type == ServerEnums.TalentType.NORMAL) {
            // 所有行
            if (rowId > this._maxRowId) {
                this._maxRowId = rowId;
            }

            // 小天赋行
            if (rowId > this._maxRowIdForSmall) {
                this._maxRowIdForSmall = rowId;
            }
        }
        // 大天赋
        if (type == ServerEnums.TalentType.ADVANCED) {
            if (rowId > this._maxRowIdForBig) {
                this._maxRowIdForBig = rowId;
            }
        }

        this.refreshRedDot();
        this.isAttrDirty = true
    }

    get maxRowIdForSmall(): number {
        return this._maxRowIdForSmall;
    }

    get maxRowIdForBig(): number {
        return this._maxRowIdForBig;
    }

    // 最大激活行id
    getMaxActiveRowId(): number {
        return this._maxRowId;
    }

    // 最大激活小天赋行id
    getMaxActiveSmallTalentRowId(): number {
        return this._maxRowIdForSmall;
    }

    /**
     * 最大可解锁行
     */
    getMaxCanUnlockRowId(): number {
        let formationLv = FormationManager.ins().getAvgCommonLevel();
        return TableManager.getAllData(table.talent.TalentConfig)
            .toDataStream()
            .filter((it) => {
                // 不算高级天赋
                if (ServerEnums.TalentType[it.talentType] == ServerEnums.TalentType.ADVANCED) {
                    return false;
                }
                return formationLv >= it.unlockLv;
            })
            .map((it) => it.rowId)
            .maxByWeightNumber((it) => it);
    }

    /**
     * 是否可以升级这个天赋
     * @param talentId
     */
    isUnlockTalent(talentId: number) {
        let isLvUp = this.isHaveLvUpTalent(talentId);
        if (isLvUp) {
            return false;
        }

        const config = TableManager.getDataById(table.talent.TalentConfig, talentId);
        if (!config) {
            return false;
        }

        // 共鸣等级 ok ?
        let isCanUnlock = FormationManager.ins().getAvgCommonLevel() >= config.unlockLv;
        if (!isCanUnlock) {
            return false;
        }
        let parentTalentId = config.parentTalentId;
        if (parentTalentId <= 0) {
            // 没有父天赋
            return true;
        }
        return this.isHaveLvUpTalent(parentTalentId);
    }

    /**
     * 是否可以升级天赋
     * @param talentId
     */
    isCanLvUpTalent(talentId: number) {
        const isUnlock = this.isUnlockTalent(talentId);
        if (!isUnlock) {
            return false;
        }

        const config = TalentConfigManager.getConfigByTalentId(talentId);
        if (!config) {
            return false;
        }

        const costItems = ItemUtils.parseKvArrayToItemArray(config.costItemArray);
        return BackpackManager.ins().isCanPayTheseItemArray(costItems);
    }

    /****属性是否需要更新 */
    private isAttrDirty: boolean = true;
    private attrDatas: AttrData[];
    /**
     * 获取所有天赋的属性加成
     * @returns 合并后的属性
     */
    getMergedAddAttrDataArray(): Array<AttrData> {
        if (!this.isAttrDirty) {
            return this.attrDatas;
        }
        let arr: AttrData[] = []
        this._lvUpTalentIdSet.forEach((talentId) => {
            const config = TableManager.getDataById(table.talent.TalentConfig, talentId);
            if (!config) {
                return;
            }
            // 2 个属性
            const effectType1 = AttrEffectUtils.getEffectTypeByName(config.effectType1);
            const effectType2 = AttrEffectUtils.getEffectTypeByName(config.effectType2);

            this.getAttr(arr, config.addAttrArray1, effectType1)
            this.getAttr(arr, config.addAttrArray2, effectType2)
        });

        this.isAttrDirty = false;
        this.attrDatas = arr;
        return arr;
    }

    private getAttr(arr: AttrData[], addAttrArray: Array<{ k: any, v: any }>, effectType: number): void {
        if (addAttrArray) {
            for (let i = 0; i < addAttrArray.length; i++) {
                let key = addAttrArray[i].k;
                const attributeConfig = AttrConfigManager.getConfigById(key);
                if (attributeConfig) {
                    let attrData = new AttrData()
                    attrData.id = key as Attribute;
                    attrData.type = attributeConfig.type;
                    attrData.num = addAttrArray[i].v;
                    attrData.unitEffectiveType = effectType;
                    attrData.worth = attributeConfig.cpWorth;
                    attrData.mod = attributeConfig.cpMod;
                    arr.push(attrData)
                }
            }
        }
    }

    getMaxRodId(): number {
        return this._maxRowId;
    }

    /**
     * 可以连续升级小天赋
     * @param count
     */
    isCanContinuousLvUpSmallByCount(count: number): boolean {
        const isCanSeeOneKey = ConditionManager.ins().checkCondition(TalentConfigManager.oneKeyUnlockConditions, false, false);
        if (!isCanSeeOneKey) {
            return false;
        }

        const curRowId = this._maxRowIdForSmall;

        let allCostItemArray = [];
        for (let i = 1; i <= count; i++) {
            const nextRowId = curRowId + i;
            const config = TalentConfigManager.getConfigByRowId(ServerEnums.TalentType.NORMAL, nextRowId);
            if (!config) {
                return false;
            }
            const unlockLv = config.unlockLv;
            const avgLv = FormationManager.ins().getAvgCommonLevel();
            if (avgLv < unlockLv) {
                return false;
            }

            const noOwnerItems = ItemUtils.parseKvArrayToItemArray(config.costItemArray);
            if (!noOwnerItems) {
                return false;
            }
            allCostItemArray = allCostItemArray.concat(...noOwnerItems);

            // 不足以付款
            const isCan = BackpackManager.ins().isCanPayTheseItemArray(allCostItemArray);
            if (!isCan) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取连续升级的小天赋id
     * @param count
     */
    getContinuousLvUpSmallTalentIdArray(count: number): number[] {
        const curRowId = this._maxRowIdForSmall;

        let array: number[] = [];
        for (let i = 1; i <= count; i++) {
            const nextRowId = curRowId + i;
            const config = TalentConfigManager.getConfigByRowId(ServerEnums.TalentType.NORMAL, nextRowId);
            array.push(config.id);
        }
        return array;
    }

    refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.TALENT)) {
            return;
        }

        RedDotManager.ins().clearAll(RedDotKeys.talent_small);
        RedDotManager.ins().clearAll(RedDotKeys.talent_big);

        // small
        const nextSmallConfig = TalentConfigManager.getConfigByRowId(ServerEnums.TalentType.NORMAL, this._maxRowIdForSmall + 1);
        if (nextSmallConfig) {
            const talentId = nextSmallConfig.id;
            const isCan = this.isCanLvUpTalent(talentId);
            RedDotManager.ins().setRedDot(RedDotKeys.talent_small, isCan, [talentId]);
        }

        // big
        const nextBigRowId = this.getNextCanLvUpRowId(ServerEnums.TalentType.ADVANCED);
        const nextBigConfig = TalentConfigManager.getConfigByRowId(ServerEnums.TalentType.ADVANCED, nextBigRowId);
        if (nextBigConfig) {
            const talentId = nextBigConfig.id;
            const isCan = this.isCanLvUpTalent(talentId);
            RedDotManager.ins().setRedDot(RedDotKeys.talent_big, isCan, [talentId]);
        }
    }

    /**
     * type 的 天赋升级次数
     * @param type
     */
    getLvUpTalentCountByType(type: TalentType): number {
        if (type == TalentType.NORMAL) {
            return this._maxRowIdForSmall;
        }
        if (type == TalentType.ADVANCED) {
            return this._maxRowIdForBig;
        }
        return 0;
    }

    /**
     * 获取 type 下的下一个可升级的天赋 id
     * @param type
     */
    getNextCanLvUpRowId(type: ServerEnums.TalentType): number {
        let startRowId = this._maxRowIdForSmall;
        if (type == ServerEnums.TalentType.ADVANCED) {
            startRowId = this._maxRowIdForBig;
        }
        for (let i = 1; i < 999; i++) {
            const nextRowId = startRowId + i;
            const config = TalentConfigManager.getConfigByRowId(type, nextRowId);
            if (!config) {
                continue;
            }
            const isCan = this.isCanLvUpTalent(config.id);
            if (isCan) {
                return nextRowId;
            }
        }
        return 0;
    }
}
