import { PoolManager } from "../../../core/pool/PoolManager";
import { SortUtils } from "../../../core/utils/SortUtils";
import { BattleLogic } from "./BattleLogic";
import { BattleUtils } from "./BattleUtils";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { DamageVo } from "./DamageVo";
import { ICaster } from "./skill/ICaster";
import { SkillBehavior } from "./skill/SkillBehavior";
import { SkillData } from "./skill/SkillData";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { BulletUnit } from "./unit/bullet/BulletUnit";
import { BaseLeaderSkillUnit } from "./unit/leaderSkill/BaseLeaderSkillUnit";

export interface IBattleLogInfo {
    showLevel: number
    value: number;
    totalHurt: number
    name: string;
    datas: IBattleLogInfo[]
    firstValue: number
}

export interface IBattleLogAttrInfo {
    showLevel: number
    value: number;
    name: string;
    uid: number;
    datas: IBattleLogAttrInfo[]
}

export class BattleLogAttrHeroInfo implements IBattleLogAttrInfo {
    showLevel: number = 0;
    value: number = 0;
    name: string = "";
    uid: number;
    datas: IBattleLogAttrInfo[]

    public clear(): void {
        this.name = "";
        this.value = 0;
        this.datas.length = 0;
    }
}

export class BattleLogAttrInfo implements IBattleLogAttrInfo {
    showLevel: number = 1;
    value: number = 0;
    name: string = "";
    uid: number;
    datas: IBattleLogAttrInfo[]

    public clear(): void {
        this.name = "";
        this.value = 0;
        this.datas.length = 0;
    }
}

/***总榜 */
export class BattleLogInfo implements IBattleLogInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public name: string
    public showLevel: number = 0
    public datas: IBattleLogInfo[] = []
    public type: number
    public firstValue: number

    public clear(): void {
        this.totalHurt = this.value = 0;
        this.datas.length = 0;
    }
}

/***每个英雄的伤害 */
export class BattleLogHeroDamageInfo implements IBattleLogInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public uid: string;
    public name: string
    public showLevel: number = 1
    public datas: IBattleLogInfo[] = []
    public firstValue: number
    protected damageSkillMap: { [skillId: string]: BattleLogSkillDamageInfo } = {}

    public addHurt(damageVo: DamageVo): void {
        this.value += damageVo.value;
        if (damageVo.buffInfo) {
            //buff造成的统计buff
            let buffId: string = damageVo.buffInfo.cfg.id;
            let info = this.damageSkillMap[buffId];
            if (!info) {
                info = this.damageSkillMap[buffId] = new BattleLogSkillDamageInfo()
                info.name = damageVo.buffInfo.cfg.name;
                info.skillId = damageVo.skillInfo?.skillId
                this.datas.push(info)
            }
            info.addHurt(damageVo)
        }
        else {
            let skillId: string = damageVo.skillInfo.skillId
            let info = this.damageSkillMap[skillId];
            if (!info) {
                info = this.damageSkillMap[skillId] = new BattleLogSkillDamageInfo()
                info.skillId = skillId;
                info.name = damageVo.skillInfo.name;
                this.datas.push(info)
            }
            info.addHurt(damageVo)
        }

        for (let skillId in this.damageSkillMap) {
            this.damageSkillMap[skillId].totalHurt = this.value;
        }
    }
}

/***每个技能的伤害 */
export class BattleLogSkillDamageInfo implements IBattleLogInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public name: string
    public skillId: string
    public showLevel: number = 2;
    public firstValue: number
    public datas: IBattleLogInfo[] = []

    public addHurt(damageVo: DamageVo): void {
        this.value += damageVo.value;
        let info = new BattleLogSkillOneDamageInfo();
        info.value = damageVo.value
        info.name = this.name;
        this.datas.unshift(info)

        if (this.datas.length > 10) {
            this.datas.pop()
        }
    }
}

/***每次技能的伤害 */
export class BattleLogSkillOneDamageInfo implements IBattleLogInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public name: string
    public showLevel: number = 3;
    public firstValue: number
    public datas: IBattleLogInfo[] = []
}

