import { SpriteAtlas } from "cc";
import { _decorator, Sprite } from "cc";
import FrameAnimNamesManager from "../FrameAnimNamesManager";
import { GameTimer } from "../../timer/GameTimer";
import { MathUtils } from "../../utils/MathUtils";
import { SpriteFrame } from "cc";
import { Logger } from "db://assets/scripts/core/log/Logger";

const { ccclass } = _decorator;
@ccclass('FrameAnim')
export class FrameAnim extends Sprite {
    /**
     * 每帧动画的时间间隔，单位为毫秒。
     * @private
     */
    private _perFrameTime = 66.6;

    private _curIndex = 0;

    private _curAnimName: string;

    /**
     * 动画名称映射，键为动画标识符，值为对应的动画名称数组。
     * 用于存储和管理组件中使用的动画名称。
     */
    private _animNames: { [key: string]: string[] };

    private _paused = true;

    private _isCompleted = false;

    private _loop = false;

    private _loopTimerKey: string;

    private _compeletListener: () => void;


    constructor() {
        super();
    }


    public setCompleteListener(listener: () => void) {
        this._compeletListener = listener;
    }

    /**初始化图集 */
    initAtlas(atlas: SpriteAtlas) {
        this.spriteAtlas = atlas;
        this.trim = false;
        this.sizeMode = Sprite.SizeMode.RAW;
        this._animNames = FrameAnimNamesManager.ins().getAnimMap(atlas);
    }

    /**
     * 设置动画播放
     * @param startIndex 动画开始播放的帧索引 33.3ms
     * @param animName 要播放的动画名称
     * @param loop 是否循环播放动画，默认为 false
     */
    setAnimation(startIndex: number, animName: string, loop: boolean = false) {
        let frameLen = this._animNames[animName]?.length;
        if (!frameLen) return;

        if (startIndex != 0) {
            startIndex = MathUtils.clamp(0, Math.ceil(startIndex * 33.3 / this._perFrameTime), frameLen - 1);
        }

        this._curIndex = startIndex;
        this._curAnimName = animName;
        this._isCompleted = false;
        this._loop = loop && frameLen > 1;
        this.paused = false;
        this._play(this._animNames[animName][startIndex]);
    }

    get modelRect() {
        let atlas = this.spriteAtlas;
        if (!atlas) return null;

        if (this._animNames) {
            let frame: SpriteFrame = this._animNames["idle"] ? atlas.getSpriteFrame(this._animNames["idle"][0]) : atlas.spriteFrames[0];
            if (!frame) {
                return null;
            }

            let rect = frame.rect;
            let offset = frame.offset
            return { x: offset.x, y: offset.y, width: rect.width, height: rect.height, originWeight: frame.originalSize.width, originHeight: frame.originalSize.height };
        }
    }

    get curAnimName() {
        return this._curAnimName;
    }

    get paused() {
        return this._paused;
    }

    /**播放动画 或 继续*/
    set paused(p: boolean) {
        if (!this.spriteAtlas || !this.isValid) return;
        // if (this._paused === paused) return;

        this._paused = p;
        if (p) {
            this._clearLoopTimer();
        } else if (!this._isCompleted) {
            this._startLoopTimer();
        }
    }

    private onUpdateFrame() {
        if (!this._curAnimName) return;

        this._curIndex++;
        if (this._curIndex >= this._animNames[this._curAnimName].length) {
            this._curIndex = 0;
            if (!this._loop) {
                this.paused = true;
                this._isCompleted = true;
                this._compeletListener?.();
                return;
            }
        }
        this._play(this._animNames[this._curAnimName][this._curIndex]);
    }

    /**
     * 播放指定关键帧动画。
     * @param key - 动画的关键帧名称。
     */
    private _play(key: string) {
        const sa = this.spriteAtlas;
        if (sa == null) {
            this._clearLoopTimer();
            Logger.debug(`[FrameAnim] 没有图集, 但是想尝试加载图集里面的图片 key = ${key}`)
            return;
        }
        const newSpFrame = sa.getSpriteFrame(key);
        if (!newSpFrame) {
            this._clearLoopTimer();
            Logger.debug(`[FrameAnim] 找不到帧动画资源 key = ${key}`)
            return;
        }
        this.spriteFrame = newSpFrame;
    }

    /**
     * 清除动画，暂停当前播放并重置索引到起始位置。
     * 这个方法用于停止所有正在进行的动画，并将动画播放状态重置为初始状态。
     */
    clearAnimations() {
        this.paused = true;
        this._curIndex = 0;
    }

    /**
     * 获取动画名称列表。
     * @returns {string[]} 返回一个包含所有动画名称的字符串数组。
     */
    getAnimNames() {
        return Object.keys(this._animNames);
    }


    private _clearLoopTimer() {
        if (this._loopTimerKey) {
            GameTimer.ins().clearByKey(this._loopTimerKey);
            this._loopTimerKey = null;
        }
    }

    private _startLoopTimer() {
        if (!this._loopTimerKey && this.isValid) {
            this._loopTimerKey = GameTimer.ins().loop(this._perFrameTime, this, this.onUpdateFrame);
        }
    }


    onEnable(): void {
        super.onEnable();
        this.paused = false;
    }

    onDisable(): void {
        super.onDisable();
        this._clearLoopTimer();
    }

    onDestroy(): void {
        super.onDestroy();
        GameTimer.ins().clearAll(this);
    }

}