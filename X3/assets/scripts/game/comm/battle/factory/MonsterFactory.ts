import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { BattleLogicManager } from "../BattleLogicManager";
import { MonsterType } from "../enum/BattleEnum";
import { FightType } from "../enum/FightType";
import { BossShowUnit } from "../show/BossShowUnit";
import { MonsterShowUnit } from "../show/MonsterShowUnit";
import { BoSaiDongMonster } from "../skill/boss/BoSaiDongMonster";
import { ChongHouShow } from "../skill/boss/ChongHou";
import { DuYeMonster, DuYeMonsterShow } from "../skill/boss/DuYeMonster";
import { ELingMonsterShow } from "../skill/boss/ELingMonster";
import { GangTieXiaMonsterShow } from "../skill/boss/GangTieXiaMonster";
import { GeLuTeMonster, GeLuTeShowMonster } from "../skill/boss/GeLuTeMonster";
import { GuanYuMonster, GuanYuMonsterShow } from "../skill/boss/GuanYuMonster";
import { HaiMuDaErMonster } from "../skill/boss/HaiMuDaErMonster";
import { HeYaShowMonster } from "../skill/boss/HeYaMonster";
import { HuangXiongMonster, HuangXiongMonsterShow } from "../skill/boss/HuangXiongMonster";
import { HuiMieZheMonster, HuiMieZheMonsterShow } from "../skill/boss/HuiMieZheMonster";
import { LuXiFaMonster, LuXiFaMonsterShow } from "../skill/boss/LuXiFaMonster";
import { MaErSiMonster, MaErSiMonsterShow } from "../skill/boss/MaErSiMonster";
import { MaLiJuLiMonster, MaLiJuLiMonsterShow } from "../skill/boss/MaLiJuLiMonster";
import { NuoWaMonster } from "../skill/boss/NuoWaMonster";
import { QiuBiTeMonster } from "../skill/boss/QiuBiTeMonster";
import { ShenHaiGeJiMonster } from "../skill/boss/ShenHaiGeJiMonster";
import { TiaoTiaoQiShouMonsterShow } from "../skill/boss/TiaoTiaoQiShouMonsterSkill";
import { WeiLaMonster, WWeiLaMonsterShow as WeiLaMonsterShow } from "../skill/boss/WeiLaMonster";
import { WoErTeMonster } from "../skill/boss/WoErTeMonster";
import { WuTouQiShiMonster, WuTouQiShiMonsterShow } from "../skill/boss/WuTouQiShiMonster";
import { ZhanZhengZhiYingMonster } from "../skill/boss/ZhanZhengZhiYingMonster";
import { ZhenDeMonster, ZhenDeMonsterShow } from "../skill/boss/ZhenDeMonster";
import { BoSaiDongZhuanHuanWu, BoSaiDongZhuanHuanWuShow } from "../skill/hero/BoSaiDongZhuanHuanWu";
import { DuYeZhaoHuanWu } from "../skill/hero/DuYeZhaoHuanWu";
import { DuYeZhaoHuanWuShow } from "../skill/hero/DuYeZhaoHuanWuShow";
import { NuoWaZhaoHuanWu, NuoWaZhaoHuanWuShow } from "../skill/hero/NuoWaZhaoHuanWu";
import { WuTouQiShiZhaoHuanWu } from "../skill/hero/WuTouQiShiZhaoHuanWu";
import { WuTouQiShiZhaoHuanWuShow } from "../skill/hero/WuTouQiShiZhaoHuanWuShow";
import { BossUnit, ChongHou } from "../unit/battle/BossUnit";
import { MonsterUnit } from "../unit/battle/MonsterUnit";

