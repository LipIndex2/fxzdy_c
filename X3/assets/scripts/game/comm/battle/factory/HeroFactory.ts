import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { IBattleUnitData } from "../../../modules/battle/vo/IBattleUnitData";
import { PreLoadMgr } from "../../mgr/PreLoadMgr";
import { WorldManager } from "../../world/WorldManager";
import { BattleLogicManager } from "../BattleLogicManager";
import { FightType } from "../enum/FightType";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { HeroShowUnit } from "../show/HeroShowUnit";
import { ANuBiSi } from "../skill/hero/ANuBiSi";
import { BoSaiDong } from "../skill/hero/BoSaiDong";
import { DuYe, DuYeShow } from "../skill/hero/DuYe";
import { ELingShow } from "../skill/hero/ELing";
import { GangTieXiaShow } from "../skill/hero/GangTieXia";
import { GeLuTe, GeLuTeShow } from "../skill/hero/GeLuTe";
import { GuanYu, GuanYuShow } from "../skill/hero/GuanYu";
import { HaiMuDaEr } from "../skill/hero/HaiMuDaEr";
import { HeYaShow } from "../skill/hero/HeYa";
import { HuangXiong, HuangXiongShow } from "../skill/hero/HuangXiong";
import { HuiMieZhe, HuiMieZheShow } from "../skill/hero/HuiMieZhe";
import { KaMoLa } from "../skill/hero/KaMoLa";
import { LuoJi, LuoJiShow } from "../skill/hero/LuoJi";
import { LuXiFa, LuXiFaShow } from "../skill/hero/LuXiFa";
import { LvBu } from "../skill/hero/LvBu";
import { MaErSi, MaErSiShow } from "../skill/hero/MaErSi";
import { MaLiJuLi, MaLiJuLiShow } from "../skill/hero/MaLiJuLi";
import { NuoWa, NuoWaShow } from "../skill/hero/NuoWa";
import { QiuBiTe } from "../skill/hero/QiuBiTe";
import { ShenHaiGeJi } from "../skill/hero/ShenHaiGeJi";
import { SunWuKong } from "../skill/hero/SunWuKong";
import { TiaoTiaoQiShouShow } from "../skill/hero/TiaoTiaoQiShou";
import { WeiLa, WeiLaShow } from "../skill/hero/WeiLa";
import { WoErTe } from "../skill/hero/WoErTe";
import { WuTouQiShi, WuTouQiShiShow } from "../skill/hero/WuTouQiShi";
import { ZhanZhengZhiYing } from "../skill/hero/ZhanZhengZhiYing";
import { ZhenDe, ZhenDeShow } from "../skill/hero/ZhenDe";
import { HeroUnit } from "../unit/battle/HeroUnit";

export class HeroFactory {

    static create(heroId: number, fightType: FightType, data: IBattleUnitData, teamId: number): HeroUnit {
        let unit: HeroUnit
        let showUnit: HeroShowUnit;

        switch (heroId) {
            case 1120:
                unit = PoolManager.getItem(HeroUnit);
                showUnit = new HeYaShow()
                break
            case 1141:
                unit = PoolManager.getItem(GeLuTe);
                showUnit = new GeLuTeShow()
                break
            case 2230:
                unit = PoolManager.getItem(HeroUnit);
                showUnit = new ELingShow()
                break
            case 1320:
                unit = PoolManager.getItem(MaErSi);
                showUnit = new MaErSiShow()
                break
            case 2310:
                unit = PoolManager.getItem(GuanYu);
                showUnit = new GuanYuShow()
                break
            case 3210:
                unit = PoolManager.getItem(MaLiJuLi)
                showUnit = new MaLiJuLiShow()
                break
            case 4220:
                unit = PoolManager.getItem(ANuBiSi)
                break
            case 4310:
                unit = PoolManager.getItem(WeiLa);
                showUnit = new WeiLaShow()
                break
            case 4340:
                unit = PoolManager.getItem(LuXiFa);
                showUnit = new LuXiFaShow()
                break
            case 5210:
                unit = PoolManager.getItem(ZhenDe);
                showUnit = new ZhenDeShow()
                break
            case 5220:
                unit = PoolManager.getItem(HaiMuDaEr);
                break
            case 5240:
                unit = PoolManager.getItem(HeroUnit);
                showUnit = new TiaoTiaoQiShouShow()
                break
            case 5330:
                unit = PoolManager.getItem(ZhanZhengZhiYing);
                break
            case 6220:
                unit = PoolManager.getItem(QiuBiTe);
                break
            case 6330:
                unit = PoolManager.getItem(ShenHaiGeJi);
                break
            case 1340:
                unit = PoolManager.getItem(DuYe);
                showUnit = new DuYeShow()
                break
            case 6110:
                unit = PoolManager.getItem(WoErTe);
                break
            case 3220:
                unit = PoolManager.getItem(BoSaiDong);
                break
            case 4330:
                unit = PoolManager.getItem(HeroUnit);
                showUnit = new GangTieXiaShow()
                break
            case 5340:
                unit = PoolManager.getItem(WuTouQiShi);
                showUnit = new WuTouQiShiShow()
                break
            case 4312:
                unit = PoolManager.getItem(NuoWa);
                showUnit = new NuoWaShow()
                break
            case 1230:
                unit = PoolManager.getItem(HuangXiong);
                showUnit = new HuangXiongShow()
                break
            case 2430:
                unit = PoolManager.getItem(SunWuKong);
                break
            case 5410:
                unit = PoolManager.getItem(LvBu);
                break
            case 2240:
                unit = PoolManager.getItem(HuiMieZhe);
                showUnit = new HuiMieZheShow()
                break
            case 3321:
                unit = PoolManager.getItem(LuoJi);
                showUnit = new LuoJiShow()
                break
            default:
                unit = PoolManager.getItem(HeroUnit);
                break
        }
        return this.createHandler(unit, showUnit, heroId, fightType, data, teamId)
    }

    private static createHandler(unit: HeroUnit, showUnit: HeroShowUnit, heroId: number, fightType: FightType, data: IBattleUnitData, teamId: number): HeroUnit {
        let cfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
        let battleLogic = BattleLogicManager.ins().get(fightType)
        unit.setBattleLogic(battleLogic)
        unit.teamId = teamId;
        unit.isHelpHero = data.type == ServerEnums.UnitType.HELP_HERO;
        unit.formationPosition = data.position;
        unit.formationPositionByServer = data.position;
        if (data.uid) {
            unit.uid = data.uid;
        }
        else {
            unit.uid = unit.battleLogic.createUid()
        }
        unit.init(cfg, data);
        unit.battleLogic.easyLogManager.initHeroData(unit)
        if (!battleLogic.isNotShowBattleEffect()) {
            if (!showUnit)
                showUnit = PoolManager.getItem(HeroShowUnit)
            showUnit.setUnitData(unit)

            let node: ActorUnitNode = PoolManager.getItem(ActorUnitNode);
            node.loadByModelId(data.modelId || cfg.modelId);
            showUnit.setSpineNode(node)
            WorldManager.ins().roleLayer.addChild(node);
            PreLoadMgr.ins().loadHeroEffect(data.configId)
            showUnit.onInitData()
            unit.battleLogic.showMgr.addUnit(showUnit);
        }
        return unit
    }
}