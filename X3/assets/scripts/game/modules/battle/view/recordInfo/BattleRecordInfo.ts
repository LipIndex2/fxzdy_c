import { FightUnitStatisticsVo } from "../../../../comm/battle/BattleEasyLogManager";

export class BattleRecordHeroInfo {
    firstHurtValue?: number = 0;
    firstBeHurtValue?: number = 0;
    firstHealValue?: number = 0;
    /**
           * 配置ID
           */
    configId: number;

    /**
     * 单位类型,UnitType
     */
    unitType: number;

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
    unitModel: { modelConfigId: number, heroSkinId: number }

    /***单位等级 */
    lv?: number = 0;
    /***单位阵位 */
    pos?: number = 0;
}

export class BattleRecordInfo {
    /**
    * 玩家ID
    */
    id: number;

    /**
     * 名称
     */
    name: string;

    /**
     * 头像
     */
    headIcon: number | string;

    /**
     * 头像框
     */
    headFrame: number;
    /**
     * 形象ID
     */
    imageId: number;

    /**
         * 攻击方单位统计列表
         */
    heros: BattleRecordHeroInfo[] = [];

    public initData(vo: Vo.player.PlayerBaseVo) {
        this.name = vo.name;
        this.headIcon = vo.headIcon
        this.headFrame = vo.headFrame;
        this.imageId = vo.imageId;
    }

    public initHerosByFightUnitStatisticsVo(heros: FightUnitStatisticsVo[]): void {
        let firstHurtValue: number = 0;
        let firstBeHurtValue: number = 0;
        let firstHealValue: number = 0;
        for (let i = 0; i < heros.length; i++) {
            let info = new BattleRecordHeroInfo()
            info.configId = heros[i].cfgId;
            info.unitModel = { heroSkinId: heros[i].skinId } as Vo.battle.UnitModel;
            info.unitType = heros[i].unitType
            info.beHurt = heros[i].beHurt;
            info.hurt = heros[i].hurt;
            info.cure = heros[i].cure;
            info.lv = heros[i].lv;
            info.pos = heros[i].pos;
            this.heros.push(info)
            firstHurtValue = Math.max(heros[i].hurt, firstHurtValue)
            firstBeHurtValue = Math.max(heros[i].beHurt, firstBeHurtValue)
            firstHealValue = Math.max(heros[i].cure, firstHealValue)
        }

        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].firstHurtValue = firstHurtValue;
            this.heros[i].firstBeHurtValue = firstBeHurtValue;
            this.heros[i].firstHealValue = firstHealValue;
        }

        //     let hero = {} as Vo.battle.UnitStatisticsBaseVo;
        //     hero.configId = attackHeros[i].cfgId
        //     hero.unitModel = { heroSkinId: attackHeros[i].skinId } as Vo.battle.UnitModel
        //     hero.unitType = attackHeros[i].unitType
        //     hero.beHurt = attackHeros[i].beHurt;
        //     hero.hurt = attackHeros[i].hurt;
        //     hero.cure = attackHeros[i].cure;
    }


    public initHeros(heros: Vo.battle.UnitStatisticsBaseVo[]): void {
        let firstHurtValue: number = 0;
        let firstBeHurtValue: number = 0;
        let firstHealValue: number = 0;
        for (let i = 0; i < heros.length; i++) {
            this.heros.push(heros[i])
            firstHurtValue = Math.max(heros[i].hurt, firstHurtValue)
            firstBeHurtValue = Math.max(heros[i].beHurt, firstBeHurtValue)
            firstHealValue = Math.max(heros[i].cure, firstHealValue)
        }

        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].firstHurtValue = firstHurtValue;
            this.heros[i].firstBeHurtValue = firstBeHurtValue;
            this.heros[i].firstHealValue = firstHealValue;
        }
    }

    public initArenaData(vo: Vo.arena.ArenaRobotBaseVo) {
        this.name = vo.robotName;
        this.headIcon = 0
        this.headFrame = 0;
    }
}
