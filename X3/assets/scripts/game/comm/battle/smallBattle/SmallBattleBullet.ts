import { Vec2 } from "cc";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { Node } from "cc";
import { MoveVec } from "../unit/MoveVec";
import { SmallBattleUnit } from "./SmallBattleUnit";
import { SmallBattleLogic } from "./SmallBattleLogic";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../math/CollisionUtils";
import { BattleUtils } from "../BattleUtils";
import { BulletType } from "../enum/BattleEnum";
import { GameTimer } from "../../../../core/timer/GameTimer";

/**普通子弹单位 （必中） */
export class SmallBattleBullet {
    private spineNode: ActorUnitNode;
    private scene: Node;
    private pos: Vec2;
    private moveVec: MoveVec;
    public uid: number
    public owner: SmallBattleUnit;
    public target: SmallBattleUnit
    public logic: SmallBattleLogic;
    private bulletCfg: table.battle.MissileConfig
    private timerKey: string

    public constructor (uid: number) {
        this.uid = uid;
        this.pos = new Vec2(0, 0)
        this.moveVec = new MoveVec()
    }

    public init(scene: Node, logic: SmallBattleLogic, bulletCfg: table.battle.MissileConfig): void {
        this.scene = scene;
        this.bulletCfg = bulletCfg;
        this.logic = logic
    }

    public get moveDistance() {
        return this.bulletCfg.speed / 100
    }

    public loadByModelId(modelId: number): void {
        if (!this.spineNode) {
            this.spineNode = PoolManager.getItem(ActorUnitNode);
        }
        let isLoop = true
        if (this.bulletCfg.type == BulletType.Rectangle) {
            isLoop = false
            this.timerKey = GameTimer.ins().once(this.bulletCfg.timeLimit, this, this.hit)
        }
        this.spineNode.loadByModelId(modelId, isLoop);

        this.scene.addChild(this.spineNode)
    }

    public setPosXY(x: number, y: number) {
        this.pos.set(x, y)
        this.spineNode.setPosition(x, y);

        let hurtPoint = this.target.hurtPoint;
        let radians = MathUtils.getRadians(this.pos.x, this.pos.y, hurtPoint.x, hurtPoint.y);
        let angle = MathUtils.radians2Angle(radians);
        this.spineNode.angle = angle + 180
    }

    public update(): void {
        //更新位移
        this.updatePos();
    }

    /**更新位置 */
    public updatePos(): void {
        let hurtPoint = this.target.hurtPoint
        if (MathUtils.distance(hurtPoint, this.pos) <= 50) {
            //命中
            this.setPosXY(hurtPoint.x, hurtPoint.y)
            this.hit();
        }
        else {
            let vec = CollisionUtils.calVecTemp(this.pos, hurtPoint, this.moveDistance);
            this.moveVec.setMoveVec(vec);
            this.pos.add(this.moveVec.moveVec);
            this.spineNode.setPosition(this.pos.x, this.pos.y)
        }
    }

    public hit(): void {
        if (!this.target.isDeath()) {
            this.target.hurt();
        }
        GameTimer.ins().clearByKey(this.timerKey)
        this.logic.poolBullet(this);
        this.spineNode.removeFromParent()
    }

    public dispose(): void {
        GameTimer.ins().clearByKey(this.timerKey)
        if (this.spineNode?.isValid)
            this.spineNode.delayDestroy(0)
    }
}