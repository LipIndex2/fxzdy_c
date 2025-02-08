import { PoolManager } from "../../../core/pool/PoolManager";
import { BaseSkillData } from "./skill/BaseSkillData";
import { ICaster } from "./skill/ICaster";
import { SkillBehavior } from "./skill/SkillBehavior";
import { SkillBuff } from "./skill/SkillBuff";
import { SkillHalo } from "./skill/SkillHalo";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { BulletUnit } from "./unit/bullet/BulletUnit";

/***
 * 伤害包结构
 */
export class DamageVo {

    /***伤害类型 BattleConstantConfig.Normal */
    public status: number;
    /***源伤害数值 */
    public originValue: number = 0;
    /***实际数值 */
    private _value: number = 0;
    public get value(): number {
        return this._value;
    }
    public set value(value: number) {
        if (this._value == 0) {
            this.originValue = value;
        }
        this._value = value;
    }
    /***无防御减伤的数值 */
    public notDefValue: number = 0;
    /****所属技能 */
    public skillInfo: BaseSkillData;
    /***来源BUFF，未必有的 */
    public buffInfo?: SkillBuff;
    /***来源光环，未必有的 */
    public haloInfo?: SkillHalo;
    /***攻击者 */
    public caster: ICaster;
    /***受击者 */
    public target: BattleUnit
    /***伤害类型 0是普攻伤害，1是细菌伤害 2余震伤害 3地狱之火和火焰之路伤害*/
    public hurtType: number = 0
    /***治疗类型 0是普通，1是特蕾莎治疗*/
    public healType: number = 0

    /***忽略不可选择的状态 */
    public ignoreNotSelect: boolean = false;
    /***是否真实伤害 */
    public isRealHurt: boolean = false;

    public skillBehavior: SkillBehavior
    /***伤害子类型 */
    public subType: number = 0;
    /***是否忽略自己对自己的伤害飘字 */
    public ignoreSelfHurtText = true;
    /***受击特效 */
    public hurtEffect: number = 0;
    /***是否秒杀，不处理任何减伤 */
    public isKill: boolean = false
    /***忽略锁血 */
    public ignoreLockingBlood: boolean = false
    /***是否穿透护盾 */
    public isPassThrough: boolean = false

    /***最原始攻击者，志向1个英雄或怪物 */
    public get originalCaster(): BattleUnit {
        if (this.caster instanceof BulletUnit)
            return this.caster.caster
        return this.caster as BattleUnit
    }

    dispose() {
        PoolManager.recovery(this);
    }
}