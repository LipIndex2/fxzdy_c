import { PoolManager } from "../../../../core/pool/PoolManager";
import { ActorState, DirctionType, WorldUnitTeam } from "../enum/BattleEnum";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { Node } from "cc";
import { SmallBattleLogic } from "./SmallBattleLogic";
import { TableManager } from "../../../../core/table/TableManager";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { Vec2 } from "cc";
import { BattleUtils } from "../BattleUtils";
import { MoveVec } from "../unit/MoveVec";
import { CollisionUtils } from "../../math/CollisionUtils";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { v2 } from "cc";
import * as fgui from "fairygui-cc";

export class SmallBattleUnit {
    private spineNode: ActorUnitNode;
    private scene: Node;
    /***阵位位置 */
    public position: number = 0;
    public teamId: number = 0;
    private logic: SmallBattleLogic
    /***离攻击动作结束还有多少帧，0则表示可以攻击 */
    protected attackEndTime: number = 0;
    private skillCfg: table.battle.SkillConfig;
    private selectTarget: SmallBattleUnit;
    private hp: number = 0;
    private maxHp: number = 0;
    public pos: Vec2;
    private moveVec: MoveVec;
    private isMoveing: boolean = false
    /***攻击距离 */
    private castingRange: number;
    public atkPoint: Vec2;
    private castingRangeArr: string[]
    protected shadow: ui.commBattle.battleComp.BattleShadowBigComp;

    public constructor () {
        this.pos = new Vec2(0, 0)
        this.moveVec = new MoveVec()
        this.castingRangeArr = TableManager.getDataById(table.trunkinstance.TrunkInstanceConstantConfig, "TRUNK_INSTANCE:position_castingRange").content.split(",");
        this.shadow = fgui.UIPackage.createObject("commBattle", "BattleShadowSmallComp") as ui.commBattle.battleComp.BattleShadowBigComp;
        this.updateShadowImgScale();
    }

    public init(scene: Node, logic: SmallBattleLogic, skillId: string): void {
        this.scene = scene;
        this.logic = logic
        this.skillCfg = TableManager.getDataById(table.battle.SkillConfig, skillId);
        if (this.skillCfg.atkPoint) {
            this.atkPoint = new Vec2(+this.skillCfg.atkPoint.x, +this.skillCfg.atkPoint.y);
        }
        else
            this.atkPoint = null;
        this.scene.insertChild(this.shadow.node, 0);
    }

    public getAtkPoint(): { x: number, y: number } {
        if (!this.atkPoint)
            return this.pos;

        let offsetX = this.atkPoint.x;
        let offsetY = this.atkPoint.y;

        offsetX = ((offsetX * this.scaleX) * (this.dirction == DirctionType.Rigth ? 1 : -1)) + this.pos.x;
        offsetY = ((offsetY * this.scaleY)) + this.pos.y;
        return { x: offsetX, y: offsetY };
    }

    /**受击点 */
    get hurtPoint() {
        let x = this.pos.x + this.scaleX;
        let y = this.pos.y + this.scaleY + 100 * 0.5;
        return v2(x, y);
    }

    protected _scaleX: number = 1;
    public set scaleX(v: number) {
        this._scaleX = v;
    }

    public get scaleX(): number {
        return this._scaleX
    }

    protected _scaleY: number = 1;
    public set scaleY(v: number) {
        this._scaleY = v;
    }

    public get scaleY(): number {
        return this._scaleY
    }

    public loadByModelId(modelId: number): void {
        if (!this.spineNode) {
            this.spineNode = PoolManager.getItem(ActorUnitNode);
            this.spineNode.setLoadCompleteListener(() => {
                this.onSpineLoaded()
            })
            this.spineNode.setCompleteListener((aniName: string) => {
                this.nodeActionComplete(aniName)
            });
        }

        this.spineNode.loadByModelId(modelId);
        this.scene.addChild(this.spineNode)
        this.spineNode.fadeIn(500)
    }

    protected onSpineLoaded(): void {
        this.updateShadowImgScale()
    }

    protected updateShadowImgScale(): void {
        if (this.spineNode && this.shadow)
            this.shadow.scaleX = this.shadow.scaleY = Math.max(90, this.spineNode.modelWidth) / this.shadow.img.width
    }

    public setHp(hpmax: number): void {
        this.maxHp = this.hp = hpmax;
    }

    public setPosXY(x: number, y: number) {
        this.pos.set(x, y)
        this.spineNode.setPosition(x, y);
        this.updateShadowPos()
    }

    protected _dirction: DirctionType = DirctionType.Rigth;
    public get dirction(): DirctionType {
        return this._dirction
    }

    public setDirction(dir: DirctionType): void {
        this._dirction = dir;
        this.spineNode.setDirction(dir)
    }

    public setPosition(position: number): void {
        this.position = position;
        this.castingRange = +this.castingRangeArr[position]
    }

    get isAttacking() {
        return this.attackEndTime;
    }

    public isDeath(): boolean {
        return this.hp <= 0;
    }

    public get moveDistance() {
        return BattleUtils.frameDeltaMs * 0.1
    }

    public update(): void {
        //更新目标状态
        this.checkTargetStatue();
        if (!this.checkSelfState()) return;
        this.updateAI();
        //更新位移
        this.updatePos();
        //更新节点
        this.updateNode();
    }

    /**检测对方状态 */
    protected checkTargetStatue(): void {
        if (this.selectTarget) {
            //主目标死亡了
            if (this.selectTarget.isDeath())
                this.clearTarget();
        }
    }

    private clearTarget(): void {
        this.selectTarget = null
    }

    /**检测状态 */
    protected checkSelfState() {
        return !this.isDeath()
    }

