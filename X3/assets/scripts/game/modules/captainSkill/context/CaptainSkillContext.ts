import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import {
    CaptainSkillConfigManager
} from "db://assets/scripts/game/modules/captainSkill/config/CaptainSkillConfigManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LocalStorageUtils } from "../../../../core/utils/LocalStorageUtils";
import GIns from "../../../GIns";
import { ConditionManager } from "../../condition/ConditionManager";
import { ConditionUtils } from "../../condition/ConditionUtils";
import { CaptainSkillUtils } from "../utils/CaptainSkillUtils";

/**核心初始等级*/
export const CaptainSkillCoreInitLv:number = 0;
/**专精初始等级*/
export const CaptainSkillInitLv:number = 0;

/**
 * 战队科技
 */
export class CaptainSkillContext implements INotification {


    // <队长技id, 等级>
    private _idToLvMap = new Map<number, number>();
    protected _lastResetTime: number = 0;
    protected _resetTimes: number = 0;
    /**核心科技等级*/
    protected _coreLv: number = 0;
    /**当前激活的战队科技技能id列表*/
    protected _activeSkillIds: number[] = null;
    protected _activeSkillCfgs: table.captain.CaptainSkillConfig[] = [];
    /**本地记录当前显示红点的等级*/
    protected _localRedDotLvMap: Map<number, number> = new Map();

