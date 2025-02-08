import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { MobileShakeType } from "../../../modules/settings/model/SettingsModel";
import { WorldManager } from "../../world/WorldManager";
import { ActorState } from "../enum/BattleEnum";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { MineralUnit } from "../unit/MineralUnit";
import { BaseShowUnit } from "./BaseShowUnit";

export class MineralShowUnit extends BaseShowUnit {
    public unitData: MineralUnit;

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
    }

    public setSpineNode(node: AnimBaseUnitNode) {
        super.setSpineNode(node)
        node.setCompleteListener((aniName: string) => {
            this.nodeActionComplete(aniName)
        });
        WorldManager.ins().roleLayer.addChild(node);
        node.name = "MineralShowUnit"
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
        if (aniName.indexOf("hurt") != -1) {
            this.setState(ActorState.Idle);
        }
    }

    protected onSpineLoaded(): void {
        if (this.unitData.isDeath)
            this.setState(ActorState.Die);
        else
            this.setState(ActorState.Idle);
    }

    public update(): void {
        super.update()
        this.setSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
    }

    public setState(state: ActorState) {
        this._state = state;
        switch (this._state) {
            case ActorState.Idle:
                if (this.isExtract()) {
                    this._spineNode.play("idle" + this.unitData.hpNum, true);
                }
                else
                    this._spineNode.play("idle", true);
                break;
            case ActorState.Hurt:
                if (this.isExtract()) {
                    this._spineNode.play("hurt" + this.unitData.hpNum, false);
                }
                else
                    this._spineNode.play("hurt", false);
                G.FacadeManager.emit(NotificationKey.Show_Mobile_Shake, MobileShakeType.mineral);
                break;
            case ActorState.Die:
                this._spineNode.play("die", false);
                break;
        }
    }

    protected isExtract(): boolean {
        if (this.unitData.cfg.collectAction == "extract") {
            return true
        }
        return false
    }

    /***设置边缘隐藏 */
    public setEdgeHide(v: boolean): void {
        if (this.isEdgeHide == 0 || ((v && this.isEdgeHide == 1) || (!v && this.isEdgeHide == 2))) {
            this.isEdgeHide = v ? 2 : 1;
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this._spineNodeList[i].isValid) {
                    if (v) {
                        this._spineNodeList[i].pause()
                        this.visible = false;
                    }
                    else {
                        this.setStatue({ forceMove: true })
                        this._spineNodeList[i].resume()
                        this.visible = true;
                    }
                }
            }
        }
    }
}