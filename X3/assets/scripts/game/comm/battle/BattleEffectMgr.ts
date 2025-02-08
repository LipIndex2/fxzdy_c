import { Vec2 } from "cc";
import { HurtNumType, WorldUnitTeam } from "./enum/BattleEnum";
import BattleShowFactory from "./factory/BattleShowFactory";
import { BattleLogic } from "./BattleLogic";
import { director } from "cc";
import { ShakeUtils } from "../../../core/utils/ShakeUtils";
import { WorldManager } from "../world/WorldManager";
import FacadeManager from "../../../core/mvc/FacadeManager";
import NotificationKey from "../../event/NotificationKey";
import { SkillData } from "./skill/SkillData";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { TableManager } from "../../../core/table/TableManager";

export default class BattleEffectMgr {
    public battleLogic: BattleLogic;
    public createNum(type: HurtNumType, val: number, pos: Vec2, offsetY = 100, ...arg): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return
        BattleShowFactory.createNum(type, val, pos, offsetY, ...arg)
    }

    public createDrop(modelId: number, val: number, pos: Vec2, killerUid?: number): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return
        let dropCfg = TableManager.getDataById(table.monster.MonsterDropConfig, modelId);
        if (dropCfg?.type == 1 && dropCfg.param?.model) {
            BattleShowFactory.createDrop(dropCfg.param.model, val, pos, killerUid)
        }
    }

    public showSkillCD(target: BattleUnit, skill: SkillData): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return
        if (target.teamId == WorldUnitTeam.Self)
            FacadeManager.ins().emit(NotificationKey.BATTLE_SKILL_CD_UPDATE, skill);
    }

    public shake(times: number = 2, offset: number = 4, speed: number = 32, mode: number = 3): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return
        ShakeUtils.shake(WorldManager.ins().effectTopLayer, times, offset, speed, mode)
        ShakeUtils.shake(WorldManager.ins().effectLayer, times, offset, speed, mode)
        ShakeUtils.shake(WorldManager.ins().roleLayer, times, offset, speed, mode)
        ShakeUtils.shake(WorldManager.ins().shadowLayer, times, offset, speed, mode)
        ShakeUtils.shake(WorldManager.ins().bgLayer, times, offset, speed, mode)
        ShakeUtils.shake(WorldManager.ins().underLayer, times, offset, speed, mode)
        let mapRoot = director.getScene().getChildByPath("Canvas/MapRoot")
        ShakeUtils.shake(mapRoot, times, offset, speed, mode)
    }

    public stopShake(): void {
        ShakeUtils.stopShake(WorldManager.ins().effectTopLayer)
        ShakeUtils.stopShake(WorldManager.ins().effectLayer)
        ShakeUtils.stopShake(WorldManager.ins().roleLayer)
        ShakeUtils.stopShake(WorldManager.ins().shadowLayer)
        ShakeUtils.stopShake(WorldManager.ins().bgLayer)
        ShakeUtils.stopShake(WorldManager.ins().underLayer)
        let mapRoot = director.getScene().getChildByPath("Canvas/MapRoot")
        ShakeUtils.stopShake(mapRoot)
    }
}