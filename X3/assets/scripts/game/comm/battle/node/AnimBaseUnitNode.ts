import { Color, color, isValid, math, Node, sp, UITransform } from "cc";
import { BaseUnitNode } from "./BaseUnitNode";
import { ResRef } from "../../../../core/res/ResRef";
import { Logger } from "../../../../core/log/Logger";
import { Res } from "../../../../core/res/Res";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TableManager } from "../../../../core/table/TableManager";
import { TimeManager } from "../../../../core/time/TimeManager";
import { AudioManager } from "../../mgr/AudioManager";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { Tween } from "cc";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { Asset } from "cc";
import { UIRenderer } from "cc";

export abstract class AnimBaseUnitNode extends BaseUnitNode {
    TAG: string = "AnimBaseUnitNode";

    public static TimeScale: number = 1

    protected _loading: boolean;
    protected _currentUrl: string;
    protected _ref: ResRef;
    protected _anim: UIRenderer;
    protected _animNode: Node;
    protected _aniNames: string[];
    protected _currentPlayName: string = null;
    protected _loop: boolean;
    // 完成动画回调
    protected _completeCallback: (aniName: string, spineNode?: AnimBaseUnitNode) => void;
    // 加载完成 callback
    protected _loadCompleteListener: (spineNode: AnimBaseUnitNode) => void;

    public cfg: table.model.ModelConfig;

    /***移动的频率 */
    public runTimeScale: number = 1;
    public modelHeight: number = 100;
    public modelWidth: number = 100;

    /**记录状态等待spine创建后执行 */
    /**缩放 */
    protected _modelScale: number = 1;
    /***播放频率 */
    protected _timeScale: number = 1
    /**颜色 */
    protected _color: Color;
    /**是否需要渐显 */
    public fadeInTime: number;

    public isFrame: boolean;

    /***扩展参数 */
    public exData: any;

    constructor () {
        super();
        this._animNode = new Node();
        this.addChild(this._animNode);
    }

    get isLoop(): boolean {
        return this._loop
    }

    /**通过表加载 @see table.model.ModelConfig.id */
    loadByModelId(modelId: number, isLoop: boolean = true) {
        let cfg = TableManager.getDataById(table.model.ModelConfig, modelId);
        if (!cfg) return false;
        this._currentPlayName = null;
        this.cfg = cfg;
        if (cfg.pos) this._animNode.setPosition(cfg.pos.x, cfg.pos.y);
        if (cfg.scale) this.modelScale = cfg.scale.scaleX;
        if (cfg.action) this.play(cfg.action, isLoop);
        if (cfg.runTimeScale)
            this.runTimeScale = cfg.runTimeScale / 10000;

        this.modelHeight = this.cfg?.height || 100
        this.modelWidth = this.cfg?.width || 100;

        this._loadCfg();
        return true;
    }

    /**子类重写处理 */
    protected _loadCfg() {
        this.load(this.cfg.modelPath);
    }

    public load(url: string) {
        /**项目则不处理 */
        const isLoad = this._loading || this.isLoaded;
        if (this._currentUrl === url && isLoad) {
            return;
        }
        this._loading = true;
        this._currentUrl = url;

        this.onLoad(url);
    }

    protected abstract onLoad(url: string);

    protected abstract onLoaded(assets: Asset);

    protected onLoadedCompleted() {
        if (this._color) {
            this._anim.color = this._color;
            this._color = null;
        }
        if (this.fadeInTime) {
            this.fadeIn(this.fadeInTime);
            this.fadeInTime = null;
        }

        if (this._currentPlayName) {
            this.play(this._currentPlayName, this._loop);
        } else {
            this.play("idle", true);
        }
        this.emit("onLoaded");
        if (this._loadCompleteListener) {
            this._loadCompleteListener(this);
        }
    }

    /**动画播放完成 */
    protected abstract _onAnimComplete(track: sp.spine.TrackEntry): void;

    /**
     * 总完成回调 | 所有动画完成
     * @param listener
     */
    public setCompleteListener(listener: (aniName: string, spineNode?: AnimBaseUnitNode) => void) {
        this._completeCallback = listener;
    }

    /**
     * 加载完成
     * @param listener 
     */
    public setLoadCompleteListener(listener: () => void) {
        this._loadCompleteListener = listener;
    }


    public setColor(c: Color) {
        if (this._anim) {
            this._anim.color = c;
        } else {
            this._color = c;
        }
    }

    public get modelScale(): number {
        return this._modelScale;
    }
    public set modelScale(value: number) {
        this._modelScale = value;
        this._animNode.setScale(value, Math.abs(value))
    }

    public setDirction(dir: number) {
        let absScaleX = Math.abs(this.getScale().x)
        this.setScale(dir >= 0 ? absScaleX : - absScaleX, absScaleX);
    }

    public get node(): Node {
        return this._animNode;
    }

    setNodeName(name: string) {
        this.node.name = name;
    }


    /**
     * 获取是否加载完毕
     */
    get isLoaded(): boolean {
        return !!this._anim;
    }

    /**
     * 当前播放的动画名
     */
    public curAnimationName() {
        return this._currentPlayName;
    }

    /**
    * 获取所有的动画
    */
    public getAllAnimationNames(): Array<string> {
        return this._aniNames;
    }

    /**获取是否有这个动作 */
    public checkHasAnimation(aniName: string): boolean {
        let ret = this._aniNames && this._aniNames.indexOf(aniName) != -1;
        if (!ret) {
            Logger.game("no anim:" + aniName + " model-> " + (this.cfg ? this.cfg.id : this._currentUrl));
        }
        return ret;
    }

    /***重新播放 */
    public replay(loop = false): void {
        this.play(this._currentPlayName, loop)
    }

