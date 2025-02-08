import { Node, Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import { PathPoint } from "../../../../core/astar/PathPoint";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { BattleLogic } from "../../../comm/battle/BattleLogic";
import { BattleUtils } from "../../../comm/battle/BattleUtils";
import { ActorState, DirctionType } from "../../../comm/battle/enum/BattleEnum";
import { ActorUnitNode } from "../../../comm/battle/node/ActorUnitNode";
import { MoveVec } from "../../../comm/battle/unit/MoveVec";
import { CollisionUtils } from "../../../comm/math/CollisionUtils";
import GIns from "../../../GIns";
import { HeroVo } from "../../hero/HeroVo";

/**
 * 交互角色
*/
export class StimulationBattleUnit {
    private spineNode: ActorUnitNode;
    private scene: Node;

    public pos: Vec2;
    public targetPos: Vec2;
    /**影子*/
    protected shadow: ui.commBattle.battleComp.BattleShadowBigComp;
    /***当前路径移动点 */
    protected nowMovePoint: PathPoint;
    /***是否路径移动中 */
    protected _isPathMove: boolean = false;
    /***当前的移动路径 */
    private movePaths: PathPoint[]
    /***当前帧的移动向量 */
    protected _moveVec = new MoveVec();
    protected _heroVo: HeroVo = null;

    public battleLogic: BattleLogic;

    public constructor() {
        this.pos = new Vec2(0, 0)
        this.shadow = fgui.UIPackage.createObject("commBattle", "BattleShadowSmallComp") as ui.commBattle.battleComp.BattleShadowBigComp;
        this.updateShadowImgScale();
    }

    public init(heroVo: HeroVo, scene: Node): void {
        this._heroVo = heroVo;
        this.scene = scene;
        this.loadByModelId(heroVo.modelId)
        this.scene.insertChild(this.shadow.node, 0);
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
        this.scene.addChild(this.spineNode);
        this.spineNode.fadeIn(500);
    }

    protected onSpineLoaded(): void {
        this.updateShadowImgScale()
    }

    protected updateShadowImgScale(): void {
        if (this.spineNode && this.shadow)
            this.shadow.scaleX = this.shadow.scaleY = Math.max(90, this.spineNode.modelWidth) / this.shadow.img.width
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
        this.spineNode.setDirction(dir);
    }

    public get moveDistance() {
        return BattleUtils.frameDeltaMs * 0.1
    }

    public get isMoving(): boolean {
        return this._isPathMove;
    }

    public get heroId(): number {
        return this._heroVo?.baseId;
    }

    public showUnit(): ActorUnitNode {
        return this.spineNode;
    }

    public update(): void {
        this.checkPathMove();
        //更新节点
        this.updateNode();
        if (!this._isPathMove) {
            return;
        }
        //更新位移
        this.updatePos();

    }

    /**更新位置 */
    public updatePos(): void {
        if (this._moveVec.isDirty) {
            if (this._moveVec.isMoving) {
                this.pos.add(this._moveVec.moveVec);
                this.spineNode.setPosition(this.pos.x, this.pos.y);
                this.updateShadowPos();
                let dirScale = this._moveVec.getDirectionScale();
                this.setDirction(dirScale);
            }
        }
    }

    /**更新节点表现 */
    public updateNode() {
        if (this._moveVec.isMoving) {
            this.setState(ActorState.Running);
        } else {
            this.setState(ActorState.Idle);
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

    public setMoveTarget(targetPoint: Vec2): number {
        if (this.battleLogic.unitCollisionsManager.isInBlock(this.pos))
            return 0;

        let paths: PathPoint[];
        if (this.battleLogic.aStar.isSameTile(this.pos, targetPoint)) {
            //相同格子不寻路
            let targetPos = this.battleLogic.aStar.getTilePoint(targetPoint.x, targetPoint.y);
            let pathPoint = new PathPoint(targetPos.x, targetPos.y);
            pathPoint.setPixelPoint(targetPoint.x, targetPoint.y);
            paths = [pathPoint];
            this.runPaths(paths, false);
            return 1;
        }

        paths = this.battleLogic.aStar.findPaths(this.pos, targetPoint, false)
        if (paths && paths.length > 0) {
            GIns.battleDebugMgr.debugShowPaths(paths);
            this.runPaths(this.battleLogic.aStar.getOptimizePath(paths), false);
            return 1;
        }
        return 0;
    }

    /***判断路径位移 */
    protected checkPathMove(): void {
        if (this._isPathMove) {
            if (!this.nowMovePoint) {
                this.clearPathMove()
                return
            }
            else if (Math.abs(this.pos.x - this.nowMovePoint.pixelPoint.x) <= this.moveDistance && Math.abs(this.pos.y - this.nowMovePoint.pixelPoint.y) <= this.moveDistance) {
                if (!this.moveNextPath()) {
                    this.clearPathMove();
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

    /***按一组路线移动 */
    public runPaths(paths: PathPoint[], isFroce: boolean): void {
        if (paths && paths.length == 0)
            return
        this._isPathMove = true;
        this.movePaths = paths;
        this.moveNextPath()
    }

    protected moveNextPath(): boolean {
        if (this.movePaths.length == 0)
            return false;
        this.nowMovePoint = this.movePaths.shift();
        return true;
    }

    protected clearPathMove(): void {
        if (this._isPathMove) {
            this._isPathMove = false;
            this.movePaths.length = 0;
            this.nowMovePoint = null;
        }
        this._moveVec.resetVec();
    }

    public dispose(): void {
        if (this.spineNode?.isValid) {
            this.spineNode.delayDestroy(0);
        }
        this.spineNode = null;
        if (this.shadow) {
            this.shadow.dispose();
        }
        this.shadow = null;
    }
}