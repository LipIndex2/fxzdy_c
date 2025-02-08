import { PoolManager } from "../../../../core/pool/PoolManager";
import BattleTimer from "../../../../core/timer/BattleTimer";
import { Handler } from "../../../../core/utils/Handler";
import { AudioManager } from "../../mgr/AudioManager";
import { WorldManager } from "../../world/WorldManager";
import { BattleCommandType } from "../BattleCommand";
import { InterpolationMoveComp } from "../comp/InterpolationMoveComp";
import BattleShowFactory from "../factory/BattleShowFactory";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { EffectLayer } from "../skill/SkillEnum";
import { BulletHitTipsComp } from "../ui/BulletHitTipsComp";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import { BaseShowUnit } from "./BaseShowUnit";

export class BulletShowUnit extends BaseShowUnit {
    public unitData: BulletUnit;
    public statueData: { move: boolean, angle: number };
    /***落点提示器 */
    protected hitTipsComp: BulletHitTipsComp;

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
        this.unitData.battleLogic.command.reg(BattleCommandType.hit, this.uid, new Handler(this, this.hit))
        this.unitData.battleLogic.command.reg(BattleCommandType.bulletEffect, this.uid, new Handler(this, this.showBulletEffect))
    }

    public setSpineNode(node: AnimBaseUnitNode) {
        super.setSpineNode(node)
        this.interpolationMoveComp = new InterpolationMoveComp(BattleTimer.battleTickFrame, new Handler(this, this.onInterpolationMove, null, false))
    }

    public update(): void {
        if (!this._spineNode)
            return;

        this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
        if (this.statueData) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this.statueData.angle != null) {
                    this._spineNodeList[i].angle = this.statueData.angle;
                }
            }
        }
        super.update()
    }

    private interpolationMoveComp: InterpolationMoveComp;
    public setSpinesPosXY(x: number, y: number): void {
        if (this.interpolationMoveComp)
            this.interpolationMoveComp.update(this.pos);
    }

    private onInterpolationMove(x: number, y: number): void {
        super.setSpinesPosXY(x, y)
    }

    /***绑定战斗数据 */
    public setUnitData(unitData: BulletUnit): void {
        super.setUnitData(unitData);
        if (unitData.cfg.shootSound)
            AudioManager.ins().playSound("bullet/" + unitData.cfg.shootSound)
    }

    public setHitTipsCompTargetPos(targetPos: { x: number, y: number }, angle: number = 0): void {
        if (!this.hitTipsComp && this.unitData?.cfg.hitTips) {
            this.hitTipsComp = new BulletHitTipsComp()
            this.hitTipsComp.setUnitData(this.unitData)
        }

        if (this.hitTipsComp)
            this.hitTipsComp.setHitTipsCompTargetPos(targetPos, angle)
    }

    protected hit(hurtTarget: BattleUnit): void {
        if (this.unitData.cfg.hitSound)
            AudioManager.ins().playSound("bullet/" + this.unitData.cfg.hitSound)
    }

    protected showBulletEffect(target: BattleUnit): void {
        if (this.unitData.cfg.effectModelId) {
            let scaleX = this._spineNode?.getScale().x || 1;
            let upModel: number[] = (this.unitData.cfg.effectModelId as { up: number[], low: number[], role: number[] }).up;
            if (upModel) {
                for (let i = 0; i < upModel.length; i++) {
                    if (target)
                        target.createFightEffect(+upModel[i], this.unitData.cfg.animPosType, target, EffectLayer.RoleLayer, false, scaleX)
                    else
                        BattleShowFactory.showEffectModel(+upModel[i], this.pos, scaleX, false, false);
                }
            }
            let lowModel: number[] = (this.unitData.cfg.effectModelId as { up: number[], low: number[], role: number[] }).low;
            if (lowModel) {
                for (let i = 0; i < lowModel.length; i++) {
                    if (target)
                        target.createFightEffect(+lowModel[i], this.unitData.cfg.animPosType, target, EffectLayer.BgLayer, false, scaleX)
                    else
                        BattleShowFactory.showEffectModel(+lowModel[i], this.pos, scaleX, true, false);
                }
            }
            let roleModel: number[] = (this.unitData.cfg.effectModelId as { up: number[], low: number[], role: number[] }).role;
            if (roleModel) {
                for (let i = 0; i < roleModel.length; i++) {
                    let eff = BattleShowFactory.showEffectModel(+roleModel[i], this.pos, scaleX, true, false);
                    WorldManager.ins().roleLayer.addChild(eff);
                }
            }
        }
    }

    /**销毁 */
    dispose() {
        if (this.hitTipsComp)
            this.hitTipsComp.dispose()
        super.dispose();
        // PoolManager.recovery(this);
    }

    onRecovery(): void {
        this.unitData = null;
    }

    poolInit(): void {
        this.isDisposed = false;
        this.readyToDispose = false;
    }
}