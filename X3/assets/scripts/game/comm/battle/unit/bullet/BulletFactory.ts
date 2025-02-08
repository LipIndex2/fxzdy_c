import { PoolManager } from "../../../../../core/pool/PoolManager";
import { TableManager } from "../../../../../core/table/TableManager";
import { HeroManager } from "../../../../modules/hero/HeroManager";
import { WorldManager } from "../../../world/WorldManager";
import { BattleLogicManager } from "../../BattleLogicManager";
import { BattleUtils } from "../../BattleUtils";
import { BulletType } from "../../enum/BattleEnum";
import { FightType } from "../../enum/FightType";
import UnitFactory from "../../factory/UnitFactory";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { AnimBaseUnitNode } from "../../node/AnimBaseUnitNode";
import { SpriteFrameUnitNode } from "../../node/SpriteFrameUnitNode";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { BattleUnit } from "../battle/BattleUnit";
import { BombUnit } from "./BombUnit";
import { BounceBullet } from "./BounceBullet";
import { BulletUnit } from "./BulletUnit";
import { ConvoluteBullet } from "./ConvoluteBullet";
import { LoopRectangleBullet, LoopRectangleBulletShow } from "./LoopRectangleBullet";
import { LoopRotateRectangleBullet, LoopRotateRectangleBulletShow } from "./LoopRotateRectangleBullet";
import { MeteoriteBulletUnit } from "./MeteoriteBulletUnit";
import { PhysicalBulletUnit, PhysicalBulletUnitShow } from "./PhysicalBulletUnit";
import { RectangleBulletUnit } from "./RectangleBulletUnit";
import { RocketBulletUnit, RocketBulletUnitShow } from "./RocketBulletUnit";
import { SmartBullet } from "./SmartBullet";
import { StretchBounceBullet, StretchBounceBulletShow } from "./StretchBounceBullet";
import { StretchBullet, StretchBulletShow } from "./StretchBullet";
import { ThroughBullet } from "./ThroughBullet";
import { ThrowBulletTargetUnit } from "./ThrowBulletTargetUnit";
import { ThrowBulletUnit } from "./ThrowBulletUnit";

export default class BulletFactory {
    /**创建子弹单元 */
    public static createBulletUnit(missileId: string, teamId: number, targetTeamId: number, fightType: FightType, fighter: BattleUnit) {
        let cfg = TableManager.getDataById(table.battle.MissileConfig, missileId);
        if (!cfg) return;

        let unit: BulletUnit;
        let isLoop = cfg.notLoop == 0 || cfg.notLoop == undefined;
        let showUnit: BulletShowUnit;
        switch (cfg.type) {
            case BulletType.NormalBullet:
                unit = PoolManager.getItem(BulletUnit);
                break;
            case BulletType.SmartBullet:
                unit = PoolManager.getItem(SmartBullet);
                break;
            case BulletType.PhysicalBullet:
                unit = PoolManager.getItem(PhysicalBulletUnit);
                showUnit = PoolManager.getItem(PhysicalBulletUnitShow);
                break;
            case BulletType.Bomb:
                unit = PoolManager.getItem(BombUnit);
                isLoop = false;
                break;
            case BulletType.Rectangle:
                unit = PoolManager.getItem(RectangleBulletUnit);
                break;
            case BulletType.Throw:
                unit = PoolManager.getItem(ThrowBulletUnit);
                break;
            case BulletType.Stretch:
                unit = PoolManager.getItem(StretchBullet);
                showUnit = PoolManager.getItem(StretchBulletShow)
                break;
            case BulletType.Bounce:
                unit = PoolManager.getItem(BounceBullet);
                break;
            case BulletType.StretchBounceBullet:
                unit = PoolManager.getItem(StretchBounceBullet);
                showUnit = PoolManager.getItem(StretchBounceBulletShow)
                break;
            case BulletType.Rocket:
                unit = PoolManager.getItem(RocketBulletUnit);
                showUnit = PoolManager.getItem(RocketBulletUnitShow)
                break;
            case BulletType.LoopRectangle:
                unit = PoolManager.getItem(LoopRectangleBullet);
                showUnit = PoolManager.getItem(LoopRectangleBulletShow)
                break;
            case BulletType.ThroughBullet:
                unit = PoolManager.getItem(ThroughBullet);
                break;
            case BulletType.ConvoluteBullet:
                unit = PoolManager.getItem(ConvoluteBullet);
                break;
            case BulletType.LoopRotateRectangle:
                unit = PoolManager.getItem(LoopRotateRectangleBullet);
                showUnit = PoolManager.getItem(LoopRotateRectangleBulletShow)
                break;
            case BulletType.ThrowTarget:
                unit = PoolManager.getItem(ThrowBulletTargetUnit);
                break;
            case BulletType.Meteorite:
                unit = PoolManager.getItem(MeteoriteBulletUnit);
                break;
        }
        if (!unit) return;
        return this.createHandler(unit, showUnit, cfg, isLoop, fightType, targetTeamId, teamId, fighter);
    }

    private static createHandler(unit: BulletUnit, showUnit: BulletShowUnit, cfg: table.battle.MissileConfig, isLoop: boolean, fightType: FightType, targetTeamId: number, teamId: number, fighter: BattleUnit): BulletUnit {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        unit.setBattleLogic(battleLogic)
        unit.teamId = teamId;
        unit.targetTeamId = targetTeamId
        unit.init(cfg);
        unit.uid = unit.battleLogic.createUid()

        if (!battleLogic.isNotShowBattleEffect()) {
            if (!showUnit)
                showUnit = PoolManager.getItem(BulletShowUnit);
            showUnit.setUnitData(unit)


            let skinId = fighter.attr.skinId;
            if (!skinId && fighter.summon) {
                let summonParentUnit = fighter.getSummonParentUnit()
                if (summonParentUnit) {
                    skinId = summonParentUnit.attr.skinId;
                }
            }

            let modelIds = cfg.modelId;
            if (modelIds) {
                for (let i = 0; i < modelIds.length; i++) {
                    if (fighter?.attr) {
                        let modelId = BattleUtils.getSkinEffectModel(modelIds[i], skinId)
                        if (cfg.layer == 1) {
                            showUnit.createOtherSpineNode(modelId, WorldManager.ins().shadowLayer, isLoop)
                        } else if (cfg.layer == 2) {
                            showUnit.createOtherSpineNode(modelId, WorldManager.ins().roleLayer, isLoop)
                        } else
                            showUnit.createOtherSpineNode(modelId, WorldManager.ins().effectLayer, isLoop)
                    }
                }
            }
            showUnit.onInitData()
            unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit;
    }
}