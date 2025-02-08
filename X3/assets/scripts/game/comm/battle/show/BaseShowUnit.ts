import { Vec2 } from "cc";
import { ActorState } from "../enum/BattleEnum";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { BaseUnit } from "../unit/BaseUnit";
import { BattleCommandType } from "../BattleCommand";
import { Handler } from "../../../../core/utils/Handler";
import { tween } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { Node } from "cc";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { TableManager } from "../../../../core/table/TableManager";
import { SpriteFrameUnitNode } from "../node/SpriteFrameUnitNode";

export class BaseShowUnit {
    public readyToDispose = false;
    public isDisposed = false;
    protected delayToDispose: number = 0;

    protected _spineNode: AnimBaseUnitNode;
    protected _spineNodeList: AnimBaseUnitNode[] = [];

    public unitData: BaseUnit;

    protected _animKey: string;
    protected _state: ActorState = ActorState.None;

    public statueData: any;

    /***绑定战斗数据 */
    public setUnitData(unitData: BaseUnit): void {
        this.unitData = unitData;
        this._spineNodeList = [];
    }

    public onInitData(): void {
        this.initCommand();
    }

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        this.unitData.battleLogic.command.reg(BattleCommandType.dispose, this.uid, new Handler(this, this.onReadyToDispose))
    }

    public changeSpineNode(modelId: number): void {
        if (this._spineNode)
            this._spineNode.loadByModelId(modelId);
    }

    public setSpineNode(node: AnimBaseUnitNode) {
        this._spineNodeList.push(node)
        if (this._spineNodeList.length == 1) {
            this._spineNode = node;
        }
        node.active = true;
        node.setLoadCompleteListener(this.onSpineLoaded.bind(this))
    }

    public createOtherSpineNode(modelId: number, layer: Node, loop: boolean = true): AnimBaseUnitNode {
        let mcfg = TableManager.getDataById(table.model.ModelConfig, modelId);
        let node: AnimBaseUnitNode = mcfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
        node.loadByModelId(modelId, loop);
        layer.addChild(node);
        this.setSpineNode(node)
        return node
    }

    protected onSpineLoaded(): void {
    }

    get node(): AnimBaseUnitNode {
        return this._spineNode;
    }

    public setStatue(data: any): void {
        if (!this.statueData)
            this.statueData = data;
        else {
            for (let i in data) {
                this.statueData[i] = data[i];
            }
        }
    }

    /***暂停模型播放 */
    public pauseModel(): void {
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this._spineNodeList[i].isValid)
                    this._spineNodeList[i].pause();
            }
        }
    }

    /***恢复模型播放 */
    public resumeModel(): void {
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this._spineNodeList[i].isValid)
                    this._spineNodeList[i].resume();
            }
        }
    }

    public isEdgeHide: number = 0;
    /***设置边缘隐藏 */
    public setEdgeHide(v: boolean): void {
        if (this.isEdgeHide == 0 || ((v && this.isEdgeHide == 1) || (!v && this.isEdgeHide == 2))) {
            this.isEdgeHide = v ? 2 : 1;
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this._spineNodeList[i].isValid) {
                    if (v) {
                        this._spineNodeList[i].pause()
                        this.visible = false;
                        // this.setVisibleForAlpha(false);
                    }
                    else if (this.unitData?.isActive) {
                        // this.setFroceSpinesPosXY(this.unitData.pos.x, this.unitData.pos.y)
                        this.setStatue({ forceMove: true })
                        this._spineNodeList[i].resume()
                        this.visible = true;
                        // this.setVisibleForAlpha(true);
                    }
                }
            }
        }
    }

    public update(): void {
        this.statueData = null;
    }

    public setFroceSpinesPosXY(x: number, y: number): void {
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                this._spineNodeList[i].setPosition(x, y);
            }
        }
    }

    public setSpinesPosXY(x: number, y: number): void {
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                this._spineNodeList[i].setPosition(x, y);
            }
        }
    }

    public setOtherVisible(v: boolean): void {
    }

    public set visible(v: boolean) {
        if (!this.unitData?.isVisible) {
            v = false;
        }

        this._spineNode.active = v
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                this._spineNodeList[i].active = v;
            }
        }
        this.setOtherVisible(v)
    }

    public setVisible(v: boolean): void {
        this.visible = v;
    }

    public get visible(): boolean {
        return this._spineNode.active
    }

    public get pos(): Vec2 {
        return this.unitData.pos;
    }

    public get uid(): number {
        return this.unitData.uid
    }

    /**获取模型高度 */
    get modelHeight() {
        if (!this._spineNode)
            return 0;

        return this._spineNode.modelHeight;
    }

    public setVisibleForAlpha(v: boolean) {
        this.setAlpha(v ? 1 : 0)
        this.setOtherVisible(v)
    }

    public setAlpha(alpha: number): void {
        this._spineNode.setAlpha(alpha)
        if (this._spineNodeList) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                this._spineNodeList[i].setAlpha(alpha)
            }
        }
    }

    public fadeOut(v: number): void {
        this._spineNode.fadeOut(v)
    }

    public fadeIn(v: number, alpha: number = 255): void {
        this._spineNode.fadeIn(v, alpha)
    }

    public fadeScale(scale: number): void {
        if (!this.node || !this.node.isValid)
            return
        scale = this.node.getScale().x < 0 ? -scale : scale
        tween().target(this._spineNode).to(0.3, { tweenScaleX: scale }).start();
    }

    /**需要被销毁 */
    get isNeedDispose(): boolean {
        return true
    }

    protected onReadyToDispose(): void {
        this.readyToDispose = true;
    }

    protected addEvent(command: string, caller: Object | null = null, method: Function | null = null, args: any[] | null = null): void {
        this.unitData.battleLogic.regEvent(command, this.unitData.uid, new Handler(caller, method, args, false))
    }

    protected removeEvent(): void {
        this.unitData.battleLogic.removeEvent(this.unitData.uid)
    }

    /***是否存在有效模型 */
    public isAcive(): boolean {
        if (!this._spineNodeList) {
            return false;
        }

        for (let i = 0; i < this._spineNodeList.length; i++) {
            if (!this._spineNodeList[i].isValid)
                return false
        }
        return true
    }

    /**销毁 */
    dispose() {
        if (this.isDisposed)
            return;

        this.removeEvent();
        this.unitData.battleLogic.command.remove(this.uid)

        if (this.isNeedDispose) {
            for (let i = 0; i < this._spineNodeList.length; i++) {
                if (this._spineNodeList[i].isValid)
                    this._spineNodeList[i].delayDestroy(0)
            }
            this.isDisposed = true;
        }
    }
}