    /**是否解锁核心*/
    protected _isUnlockCore: boolean = false;
    /**是否解锁专精*/
    protected _isUnlockSkill: boolean = false;

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.FORMATION_SET_UP_FORMATION
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.refreshRedDot();
                break;
            case NotificationKey.FORMATION_SET_UP_FORMATION:
                this.refreshActiveCaptain();
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(eventName)
        if (ok) {
            this.updateUnlockState();
        }
    }

    protected getLocalRedDotLvMapKey(): string {
        return 'captainSkillLocalLvMap_' + GIns.playerModel.playerId;
    }

    initLocalRedDotLvMap(): void {
        this._localRedDotLvMap = LocalStorageUtils.get(this.getLocalRedDotLvMapKey(), Map<number, number>);
        if (this._localRedDotLvMap == null) {
            this._localRedDotLvMap = new Map();
        }
    }

    saveLocalRedDotLvMap(): void {
        const configs = CaptainSkillConfigManager.getCaptainSkillConfigArray();
        for (let config of configs) {
            const skillId = config.id;
            const curLv = this.getLvBySkillId(skillId);
            const isUnlock = curLv >= 0
            if (isUnlock) {
                // 计算出可升级等级
                this._localRedDotLvMap.set(skillId, this.getCanUpLv(skillId));
            }
        }
        LocalStorageUtils.set(this.getLocalRedDotLvMapKey(), this._localRedDotLvMap);
        this.refreshRedDot();
    }

    protected updateUnlockState(): void {
        if (this._isUnlockCore && this._isUnlockSkill) {
            return;
        }
        let hasUnlock: boolean = false;
        if (!this._isUnlockCore) {
            this._isUnlockCore = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN_CORE);
            if (this._isUnlockCore) {
                this.setCoreLv(CaptainSkillCoreInitLv);
                hasUnlock = true;
            }
        }
        if (!this._isUnlockSkill) {
            this._isUnlockSkill = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN);
            if (this._isUnlockSkill) {
                this.unlockAll();
                hasUnlock = true;
            }
        }
        if (hasUnlock) {
            this.refreshRedDot();
        }
    }

    @LogBusiness("重置战队科技 by 登录数据")
    reset(data: Vo.captain.CaptainLoginVo) {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
        this._isUnlockCore = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN_CORE);
        this._isUnlockSkill = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN);
        if (!this._isUnlockCore) {
            //未开启
            this._coreLv = -1;
        } else {
            this._coreLv = data.captainCoreLevel;
        }
        
        this._resetTimes = data.resetTimes;
        // this._lastResetTime = data.lastResetTime;
        this._idToLvMap.clear();
        let allCfgs = CaptainSkillUtils.getCaptainSkillConfigArray();
        allCfgs?.forEach((cfg) => {
            //先初始化
            this._idToLvMap.set(cfg.id, this._isUnlockSkill ? CaptainSkillInitLv : -1);
        })

        //再用后端数据覆盖
        const captainMap = data.captainMap;
        if (captainMap) {
            const map = ObjectUtils.toMap(
                captainMap,
                it => it.toInt(),
                it => it as number
            );
            for (const [k, v] of map) {
                this._idToLvMap.set(k, v);
            }
        }
        this.refreshActiveCaptain();
    }

    /**核心科技等级*/
    get coreLv(): number {
        return this._coreLv;
    }

    /**累计重置次数*/
    get resetTimes(): number {
        return this._resetTimes;
    }

    /**上次重置时间*/
    get lastResetTime(): number {
        return this._lastResetTime;
    }

    /**设置核心科技等级*/
    public setCoreLv(lv: number): void {
        this._coreLv = lv;
        G.FacadeManager.emit(NotificationKey.CAPTAIN_SKILL_CORE_LV_UPDATE);
        this.updateFightDelay();
    }

    refreshRedDot() {
        let isShowCoreRedDot: boolean = false;
        if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN_CORE)) {
            let nextCoreCfg = G.TableManager.getDataById(table.captain.CaptainCoreLevelConfig, this._coreLv + 1);
            if (nextCoreCfg) {
                const costItems = ItemUtils.parseKvArrayToItemArray(nextCoreCfg.costItems);
                isShowCoreRedDot = GIns.backpackMgr.isCanPayTheseItemArray(costItems)
                GIns.redDotMgr.setRedDot(RedDotKeys.captainSkill_coreLvUp, isShowCoreRedDot);
            } else {
                GIns.redDotMgr.setRedDot(RedDotKeys.captainSkill_coreLvUp, false);
            }
        }

        let isShowAllRedDot: boolean = false;
        if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN)) {
            const configs = CaptainSkillConfigManager.getCaptainSkillConfigArray();

            for (let config of configs) {
                const skillId = config.id;

                const curLv = this.getLvBySkillId(skillId);
                const isUnlock = curLv >= 0

                if (isUnlock) {
                    // 是否可以升级
                    const isCanLvUp = this.isCanLvUp(skillId, curLv + 1);

                    let nextLv = isUnlock ? curLv + 1 : 0
                    let nextLvConfig = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(skillId, nextLv);
                    let isOpen = true
                    if (nextLvConfig && nextLvConfig.unlockConditionText) {
                        isOpen = ConditionManager.ins().checkCondition(nextLvConfig.unlockConditionText, false) && nextLvConfig.needCaptainCoreLevel <= this._coreLv;
                    }
                    // RedDotManager.ins().setRedDot(RedDotKeys.captainSkill_unlock, false, [skillId]);

                    RedDotManager.ins().setRedDot(RedDotKeys.captainSkill_lvUp, isCanLvUp && isOpen, [skillId]);

                    if (isShowAllRedDot == false) {
                        if (this._localRedDotLvMap.has(skillId) == false) {
                            isShowAllRedDot = isCanLvUp && isOpen;
                        } else {
                            let localNextCfg = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(skillId, this._localRedDotLvMap.get(skillId) + 1);
                            if (localNextCfg == null) {
                                //记录已经是最高级了
                                isShowAllRedDot = false;
                            } else {
                                isShowAllRedDot = this.getCanUpLv(skillId) > this._localRedDotLvMap.get(skillId);
                            }
                        }
                    }
                } else {
                    // RedDotManager.ins().setRedDot(RedDotKeys.captainSkill_unlock, isCanLvUp && isOpen, [skillId]);
                    RedDotManager.ins().setRedDot(RedDotKeys.captainSkill_lvUp, false, [skillId]);
                }
            }
        }
        RedDotManager.ins().setRedDot(RedDotKeys.captainSkill, isShowAllRedDot || isShowCoreRedDot);
    }

    /**
     * 是否解锁了
     * @param skillId
     */
    isUnlock(skillId: number): boolean {
        return this._idToLvMap.has(skillId);
    }

    /**
     * 获取战技等级
     * 没有等级 = -1
     * @param skillId
     */
    getLvBySkillId(skillId: number) {
        const lv = this._idToLvMap.get(skillId);
        if (lv == null) {
            return -1;
        }
        return lv;
    }

    /**
     * 升级
     * @param captainSkillId
     * @param lv
     */
    lvUp(captainSkillId: number, lv: number) {
        const lvMap = this._idToLvMap;
        const oldLv = this.getLvBySkillId(captainSkillId);
        const newLv = oldLv + 1;
        lvMap.set(captainSkillId, newLv);
        G.FacadeManager.emit(NotificationKey.CAPTAIN_SKILL_LV_UPDATE, captainSkillId);
        // 战斗力
        this.updateFightDelay();
    }

    resetAllLv(vo: Vo.captain.CaptainResetVo): void {
        this._resetTimes = vo.resetTimes;
        // this._lastResetTime = vo.lastResetTime;

        let hasChange: boolean = false;
        let keys: number[] = Array.from(this._idToLvMap.keys());
        keys?.forEach((key) => {
            if (this._idToLvMap.get(key) > 0) {
                this._idToLvMap.set(key, CaptainSkillInitLv);
                hasChange = true;
            }
        })
        if (hasChange) {
            G.FacadeManager.emit(NotificationKey.CAPTAIN_SKILL_LV_UPDATE, 0);
            this.refreshActiveCaptain();
            // 战斗力
            this.updateFightDelay();
        }
    }

    unlockAll(): void {
        let allCfgs = CaptainSkillUtils.getCaptainSkillConfigArray();
        let hasChange: boolean = false;
        allCfgs?.forEach((cfg) => {
            if (this._idToLvMap.has(cfg.id) == false || this._idToLvMap.get(cfg.id) < 0) {
                //激活所有未激活的技能
                this._idToLvMap.set(cfg.id, CaptainSkillInitLv);
                hasChange = true;
            }
        })
        if (hasChange) {
            G.FacadeManager.emit(NotificationKey.CAPTAIN_SKILL_LV_UPDATE, 0);
            this.refreshActiveCaptain();
            // 战斗力
            this.updateFightDelay();
        }
    }

    /**
     * 是否解锁过任何技能
     */
    isHaveAnyUnlockSkill(): boolean {
        return MapUtils.isNotEmpty(this._idToLvMap)
    }

    getDefaultCaptainSkillId(): number {
        if (MapUtils.isEmpty(this._idToLvMap)) {
            return 0;
        }
        return MapUtils.getFirstKey(this._idToLvMap);
    }

    /**
     * 获取所有队长技能 ID
     */
    getAllCaptainSkillId() {
        return Array.from(this._idToLvMap.keys());
    }

    getCaptainIdToLvMap(): Map<number, number> {
        return new Map(this._idToLvMap);
    }

    /**获取所有激活的战队科技技能配置列表*/
    protected getAllActiveSkillCfgs(): table.captain.CaptainSkillConfig[] {
        let cfgs = GIns.formationMgr.getDefaultFormationVo().getAllActivateCaptainSkillCfgs();
        //筛选出同战队科技id的 只取等级最高的一个
        let id2LvMap: Map<number, number> = new Map();
        let id2CfgMap: Map<number, table.captain.CaptainSkillConfig> = new Map();

        cfgs?.forEach((cfg) => {
            if (cfg) {
                let skillCfg = G.TableManager.getDataById(table.captain.CaptainSkillConfig, cfg.captainSkillId);
                if (skillCfg) {
                    if (id2LvMap.has(skillCfg.captainId)) {
                        if (id2LvMap.get(skillCfg.captainId) > skillCfg.level) {
                            //现有的已经比这个等级高
                            return;
                        }
                    }
                    id2LvMap.set(skillCfg.captainId, skillCfg.level);
                    id2CfgMap.set(skillCfg.captainId, skillCfg);
                }
            }
        })
        return Array.from(id2CfgMap.values());
    }

    /**刷新战队科技*/
    protected refreshActiveCaptain(): void {
        this._activeSkillCfgs = this.getAllActiveSkillCfgs();
        let ids: number[] = this._activeSkillCfgs.map((value) => { return value.id });
        ids?.sort((a, b) => {
            return a - b;
        })
        let newStr: string = ids.toString();
        let oldStr: string = this._activeSkillIds ? this._activeSkillIds.toString() : null;
        this._activeSkillIds = ids;
        if (oldStr !== null && oldStr != newStr) {
            //战队技能发生变化
            G.FacadeManager.emit(NotificationKey.CAPTAIN_SKILL_CHANGE)
        }
    }

    public get activeSkillCfgs(): table.captain.CaptainSkillConfig[] {
        return this._activeSkillCfgs;
    }

    /**
     * 是否可以升级
     * @param skillId
     * @param nextLv
     * @private
     */
    private isCanLvUp(skillId: number, nextLv: number): boolean {
        const lvUpConfig = CaptainSkillConfigManager.getLvUpConfig(skillId, nextLv);
        if (!lvUpConfig) {
            return false;
        }
        const costItems = ItemUtils.parseKvArrayToItemArray(lvUpConfig.costItems);
        return BackpackManager.ins().isCanPayTheseItemArray(costItems);
    }

    /**获取当前战队科技可升级的最大等级数*/
    protected getCanUpLv(skillId: number): number {
        const curLv = this.getLvBySkillId(skillId);
        let canLv: number = curLv + 1;
        let cfg = CaptainSkillConfigManager.getLvUpConfig(skillId, canLv);
        while (cfg != null && GIns.conditionMgr.checkCondition(cfg.unlockConditionText)) {
            let costMap = CaptainSkillUtils.getCaptainSkillTotalCostMap(skillId, canLv, curLv);
            if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(Array.from(costMap.values()))) {
                canLv++;
                cfg = CaptainSkillConfigManager.getLvUpConfig(skillId, canLv);
            } else {
                break;
            }
        }
        return canLv - 1;
    }


    protected _updateFightTimerKey: string = null;
    /**延迟更新战力*/
    protected updateFightDelay(delay: number = 500): void {
        //延时更新角色战力 防止频繁更新卡顿
        if (this._updateFightTimerKey) {
            G.GameTimer.clearByKey(this._updateFightTimerKey)
            this._updateFightTimerKey = null
        }
        this._updateFightTimerKey = G.GameTimer.once(delay, this, () => {
            this._updateFightTimerKey = null
            G.FacadeManager.emit(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        });
    }
}