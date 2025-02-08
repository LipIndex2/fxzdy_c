import { sp, Node, Vec2 } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { SpineUnitNode } from "./SpineUnitNode";
import * as fgui from "fairygui-cc";
import { Vec3 } from "cc";

export class ActorUnitNode extends SpineUnitNode {
    TAG: string = "ActorUnitNode";

    private _isOpenStepPlay: boolean = false;

    /***头顶对话 */
    protected talkComp: ui.commBattle.battleComp.BattleTalkComp;

    public showTalkComp(str: string, parentNode: Node, hideDelay: number = 2000): void {
        if (!this.talkComp)
            this.talkComp = fgui.UIPackage.createObject("commBattle", "BattleTalkComp") as ui.commBattle.battleComp.BattleTalkComp;
        // this.node.addChild(this.talkComp.node)
        parentNode.addChild(this.talkComp.node)
        // this.talkComp.node.setPosition(0, this.modelHeight);
        this.talkComp.node.setPosition(this.position.x, this.position.y + this.modelHeight);
        this.talkComp.label.text = str;
        this.refreshTalkComp()
        GameTimer.ins().frameOnce(2, this, () => {
            if (this.talkComp.node.isValid) {
                this.refreshTalkComp()
            }
        });

        GameTimer.ins().once(hideDelay, this, () => {
            if (this.talkComp.node.isValid) {
                this.talkComp.node.removeFromParent();
            }
        });
        // this.talkComp.setScale(this.getScale().x, 1);
    }

    protected refreshTalkComp(): void {
        this.talkComp.label.autoSize = fgui.AutoSizeType.Both;
        if (this.talkComp.label.textWidth >= this.talkComp.label.maxWidth) {
            this.talkComp.label.autoSize = fgui.AutoSizeType.Height;
            this.talkComp.label.width = this.talkComp.label.maxWidth;
        }
    }

    public setPosition(position: Vec3 | number, y?: number, z?: number): void {
        if (typeof position === 'number') {
            super.setPosition(position, y, z);
        } else {
            super.setPosition(position.x, position.y, position.z);
        }
        if (this.talkComp)
            this.talkComp.node.setPosition(this.position.x, this.position.y + this.modelHeight);
    }

    public setDirction(dir: number) {
        super.setDirction(dir)
        // if (this.talkComp)
        //     this.talkComp.setScale(this.getScale().x, 1);
    }

    /***是否开启逐帧播放，需要手动调用step() */
    public get isOpenStepPlay(): boolean {
        return this._isOpenStepPlay;
    }

    /***是否开启逐帧播放，需要手动调用step() */
    public set isOpenStepPlay(value: boolean) {
        this._isOpenStepPlay = value;
        if (value)
            this.pause()
    }

    public findBone(boneName: string) {
        return this.spine && this.spine.findBone(boneName);
    }

    public findSlot(boneName: string) {
        return this.spine && this.spine.findSlot(boneName);
    }

    private socketMap: { [name: string]: sp.SpineSocket } = {};
    public addScoket(bindBoneName: string, node: Node): void {
        if (!this.spine)
            return
        var socket = this.socketMap[bindBoneName]
        if (!socket) {
            socket = this.socketMap[bindBoneName] = new sp.SpineSocket(bindBoneName); // 第一个参数传入的是挂点的目标骨骼。第二个参数传入的是挂点的节点
            this.spine!.sockets.push(socket);
        }
        socket.target = node;
        this.addChild(node)
        this.spine!.sockets = this.spine!.sockets;
    }

    public removeSocket(bindBoneName: string): void {
        let node = this.socketMap[bindBoneName].target
        node.destroy();
    }


    /***找骨骼坐标的辅助节点 */
    private bonePointMap: { [name: string]: Node } = {};
    /**获取某个节点的世界坐标 */
    public getBonePoint(name: string) {
        let node = this.bonePointMap[name]
        if (!node) {
            node = new Node(name)
            this.bonePointMap[name] = node
            var socket = new sp.SpineSocket("root/" + name, node);
            this.spine!.sockets.push(socket);
            this.spine!.sockets = this.spine!.sockets;
        }

        let offsetX = node.position.x;
        let offsetY = node.position.y;

        offsetX = ((offsetX * this._animNode.scale.x + this._animNode.position.x) * this.scale.x) + this.position.x;
        offsetY = ((offsetY * this._animNode.scale.y + this._animNode.position.y) * this.scale.y) + this.position.y;
        return { x: offsetX, y: offsetY };
    }

    /**逐帧播放 */
    public step() {
        if (this.isLoaded && this.isOpenStepPlay) {
            this.resume();
            this.spine.updateAnimation(0.016666)
            this.pause();
        }
    }

    private rotationAmiNameMap: { [name: string]: number } = {}
    public setBoneRotation(boneName: string, angle: number): void {
        let bone = this.findBone(boneName);
        if (bone) {
            this.rotationAmiNameMap[boneName] = bone.data.rotation;
            bone.data.rotation = angle
        }
    }

    public clearBoneRotation(): void {
        for (let name in this.rotationAmiNameMap) {
            let bone = this.findBone(name);
            if (bone)
                bone.data.rotation = this.rotationAmiNameMap[name]
        }
    }


    /**动画播放完成 */
    _onAnimComplete(track: sp.spine.TrackEntry) {
        this.clearBoneRotation();
        super._onAnimComplete(track)
    }

    private depthMap: { [type: number]: number } = {}
    /***
     * 添加深度排序的信息
     * type : 最高层
     *  */
    public setDepthExData(type: number, value: number): void {
        this.depthMap[type] = value;
    }

    public removeDepthExData(type: number): void {
        delete this.depthMap[type]
    }

    /**深度排序扩展 */
    public get sortDepthEx(): number {
        if (this.depthMap[1])
            return this.depthMap[1]
        return 0;
    }

    /**深度排序 */
    public get sortDepth(): number {
        return this.position.y
    }


    protected _onPreDestroy() {
        if (this.talkComp)
            this.talkComp.dispose();

        for (let name in this.socketMap) {
            let node = this.socketMap[name].target
            node.destroy();
        }
        this.socketMap = null;

        return super._onPreDestroy();
    }
}