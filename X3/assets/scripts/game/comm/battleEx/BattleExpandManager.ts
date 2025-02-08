import BaseSingleton from "../../../core/base/BaseSingleton";
import { GameTimer } from "../../../core/timer/GameTimer";
import BattleShowFactory from "../battle/factory/BattleShowFactory";
import NotificationKey from "../../event/NotificationKey";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { ITransfer } from "../../tiledMap/interface/ITransfer";
import { TableManager } from "../../../core/table/TableManager";
import { Vec2 } from "cc";
import { MonsterUnit } from "../battle/unit/battle/MonsterUnit";
import { IObject1 } from "../interface/IObject1";
import { UnlockResAnimNode } from "../../modules/common/anim/UnlockResAnimNode";
import { SoundType } from "../mgr/AudioManager";
import { HeroUnit } from "../battle/unit/battle/HeroUnit";
import { BattleUnit } from "../battle/unit/battle/BattleUnit";
import { WorldUnitTeam } from "../battle/enum/BattleEnum";
import { MathUtils } from "../../../core/utils/MathUtils";
import { MineralUnit } from "../battle/unit/MineralUnit";
import GIns from "../../GIns";
import { Tween } from "cc";
import G from "../../../core/comm/G";

/**战斗扩展管理器 */
export class BattleExpandManager extends BaseSingleton {

    /**乘飞船传送 */
    transferByAirship() {
        //传送
        let mapId = GIns.mapMgr.getMapID();
        let fieldMapId = 1;
        let pos: Vec2;
        //判断当前地图是否为主城
        if (mapId == 1) {
            fieldMapId = GIns.mapMgr.getTransferPos()?.fieldMapId;
            pos = GIns.mapMgr.getTransferPos()?.pos;
            if (!fieldMapId) {
                return;
            }
        } else {
            let posStr = TableManager.getDataById(table.map.MapConstantConfig, "MAP_TRANSFER_POS");
            let x = posStr.content.split(",")[0];
            let y = posStr.content.split(",")[1];
            pos = new Vec2(Number(x), Number(y));
        }
        FacadeManager.ins().emit(NotificationKey.MAP_AREA_TRANSFER_START, { mapId: fieldMapId, pos: pos } as ITransfer);
    }

    /**显示所有的英雄 */
    showHeroes() {
        let heroes = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
        for (let index = 0; index < heroes.length; index++) {
            const hero = heroes[index];
            hero.isToHide = false;
            hero.showUnit()?.setAlpha(1);
            hero.setOtherVisible(true);
        }
    }

    /**隐藏所有的英雄 */
    hideHeroes() {
        let heroes = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
        for (let index = 0; index < heroes.length; index++) {
            const hero = heroes[index];
            hero.isToHide = true
            hero.showUnit()?.setAlpha(0);
            hero.setOtherVisible(false);
        }
    }

    /**传送开始 渐隐*/
    transferStartAnimFadeOut() {
        let heroes = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(1);

        for (let index = 0; index < heroes.length; index++) {
            const hero = heroes[index];
            let pos = hero.pos;

            BattleShowFactory.showEffectModel(10010004, pos, 1, true, false); //传送背景
            BattleShowFactory.showEffectModel(10010005, pos, 1, false, false); //传送前景

            hero.showUnit()?.fadeOut(1000);
            GameTimer.ins().once(200, this, () => {
                hero.setOtherVisible(false);
            })
        }

        GIns.audioMgr.playSound(SoundType.leave);
    }


    /**传送结束 渐显*/
    transferEndAnimFadeIn() {
        let heroes = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
        for (let index = 0; index < heroes.length; index++) {
            const hero = heroes[index];
            if (hero instanceof HeroUnit && hero.isHelpHero)
                continue;//助战英雄不显示

            let pos = hero.pos;
            hero.isToHide = false;

            BattleShowFactory.showEffectModel(10010001, pos, 1, true, false);  //传送背景
            BattleShowFactory.showEffectModel(10010002, pos, 1, false, false); //传送前景

            hero.showUnit()?.fadeIn(1000);
            GameTimer.ins().once(200, this, () => {
                hero.setOtherVisible(true);
            })
        }
        GIns.audioMgr.playSound(SoundType.arrive);
    }

    /***以传送特效的形式显示1个单位*/
    showHeroByTransferEffect(hero: BattleUnit): void {
        let pos = hero.pos;
        BattleShowFactory.showEffectModel(10010001, pos, 1, true, false);  //传送背景
        BattleShowFactory.showEffectModel(10010002, pos, 1, false, false); //传送前景
        hero.showUnit()?.fadeIn(1000);
        GameTimer.ins().once(200, this, () => {
            hero.setOtherVisible(true);
        })
    }

