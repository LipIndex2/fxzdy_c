import { MathUtils } from "../../../../core/utils/MathUtils";
import { ActorState, DirctionType, UnitType } from "../enum/BattleEnum";
import { BaseUnit } from "./BaseUnit";
import { Vec2, v2 } from "cc";
import { PathPoint } from "../../../../core/astar/PathPoint";
import { CollisionUtils } from "../../math/CollisionUtils";
import { BattleDebugManager } from "../BattleDebugManager";
import { MoveVec } from "./MoveVec";
import { BattleUtils } from "../BattleUtils";
import { BattleCommandType } from "../BattleCommand";
import { ShowUnit } from "../show/ShowUnit";
import { Handler } from "../../../../core/utils/Handler";

export class ActorUnit extends BaseUnit {

    protected _type: UnitType = UnitType.Actor;

    protected _state: ActorState = ActorState.Idle;
    protected _animKey: string;

    /***当前路径移动点 */
    protected nowMovePoint: PathPoint;
    /***是否路径移动中 */
    protected isPathMove: boolean = false;
    /***是否强制路径移动中 */
    protected isForcePathMove: boolean = false;
    /***当前的移动路径 */
    private movePaths: PathPoint[]
    /***当前帧的移动向量 */
    protected _moveVec = new MoveVec();
    /**本次移动的向量 */
    protected _tempPosVec: Vec2 = v2();
    /***阵位坐标 */
    protected _formationPos: Vec2 = v2();

    /***是否飞行单位 */
    get isFlyUnit(): boolean {
        return false
    }

    set formationPos(pos: Vec2) {
        this._formationPos.set(pos);
    }

    get formationPos() {
        return this._formationPos;
    }

    /**仇恨计算原点 */
    get originPos(): Vec2 {
        return null;
    }

    public set state(state: ActorState) {
        this._state = state;
    }

    public get state(): ActorState {
        return this._state
    }

    /***
     * loopType 0 自动，1循环，2不循环
     * directionParm 1是背面动作
     */
    setState(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0) {
        this._state = state;
        this.battleLogic.command.send(BattleCommandType.changeAction, this.uid, state, anim, timeScale, directionParm, loopType)
    }

    getMoveVec(): MoveVec {
        return this._moveVec
    }

    setMoveVec(vec: Vec2) {
        this._moveVec.setMoveVec(vec);
    }

    setCtrlVec(vec: Vec2) {
        this.isCheckNearby = false
        if (!this.isForcePathMove) {
            this.clearPathMove();
            this._moveVec.setCtrlVec(vec);
        }
    }

    addEnvVec(vec: Vec2) {
        this._moveVec.addEnvVec(vec);
    }

    /**强制移动 */
    forceMove(vec: Vec2) {
        this._moveVec.setForceMove(vec);
    }

    /***判断1次都无移动的时候，但自身处于不可走点，那么会强制触发1次回到阵位 */
    private isFirstMove: boolean = true;
    setPosXY(x: number, y: number) {
        super.setPosXY(x, y);
        this._moveVec.isDirty = true;
        // this.updateNode()
    }

    setPosXYForce(x: number, y: number) {
        super.setPosXY(x, y);
        this.battleLogic.showMgr.setStatue(this.uid, { forceMove: true })
    }

    /**移动距离 */
    get moveDistance() {
        return BattleUtils.frameDeltaMs;
    }

    /***移动因不可走点的碰撞次数 */
    protected stopByBlockTimes: number = 0;
    /***移动碰撞到障碍物而暂停 */
    protected tryMove(pos: Vec2, moveVec: Vec2): boolean {
        let isMove = this.battleLogic.unitCollisionsManager.tryMove(pos, moveVec, this.isPathMove);//路径移动忽略碰撞
        if (!isMove && !this._moveVec.isCrtl) {
            this._moveVec.resetVec();
        }

        if (!isMove) {
            if (!this._moveVec.isCrtl) {
                this.stopByBlockTimes++;
            }
            else {
                //手动移动的时候要判断和当前目标点是否很近,近就不移动了
                let targetPoint = this.getForceMovePathTarget()
                if (!targetPoint) {
                    //回到队伍位置
                    targetPoint = this.formationPos;
                }
                let dis = MathUtils.distance(targetPoint, this.pos)
                if (dis > 150) {
                    this.stopByBlockTimes++;
                }
            }
        }
        else {
            //可以移动的话重置失败次数
            this.stopByBlockTimes = 0;
        }

        if (!isMove && (this.isFirstMove || this.stopByBlockTimes >= 1)) {
            this.stopByBlockTimes = 0;
            this.forceMovePathHandler();
        }
        this.isFirstMove = false;
        return isMove;
    }