export class MonsterFactory {
    static create(monsterId: number, fightType: FightType): [MonsterUnit, MonsterShowUnit] {
        let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, monsterId);
        let unit: MonsterUnit
        let showUnit: MonsterShowUnit;
        switch (cfg.belongId) {
            case 9501:
                unit = PoolManager.getItem(ChongHou);
                showUnit = PoolManager.getItem(ChongHouShow)
                break
            case 102:
                unit = PoolManager.getItem(MonsterUnit);
                showUnit = PoolManager.getItem(HeYaShowMonster)
                break
            case 103:
                unit = PoolManager.getItem(GeLuTeMonster);
                showUnit = PoolManager.getItem(GeLuTeShowMonster)
                break
            case 105:
                unit = PoolManager.getItem(MaErSiMonster);
                showUnit = PoolManager.getItem(MaErSiMonsterShow)
                break
            case 109:
                unit = PoolManager.getItem(MonsterUnit);
                showUnit = PoolManager.getItem(ELingMonsterShow)
                break
            case 110:
                unit = PoolManager.getItem(GuanYuMonster);
                showUnit = PoolManager.getItem(GuanYuMonsterShow)
                break
            case 126:
                unit = PoolManager.getItem(LuXiFaMonster);
                showUnit = PoolManager.getItem(LuXiFaMonsterShow)
                break
            case 134:
                unit = PoolManager.getItem(QiuBiTeMonster);
                break
            case 114:
                unit = PoolManager.getItem(MaLiJuLiMonster);
                showUnit = PoolManager.getItem(MaLiJuLiMonsterShow)
                break
            case 135:
                unit = PoolManager.getItem(ShenHaiGeJiMonster);
                break
            case 125:
                unit = PoolManager.getItem(WeiLaMonster);
                showUnit = PoolManager.getItem(WeiLaMonsterShow)
                break
            case 131:
                unit = PoolManager.getItem(ZhanZhengZhiYingMonster);
                break
            case 130:
                unit = PoolManager.getItem(MonsterUnit);
                showUnit = PoolManager.getItem(TiaoTiaoQiShouMonsterShow)
                break
            case 128:
                unit = PoolManager.getItem(HaiMuDaErMonster);
                break
            case 127:
                unit = PoolManager.getItem(ZhenDeMonster);
                showUnit = PoolManager.getItem(ZhenDeMonsterShow)
                break
            case 134001:
                unit = PoolManager.getItem(DuYeZhaoHuanWu);
                showUnit = PoolManager.getItem(DuYeZhaoHuanWuShow)
                break
            case 322001:
                unit = PoolManager.getItem(BoSaiDongZhuanHuanWu);
                showUnit = PoolManager.getItem(BoSaiDongZhuanHuanWuShow)
                break
            case 534001:
                unit = PoolManager.getItem(WuTouQiShiZhaoHuanWu);
                showUnit = PoolManager.getItem(WuTouQiShiZhaoHuanWuShow)
                break
            case 431201:
                unit = PoolManager.getItem(NuoWaZhaoHuanWu);
                showUnit = PoolManager.getItem(NuoWaZhaoHuanWuShow)
                break
            case 212:
                unit = PoolManager.getItem(HuangXiongMonster);
                showUnit = PoolManager.getItem(HuangXiongMonsterShow)
                break
            case 213:
                unit = PoolManager.getItem(DuYeMonster);
                showUnit = PoolManager.getItem(DuYeMonsterShow)
                break
            case 214:
                unit = PoolManager.getItem(HuiMieZheMonster);
                showUnit = PoolManager.getItem(HuiMieZheMonsterShow)
                break
            case 216:
                unit = PoolManager.getItem(BoSaiDongMonster);
                break
            case 219:
                unit = PoolManager.getItem(NuoWaMonster);
                break
            case 221:
                unit = PoolManager.getItem(WuTouQiShiMonster);
                showUnit = PoolManager.getItem(WuTouQiShiMonsterShow)
                break
            case 222:
                unit = PoolManager.getItem(WoErTeMonster);
                break
            case 220:
                unit = PoolManager.getItem(MonsterUnit);
                showUnit = PoolManager.getItem(GangTieXiaMonsterShow);
                break
            default:
                unit = cfg.monsterType == MonsterType.Boss ? PoolManager.getItem(BossUnit) : PoolManager.getItem(MonsterUnit); //创建Boss或怪物
                break
        }
        if (!showUnit) {
            showUnit = cfg.monsterType == MonsterType.Boss ? PoolManager.getItem(BossShowUnit) : PoolManager.getItem(MonsterShowUnit);
        }
        unit.setBattleLogic(BattleLogicManager.ins().get(fightType))
        return [unit, showUnit]
    }
}