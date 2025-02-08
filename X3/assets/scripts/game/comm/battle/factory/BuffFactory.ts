import { PoolManager } from "../../../../core/pool/PoolManager";
import { BattleLogic } from "../BattleLogic";
import { AbnormalHurtBuff } from "../buff/AbnormalHurtBuff";
import { AddBuffTimeBuff } from "../buff/AddBuffTimeBuff";
import { AddPassivityFlagBuff } from "../buff/AddPassivityFlagBuff";
import { AttrValueBuff } from "../buff/AttrValueBuff";
import { BehaviorBuff } from "../buff/BehaviorBuff";
import { BoomLayerBuff } from "../buff/BoomLayerBuff";
import { DelayGuardBuff } from "../buff/DelayGuardBuff";
import { DispelAbnormalTypeBuff } from "../buff/DispelAbnormalTypeBuff";
import { DispelIdBuff } from "../buff/DispelIdBuff";
import { ElementRecursionBuff } from "../buff/ElementRecursionBuff";
import { GuardBuff } from "../buff/GuardBuff";
import { HaloBuff } from "../buff/HaloBuff";
import { HaloHurtBuff } from "../buff/HaloHurtBuff";
import { HaloHurtByAtkTimeBuff } from "../buff/HaloHurtByAtkTimeBuff";
import { HaloMaxHurtBuff } from "../buff/HaloMaxHurtBuff";
import { HealMaxHpBuff } from "../buff/HealMaxHpBuff";
import { HurtBuff } from "../buff/HurtBuff";
import { HurtCutHpBuff } from "../buff/HurtCutHpBuff";
import { HurtNowHpBuff } from "../buff/HurtNowHpBuff";
import { KillBuff } from "../buff/KillBuff";
import { MoveHurtBuff } from "../buff/MoveHurtBuff";
import { MoveRemoveBuff } from "../buff/MoveRemoveBuff";
import { PullBuff } from "../buff/PullBuff";
import { PushPassivityBuff } from "../buff/PushPassivityBuff";
import { RealHurtBuff } from "../buff/RealHurtBuff";
import { ReviveBuff } from "../buff/ReviveBuff";
import { ShieldAtkBuff } from "../buff/ShieldAtkBuff";
import { ShieldBuff } from "../buff/ShieldBuff";
import { ShieldMaxHpBuff } from "../buff/ShieldMaxHpBuff";
import { ShieldTargetMaxHpBuff } from "../buff/ShieldTargetMaxHpBuff";
import { SuddenDeathBuff } from "../buff/SuddenDeathBuff";
import { TieBuff } from "../buff/TieBuff";
import { TowBuff } from "../buff/TowBuff";
import { ZhanYiBuff } from "../buff/ZhanYiBuff";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffType } from "../skill/SkillEnum";

export default class BuffFactory {

    /**
    * 创建buff
    * @param cfg 
    * @returns 
    */
    static createBuff(cfg: table.battle.BuffConfig, timeLimit: number, battleLogic: BattleLogic): SkillBuff {
        let buff: SkillBuff
        switch (cfg.effectType) {
            case BuffType.Kill:
                buff = PoolManager.getItem(KillBuff);
                break
            case BuffType.Hurt:
                buff = PoolManager.getItem(HurtBuff);
                break
            case BuffType.RealHurt:
                buff = PoolManager.getItem(RealHurtBuff);
                break
            case BuffType.HealMax:
                buff = PoolManager.getItem(HealMaxHpBuff);
                break
            case BuffType.BoomLayerBuff:
                buff = PoolManager.getItem(BoomLayerBuff);
                break
            case BuffType.HaloHurt:
                buff = PoolManager.getItem(HaloHurtBuff);
                break
            case BuffType.HaloMaxHurt:
                buff = PoolManager.getItem(HaloMaxHurtBuff);
                break
            case BuffType.ShieldAtk:
                buff = PoolManager.getItem(ShieldAtkBuff);
                break
            case BuffType.ShieldMaxHp:
                buff = PoolManager.getItem(ShieldMaxHpBuff);
                break
            case BuffType.ShieldTargetMaxHpBuff:
                buff = PoolManager.getItem(ShieldTargetMaxHpBuff);
                break
            case BuffType.Shield:
                buff = PoolManager.getItem(ShieldBuff);
                break
            case BuffType.AbnormalHurt:
                buff = PoolManager.getItem(AbnormalHurtBuff);
                break
            case BuffType.HaloBuff:
                buff = PoolManager.getItem(HaloBuff);
                break
            case BuffType.DispelAbnormalType:
                buff = PoolManager.getItem(DispelAbnormalTypeBuff);
                break
            case BuffType.DispelId:
                buff = PoolManager.getItem(DispelIdBuff);
                break
            case BuffType.ZhanYi:
                buff = PoolManager.getItem(ZhanYiBuff);
                break
            case BuffType.HaloHurtByAtkTime:
                buff = PoolManager.getItem(HaloHurtByAtkTimeBuff);
                break
            case BuffType.SuddenDeath:
                buff = PoolManager.getItem(SuddenDeathBuff);
                break
            case BuffType.HurtCutHp:
                buff = PoolManager.getItem(HurtCutHpBuff);
                break
            case BuffType.HurtNowHp:
                buff = PoolManager.getItem(HurtNowHpBuff);
                break
            case BuffType.PushPassivity:
                buff = PoolManager.getItem(PushPassivityBuff);
                break
            case BuffType.AddPassivityFlag:
                buff = PoolManager.getItem(AddPassivityFlagBuff);
                break
            case BuffType.AddBuffTime:
                buff = PoolManager.getItem(AddBuffTimeBuff);
                break
            case BuffType.MoveHurt:
                buff = PoolManager.getItem(MoveHurtBuff);
                break
            case BuffType.Tie:
                buff = PoolManager.getItem(TieBuff);
                break
            case BuffType.Guard:
                buff = PoolManager.getItem(GuardBuff);
                break
            case BuffType.DelayGuard:
                buff = PoolManager.getItem(DelayGuardBuff);
                break
            case BuffType.ElementRecursion:
                buff = PoolManager.getItem(ElementRecursionBuff);
                break
            case BuffType.Revive:
                buff = PoolManager.getItem(ReviveBuff);
                break
            case BuffType.AttrValue:
                buff = PoolManager.getItem(AttrValueBuff);
                break
            case BuffType.Tow:
                buff = PoolManager.getItem(TowBuff);
                break
            case BuffType.Pull:
                buff = PoolManager.getItem(PullBuff);
                break
            case BuffType.Behavior:
                buff = PoolManager.getItem(BehaviorBuff);
                break
            case BuffType.MoveRemoveBuff:
                buff = PoolManager.getItem(MoveRemoveBuff);
                break
            default:
                buff = PoolManager.getItem(SkillBuff);
                break

        }
        buff.init(cfg, timeLimit, battleLogic);
        return buff;
    }
}