    /****重新更新目标位置的时间 */
    private attackMoveTargetUpdateTime: number = 30;
    private setMoveTargetComplete: Handler
    public setMoveTarget(targetPoint: Vec2, force: boolean = false, setMoveTargetComplete?: Handler): number {
        if (this.battleLogic.unitCollisionsManager.isInBlock(this.pos))
            return 0;
        // if (!this.battleLogic.aStar.checkPointPassByPix(this.pos)) {
        //     return false
        // }

        if (this.isPathMove) {
            this.attackMoveTargetUpdateTime--;
            if (!force && this.attackMoveTargetUpdateTime > 0)
                return -1
            else {
                this.attackMoveTargetUpdateTime = 50;
            }
        }

        let paths: PathPoint[]
        if (this.battleLogic.aStar.isSameTile(this.pos, targetPoint)) {
            //相同格子不寻路
            let targetPos = this.battleLogic.aStar.getTilePoint(targetPoint.x, targetPoint.y)
            let pathPoint = new PathPoint(targetPos.x, targetPos.y)
            pathPoint.setPixelPoint(targetPoint.x, targetPoint.y)
            paths = [pathPoint];
            this.runPaths(paths, false)
            this.setMoveTargetComplete = setMoveTargetComplete;
            return 1
        }

        paths = this.battleLogic.aStar.findPaths(this.pos, targetPoint, false)
        if (paths && paths.length > 0) {
            BattleDebugManager.ins().debugShowPaths(paths)
            this.runPaths(this.battleLogic.aStar.getOptimizePath(paths), false)
            this.setMoveTargetComplete = setMoveTargetComplete;
            return 1
        }
        return 0
    }

    /***判断路径位移 */
    protected checkPathMove(): void {
        if (this.isPathMove) {
            if (!this.nowMovePoint) {
                this.clearPathMove()
                return
            }
            else if (Math.abs(this.pos.x - this.nowMovePoint.pixelPoint.x) <= this.moveDistance && Math.abs(this.pos.y - this.nowMovePoint.pixelPoint.y) <= this.moveDistance) {
                if (!this.moveNextPath()) {
                    this.isPathMove = false;
                    this.isForcePathMove = false;
                    return
                }
            }
            let vec = CollisionUtils.calVecTemp(this.pos, this.nowMovePoint.pixelPoint, this.moveDistance);
            this._moveVec.setMoveVec(vec);
        }
    }

    public stopMove(): void {
        this._moveVec.resetVec()
        this.clearPathMove()
    }

    protected onStopMove(): void {
        this.clearPathMove()
    }

    /**更新位置 */
    public updatePos(): void {
        if (this._moveVec.isForce) {
            this.tryMove(this.pos, this._moveVec.envVec)
            this.updateOtherPos();
            return;
        }

        if (this._moveVec.isSustainForce) {
            this.tryMove(this.pos, this._moveVec.sustainVec)
            this.updateOtherPos();
            return;
        }

        if (!this.canMove()) return;

        if (!this.isPathMove)
            this.onBeforUpdatePos();    //返回原点处理

        if (this._moveVec.isDirty) {
            let tempVec = MoveVec.tempVec;
            if (this._moveVec.isCrtl) {
                tempVec.set(this._moveVec.ctrlVec);
            } else {
                tempVec.set(this._moveVec.envVec);
            }

            if (this._moveVec.isMoving) {
                tempVec.add(this._moveVec.moveVec);
            }
            this.onMove()
            this.tryMove(this.pos, tempVec);
        }
        else {
            this.onStopMove()
        }
        this.updateOtherPos();
    }

    /**更新位置前 */
    protected onBeforUpdatePos() {
    }

    /**是否能移动 */
    protected canMove(): boolean {
        return true
    }

    protected onMove(notBreakAttack: boolean = false): void {
    }

    /***更新其他需要改变的坐标 */
    protected updateOtherPos(): void {
    }

    /***按一组路线移动 */
    public runPaths(paths: PathPoint[], isFroce: boolean): void {
        if (paths && paths.length == 0)
            return

        this.isForcePathMove = isFroce
        this.isPathMove = true;
        this.movePaths = paths;
        this.moveNextPath()
    }

    protected moveNextPath(): boolean {
        if (this.movePaths.length == 0) {
            if (this.setMoveTargetComplete) {
                this.setMoveTargetComplete.runWith([this])
            }
            return false;
        }
        this.nowMovePoint = this.movePaths.shift();
        return true;
    }