    /**传送光效（引导地图用到） */
    GuideTransferHeroAnimInFirst() {
        let heroes = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
        for (let index = 0; index < heroes.length; index++) {
            const hero = heroes[index];
            let pos = hero.pos;
            BattleShowFactory.showEffectModel(10010001, pos, 1, true, false);  //传送背景
            BattleShowFactory.showEffectModel(10010002, pos, 1, false, false); //传送前景
            hero.showUnit()?.fadeIn(1000);
            hero.setOtherVisible(false);
            GameTimer.ins().once(200, this, () => {
                hero.setOtherVisible(true);
            })
        }
        GIns.audioMgr.playSoundDelay(100, SoundType.arrive)
    }

    /**引导中怪物出现 */
    guideMonsterFadeInByIds(resourceIds: number[]) {
        let map = {};
        for (let i = 0; i < resourceIds.length; i++) {
            map[resourceIds[i]] = true;
        }
        //GameTimer.ins().frameOnce(1, this, () => {
        //延迟等待创建
        let units = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            if (unit.resId) {
                let monster = unit as MonsterUnit;
                if (map[monster.resourceId]) {
                    if (!monster.showUnit()) {
                        monster.showCreateUnit();
                    }
                    // Tween.stopAllByTarget(monster.showUnit().node);
                    G.GameTimer.clearAll(monster.showUnit().node);
                    monster.showUnit().node.setAlpha(0);
                    monster.showUnit().node.active = false;
                    // monster.showUnit().setShadowVisible(false);
                    monster.setOtherVisible(false);


                    GameTimer.ins().once(200 * i, this, () => {
                        let pos = monster.pos;
                        if (monster.showUnit() && !monster.showUnit().isDisposed) {
                            BattleShowFactory.showEffectModel(10010001, pos, 1, true, false);  //传送背景
                            BattleShowFactory.showEffectModel(10010002, pos, 1, false, false); //传送前景
                            monster.showUnit().node.active = true;
                            monster.showUnit().fadeIn(1000);
                            monster.setOtherVisible(false);
                            GameTimer.ins().once(200, this, () => {
                                monster.setOtherVisible(true);
                            })
                        }
                    })
                }
            }
        }
        //});
    }

    /**解锁建筑物 资源飞行动画
     * @param targetPos 终点位置
     * @param cost 消耗道具
     * @returns {number} 动画总时长
     */
    unlockBuildingAnim(targetPos: { x: number, y: number }, cost: IObject1): number {
        let cfg = TableManager.getDataById(table.item.ItemConfig, cost.k);
        if (!cfg) return;

        let team = GIns.battleMgr.curUnitProcessor.myTeam;
        let stepMs = 100;
        let num = Math.min(cost.v, 10);
        for (let i = 0; i < num; i++) {
            let anim = UnlockResAnimNode.create();
            anim.play(cfg.smallIconPath, team.pos, targetPos, stepMs * i);
            GIns.worldMgr.tipsLayer.addChild(anim.node);
        }

        FacadeManager.ins().emit(NotificationKey.MAP_BUILDING_UNLOCK_COST_ANIM); //同步算时间

        return num ? num * stepMs + UnlockResAnimNode.tweenTime : 0;
    }

    /**找最近的指定怪物单位
     * @param monsterId @see table.monster.MonsterAttributeConfig.id
     */
    findNearestMonsterUnit(monsterId: number) {
        if (!monsterId) return null;

        let nearestUnit: MonsterUnit;
        let curPos = GIns.mapMgr.getMapPos();
        let units = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        let minDis = 1e6;
        for (let index = 0; index < units.length; index++) {
            const unit = units[index];
            if (unit instanceof MonsterUnit && unit.cfg?.id === monsterId && !unit.isNeedDispose) {
                let dis = MathUtils.distance(curPos, unit.pos);
                if (dis < minDis) {
                    minDis = dis;
                    nearestUnit = unit;
                }
            }
        }

        return nearestUnit;
    }

    /**找最近的指定矿单位
     * @param mineralId  @see table.map.MapMineralConfig.id
     */
    findNearestMineralUnit(mineralId: number) {
        if (!mineralId) return null;

        let nearestUnit: MineralUnit;
        let curPos = GIns.mapMgr.getMapPos();
        let units = GIns.battleMgr.curUnitProcessor.getMineralsUnits();
        let minDis = 1e6;
        for (let index = 0; index < units.length; index++) {
            const unit = units[index];
            if (unit instanceof MineralUnit && unit.cfg?.id === mineralId && unit.hpNum > 0 && !unit.isNeedDispose) {
                let dis = MathUtils.distance(curPos, unit.pos);
                if (dis < minDis) {
                    minDis = dis;
                    nearestUnit = unit;
                }
            }
        }
        return nearestUnit;
    }
}
