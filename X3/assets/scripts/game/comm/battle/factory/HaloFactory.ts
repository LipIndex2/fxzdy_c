import { PoolManager } from "../../../../core/pool/PoolManager";
import { HurtHalo } from "../halo/HurtHalo";
import { ContactBoomHalo } from "../halo/ContactBoomHalo";
import { HaloType } from "../skill/SkillEnum";
import { SkillHalo } from "../skill/SkillHalo";
import { AddBuffHalo } from "../halo/AddBuffHalo";
import { HealHalo } from "../halo/HealHalo";
import { HealMaxHalo } from "../halo/HealMaxHalo";
import { TeamHurtHalo } from "../halo/TeamHurtHalo";

export default class HaloFactory {

    /**
    * 创建buff
    * @param cfg 
    * @returns 
    */
    static createHalo(cfg: table.battle.HaloConfig): SkillHalo {
        let halo: SkillHalo
        switch (cfg.effectType) {
            case HaloType.Hurt:
                halo = PoolManager.getItem(HurtHalo);
                break
            case HaloType.TeamHurt:
                halo = PoolManager.getItem(TeamHurtHalo);
                break
            case HaloType.ContactBoom:
                halo = PoolManager.getItem(ContactBoomHalo);
                break
            case HaloType.AddBuff:
                halo = PoolManager.getItem(AddBuffHalo);
                break
            case HaloType.Heal:
                halo = PoolManager.getItem(HealHalo);
                break
            case HaloType.HealMaxHp:
                halo = PoolManager.getItem(HealMaxHalo);
                break
            default:
                halo = PoolManager.getItem(SkillHalo);
                break
        }
        return halo;
    }
}