    protected clearPathMove(): void {
        if (this.isPathMove) {
            this.isPathMove = false;
            this.isForcePathMove = false;
            this.movePaths.length = 0;
            this.nowMovePoint = null;
        }
    }

    /***获取强制移动路径的目标点 */
    protected getForceMovePathTarget(): Vec2 {
        return null
    }

    private forceMovePathDelay: number = 10;
    /***强制移动路径的处理 */
    protected forceMovePathHandler(): void {
        let paths: PathPoint[]
        let targetPoint: Vec2;
        let isMoveFormation: boolean = false
        targetPoint = this.getForceMovePathTarget()

        if (!targetPoint) {
            //回到队伍位置
            targetPoint = this.formationPos;
            isMoveFormation = true;
        }

        if (this.battleLogic.aStar.checkPointPass(this.pos) && this.battleLogic.aStar.isSameTile(this.pos, targetPoint)) {
            //相同格子不寻路
            return
        }

        paths = this.battleLogic.aStar.findPaths(this.pos, targetPoint, false, 0, false)
        if (isMoveFormation && (!paths || paths.length == 0) && this.forceMovePathDelay < 0) {
            //回到阵位的需要处理阵位时不可走点的情况
            paths = this.getFormationNearbyPaths()
            this.forceMovePathDelay = 100;
        }

        if (paths && paths.length > 0) {
            // BattleDebugManager.ins().debugShowPaths(paths)
            if (paths.length > this.battleLogic.battleSetting.flashTile) {
                //大于一定的路径直接闪现
                this.setPosXY(paths[paths.length - 1].pixelPoint.x, paths[paths.length - 1].pixelPoint.y)
                this.setState(ActorState.Idle)
            }
            else
                this.runPaths(this.battleLogic.aStar.getOptimizePath(paths), true)
        }
        this.forceMovePathDelay--
    }

    /***是否触发过阵位不可走 */
    private isCheckNearby: boolean = false
    /***获取阵位附近的1个可走点路径 */
    protected getFormationNearbyPaths(): PathPoint[] {
        if (this.isCheckNearby)
            return null

        this.isCheckNearby = true
        let teamPos = this.originPos;
        let tilePoint: Vec2 = this.battleLogic.aStar.getTilePoint(teamPos.x, teamPos.y)
        //无可走点，就找队伍位置的附近1格
        let newPoint: Vec2
        //寻找上下左右可走的一格
        b: for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i != 0 && j != 0) {

                }
                else if (this.battleLogic.aStar.isPass(tilePoint.x + i, tilePoint.y + j)) {
                    let titleSize = this.battleLogic.aStar.tileSize
                    newPoint = new Vec2((tilePoint.x + i) * titleSize, (tilePoint.y + j) * titleSize)
                    break b;
                }
            }
        }

        let paths: PathPoint[];
        if (newPoint) {
            paths = this.battleLogic.aStar.findPaths(this.pos, newPoint, false)
        }
        return paths
    }

    /**更新节点表现 */
    public updateNode() {
        if (this._moveVec.isDirty) {
            this.battleLogic.showMgr.setStatue(this.uid, { move: true })
            this._moveVec.resetVec();
        }
    }

    protected _dirction: DirctionType = DirctionType.Rigth;
    public get dirction(): DirctionType {
        return this._dirction
    }

    public setDirction(dir: DirctionType): void {
        this._dirction = dir;
    }

    public showTalk(str: string, delay: number = 0): void {
        this.battleLogic.command.send(BattleCommandType.showTalk, this.uid, str, delay);
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): ShowUnit {
        if (this.battleLogic.isNotShowBattleEffect())
            return null;
        return this.battleLogic.showMgr.getUnit(this.uid) as ShowUnit;
    }

    public isOtherVisible: boolean = true
    public setOtherVisible(v: boolean): void {
        this.isOtherVisible = v;
        this.showUnit()?.setOtherVisible(v)
    }

    public set visible(v: boolean) {
        this.isVisible = v;
        if (this.showUnit()) {
            this.showUnit().visible = v;
        }
        this.setOtherVisible(v)
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

    /**销毁 */
    dispose() {
        this.setMoveTargetComplete = null
        super.dispose()
    }

    /**销毁 */
    // dispose() {
    //     if (this._spineNode?.isValid) {
    //         this._spineNode.destroy(); //先销毁
    //     }
    //     super.dispose();
    // }
}