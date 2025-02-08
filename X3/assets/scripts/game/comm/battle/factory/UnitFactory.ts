import { PoolManager } from "../../../../core/pool/PoolManager";
import { CollectSkillype, LeaderSkillype as LeaderSkillType, WorldUnitTeam } from "../enum/BattleEnum";
import { MonsterUnit } from "../unit/battle/MonsterUnit";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { WorldManager } from "../../world/WorldManager";
import { TableManager } from "../../../../core/table/TableManager";
import { MineralUnit } from "../unit/MineralUnit";
import { ICreateMineralData, ICreateMonsterData } from "../interface/BattleInterface";
import { IMapObject } from "../../../tiledMap/IMapObject";
import { AreaUnit } from "../unit/AreaUnit";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { IBattleUnitData } from "../../../modules/battle/vo/IBattleUnitData";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { WuRenJiUnit, WuRenJiUnitShow } from "../unit/leaderSkill/WuRenJiUnit";
import { BaseLeaderSkillUnit } from "../unit/leaderSkill/BaseLeaderSkillUnit";
import { HeroFactory } from "./HeroFactory";
import { IVec2Like } from "cc";
import { Vec2 } from "cc";
import { MonsterFactory } from "./MonsterFactory";
import { NvShenQiFuUnit } from "../unit/leaderSkill/NvShenQiFuUnit";
import { TianJiangBaoChong } from "../unit/leaderSkill/TianJiangBaoChong";
import { JingZhiJieJieShow, JingZhiJieJieUnit } from "../unit/leaderSkill/JingZhiJieJieUnit";
import { LeaderSkillShowUnit } from "../show/LeaderSkillShowUnit";
import { MineralShowUnit } from "../show/MineralShowUnit";
import { FightType } from "../enum/FightType";
import { BattleLogicManager } from "../BattleLogicManager";
import { v2 } from "cc";
import { OtherSkillUnit } from "../unit/other/OtherSkillUnit";
import { OtherSkillData } from "../skill/OtherSkillData";
import { JianMieJiGuangShow, JianMieJiGuangUnit } from "../unit/leaderSkill/JianMieJiGuangUnit";
import { PetFactory } from "./PetFactory";
import { PetUnit } from "../unit/battle/PetUnit";
import { PetBattleData } from "../unit/battle/PetBattleData";
import { BattleUtils } from "../BattleUtils";
import { SkillUtils } from "../skill/SkillUtils";
import { MonsterFlag } from "../skill/SkillEnum";
import { FanZhenNengLiangChangShow, FanZhenNengLiangChangUnit } from "../unit/leaderSkill/FanZhenNengLiangChang";
import { BaseCollectSkillUnit } from "../unit/collectSkill/BaseCollectSkillUnit";
import { CollectSkillShowUnit } from "../show/CollectSkillShowUnit";
import { WuXianShouTaoCollectUnit } from "../unit/collectSkill/WuXianShouTaoCollectUnit";

export default class UnitFactory {
    public static createHeroUnit(teamId: number, data: IBattleUnitData, fightType: FightType) {
        return HeroFactory.create(data.configId, fightType, data, teamId);
    }

    public static findNotBlockPos(fightType: FightType, pos: IVec2Like, range: { w: number, h: number }, angle: number = 0, num: number = 20, isAStarCheck: boolean = false): IVec2Like {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let tryTimes = num;
        while (--tryTimes > 0) {
            let newPos = battleLogic.randomMgr.createRandomCoordinate(pos as Vec2, range.w, range.h, angle)
            if (isAStarCheck) {
                //通过A星检查
                if (!battleLogic.unitCollisionsManager.isInBlock(newPos)) {
                    let paths = battleLogic.aStar.findPaths(pos as Vec2, newPos, false, 0, false);
                    if (paths && paths.length > 0 && paths.length < 15) {
                        return newPos;
                    }
                }
            }
            else {
                if (!battleLogic.unitCollisionsManager.isInBlock(newPos)) {
                    return newPos;
                }
            }
        }

        if (isAStarCheck) {
            let newPos = battleLogic.aStar.getTilePoint(pos.x, pos.y);
            let tempPos = v2()
            let numberTurns: number = 0;
            while (true) {
                numberTurns++;
                //寻找上下左右可走的一格
                for (let i = -numberTurns; i < numberTurns; i++) {
                    for (let j = -numberTurns; j < numberTurns; j++) {
                        tempPos.set(newPos.x + i, newPos.y + j)
                        if (battleLogic.aStar.findPathsByTile(newPos, tempPos, false, 0, false)) {
                            return battleLogic.aStar.getPixelPoint(tempPos.x, tempPos.y);
                        }
                    }
                }
                if (numberTurns > 20) {
                    break
                }
            }
        }
        return battleLogic.randomMgr.createRandomCoordinate(pos as Vec2, range.w, range.h, angle);
    }

