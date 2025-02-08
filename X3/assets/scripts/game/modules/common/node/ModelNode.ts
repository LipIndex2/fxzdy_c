import * as fgui from "fairygui-cc";
import { SpineUnitNode } from "../../../comm/battle/node/SpineUnitNode";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { sp } from "cc";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { NumberFormat } from "../../../../core/utils/NumberFormatter";
import { TableManager } from "../../../../core/table/TableManager";
import { AnimBaseUnitNode } from "../../../comm/battle/node/AnimBaseUnitNode";
import { SpriteFrameUnitNode } from "../../../comm/battle/node/SpriteFrameUnitNode";

/**
 * 动画命令
 */
export interface IAnimOrder {
    /**动作名字 */
    name: string,
    /**倍速 （默认1倍）*/
    speed?: number,
    /**是否循环 （仅支持最后一个动作，默认不循环） */
    isLoop?: boolean,
    // 单个动画的完成回调
    callbackForComplete?: (it: sp.Skeleton) => void;
}

/** 模型节点 支持队列播放*/
export class ModelNode extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "ModelNode";
    // 当前执行的动画命令
    private _curAnimOrder: IAnimOrder;


    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName);
    }

    private _modleId: number;
    public get modleId(): number {
        return this._modleId;
    }
    public set modleId(value: number) {
        this._modleId = value;
    }
    protected _modelPath: string;
    protected _animNode: AnimBaseUnitNode;
    protected _orders: IAnimOrder[];

    private _compeletListener: (modelId: number) => void;
    private _loadCompeletListener: () => void;
    private _eventListener: (evnetName: string) => void;


    public setCompleteListener(listener: (modelId: number) => void) {
        this._compeletListener = listener;
    }

    public setLoadCompleteListener(listener: () => void) {
        this._loadCompeletListener = listener;
    }

    public setEventListener(listener: (evnetName: string) => void) {
        this._eventListener = listener
    }

    private initSpine() {
        if (this._animNode && !(this._animNode instanceof SpineUnitNode)) {
            this._animNode.destroy();
            this._animNode = null;
        }

        if (!this._animNode) {
            let animNode: SpineUnitNode = PoolManager.getItem(SpineUnitNode);
            animNode.setCacheMode(sp.AnimationCacheMode.REALTIME);
            animNode.setCompleteListener(this.onAnimComplete.bind(this));
            animNode.setLoadCompleteListener(this.onLoadComplete.bind(this));
            animNode.setEventListener(this.onEventTrigger.bind(this));
            this.node.addChild(animNode);
            this._animNode = animNode;
        }
        if (this._animNode) {
            this._animNode.timeScale = this._timeScale;
        }
    }

    private initSpriteFrame() {
        if (this._animNode && !(this._animNode instanceof SpriteFrameUnitNode)) {
            this._animNode.destroy();
            this._animNode = null;
        }

        if (!this._animNode) {
            let animNode: SpriteFrameUnitNode = PoolManager.getItem(SpriteFrameUnitNode);
            animNode.setCompleteListener(this.onAnimComplete.bind(this));
            animNode.setLoadCompleteListener(this.onLoadComplete.bind(this));
            this.node.addChild(animNode);
            this._animNode = animNode;
        }
        if (this._animNode) {
            this._animNode.timeScale = this._timeScale;
        }
    }


    loadByModelId(modelId: number, isLoop = true) {
        let cfg = TableManager.getDataById(table.model.ModelConfig, modelId);
        if (cfg.spriteFrame) {
            this.initSpriteFrame();
        } else {
            this.initSpine();
        }

        if (this._modleId != modelId) {
            this._animNode.clean();
            this._animNode.loadByModelId(modelId, isLoop);
            let modelCfg = TableManager.getDataById(table.model.ModelConfig, modelId);
            if (modelCfg?.showScale) {
                this._animNode.modelScale = modelCfg.showScale.scaleX;
            }
        }
        this._modleId = modelId;
    }

    clearOrders() {
        this._curAnimOrder = null;
        this._orders = []
    }

    loadByPath(modelPath: string) {
        this.initSpine();

        if (this._modelPath != modelPath) {
            this._animNode.clean();
            this._animNode.load(modelPath);
        }
        this._modelPath = modelPath;
    }

    /**获取动画节点 */
    public get animNode(): AnimBaseUnitNode {
        return this._animNode;
    }

    /**
     * 获取Spine节点,试用前请先判断是否为空。
     * @returns {SpineUnitNode | null} 当前的 Spine 单元节点或 null。
     */
    public get spineNode(): SpineUnitNode {
        if (this._animNode && this._animNode instanceof SpineUnitNode) {
            return this._animNode;
        }
        return null;
    }

    /***播放频率 */
    protected _timeScale: number = 1
    public set timeScale(timeScale: number) {
        this._timeScale = timeScale;
        if (this._animNode) {
            this._animNode.timeScale = this._timeScale;
        }
    }

    /***加载完毕 */
    private onLoadComplete(): void {
        if (this._loadCompeletListener)
            this._loadCompeletListener()
    }

    /***事件 */
    private onEventTrigger(eventName: string): void {
        if (this._eventListener) {
            this._eventListener(eventName);
        }
    }

    /**
     * 当一个动画序列完成后
     * @private
     */
    private onAnimComplete() {
        const curAnimOrder = this._curAnimOrder;
        if (curAnimOrder) {
            // 完成回调
            const callbackForComplete = curAnimOrder.callbackForComplete;
            const spine = this.spineNode.spine;

            if (spine && callbackForComplete) {
                callbackForComplete(spine)
            }
        }
        this.playNext();
    }

    private playNext() {
        // 没有动画了
        if (!this._orders?.length) {
            if (this._compeletListener) {
                this._compeletListener(this._modleId);
            }
            return;
        }
        let order = this._orders.pop();
        this._curAnimOrder = order;

        this._animNode.play(order.name, order.isLoop || false, order.speed || 1);
    }

    /**播放动画队列 */
    playOrders(orders: IAnimOrder[]) {
        this.visible = true;
        if (!this._animNode) {
            console.warn("未设置模型Id");
            return;
        }
        GameTimer.ins().clearAll(this);

        this._animNode.clean();

        this._orders = orders.reverse();
        this.playNext();
    }

    /***停止在某帧 */
    public gotoAndStop(frame: number): void {
        if (this._animNode.isLoaded && this._animNode.isValid) {
            this.spineNode?.gotoAndStop(frame);
            // this._animNode.gotoAndStop(frame)
        }

    }

    public stop(): void {
        if (this._animNode.isLoaded && this._animNode.isValid)
            this._animNode.pause();
    }

    public resume(): void {
        if (this._animNode.isLoaded && this._animNode.isValid)
            this._animNode.resume()
    }

    /**
     * 播放动画
     * @param name 动画名字
     * @param isLoop 是否循环播放
     * @param speed 播放速度
     * @param delay 是否延迟播放ms
     */
    play(name: string, isLoop = false, speed?: number, delay?: number) {
        if (!this._animNode) {
            console.warn("未设置模型Id");
            return;
        }

        GameTimer.ins().clearAll(this);
        if (delay) {
            GameTimer.ins().once(delay, this, () => {
                this._animNode.play(name, isLoop, speed);
            });
        } else {
            this._animNode.play(name, isLoop, speed);
        }
    }

    /**
     * 间歇循环播放
     * @param name 
     * @param intervalMs 
     * @param needHide 间歇时是否隐藏 (这里应该是让动作保留空帧， 目前只是为了兼容原来动画的临时处理)
     * @returns 
     */
    playIntervalLoop(name: string, intervalMs: number = 1000, needHide: boolean = false) {
        if (!this._animNode) {
            console.warn("未设置模型Id");
            return;
        }
        GameTimer.ins().clearAll(this);

        this._compeletListener = () => {
            if (needHide) this._animNode.active = false;
            GameTimer.ins().once(intervalMs, this, () => {
                if (needHide) this._animNode.active = true;
                this._animNode.play(name);
            });
        }
        if (needHide) this._animNode.active = true;
        this._animNode.play(name);
    }

    clear() {
        this._modleId = null;
        if (this._animNode) {
            this._animNode.destroy();
        }
        this._animNode = null;
        this.clearOrders();
        GameTimer.ins().clearAll(this);
    }

    onPreDispose() {
        this.clear();
        super.onPreDispose();
    }
}