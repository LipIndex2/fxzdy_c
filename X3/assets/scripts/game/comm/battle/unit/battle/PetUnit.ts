import { Vec2 } from "cc";
import { UnitType } from "../../enum/BattleEnum";
import { BattleUnit } from "./BattleUnit";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { TeamUnit } from "../TeamUnit";
import { PetBattleData } from "./PetBattleData";
import { DamageVo } from "../../DamageVo";
import { PetShowUnit } from "../../show/PetShowUnit";
import { PetBattleAttr } from "../../attribute/PetBattleAttr";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { BattleUtils } from "../../BattleUtils";
import { EffectLayer, SkillEffectPos } from "../../skill/SkillEnum";
import { BattleDebugManager } from "../../BattleDebugManager";
import GIns from "../../../../GIns";
import BattleConstantConfig from "../../config/BattleConstantConfig";

export class PetUnit extends BattleUnit {
    protected _type: UnitType = UnitType.Pet;
    private _cfg: table.pet.PetConfig;
    protected teamUnit: TeamUnit;
    protected _attr: PetBattleAttr;
    /***存活时间 */
    protected survivalTime: number;

    private randomMoveIndex: number = -1

    get cfg(): table.pet.PetConfig {
        return this._cfg
    }

    /**初始化怪物数据 */
    init(data: table.pet.PetConfig, battleData: PetBattleData) {
        this._cfg = data;
        if (!this._attr)
            this._attr = new PetBattleAttr(this);
        this._attr.initByPet(battleData);
        this.disposeDelayTime = 2500;
        this.survivalTime = BattleUtils.getFrameByTime(this._cfg.castTime || 0)
        this.teamUnit = this.battleLogic.getTeamByTeamId(this.teamId)
        this.initModelCfg(data.modelId)
    }

    update(): boolean {
        let b = super.update()
        if (b) {
            let units = this.battleLogic.getUnitsByTeamId(this.teamId);
            let allDie = true;
            for (let i = 0; i < units.length; i++) {
                if (units[i].type == UnitType.Hero && units[i].isActive) {
                    allDie = false;
                    break
                }
            }
            this.visible = !allDie

            if (this.survivalTime > 0) {
                this.survivalTime--;
                if (this.survivalTime == 0) {
                    //死亡
                    this.toDie()
                }
            }

        }
        return b
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        let b = super.checkCanActivateSkills()
        return b && !this.teamUnit.isMoving
    }

    /**修正移动位置 */
    onBeforUpdatePos(): void {
        if (this.teamUnit.isMoving || (!this._moveVec.isMoving && !this.isBeginToFight) /* || this.checkHateDis(this.pos, true) */) {
            this.clearMainTarget()
            this.clearHatredTarget();
            this.moveToFormation();
        }
    }

    private summonMoveIndex: number = 0;
    /**向阵位移动 */
    moveToFormation(force: boolean = false): void {
        if (GIns.mapMgr.isInMainCity()) {
            //主城闲逛模式
            if (this.randomMoveIndex <= 0) {
                this.initRandomMoveTime()
                this.moveToRandomPos();
            }
            this.randomMoveIndex--;
        }
        else {
            let dis = Vec2.distance(this.originPos, this._pos);
            if (dis > 20) {
                if (this.summonMoveIndex == 0) {
                    this.summonMoveIndex = 10;
                    let radians = MathUtils.getRadians(this._pos.x, this._pos.y, this.originPos.x, this.originPos.y);
                    let moveDistance = Math.min(this.moveDistance, dis);
                    let tempVec = MathUtils.tempVec2(moveDistance * Math.cos(radians), moveDistance * Math.sin(radians))
                    this._moveVec.sustainVec.set(tempVec.x, tempVec.y)
                }
                this._moveVec.setMoveVec(this._moveVec.sustainVec);
                this.summonMoveIndex--
                if (force) {
                    this.forceMovePathHandler();
                }
            }
            else {
                this.summonMoveIndex = 0;
            }
        }
    }

    protected initRandomMoveTime(): void {
        this.randomMoveIndex = BattleUtils.getFrameByTime(this.battleLogic.randomMgr.randomInt(BattleConstantConfig.monsterRandomMoveMinTime, BattleConstantConfig.monsterRandomMoveMaxTime))
    }

    private isRandomMove: boolean = false;
    /***移动到附近1个坐标 */
    private moveToRandomPos() {
        if (this.battleLogic.isStopFightAi)
            return
        if (this.battleLogic.unitCollisionsManager.isInBlock(this.pos))
            return
        let range = BattleConstantConfig.monsterRandomMoveRange;
        let tryTimes = 5;
        while (--tryTimes > 0) {
            let newPos = this.battleLogic.randomMgr.createRandomCoordinate(this.pos, 1000, 1000, range.a)
            if (!this.battleLogic.unitCollisionsManager.isInBlock(newPos)) {
                let b = this.setMoveTarget(newPos, true)
                if (b != 0 && b != -1) {
                    this.isRandomMove = true
                    this.checkPathMove()
                    break
                }
            }
        }
    }

    private originPosVec: Vec2
    private originRandomX: number = 0;//召唤物的初始坐标随机
    private originRandomY: number = 0;
    /**仇恨计算原点 */
    get originPos(): Vec2 {
        if (!this.originPosVec) {
            this.originPosVec = this.battleLogic.randomMgr.getRandomPointOnRectEdge(this.teamUnit.pos, 300, 300, 50)//v2(this.battleLogic.randomMgr.randomInt(-this.originRandomX, this.originRandomX), this.battleLogic.randomMgr.randomInt(-this.originRandomY, this.originRandomY))
            this.originRandomX = (this.teamUnit.pos.x - this.originPosVec.x);
            this.originRandomY = (this.teamUnit.pos.y - this.originPosVec.y)
        }
        return this.originPosVec.set(this.teamUnit.pos.x + this.originRandomX, this.teamUnit.pos.y + this.originRandomY)
    }

    /**死亡 */
    protected onDie(damageVo?: DamageVo): void {
        this._attr.refreshReviveCD()
        super.onDie(damageVo);
        this.needDispose()
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): PetShowUnit {
        return super.showUnit() as PetShowUnit;
    }

    /**处理其他事情 */
    protected doOther() {
        super.doOther()
        if (!this.selectMainTarget && !this._moveVec.isCrtl && !this.isAttacking) {
            let team = this.battleLogic.getTeamByTeamId(this.teamId)
            if (team.isTeamFighting) {
                //附近无敌人的时候，假如队伍是参战状态，就前往队友的目标
                let teamSelectTarget = team.getTeamSelectMainTarget()
                if (teamSelectTarget) {
                    let vec = CollisionUtils.calVecTemp(this.pos, teamSelectTarget.pos, this.moveDistance);
                    this._moveVec.setMoveVec(vec);
                }
                return
            }
        }
    }

    /***是否可以选中 */
    public canSelect(): boolean {
        return false;
    }

    protected markVerify(): void {
        this.battleLogic.markVerify(this);
    }

    /***
     * 进入战斗
     * teamEnter 是否全队进战
     *  */
    public enterFight(teamEnter: boolean = true): boolean {
        return super.enterFight(false)
    }
}