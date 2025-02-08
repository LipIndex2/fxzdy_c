import { PoolManager } from "../../../core/pool/PoolManager";
import UrlUtils from "../../../core/utils/UrlUtils";
import { BattleLogic } from "./BattleLogic";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { DamageVo } from "./DamageVo";
import { WorldUnitTeam } from "./enum/BattleEnum";
import { ICaster } from "./skill/ICaster";
import { SkillBehavior } from "./skill/SkillBehavior";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { MonsterUnit } from "./unit/battle/MonsterUnit";
import { PetUnit } from "./unit/battle/PetUnit";
import { BulletUnit } from "./unit/bullet/BulletUnit";
import { BaseLeaderSkillUnit } from "./unit/leaderSkill/BaseLeaderSkillUnit";
import { OtherSkillUnit } from "./unit/other/OtherSkillUnit";

export class FightUnitStatisticsVo {
    /**
             * 战斗单位唯一ID
             */
    unitId: number;
    /***单位类型 */
    unitType: number;
    /***配置ID */
    cfgId: number;
    /**
     * 伤害
     */
    hurt: number;

    /**
     * 治疗
     */
    cure: number;

    /**
     * 承伤
     */
    beHurt: number;
    /***皮肤ID */
    skinId: number
    /***单位等级 */
    lv: number = 0
    /***单位阵位 */
    pos: number = 0

    /**
         * 剩余血量
         */
    surplusHp: number;
}

export class BattleEasyLogManager {
    public isStart: boolean = false;
    private damageMap: { [teamId: number]: { [uid: string]: FightUnitStatisticsVo } } = {};
    public battleLogic: BattleLogic;
    private totalHurtMap: { [teamId: number]: number };

    public constructor () {
        this.start();
    }

    public start(): void {
        this.isStart = true
        this.damageMap = {};

        this.totalHurtMap = {};
        this.totalHurtMap[WorldUnitTeam.Self] = 0;
        this.totalHurtMap[WorldUnitTeam.Enemy] = 0;
    }

    /***服务端只记录发出的数据，无发出他就无英雄列表，所以在初始化英雄时要把数据设0 */
    public initHeroData(unit: BattleUnit): void {
        if (!this.damageMap[unit.teamId])
            this.damageMap[unit.teamId] = {};

        this.createFightUnitStatisticsVo(unit)
    }

    protected createFightUnitStatisticsVo(unit: BattleUnit): FightUnitStatisticsVo {
        let fightUnitStatisticsVo = this.damageMap[unit.teamId][unit.uid] = new FightUnitStatisticsVo()
        fightUnitStatisticsVo.unitId = unit.uid;
        fightUnitStatisticsVo.hurt = 0;
        fightUnitStatisticsVo.cure = 0;
        fightUnitStatisticsVo.beHurt = 0
        fightUnitStatisticsVo.skinId = unit.attr.skinId;
        fightUnitStatisticsVo.unitType = unit.type
        fightUnitStatisticsVo.cfgId = unit.attr.getConfigId()
        fightUnitStatisticsVo.lv = unit.attr.lv;
        fightUnitStatisticsVo.pos = unit.formationPositionByServer;
        return fightUnitStatisticsVo
    }

    public stop(): void {
        this.isStart = false
    }

    public clear(): void {
        this.isStart = false
        this.damageMap = {};
    }

    private addTotalHurt(damageVo: DamageVo, type: string) {
        if (type !== "hurt") return;

        let teamId = damageVo.caster?.teamId
        if (teamId) {
            this.totalHurtMap[teamId] += damageVo.value;
        }
    }

    public addShield(caster: ICaster, target: BattleUnit, hp: number, skill: SkillBehavior): void {
        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill?.skill;
        damageVo.caster = caster
        damageVo.target = target
        damageVo.value = hp;
        damageVo.status = BattleConstantConfig.Heal;
        this.hurt(damageVo, "heal")
    }

    protected checkShowLog(damageVo: DamageVo, type: string): void {
        if (!UrlUtils.getURLQuery(UrlUtils.ShowBattleLog))
            return

        if (!damageVo.caster || !damageVo.caster.caster)
            return

        let str = ""
        if (damageVo.buffInfo)
            str = `第${this.battleLogic.frameIndex}帧${this.getNameStr(damageVo.caster.caster)}对${this.getNameStr(damageVo.target)}%c使用BUFF【${damageVo.buffInfo.cfg.name}】`;
        else if (damageVo.haloInfo)
            str = `第${this.battleLogic.frameIndex}帧${this.getNameStr(damageVo.caster.caster)}对${this.getNameStr(damageVo.target)}%c使用光环【${damageVo.haloInfo.cfg.name}】`;
        else if (damageVo.skillInfo) {
            str = `第${this.battleLogic.frameIndex}帧${this.getNameStr(damageVo.caster.caster)}对${this.getNameStr(damageVo.target)}%c使用技能【${damageVo.skillInfo.cfg.name}】`;
        }

        if (str && type == "hurt") {
            str += `，造成%c[${damageVo.value}]伤害`;
        }
        else if (str && type == "heal") {
            str += `，治疗%c[${damageVo.value}]血量`;
        }

        if (str) {
            console.log(str,
                damageVo.caster.teamId == 1 ? "color:green" : "color:red",
                damageVo.target.teamId == 1 ? "color:green" : "color:red", "color:initial",
                type == "heal" ? "color:green" : "color:red")
        }
    }