    private behaviorTime: number = 0;
    private behaviorCfg: table.battle.BehaviorConfig;
    /**更新AI */
    protected updateAI() {
        if (this.attackEndTime > 0) {
            this.attackEndTime--;
            if (this.attackEndTime <= 0)
                this.attackActionComplete(false)
        }

        if (!this.isAttacking) {
            this.checkTarget()
            if (this.selectTarget && !this.selectTarget.isDeath()) {
                this.attack();
            }
        }
        else if (this.behaviorCfg) {
            //触发行为
            if (this.behaviorTime > 0) {
                this.behaviorTime--;
            }
            if (this.behaviorTime == 0)
                this.behaviorHandler()
        }
    }

    private checkTarget(): void {
        if (this.selectTarget) {
            return
        }

        this.selectTarget = this.logic.checkTargetByPosition(this.position, this.teamId)
    }

    /***进行攻击 */
    protected attack(): void {
        if (!this.checkAttack())//检查攻击条件是否满足
            return

        this.attackEndTime = BattleUtils.getFrameByTime(this.skillCfg.castTime);
        let cfg = TableManager.getDataById(table.battle.SkillEffectConfig, this.skillCfg.anim);
        this.setState(ActorState.Attack, cfg.anim);
        this.behaviorCfg = TableManager.getDataById(table.battle.BehaviorConfig, this.skillCfg.behavior_0.behaviorId);
        this.behaviorTime = BattleUtils.getFrameByTime(this.skillCfg.behavior_0.delay) || 0;
    }

    private behaviorHandler(): void {
        if (this.selectTarget) {
            if (this.behaviorCfg.effectType == "hurt") {
                this.selectTarget.hurt()
            }
            else if (this.behaviorCfg.effectType == "missile" && this.behaviorCfg.effectParam) {
                this.logic.createBullet(this, this.selectTarget, this.behaviorCfg.effectParam.missileId || 1)
            }
        }
        this.behaviorCfg = null;
    }

    public hurt(): void {
        this.spineNode.colorDelay()
        if (this.teamId == WorldUnitTeam.Enemy) {
            //敌人才会受伤
            this.hp--;
            if (this.hp == 0) {
                //死亡
                this.attackActionComplete(true)
                this.setState(ActorState.Die);
            }
        }
    }

    /***
     * 判断当前状态能否攻击
     * isIgnoreDis 是否忽略距离
     *  */
    protected checkAttack(): boolean {
        if (!this.selectTarget || this.isDeath())
            return false

        if (MathUtils.distance(this.selectTarget.pos, this.pos) <= this.castingRange) {
            return true
        }
        else if (this.teamId == WorldUnitTeam.Enemy) {
            //敌人要移动到目标位置,玩家的不能移动
            let vec = CollisionUtils.calVecTemp(this.pos, this.selectTarget.pos, this.moveDistance);
            this.moveVec.setMoveVec(vec);
        }
        return false;
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        if (!isForce || this.attackEndTime) {
            this.attackEndTime = 0;
            this.behaviorCfg = null;
        }
    }

    /**更新位置 */
    public updatePos(): void {
        if (this.moveVec.isDirty) {
            if (this.moveVec.isMoving) {
                this.pos.add(this.moveVec.moveVec);
                this.spineNode.setPosition(this.pos.x, this.pos.y)
                this.updateShadowPos()
            }
        }
    }

    /**更新节点表现 */
    public updateNode() {
        this.isMoveing = false;
        if (this.moveVec.isMoving) {
            if (!this.isAttacking)
                this.setState(ActorState.Running);
            this.isMoveing = true;
        } else {
            if (!this.isAttacking && !this.isDeath()) {
                this.setState(ActorState.Idle);
            }
        }

        if (this.moveVec.isDirty) {
            this.moveVec.resetVec();
        }
    }

    private state: ActorState;
    private setState(state: ActorState, anim?: string, timeScale?: number, loopType: number = 0) {
        if (!this.spineNode)
            return

        if (this.state != state || state == ActorState.Attack) {
            this.state = state;
            let loop = loopType == 1;
            switch (this.state) {
                case ActorState.Running:
                    this.setStateHandler("move", loopType == 0 ? true : loop, this.spineNode.runTimeScale);
                    break;
                case ActorState.Idle:
                    let idleActionName = "idle"
                    this.setStateHandler(idleActionName, loopType == 0 ? true : loop);
                    break;
                case ActorState.RunAttack:
                case ActorState.Attack:
                    let defaultAnim: string = "attack"
                    this.setStateHandler(anim ? anim : defaultAnim, loopType == 0 ? false : loop, timeScale);
                    break;
                case ActorState.Die:
                    this.setStateHandler("die", loopType == 0 ? false : loop);
                    break;
            }
        }
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        this.spineNode.play(actionName, loop, timeScaler);
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
        if (this.state == ActorState.Attack || this.state == ActorState.SKilling) {
            this.setState(ActorState.Idle)
        }
        else if (this.state == ActorState.Die) {
            this.onDieActionComplete()
        }
    }

    /**
       * 更新影子坐标
       */
    protected updateShadowPos(): void {
        if (this.shadow) {
            this.shadow.x = this.pos.x;
            this.shadow.y = -this.pos.y
        }
    }

    private dieTimer: string
    private onDieActionComplete(): void {
        if (this.spineNode?.isValid)
            this.spineNode.fadeOut(2000)
        this.dieTimer = GameTimer.ins().once(2000, this, () => {
            this.logic.monsterRevive(this)
        })
    }

    public dispose(): void {
        if (this.spineNode?.isValid)
            this.spineNode.delayDestroy(0)
        if (this.dieTimer)
            GameTimer.ins().clearByKey(this.dieTimer)
    }
}