import { WorldManager } from "../../world/WorldManager";
import { WorldUnitTeam } from "../enum/BattleEnum";
import { MathUtils } from "../../../../core/utils/MathUtils";
import UnitProcessor from "./UnitProcessor";
import { SkillUtils } from "../skill/SkillUtils";
import { TimeManager } from "../../../../core/time/TimeManager";
import { TableManager } from "../../../../core/table/TableManager";
import { FloatingTextManager } from "../../../modules/floatingText/FloatingTextManager";
import { BattleManager } from "../BattleManager";
import RandomUtils from "../../../../core/utils/RandomUtils";
import { BattleLogicManager } from "../BattleLogicManager";
import { BattleLogic } from "../BattleLogic";
import { Vec2 } from "cc";
import { v2 } from "cc";
import BattleTimer from "../../../../core/timer/BattleTimer";
import { InterpolationMoveComp } from "../comp/InterpolationMoveComp";
import { Handler } from "../../../../core/utils/Handler";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

export default class BattleProcessor {
    public battleLogic: BattleLogic;
    private _unitProcessor: UnitProcessor;
    private _isDirty = true;
    private _safeHealTime = 0;
    private _frameCount = 0;

    constructor (unitProcessor: UnitProcessor) {
        this._unitProcessor = unitProcessor;
        this.interpolationMoveComp = new InterpolationMoveComp(BattleTimer.battleTickFrame, new Handler(this, this.onInterpolationMove, null, false))
    }

    /**团队向指定方向移动 */
    teamMoveByAngle(angle: number) {
        if (this._unitProcessor.myTeam && !this.battleLogic.isNotShowBattleEffect()) {
            this._unitProcessor.myTeam.setDirection(angle);
        }
    }

    /**传送 */
    transfer(pos: { x: number, y: number }) {
        let team = this._unitProcessor.myTeam;
        if (team.pos.x == pos.x && team.pos.y == pos.y) {
            return;
        }

        let heroes = this._unitProcessor.heroes;
        if (team) {
            team.pos.set(pos.x, pos.y);
            for (let i = heroes.length - 1; i >= 0; i--) {
                // heroes[i].setPosXY(pos.x + RandomUtils.random(-1, 1), pos.y + RandomUtils.random(-1, 1))
                heroes[i].setPosXY(pos.x, pos.y)
                let summons = this._unitProcessor.getSummons(heroes[i].uid)
                for (let j = 0; j < summons.length; j++) {
                    summons[j].setPosXY(pos.x, pos.y)
                }
            }

            team.calFormationPos(MathUtils.angle2Radians(45));
            team.updateFormation(true);

            let pets = this._unitProcessor.pets;
            for (let i = pets.length - 1; i >= 0; i--) {
                pets[i].setPosXY(pos.x, pos.y)
            }

        } else {
            DebugUtils.isDebugMode() && console.log(" 未出生 ");
        }
        this.moveCamera(true)
        this._isDirty = true;
    }

    /**是否在安全区 */
    public checkSafe() {
        let team = this._unitProcessor.myTeam;
        if (team.isMoving || this._isDirty) {
            let isSafe = this.battleLogic.unitCollisionsManager.isInSafeArea(team.pos);
            if (isSafe != this.battleLogic.isSafe) {
                this.battleLogic.isSafe = isSafe;
            }
        }
    }

    private _area = null;
    /**是否变更区域 */
    public checkArea() {
        let team = this._unitProcessor.myTeam;
        if (team.isMoving || this._isDirty) {
            let area = this.battleLogic.unitCollisionsManager.getInArea(team.pos);
            if (area && this._area != area) {
                this._area = area;
                let allCfg = TableManager.getAllData(table.map.MapBuildingConfig);
                for (let cfg of allCfg) {
                    if (cfg.area_id == area.areaId) {
                        // FloatingTextManager.ins().showTips(cfg.maparea_name);
                        FloatingTextManager.ins().showAreaItem(cfg.maparea_name);
                        // console.log("区域变更！-----区域名字：" + cfg.maparea_name);
                        break;
                    }
                }
            }
        }
    }