    protected getNameStr(unit: BattleUnit): string {
        return `%c【${unit.attr.name}】`
    }

    public hurt(damageVo: DamageVo, type: string): void {
        if (!damageVo)
            return

        this.checkShowLog(damageVo, type)

        if (!this.isStart)
            return

        if ((damageVo.target && (damageVo.target.summon || damageVo.target.isNotStatisticsHp)) || (damageVo.originalCaster && (damageVo.originalCaster.summon || damageVo.originalCaster.isNotStatisticsHp))) {
            if (!this.battleLogic.battleSetting.isSummonStatistics) return;
        }

        this.addTotalHurt(damageVo, type);

        if (this.battleLogic.battleSetting.isUnitStatistics == 0 ||
            (this.battleLogic.battleSetting.isUnitStatistics == 2 && damageVo.originalCaster?.teamId == WorldUnitTeam.Enemy)) {
            return;
        }

        //伤害来源
        let casterUid: number;
        if (damageVo.caster instanceof BaseLeaderSkillUnit) {
            //队长技能伤害不统计
            return
        }
        else if (damageVo.originalCaster instanceof OtherSkillUnit) {
            //队长技能伤害不统计
            return
        }
        else if (damageVo.caster instanceof BulletUnit && damageVo.caster.caster) {
            casterUid = damageVo.caster?.caster?.uid;
        }
        else if (damageVo.caster instanceof PetUnit) {
            casterUid = damageVo.caster?.uid;
        }
        else if (damageVo.caster instanceof BattleUnit) {
            casterUid = damageVo.caster?.uid;
        }
        else {
            //无主的伤害
            return
        }

        if (!casterUid)
            return

        if (type == "hurt" && (!damageVo.target || casterUid == damageVo.target.uid)) {
            return
        }

        //攻击者
        let caster = this.battleLogic.getBatteUintByUid(casterUid)
        if (caster) {
            if (caster.summon) {
                //召唤物的伤害是它的所属施法者
                casterUid = caster.summon.byUid;
                caster = this.battleLogic.getBatteUintByUid(casterUid)
                if (!caster)
                    return
            }

            if (caster.teamId == WorldUnitTeam.Self && caster instanceof MonsterUnit) {
                return
            }

            if (type == "hurt")
                this.hurtHandler(damageVo, casterUid, caster.teamId, type)
            else if (type == "heal")
                this.hurtHandler(damageVo, casterUid, caster.teamId, type)
        }

        if (type == "hurt") {
            //受击者
            let target = damageVo.target
            if (target) {
                let hurtUid = target.uid
                if (target.summon) {
                    hurtUid = target.summon.byUid;
                    target = this.battleLogic.getBatteUintByUid(hurtUid)
                    if (!target)
                        return
                }
                this.hurtHandler(damageVo, hurtUid, target.teamId, "beHurt")
            }
        }
    }

    public hurtHandler(damageVo: DamageVo, uid: number, teamId: number, type: string): void {
        if (damageVo.skillInfo) {
            //造成伤害
            if (!this.damageMap[teamId]) {
                this.damageMap[teamId] = {}
            }

            let fightUnitStatisticsVo = this.damageMap[teamId][uid]
            if (!fightUnitStatisticsVo) {
                fightUnitStatisticsVo = this.createFightUnitStatisticsVo(damageVo.originalCaster)
            }
            if (type == "hurt") {
                fightUnitStatisticsVo.hurt += damageVo.value;
            }
            else if (type == "heal") {
                fightUnitStatisticsVo.cure += damageVo.value;
            }
            else if (type == "beHurt") {
                fightUnitStatisticsVo.beHurt += damageVo.value;
            }
        }
    }

    /***通过队伍ID获取队伍的伤害统计 */
    public getUnitStatistics(team: WorldUnitTeam): FightUnitStatisticsVo[] {
        let arr: FightUnitStatisticsVo[] = [];
        for (let key in this.damageMap[team]) {
            arr.push(this.damageMap[team][key])
        }
        return arr
    }

    /***通过队伍ID获取队伍的伤害统计 */
    public getTotalHurt(team: WorldUnitTeam): number {
        if (!this.totalHurtMap)
            return 0;
        return this.totalHurtMap[team];
    }

}