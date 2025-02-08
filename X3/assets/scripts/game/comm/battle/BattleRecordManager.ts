import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { UIBattleKeys } from "../../modules/battle/UIBattleKeys";
import { IBattleRecord } from "../../modules/battle/view/BattleRecordView";
import { BattleRecordInfo } from "../../modules/battle/view/recordInfo/BattleRecordInfo";
import { PlayerModel } from "../../modules/player/model/PlayerModel";
import { BattleLogicManager } from "./BattleLogicManager";
import { BattleManager } from "./BattleManager";
import { UnitType, WorldUnitTeam } from "./enum/BattleEnum";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { FightType } from "./enum/FightType";
import { TeamChallengeModel } from "../../modules/teamChallenge/model/TeamChallengeModel";
import { SortUtils } from "../../../core/utils/SortUtils";

export class BattleRecordManager extends BaseSingleton {

    /**
     * 显示竞技战斗记录
     *
     * @argument isWin 是否胜利
     * @param fightType 战斗类型
     * */
    public showRecordView(
        fightType: ServerEnums.FightType,
        isWin: boolean,
    ): void {

        let attack = new BattleRecordInfo()
        attack.name = PlayerModel.ins().Vo.name;
        attack.headFrame = 0
        attack.headIcon = 0
        attack.imageId = 0;

        let attackHeros = BattleLogicManager.ins().get(fightType).easyLogManager.getUnitStatistics(WorldUnitTeam.Self);
        // let voHeros: Vo.battle.UnitStatisticsBaseVo[] = [];
        // for (let i = 0; i < attackHeros.length; i++) {
        //     let hero = {} as Vo.battle.UnitStatisticsBaseVo;
        //     hero.configId = attackHeros[i].cfgId
        //     hero.unitModel = { heroSkinId: attackHeros[i].skinId } as Vo.battle.UnitModel
        //     hero.unitType = attackHeros[i].unitType
        //     hero.beHurt = attackHeros[i].beHurt;
        //     hero.hurt = attackHeros[i].hurt;
        //     hero.cure = attackHeros[i].cure;
        //     voHeros.push(hero)
        // }
        attack.initHerosByFightUnitStatisticsVo(attackHeros);
        attack.id = BattleManager.ins().mainScene.battleData.atkPlayerId;

        let defHeros = BattleLogicManager.ins().get(fightType).easyLogManager.getUnitStatistics(WorldUnitTeam.Enemy);
        let def = new BattleRecordInfo()
        def.name = BattleManager.ins().mainScene.battleData.defenderName;
        def.headIcon = BattleManager.ins().mainScene.battleData.defenderIcon
        def.id = BattleManager.ins().mainScene.battleData.defPlayerId;
        // voHeros = [];
        // for (let i = 0; i < defHeros.length; i++) {
        //     let hero = {} as Vo.battle.UnitStatisticsBaseVo
        //     hero.configId = defHeros[i].cfgId
        //     hero.unitModel = { heroSkinId: defHeros[i].skinId } as Vo.battle.UnitModel
        //     hero.unitType = defHeros[i].unitType
        //     hero.beHurt = defHeros[i].beHurt;
        //     hero.hurt = defHeros[i].hurt;
        //     hero.cure = defHeros[i].cure;
        //     voHeros.push(hero)
        // }
        def.initHerosByFightUnitStatisticsVo(defHeros)

        if (fightType == FightType.TEAM_INSTANCE) {
            //组队副本改写名字
            attack.name = TeamChallengeModel.ins().getTeamName();
            //排序队长
            SortUtils.sortBy2(attack.heros, ["pos", "lv"], [true, false], false)
        }

        let data: IBattleRecord = {
            fightType: fightType,
            attackerBaseVo: attack,
            defenderBaseVo: def,
            attackerWin: isWin,
        };
        G.UIManager.open(UIBattleKeys.BattleRecordView, data)
    }