    /**更新碰撞区域 */
    public updateCollisions() {
        this.battleLogic.unitCollisionsManager.updateRect(this._unitProcessor.myTeam.pos);
        // UnitCollisionsManager.ins().updateUnits(WorldUnitTeam.Self, this._unitProcessor.heroes);
        // UnitCollisionsManager.ins().updateUnits(WorldUnitTeam.Enemy, this._unitProcessor.monsters);

        this.battleLogic.unitCollisionsManager.initTreeTeam(WorldUnitTeam.Self)
        this.battleLogic.unitCollisionsManager.initTreeTeam(WorldUnitTeam.Enemy)

        let heros = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Self)
        for (let i = heros.length - 1; i >= 0; i--) {
            this.battleLogic.unitCollisionsManager.updateUnit(heros[i])
        }

        let monsters = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy)
        for (let i = monsters.length - 1; i >= 0; i--) {
            this.battleLogic.unitCollisionsManager.updateUnit(monsters[i])
        }

        this.battleLogic.unitCollisionsManager.updateMineralUnits(this._unitProcessor.minerals);
        this.battleLogic.unitCollisionsManager.updateDropUnits(this._unitProcessor.drops);
    }

    public onUpdate() {
        for (let teamId in this._unitProcessor.teamMap) {
            this._unitProcessor.teamMap[teamId].update();
        }

        this.checkSafe();

        this.checkArea();

        this.updateCollisions();

        this.updateAction();

        this.updateBullet();

        this.updateDrop();

        // this.battleLogic.showMgr.update();

        // if (this._unitProcessor.myTeam.isMoving || this._unitProcessor.myTeam.isAutoMoving) {
        //     if (!this.battleLogic.isHideBattle)
        //         BattleManager.ins().moveCamera(this._unitProcessor.myTeam.pos.x, this._unitProcessor.myTeam.pos.y, this._unitProcessor.myTeam.isMoving)
        // }

        this._isDirty = false;
    }

    public updateShow(): void {
        this.moveCamera();
        this.battleLogic.showMgr.update();
        this.sortDepth()
    }

    private interpolationMoveComp: InterpolationMoveComp;
    private moveCamera(isForce: boolean = false): void {
        let b = false
        if (isForce || this._unitProcessor.myTeam.isMoving || this._unitProcessor.myTeam.isAutoMoving) {
            if (!this.battleLogic.isNotShowBattleEffect()) {
                b = true
                this.interpolationMoveComp.update(this._unitProcessor.myTeam.pos, 1);
            }
        }

        if (!b)
            this.interpolationMoveComp.stop()
    }

    private onInterpolationMove(x: number, y: number): void {
        BattleManager.ins().moveCamera(x, y, this._unitProcessor.myTeam.isMoving)
    }

    public updateBullet() {
        let bullets = this._unitProcessor.bullets;
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (bullets[i].isActive) {
                bullets[i].update();
            } else {
                bullets[i].dispose();
                bullets.splice(i, 1);
            }
        }
    }

    public updateDrop(): void {
        let drops = this._unitProcessor.drops;
        for (let i = drops.length - 1; i >= 0; i--) {
            if (drops[i].isActive) {
                drops[i].update();
            } else {
                drops[i].dispose();
                drops.splice(i, 1);
            }
        }
    }

    public updateAction() {
        let heroes = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Self);
        let monsters = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        let minerals = this._unitProcessor.minerals;
        let leaderSkills = this._unitProcessor.leaderSkills;
        let collectSkills = this._unitProcessor.collectSkills;
        let otherSkill = this._unitProcessor.otherSkill;

        // if (!BattleManager.ins().isEndFight) {
        //     for (let i = heroes.length - 1; i >= 0; i--) {
        //         UnitCollisionsManager.ins().calUnitEnvVec(heroes[i]);
        //     }
        // }

        if (!this.battleLogic.battleSetting.isNotEnv) {
            for (let i = monsters.length - 1; i >= 0; i--) {
                this.battleLogic.unitCollisionsManager.calUnitEnvVec(monsters[i]);
            }
        }

        //Buff逻辑心跳
        this.battleLogic.update()

        for (let i = heroes.length - 1; i >= 0; i--) {
            heroes[i].update();
        }

        for (let i = monsters.length - 1; i >= 0; i--) {
            monsters[i].update();
        }

        for (let i = minerals.length - 1; i >= 0; i--) {
            minerals[i].update();
        }

        for (let i = leaderSkills.length - 1; i >= 0; i--) {
            if (leaderSkills[i].isActive) {
                leaderSkills[i].update();
            } else {
                leaderSkills[i].dispose();
                leaderSkills.splice(i, 1);
            }
        }

        for (let i = collectSkills.length - 1; i >= 0; i--) {
            if (collectSkills[i].isActive) {
                collectSkills[i].update();
            } else {
                collectSkills[i].dispose();
                collectSkills.splice(i, 1);
            }
        }

        for (let i = otherSkill.length - 1; i >= 0; i--) {
            if (otherSkill[i].isActive) {
                otherSkill[i].update();
            } else {
                otherSkill[i].dispose();
                otherSkill.splice(i, 1);
            }
        }

        if (this.battleLogic.isSafe) {
            /**安全区 */
            let time = TimeManager.battleNow;
            if (this._safeHealTime < time) {
                SkillUtils.safeAreaHeal(heroes);
                this._safeHealTime = time + 1000;
            }
            this.exitBattleState();
        } else if (this.battleLogic.isInBattle()) {
            this.checkExitBattle()
        }

        this._unitProcessor.doDisposeUnits();
    }

    public sortDepth(force: boolean = false): void {
        if (this._frameCount++ % 10 == 0 || force) {
            // SortUtils.sortBy2(WorldManager.ins().roleLayer.children, ["sortDepth"], [false], false)
            //WorldManager.ins().roleLayer.children.sort((a, b) => { return b.position.y - a.position.y });
            let children = WorldManager.ins().roleLayer?.children?.slice();
            if (children?.length) {
                let sorArr = children.sort((a, b) => { return b.position.y - a.position.y });
                for (let i = 0; i < sorArr.length; i++) {
                    sorArr[i].setSiblingIndex(i);
                }
            }

            children = WorldManager.ins().uiLayer?.children?.slice();
            if (children?.length) {
                let sorArr = children.sort((a, b) => { return b.position.y - a.position.y });
                for (let i = 0; i < sorArr.length; i++) {
                    sorArr[i].setSiblingIndex(i);
                }
            }

            children = WorldManager.ins().effectLayer?.children?.slice();
            if (children?.length) {
                let sorArr = children.sort((a, b) => { return b.position.y - a.position.y });
                for (let i = 0; i < sorArr.length; i++) {
                    sorArr[i].setSiblingIndex(i);
                }
            }
            //setSiblingIndex
        }
    }

    /***
     * 检查脱战
     * 有仇恨目标的话就是没脱战
     *  */
    private checkExitBattle(): void {
        let a = false;
        //怪物脱战判断
        let heroes = this._unitProcessor.heroes;
        for (let i = heroes.length - 1; i >= 0; i--) {
            if (!heroes[i].canExitBattle()) {
                a = true
                break
            }
        }

        //怪物脱战判断
        let b = false
        let monsters = this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        for (let i = monsters.length - 1; i >= 0; i--) {
            if (!monsters[i].canExitBattle()) {
                b = true
            }
            else {
                monsters[i].exitFight();
            }
        }

        if (!a && !b)//都无仇恨目标，脱战
            this.exitBattleState();

        if (!a || !b) {
            //单方面脱战标记当前状态可以进入销毁
            if (!this._unitProcessor.readyDispose)
                this._unitProcessor.readyDisposeTime = Date.now();
            this._unitProcessor.readyDispose = true
        }
        else {
            this._unitProcessor.readyDispose = false
        }
    }

    /***强制脱战 */
    private exitBattleState(): void {
        if (this.battleLogic.isInBattle()) {
            let units = this._unitProcessor.allUnits;
            for (let i = units.length - 1; i >= 0; i--) {
                units[i].exitFight();
            }
            this.battleLogic.exitBattleState();
        }
    }
}