/***每个英雄的承伤的信息 */
export class BattleLogHeroEndureInfo implements IBattleLogInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public uid: string;
    public name: string
    public showLevel: number = 1
    public formUnitMap: { [uid: string]: BattleLogEndureInfo } = {}
    public datas: IBattleLogInfo[] = []
    public firstValue: number

    public addHurt(damageVo: DamageVo): void {
        this.value += damageVo.value;

        //伤害来源
        let casterUid: string;
        let name: string
        if (damageVo.caster instanceof BulletUnit) {
            casterUid = damageVo.caster.caster.uid + "";
            name = damageVo.caster.caster.attr.name
        }
        else if (damageVo.caster instanceof BattleUnit) {
            casterUid = damageVo.caster.uid + "";
            name = damageVo.caster.attr.name
        }
        else if (damageVo.caster instanceof BaseLeaderSkillUnit) {
            casterUid = "队长技能" + damageVo.caster.uid;
            name = damageVo.caster.name
        }

        let info = this.formUnitMap[casterUid];
        if (!info) {
            info = this.formUnitMap[casterUid] = new BattleLogEndureInfo()
            info.uid = casterUid
            info.name = name;
            this.datas.push(info)
        }
        info.addHurt(damageVo)

        for (let uid in this.formUnitMap) {
            this.formUnitMap[uid].totalHurt = this.value;
        }
    }
}

/***每个承伤的来源 */
export class BattleLogEndureInfo extends BattleLogHeroDamageInfo {
    /***当前总伤害 */
    public totalHurt: number = 0;
    public value: number = 0;
    public name: string
    public showLevel: number = 2;
    public firstValue: number
    public datas: IBattleLogInfo[] = []

    public addHurt(damageVo: DamageVo): void {
        super.addHurt(damageVo)

        for (let skillId in this.damageSkillMap) {
            this.damageSkillMap[skillId].showLevel = 3;
        }
    }
}

export class BattleLogManager {
    public battleLogic: BattleLogic;
    public damageInfo: BattleLogInfo
    public healInfo: BattleLogInfo
    public endureInfo: BattleLogInfo
    private damageMap: { [uid: string]: BattleLogHeroDamageInfo } = {}
    private endureMap: { [uid: string]: BattleLogHeroEndureInfo } = {}
    private healMap: { [uid: string]: BattleLogHeroDamageInfo } = {}
    private isStart: boolean = false;
    /***第1次收到伤害或者治疗的时间 */
    private firstTime: number = 0;

    public constructor () {
        this.damageInfo = new BattleLogInfo();
        this.damageInfo.name = "伤害"
        this.damageInfo.type = 1;

        this.endureInfo = new BattleLogInfo();
        this.endureInfo.name = "承伤"
        this.endureInfo.type = 2;

        this.healInfo = new BattleLogInfo();
        this.healInfo.name = "治疗"
        this.healInfo.type = 3;
        // this.start();
    }

    public start(): void {
        this.isStart = true
        this.firstTime = 0;
    }