    /**基于战斗数据创建单位 */
    public static createUnitByBattleData(teamId: number, data: IBattleUnitData, fightType: FightType) {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        if (data.type == ServerEnums.UnitType.HERO || data.type == ServerEnums.UnitType.HELP_HERO) {
            return this.createHeroUnit(teamId, data, fightType);
        } else if (data.type == ServerEnums.UnitType.MONSTER) {
            let resourcePoint: IVec2Like;
            if (data.resourceId == -1) {
                //在己方附近出现
                resourcePoint = this.findNotBlockPos(fightType, battleLogic.getTeamPosByTeamId(WorldUnitTeam.Self), { w: 600, h: 600 }, 0, 20, true);
            } else {
                resourcePoint = battleLogic.unitProcessor.mapIns.getUnitPosObjectByObjectId(data.resourceId);
            }

            const configId = data.configId;
            let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, configId); //data.monsterId
            if (!cfg || !resourcePoint) {
                console.error(`创建单位成功但是没有配置. 导致单位创建失败. not found table.monster.MonsterAttributeConfig. configId=${configId}, teamId=${teamId}, data = `, data)
                return;
            }
            let createArr = MonsterFactory.create(configId, fightType)
            let unit: MonsterUnit = createArr[0];
            let monsterResourceConfig = TableManager.getDataById(table.battle.MonsterResourceConfig, data.monsterResourceId)
            unit.hatredGroup = monsterResourceConfig?.hatredGroup || 0;
            unit.dropRewards = data.dropReward;
            unit.teamId = teamId;
            unit.formationPosition = data.position;
            unit.formationPositionByServer = data.position;
            if (data.uid) {
                unit.uid = data.uid;
            }
            else {
                unit.uid = unit.battleLogic.createUid()
            }
            if (data.resourceIdx == 0) {
                unit.setPosXY(resourcePoint.x, resourcePoint.y); //防止怪物完全重叠
            } else if (data.resourceId != -1) {
                let range = BattleConstantConfig.monsterRefreshRange;
                let monsterPos = this.findNotBlockPos(fightType, resourcePoint, range, range.a, 2, true);
                unit.setPosXY(monsterPos.x, monsterPos.y);
            }
            else {
                unit.setPosXY(resourcePoint.x, resourcePoint.y);
            }
            unit.init(cfg, data);
            unit.battleLogic.easyLogManager.initHeroData(unit)

            if (!battleLogic.isNotShowBattleEffect() && !SkillUtils.checkSkillSubType(MonsterFlag.Hide, cfg.flag)) {
                let showUnit = createArr[1];
                showUnit.setUnitData(unit)
                battleLogic.showMgr.addCreateList(showUnit, cfg.modelId, { fadeIn: 500 })
                // let mcfg = TableManager.getDataById(table.model.ModelConfig, cfg.modelId);
                // let node: AnimBaseUnitNode = mcfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
                // node.loadByModelId(data.modelId);
                // let showUnit = createArr[1];
                // showUnit.setUnitData(unit)
                // showUnit.setSpineNode(node)
                // showUnit.fadeIn(500);
                // WorldManager.ins().roleLayer.addChild(node);
                // showUnit.onInitData()
                // unit.battleLogic.showMgr.addUnit(showUnit);
            }
            return unit;
        }
    }

    public static createMonsterUnit(data: ICreateMonsterData, resourceIdx: number, fightType: FightType) {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, data.monsterId); //data.monsterId
        if (!cfg) {
            cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, 1); //data.monsterId
        }
        if (!cfg) return;


        let createArr = MonsterFactory.create(data.monsterId, fightType)
        let unit: MonsterUnit = createArr[0]
        unit.uid = unit.battleLogic.createUid()
        unit.teamId = data.teamId;
        unit.resourceId = data.resourceId;
        unit.resourceIdx = resourceIdx;
        unit.isNotStatisticsHp = data.isNotStatisticsHp
        unit.splitMonsterFatherUid = data.splitMonsterFatherUid;

        if (resourceIdx == 0) {
            unit.setPosXY(data.pos.x, data.pos.y); //防止怪物完全重叠
        }
        else if (data.summon) {
            let summonPos = BattleUtils.setPosNotBlockPos(fightType, v2(data.pos))
            unit.setPosXY(summonPos.x, summonPos.y); //防止怪物完全重叠
        }
        else {
            let range = BattleConstantConfig.monsterRefreshRange;

            //资源点是否处于未解锁区域，假如是的话，则不按A星可联通来判断
            let isResourcePointInBlock = !battleLogic.unitCollisionsManager.isInCanUnlockBlock(data.pos)
            let monsterPos = this.findNotBlockPos(fightType, data.pos, range, range.a, 2, isResourcePointInBlock);
            unit.setPosXY(monsterPos.x, monsterPos.y);
        }
        unit.initAttrMod();
        unit.init(cfg, null, data.attr);
        unit.setDirction(data.dirction);

        if (!battleLogic.isNotShowBattleEffect() && (!data.summon || !data.summon.possess) && !SkillUtils.checkSkillSubType(MonsterFlag.Hide, cfg.flag)) {
            let showUnit = createArr[1];
            showUnit.setUnitData(unit)

            let modelId = cfg.modelId;
            if (data.summon) {
                let summonParentUnit = battleLogic.unitProcessor.getBattleUnitByUid(data.summon.byUid);
                if (summonParentUnit) {
                    modelId = BattleUtils.getSummonModel(modelId, summonParentUnit.attr.skinId)
                }
            }

            battleLogic.showMgr.addCreateList(showUnit, modelId, data.summon ? null : { fadeIn: 500 })
            // let mcfg = TableManager.getDataById(table.model.ModelConfig, cfg.modelId);
            // let node: AnimBaseUnitNode = mcfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
            // node.loadByModelId(cfg.modelId);
            // let showUnit = createArr[1];
            // showUnit.setUnitData(unit)
            // showUnit.setSpineNode(node)
            // if (!data.summon)
            //     showUnit.fadeIn(500);
            // WorldManager.ins().roleLayer.addChild(node);
            // showUnit.onInitData()
            // unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit;
    }

    public static createPetUnit(data: PetBattleData, fightType: FightType): PetUnit {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let cfg = TableManager.getDataById(table.pet.PetConfig, data.petId); //data.monsterId
        if (!cfg) {
            return null;
        }

        let createArr = PetFactory.create(data.petId, fightType)
        let unit: PetUnit = createArr[0]
        unit.uid = data.uid ? data.uid : unit.battleLogic.createUid()
        unit.teamId = data.teamId;

        let teamUnit = battleLogic.getTeamByTeamId(data.teamId)
        unit.setPosXY(teamUnit.pos.x, teamUnit.pos.y); //防止怪物完全重叠
        unit.init(cfg, data);
        unit.battleLogic.easyLogManager.initHeroData(unit)
        if (!battleLogic.isNotShowBattleEffect()) {
            let node: ActorUnitNode = PoolManager.getItem(ActorUnitNode);
            node.loadByModelId(cfg.modelId);
            let showUnit = createArr[1]
            showUnit.setUnitData(unit)
            showUnit.setSpineNode(node)
            WorldManager.ins().roleLayer.addChild(node);
            showUnit.onInitData()
            unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit
    }

    public static createMineralUnit(data: ICreateMineralData, resourceIdx: number, fightType: FightType) {
        let cfg = TableManager.getDataById(table.map.MapMineralConfig, data.mineralId);
        let unit: MineralUnit = PoolManager.getItem(MineralUnit);
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        unit.uid = unit.battleLogic.createUid()

        unit.resourceId = data.resourceId;
        unit.resourceIdx = resourceIdx;
        unit.setPosXY(data.pos.x, data.pos.y); //+40 为了受击位置上移
        unit.init(cfg);
        // let mcfg = TableManager.getDataById(table.model.ModelConfig, cfg.modelId);
        // let node: AnimBaseUnitNode = mcfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
        // node.loadByModelId(cfg.modelId);
        // node.setPosition(data.pos.x, data.pos.y);



        let showUnit = PoolManager.getItem(MineralShowUnit)
        showUnit.setUnitData(unit)
        unit.battleLogic.showMgr.addCreateList(showUnit, cfg.modelId)
        // showUnit.setSpineNode(node)
        // showUnit.onInitData()
        // unit.battleLogic.showMgr.addUnit(showUnit);
        return unit;
    }

    /**创建其他技能实体 */
    public static createOtherSkillUnit(skillData: OtherSkillData, teamId: number, targetTeamId: number, fightType: FightType): OtherSkillUnit {
        let unit: OtherSkillUnit = PoolManager.getItem(OtherSkillUnit);
        if (!unit) return;
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        unit.init(skillData)
        unit.teamId = teamId;
        unit.uid = unit.battleLogic.createUid()
        return unit;
    }

    /**创建队长技能实体 */
    public static createLeaderSkillUnit(id: string, teamId: number, targetTeamId: number, fightType: FightType): BaseLeaderSkillUnit {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let cfg = TableManager.getDataById(table.captain.CaptainSkillConfig, id);
        if (!cfg) return;

        let unit: BaseLeaderSkillUnit;
        let showUnit: LeaderSkillShowUnit;
        let isLoop: boolean = false
        switch (cfg.belongType) {
            case LeaderSkillType.WuRenJi:
                unit = PoolManager.getItem(WuRenJiUnit);
                isLoop = true;
                showUnit = PoolManager.getItem(WuRenJiUnitShow);
                break;
            case LeaderSkillType.JianMieJiGuang:
                unit = PoolManager.getItem(JianMieJiGuangUnit);
                showUnit = PoolManager.getItem(JianMieJiGuangShow);
                break;
            case LeaderSkillType.NvShenQiFu:
                unit = PoolManager.getItem(NvShenQiFuUnit);
                break;
            case LeaderSkillType.JingZhiJieJie:
                unit = PoolManager.getItem(JingZhiJieJieUnit);
                showUnit = PoolManager.getItem(JingZhiJieJieShow);
                break;
            case LeaderSkillType.BaoChong:
                unit = PoolManager.getItem(TianJiangBaoChong);
                break;
            case LeaderSkillType.FanZhenNengLiangChang:
                unit = PoolManager.getItem(FanZhenNengLiangChangUnit);
                showUnit = PoolManager.getItem(FanZhenNengLiangChangShow);
                break;
        }

        if (!unit) return;
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        unit.teamId = teamId;
        unit.targetTeamId = targetTeamId
        unit.uid = unit.battleLogic.createUid()
        unit.init(cfg);
        unit.initParam();

        if (!battleLogic.isNotShowBattleEffect()) {
            if (!showUnit)
                showUnit = PoolManager.getItem(LeaderSkillShowUnit);
            // let node: ActorUnitNode = PoolManager.getItem(ActorUnitNode);
            // node.loadByModelId(cfg.modelId, isLoop);
            showUnit.setUnitData(unit)
            if (cfg.modelId.up)
                showUnit.createOtherSpineNode(cfg.modelId.up, WorldManager.ins().effectTopLayer, isLoop)

            if (cfg.modelId.low)
                showUnit.createOtherSpineNode(cfg.modelId.low, WorldManager.ins().shadowLayer, isLoop)
            // showUnit.setSpineNode(node)
            showUnit.onInitData()
            unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit;
    }

    /**创建收藏品技能实体 */
    public static createCollectSkillUnit(id: string, teamId: number, targetTeamId: number, fightType: FightType): BaseCollectSkillUnit {
        let battleLogic = BattleLogicManager.ins().get(fightType)
        let cfg = TableManager.getDataById(table.battle.CollectionSkillConfig, id);
        if (!cfg) return;

        let unit: BaseCollectSkillUnit;
        let showUnit: CollectSkillShowUnit;
        let isLoop: boolean = false
        let parentNode = WorldManager.ins().effectTopLayer
        switch (cfg.belongType) {
            case CollectSkillype.WuXianShouTao:
                unit = PoolManager.getItem(WuXianShouTaoCollectUnit);
                break;
            default:
                unit = PoolManager.getItem(BaseCollectSkillUnit);
                break
        }

        if (!unit) return;
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        unit.teamId = teamId;
        unit.targetTeamId = targetTeamId
        unit.uid = unit.battleLogic.createUid()
        unit.init(cfg);
        unit.initParam();

        if (!battleLogic.isNotShowBattleEffect()) {
            if (!showUnit)
                showUnit = PoolManager.getItem(CollectSkillShowUnit);
            let node: ActorUnitNode = PoolManager.getItem(ActorUnitNode);
            node.loadByModelId(cfg.modelId, isLoop);
            parentNode.addChild(node);
            showUnit.setUnitData(unit)
            showUnit.setSpineNode(node)
            showUnit.onInitData()
            unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit;
    }


    /**创建区域单元 */
    public static createAreaUnit(data: IMapObject) {
        return AreaUnit.createUnit(data);
    }

    // /**创建技能列表 */
    // public static createMonsterSkillCfgs(data: table.monster.MonsterAttributeConfig): table.battle.SkillConfig[] {
    //     let skills: table.battle.SkillConfig[] = [];
    //     for (let i = 0; i < 5; i++) {
    //         let cfg = TableManager.getDataById(table.battle.SkillConfig, data["skill" + i]);
    //         if (cfg) {
    //             skills.push(cfg);
    //         }
    //     }

    //     if (data.skillIds?.length > 0) {
    //         for (let i = 0; i < data.skillIds.length; i++) {
    //             let cfg = TableManager.getDataById(table.battle.SkillConfig, data.skillIds[i]);
    //             if (cfg) {
    //                 skills.push(cfg);
    //             }
    //         }
    //     }

    //     return skills;
    // }

    public static createHerosSkillCfgs(data: table.hero.HeroConfig): table.battle.SkillConfig[] {
        let skills: table.battle.SkillConfig[] = [];
        for (let i = 0; i < 5; i++) {
            let cfg = TableManager.getDataById(table.battle.SkillConfig, data["skill" + i]);
            if (cfg) {
                skills.push(cfg);
            }
        }
        return skills;
    }
}