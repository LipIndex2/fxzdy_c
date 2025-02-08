/**@format */
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { ItemFrame } from "db://assets/scripts/game/modules/common/item/ItemFrame";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ModelNode } from "../../common/node/ModelNode";

@bindFguiExtension("ui://pet/CharacterComp")
export class PetHubCharacter extends fgui.GComponent {
    private _modelId: number | undefined; // 当前加载的模型ID
    private isMoving: boolean; // 小人是否正在移动
    private posY: number; // 小人的Y坐标
    private targetX: number; // 小人移动的目标X坐标

    static pkgName: string = "pet";
    static viewName: string = "CharacterComp";

    private get view(): ui.pet.com.CharacterComp {
        return this as any;
    }

    private get _modelNode(): ModelNode {
        return this.view.modelNode as any;
    }

    private get _itemBox(): ItemFrame {
        return this.view.itemBox as any;
    }

    protected onInit() {
        this.posY = 240;
    }

    static create(): PetHubCharacter {
        let character = fgui.UIPackage.createObject(this.pkgName, this.viewName) as PetHubCharacter;
        character.view.visible = true;
        return character;
    }

    /**
     * 设置物品框的内容
     * @param data 奖励物品数据
     */
    public setItem(data: NoOwnerItem): void {
        this._itemBox.visible = true;
        this._itemBox.resetByNoOwnerItem(data);
    }

    public setItemVisible(visible: boolean): void {
        this._itemBox.visible = visible;
    }

    /**
     * 播放小人的动作动画
     */
    public playAction(action: string, heroId?: number): void {
        const id = heroId ? heroId : 14010; // 默认雷诺
        if (this._modelId !== id) {
            this._modelId = id;

            this._modelNode.loadByModelId(id);
            this._modelNode.setScale(-1.5, 1.5);
            this._modelNode.playOrders([
                {
                    name: action || "idle",
                    isLoop: true,
                },
            ]);
        }
        this.view.x = 0;
        this.view.y = this.posY;
    }

    /**
     * 播放小人移出画面的动画
     */
    public playExitAnimation(targetX: number, targetY: number, frame: number, onComplete: () => void): void {
        const startX = this.targetX;
        const startY = this.posY;

        this.view.x = startX;
        this.view.y = startY;
        // console.error("开始位置:" + this.view.x, this.view.y);
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        let allFrames = 0;
        this._modelNode.setScale(1.5, 1.5);
        let speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / frame;
        let key = GameTimer.ins().frameLoop(1, this, () => {
            allFrames = allFrames + 1; //累计
            if (allFrames < frame) {
                this.view.x = startX - speed * allFrames;
                this.view.y = startY - speed * allFrames;
            } else {
                // console.error("结束位置:" + this.view.x, this.view.y);
                // 动画完成，隐藏小人
                this.view.visible = false;
                GameTimer.ins().clearByKey(key);
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    /**
     * 小人移动到指定位置
     * @param targetX 目标X坐标
     * @param frames 执行帧数
     * @param onNext 到达指定位置时触发的回调
     * @param onComplete 动画完成时触发的回调
     */
    public moveTo(targetX: number, frames: number, onNext: () => void, onComplete: () => void): void {
        const startX = 0;
        this.targetX = targetX;
        this.isMoving = true;
        let nextTriggered = false;
        let deltaX = targetX - startX;
        let passFrames = 0;
        let key = GameTimer.ins().frameLoop(1, this, () => {
            if (!this.isMoving) {
                return;
            }
            passFrames++;
            const progress = Math.min(passFrames / frames, 1);

            const effectiveProgress = Math.min(progress, 1);
            this.view.y = this.posY;
            this.view.x = startX + deltaX * effectiveProgress;

            // 触发一次 onNext
            if (!nextTriggered && this.view.x >= 110) {
                nextTriggered = true;
                if (onNext) {
                    onNext();
                }
            }

            if (progress >= 1) {
                this.isMoving = false;
                if (onComplete) {
                    onComplete();
                }
                GameTimer.ins().clearByKey(key);
            }
        });
    }

    public reset(): void {
        this.stopAnimation(); // 停止动画
        this.view.x = 0;
        this.view.y = this.posY;
        this.view.visible = false;
        this._itemBox.visible = false;
        this._modelId = undefined;
        // GameTimer.ins().clearAll(this);
    }

    public stopAnimation(): void {
        this.isMoving = false;
    }
}