    public stop(): void {
        this.isStart = false
        this.damageInfo.clear();
        this.healInfo.clear();
        this.endureInfo.clear()
        this.damageMap = {};
        this.endureMap = {};
        this.healMap = {};
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

    public hurt(damageVo: DamageVo, type: string): void {
        if (!this.isStart)
            return

        if (!damageVo)
            return

        //伤害来源
        let casterUid: number;
        if (damageVo.caster instanceof BulletUnit && damageVo.caster.caster) {
            casterUid = damageVo.caster.caster.uid;
        }
        else if (damageVo.caster instanceof BattleUnit) {
            casterUid = damageVo.caster.uid;
        }
        else if (damageVo.caster instanceof BaseLeaderSkillUnit) {
            casterUid = damageVo.caster.uid;
        }
        else {
            //无主的伤害
            console.log("无主的伤害")
            return
        }

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
            if (type == "hurt")
                this.hurtHandler(damageVo, casterUid + "", caster.attr.name)
            else if (type == "heal")
                this.healHandler(damageVo, casterUid + "", caster.attr.name)
        }
        else {
            if (damageVo.caster instanceof BaseLeaderSkillUnit) {
                if (type == "hurt")
                    this.hurtHandler(damageVo, "队长技能" + damageVo.caster._cfg.id, damageVo.caster.name)
                else
                    this.healHandler(damageVo, "队长技能" + damageVo.caster._cfg.id, damageVo.caster.name)
            }
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
                this.endureHandler(damageVo, hurtUid + "", target.attr.name)
            }
        }
    }

    public hurtHandler(damageVo: DamageVo, uid: string, name: string): void {
        this.damageInfo.totalHurt += damageVo.value;
        this.damageInfo.value = this.damageInfo.totalHurt;

        if (damageVo.skillInfo) {
            //造成伤害
            let damageInfo = this.damageMap[uid]
            if (!damageInfo) {
                damageInfo = this.damageMap[uid] = new BattleLogHeroDamageInfo();
                damageInfo.uid = uid;
                damageInfo.name = name;
                this.damageInfo.datas.push(damageInfo)
            }
            damageInfo.addHurt(damageVo)
        }
        else if (damageVo.buffInfo) {
            console.log("无技能来源的BUFF伤害")
        }
        else {
            //非技能伤害
            console.log("非技能伤害")
            return
        }

        for (let uid in this.damageMap) {
            this.damageMap[uid].totalHurt = this.damageInfo.totalHurt;
        }

        if (!this.firstTime)
            this.firstTime = this.battleLogic.frameIndex;
    }

    public endureHandler(damageVo: DamageVo, uid: string, name: string): void {
        this.endureInfo.totalHurt += damageVo.value;
        this.endureInfo.value = this.endureInfo.totalHurt;

        if (damageVo.skillInfo) {
            //承受伤害
            let endureInfo = this.endureMap[uid]
            if (!endureInfo) {
                endureInfo = this.endureMap[uid] = new BattleLogHeroEndureInfo()
                endureInfo.uid = uid;
                endureInfo.name = name;
                this.endureInfo.datas.push(endureInfo)
            }
            endureInfo.addHurt(damageVo)
        }
        else {
            return
        }

        for (let uid in this.endureMap) {
            this.endureMap[uid].totalHurt = this.endureInfo.totalHurt;
        }

        if (!this.firstTime)
            this.firstTime = this.battleLogic.frameIndex;
    }

    public healHandler(damageVo: DamageVo, uid: string, name: string): void {
        this.healInfo.totalHurt += damageVo.value;
        this.healInfo.value = this.healInfo.totalHurt;

        if (damageVo.skillInfo) {
            //造成伤害
            let healInfo = this.healMap[uid]
            if (!healInfo) {
                healInfo = this.healMap[uid] = new BattleLogHeroDamageInfo();
                healInfo.uid = uid;
                healInfo.name = name;
                this.healInfo.datas.push(healInfo)
            }
            healInfo.addHurt(damageVo)
        }
        else {
            console.log("非技能治疗")
            return
        }

        for (let uid in this.healMap) {
            this.healMap[uid].totalHurt = this.healInfo.totalHurt;
        }

        if (!this.firstTime)
            this.firstTime = this.battleLogic.frameIndex;
    }

    /***战斗时间 */
    public getTime(): number {
        return BattleUtils.getTimeByFrame(this.battleLogic.frameIndex - this.firstTime)
    }

    /***获取所有类型统计 */
    public getAllList(): IBattleLogInfo[] {
        return [this.damageInfo, this.endureInfo, this.healInfo]
    }

    public getHeroDamageList(type: number): IBattleLogInfo[] {
        if (type == 1) {
            SortUtils.sortBy2(this.damageInfo.datas, ["value"], [false], false)
            return this.damageInfo.datas
        }
        else if (type == 2) {
            SortUtils.sortBy2(this.endureInfo.datas, ["value"], [false], false)
            return this.endureInfo.datas
        }
        else {
            SortUtils.sortBy2(this.healInfo.datas, ["value"], [false], false)
            return this.healInfo.datas
        }
    }

    public getSkillDamageList(uid: string, type: number): IBattleLogInfo[] {
        if (type == 1 && this.damageMap[uid]) {
            SortUtils.sortBy2(this.damageMap[uid].datas, ["value"], [false], false)
            return this.damageMap[uid]?.datas
        }
        else if (type == 2 && this.endureMap[uid]) {
            SortUtils.sortBy2(this.endureMap[uid].datas, ["value"], [false], false)
            return this.endureMap[uid]?.datas
        }
        else if (this.healMap[uid]) {
            SortUtils.sortBy2(this.healMap[uid].datas, ["value"], [false], false)
            return this.healMap[uid]?.datas
        }
        return []
    }

    public getHeroDamage(uid: string, type: number): IBattleLogInfo {
        if (type == 1)
            return this.damageMap[uid]
        else if (type == 3) {
            return this.healMap[uid]
        }
        else
            return this.endureMap[uid]
    }

    public getHeroSkillDamage(uid: string, skill: string): IBattleLogInfo[] {
        for (let i = 0; i < this.damageMap[uid].datas.length; i++) {
            if (this.damageMap[uid].datas[i]["skillId"] == skill) {
                return this.damageMap[uid].datas[i].datas;
            }
        }
    }
}