    public set timeScale(timeScale: number) {
        this._timeScale = timeScale;
    }

    /**
     * 播放动画
     * @param name 动画名字
     * @param loop 是否循环播放
     */
    public play(animName: string, loop = false, timeScale?: number) {
        //if (!!this._currentPlayName && this._currentPlayName !== animName) {
        //this.emit(Event.STOPPED);
        //}
        if (animName == null)
            animName = this._currentPlayName;
        if (this.isLoaded && this.checkHasAnimation(animName)) {
            // if (!this._anim.isAnimationCached())
            //     this._anim.clearTracks();
            if (!this.isLoaded) {
                return;
            }

            if (NodeUtils.isNotValidNode(this.node)) {
                return;
            }

            this._play(animName, loop, timeScale);
        }

        this._currentPlayName = animName;
        this._loop = loop;
    }

    protected abstract _play(animName: string, loop: boolean, timeScale?: number): void;

    /**
     * 播放动画
     * @param nameOrIdx 动画名字
     * @param loop 是否循环播放
     */
    public setNextPlay(animName: string, loop = false, delay: number = 0) {
        if (this.isLoaded && this.checkHasAnimation(animName)) {
            // this._anim.addAnimation(0, animName, loop, delay);
            this._setNextPlay(animName, loop, delay);
        }
    }

    protected abstract _setNextPlay(animName: string, loop: boolean, delay: number): void;

    /**
     * 暂停播放动画。
     * 恢复需要调用resume，从当前pause的帧开始播放
     */
    public abstract pause();

    /**继续播放 */
    public abstract resume();

    public abstract isPasue();

    /**获取透明度 */
    public getAlpha() {
        return (this._anim && this._anim.color.a) || 0;
    }

    /**设置透明度 */
    public setAlpha(alpha: number) {
        if (!this.isLoaded) {
            this.setColor(math.color(255, 255, 255, alpha));
            return;
        }

        this._anim.color = ColorUtils.setAlpha(this._anim, alpha);
    }

    /**渐现 */
    public fadeIn(time: number = 1000, alpha: number = 255) {
        if (!this._anim) {
            this.fadeInTime = time;
            return;
        }
        let color = math.color(this._anim.color);
        color.a = 0;
        this._anim.color = color;
        let step = (alpha - color.a) / time;
        if (step <= 0) return;

        let key = GameTimer.ins().frameLoop(1, this, () => {
            let a = color.a + step * TimeManager.frameDeltaMs;
            color.a = a > alpha ? alpha : a;
            this._anim.color = color;
            if (color.a >= alpha) {
                GameTimer.ins().clearByKey(key);
            }
        });
    }

    /**渐隐 */
    public fadeOut(time: number = 1000) {
        if (!this._anim) return;

        let color = math.color(this._anim.color);
        let step = (color.a - 0) / time;
        if (step <= 0) return;

        let key = GameTimer.ins().frameLoop(1, this, () => {
            let a = color.a - step * TimeManager.frameDeltaMs;
            color.a = a < 0 ? 0 : a;
            this._anim.color = color;

            if (color.a <= 0) {
                GameTimer.ins().clearByKey(key);
            }
        });
    }

    /***改变颜色保持N毫秒 */
    public colorDelay(delay: number = 100, r: number = 255, g: number = 100, b: number = 100): void {
        if (this._anim && this._anim.isValid) {
            this._anim.color = color(r, g, b);
            GameTimer.ins().once(delay, this, () => {
                if (this._anim)
                    this._anim.color = color(255, 255, 255);
            });
        }
    }

    /***颜色闪烁 */
    public colorYoYo(r: number = 255, g: number = 160, b: number = 160): void {
        let dir = 0;
        GameTimer.ins().frameLoop(1, this, () => {
            if (!dir) {
                r -= 3;
            } else {
                r += 3;
            }

            if (r >= 255) {
                dir = 0;
            } else if (r <= 180) {
                dir = 1;
            }
            if (this._anim)
                this._anim.color = color(r, g, b);
        });
    }

    /**清理状态 */
    public clean() {
        GameTimer.ins().clearAll(this);
        Tween.stopAllByTarget(this);
        this._currentPlayName = null;
        this._loop = false;
        // if (this.isLoaded) {
        //     this._anim.clearTracks();
        //     this._anim.clearAnimations();
        // }
    }

    /**1秒后自动销毁 */
    public delayDestroy(delay: number = 1000) {
        if (this.isValid) {
            if (delay == 0) {
                if (this.isValid) {
                    this.destroy();
                }
            }
            else {
                this.fadeOut(delay);
                GameTimer.ins().once(delay, this, () => {
                    if (this.isValid) {
                        this.destroy();
                    }
                });
            }
        }
    }

    /**销毁前 */
    protected _onPreDestroy() {
        GameTimer.ins().clearAll(this);
        Tween.stopAllByTarget(this);

        this._completeCallback = null;
        this._loadCompleteListener = null;

        if (this.isLoaded) {
            this._anim.destroy();
        }

        if (this._ref) {
            this._ref.dispose();
            this._ref = null;
        }
        return super._onPreDestroy();
    }

    /***用于缓动的缩放 */
    public set tweenScaleX(v: number) {
        this.setScale(v, this.getScale().y);
    }

    public get tweenScaleX() {
        return this.getScale().x
    }

    // public destroy(): boolean {
    //     if (this._anim) {
    //         this._completeCallback = null;
    //         this._loadCompleteListener = null;
    //         this._anim["removeAllAddListener"] && this._anim["removeAllAddListener"]()
    //         this._anim.destroy()
    //     }
    //     return super.destroy()
    // }
}