import { Node } from "cc";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { ActorUnit } from "../unit/ActorUnit";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { ActorState } from "../enum/BattleEnum";
import { BattleCommandType } from "../BattleCommand";
import { Handler } from "../../../../core/utils/Handler";
import { BaseShowUnit } from "./BaseShowUnit";

export class ShowUnit extends BaseShowUnit {

    public unitData: ActorUnit;
    public statueData: { move: boolean, forceMove: boolean, addAngle?: number, shadowVisible: boolean, angle: number };

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.changeAction, this.uid, new Handler(this, this.setState))
        this.unitData.battleLogic.command.reg(BattleCommandType.addChild, this.uid, new Handler(this, this.setState))
    }

    /***上1个动作 */
    protected lastActionName: string
    /***是否背面动作，假如存在背面动作，待机会取背面 */
    private isBackAction: boolean = false;
    /***
     * loopType 0 自动，1循环，2不循环
     * directionParm 1是背面动作
     */
    setState(state: ActorState, anim?: string, timeScale?: number, directionParm: number = 0, loopType: number = 0) {
        if (!this._spineNode)
            return

        if (this._state != state || anim != this._animKey || state == ActorState.Attack || state == ActorState.RunAttack || state == ActorState.Collect) {
            this.unitData.state = state;
            this._state = state;
            this._animKey = anim;
            let loop = loopType == 1;
            if (state != ActorState.Idle) {
                this.isBackAction = directionParm == 1;
            }
            switch (this._state) {
                case ActorState.Running:
                    this.setStateHandler(this.moveAction, loopType == 0 ? true : loop, this._spineNode.runTimeScale);
                    break;
                case ActorState.Idle:
                    let idleActionName = "idle"
                    if (this.isBackAction)
                        idleActionName += "_up";
                    this.setStateHandler(idleActionName, loopType == 0 ? true : loop);
                    break;
                case ActorState.RunAttack:
                case ActorState.Attack:
                    let defaultAnim: string = "attack"
                    if (directionParm == 1)
                        defaultAnim = "attack_up"
                    this.setStateHandler(anim ? anim : defaultAnim, loopType == 0 ? false : loop, timeScale);
                    break;
                case ActorState.Collect:
                    this.setStateHandler(anim ? anim : "idle", loopType == 0 ? false : loop); //必须有动作名
                    break
                case ActorState.Die:
                    this.setStateHandler("die", loopType == 0 ? false : loop);
                    break;
                case ActorState.Vertigo:
                    this.setStateHandler("ctrl", true);
                    break;
            }
        }
    }

    protected get moveAction(): string {
        return "move"
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        for (let i = 0; i < this._spineNodeList.length; i++) {
            this._spineNodeList[i].play(actionName, loop, timeScaler);
        }
        this.lastActionName = actionName;
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {

    }

    protected onSpineLoaded(): void {
        this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
    }

    public update(): void {
        this.updateModel()
        this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
        for (let i = 0; i < this._spineNodeList.length; i++) {
            if (this.statueData) {
                // if (this.statueData.move)
                //     this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
                if (this.statueData.addAngle != null) {
                    this._spineNodeList[i].angle += this.statueData.addAngle;
                }
                if (this.statueData.angle != null) {
                    this._spineNodeList[i].angle = this.statueData.angle;
                }
            }
            this._spineNodeList[i].setDirction(this.unitData.dirction);
        }
        super.update()
    }

    /**更新模型 */
    protected updateModel() {
        //this._spineNode.step()
    }

    protected addChild(layer: Node): void {
        layer.addChild(this._spineNode)
    }
}