    /***显示竞技战斗记录 */
    public showRecordViewByArena(vo: Vo.arena.ArenaChallengeRecord): void {
        let attack = new BattleRecordInfo()
        attack.initData(vo.attackerBaseVo)
        for (let i = 0; i < vo.attackerStatisticsVos.length; i++) {
            if (vo.attackerStatisticsVos[i].unitType == ServerEnums.UnitType.HERO) {
                vo.attackerStatisticsVos[i].unitType = UnitType.Hero;
            }
            else if (vo.attackerStatisticsVos[i].unitType == ServerEnums.UnitType.PET) {
                vo.attackerStatisticsVos[i].unitType = UnitType.Pet;
            }
            else if (vo.attackerStatisticsVos[i].unitType == ServerEnums.UnitType.MONSTER) {
                vo.attackerStatisticsVos[i].unitType = UnitType.Monster;
            }
        }
        attack.initHeros(vo.attackerStatisticsVos)
        attack.id = vo.attackerBaseVo.id

        let def = new BattleRecordInfo()
        if (vo.defenderBaseVo) {
            def.initData(vo.defenderBaseVo)
            def.id = vo.defenderBaseVo.id;
        }
        else
            def.initArenaData(vo.defenderRobotBaseVo)
        def.initHeros(vo.defenderStatisticsVos)


        for (let i = 0; i < vo.defenderStatisticsVos.length; i++) {
            if (vo.defenderStatisticsVos[i].unitType == ServerEnums.UnitType.HERO) {
                vo.defenderStatisticsVos[i].unitType = UnitType.Hero;
            }
            else if (vo.defenderStatisticsVos[i].unitType == ServerEnums.UnitType.PET) {
                vo.defenderStatisticsVos[i].unitType = UnitType.Pet;
            }
            else if (vo.defenderStatisticsVos[i].unitType == ServerEnums.UnitType.MONSTER) {
                vo.defenderStatisticsVos[i].unitType = UnitType.Monster;
            }
        }

        let data: IBattleRecord = {
            fightType: ServerEnums.FightType.ARENA,
            attackerBaseVo: attack,
            defenderBaseVo: def,
            attackerWin: vo.attackerWin,
        };
        G.UIManager.open(UIBattleKeys.BattleRecordView, data)
    }

    /***显示战斗记录 */
    public showRecordViewByServer(fightType: FightType, attackBaseVo: Vo.player.PlayerBaseVo, defBaseVo: Vo.player.PlayerBaseVo, attackerStatisticsVos: Vo.battle.UnitStatisticsBaseVo[], defenderStatisticsVos: Vo.battle.UnitStatisticsBaseVo[], isWin: boolean): void {
        let attack = new BattleRecordInfo()
        attack.initData(attackBaseVo)
        for (let i = 0; i < attackerStatisticsVos.length; i++) {
            if (attackerStatisticsVos[i].unitType == ServerEnums.UnitType.HERO) {
                attackerStatisticsVos[i].unitType = UnitType.Hero;
            }
            else if (attackerStatisticsVos[i].unitType == ServerEnums.UnitType.PET) {
                attackerStatisticsVos[i].unitType = UnitType.Pet;
            }
            else if (attackerStatisticsVos[i].unitType == ServerEnums.UnitType.MONSTER) {
                attackerStatisticsVos[i].unitType = UnitType.Monster;
            }
        }
        attack.initHeros(attackerStatisticsVos)
        attack.id = attackBaseVo.id

        let def = new BattleRecordInfo()
        if (defBaseVo) {
            def.initData(defBaseVo)
            def.id = defBaseVo.id;
        }
        if (defenderStatisticsVos) {
            def.initHeros(defenderStatisticsVos)

            for (let i = 0; i < defenderStatisticsVos.length; i++) {
                if (defenderStatisticsVos[i].unitType == ServerEnums.UnitType.HERO) {
                    defenderStatisticsVos[i].unitType = UnitType.Hero;
                }
                else if (defenderStatisticsVos[i].unitType == ServerEnums.UnitType.PET) {
                    defenderStatisticsVos[i].unitType = UnitType.Pet;
                }
                else if (defenderStatisticsVos[i].unitType == ServerEnums.UnitType.MONSTER) {
                    defenderStatisticsVos[i].unitType = UnitType.Monster;
                }
            }
        }

        let data: IBattleRecord = {
            fightType: fightType,
            attackerBaseVo: attack,
            defenderBaseVo: def,
            attackerWin: isWin,
        };
        G.UIManager.open(UIBattleKeys.BattleRecordView, data)
    }
}