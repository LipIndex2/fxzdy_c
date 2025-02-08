import { isValid, Node, sp, UITransform } from "cc";
import { ResRef } from "../../../../core/res/ResRef";
import { Logger } from "../../../../core/log/Logger";
import { Res } from "../../../../core/res/Res";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TableManager } from "../../../../core/table/TableManager";
import { AudioManager } from "../../mgr/AudioManager";
import { AnimBaseUnitNode } from "./AnimBaseUnitNode";
import { Asset } from "cc";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import G from "../../../../core/comm/G";

export class SpineUnitNode extends AnimBaseUnitNode {
    TAG: string = "SpineUnitNode";

    public static TimeScale: number = 1
    public static Fps: number = 30;

    private _cacheMode = sp.AnimationCacheMode.SHARED_CACHE;

    // spine事件 callback
    private _eventListener: (evnetName: string) => void;

    public premultipliedAlpha = true;

    /***当前状态的事件列表 */
    private eventList: sp.spine.EventData[]

    constructor() {
        super();
    }

    get spine(): sp.Skeleton {
        return this._anim as sp.Skeleton;
    }

    setCacheMode(mode: sp.AnimationCacheMode) {
        this._cacheMode = mode;
        if (this.spine)
            this.spine.setAnimationCacheMode(mode);
    }

    loadByModelId(modelId: number, isLoop: boolean = true) {
        let ret = super.loadByModelId(modelId, isLoop);
        if (!ret) return false;

        /**! cfg.noPremultipliedAlpha; //解决美术预乘输出的白边问题*/
        this.premultipliedAlpha = true;
        if (this.cfg.cache == 1) {
            this.setCacheMode(sp.AnimationCacheMode.REALTIME);
        }
        return true;
    }

    protected onLoad(url: string) {
        if (!url) {
            return;
        }
        Res.getResRef({ url: this._currentUrl, type: sp.SkeletonData, bundle: AssetBundleKeys.SPINE }, null, (ref: ResRef) => {
            //第2次加载可能因为COCOS那边直接抛出完成事件而没等骨骼解析，导致第1次播放动画是失效的
            //所以加上calllater解决
            if (this._currentUrl == url) {
                GameTimer.ins().callLater(this, () => {
                    if (!ref || !ref.content) {
                        // 加载错了要打日志
                        Logger.error(`Failed to load asset. assetPath = ${this._currentUrl}`);
                        return;
                    }

                    if (!isValid(this)) {
                        Logger.warn(this.TAG + " isDestroyed " + url);
                        ref.dispose();
                        return;
                    }

                    if (this._ref) {
                        this._ref.dispose();
                    }
                    this._ref = ref;
                    this._loading = false;

                    this.onLoaded(ref.content);
                })
            } else if (ref && ref.content) {
                //已经更换了纹理
                ref.dispose();
            }
        });
    }

    protected onLoaded(spineAsset: sp.SkeletonData) {
        let spine: sp.Skeleton = this.spine;
        if (!spine) {
            spine = this._anim = this._animNode.addComponent(sp.Skeleton);
        }

        //_spine.setAnimationCacheMode(this._cacheMode);
        spine.setAnimationCacheMode(sp.AnimationCacheMode.REALTIME);
        spine.premultipliedAlpha = this.premultipliedAlpha;
        spine.skeletonData = spineAsset;

        spine.setCompleteListener(this._onAnimComplete.bind(this));
        spine.setEventListener(this.onEventHandler.bind(this))
        spine.timeScale = this.getBugScale(this._timeScale || 1);
        spine.enableBatch = true;

        this.modelHeight = this.cfg?.height || this._animNode.getComponent(UITransform).height;
        this.modelWidth = this.cfg?.width || this._animNode.getComponent(UITransform).width;

        this._aniNames = [];
        if (!spine._skeleton?.data) {
            G.Logger.error(" _skeleton ======================= null " + this._currentUrl);
        }

        let anis = spine._skeleton?.data?.animations;
        for (let i in anis) {
            this._aniNames.push(anis[i].name);
        }

        this.onLoadedCompleted();
    }

    /**
     * spine触发事件
     * @param listener
     */
    public setEventListener(listener: () => void) {
        this._eventListener = listener;
    }


    /**动画播放完成 */
    protected _onAnimComplete(track: sp.spine.TrackEntry) {
        this.skipLoop = false;
        this.emit("onAnimComplete", track.animation.name);
        if (this._completeCallback) {
            this._completeCallback(track.animation.name, this);
        }
    }

    public set timeScale(timeScale: number) {
        this._timeScale = timeScale;
        if (this.spine) {
            this.spine.timeScale = this.getBugScale(timeScale)
        }
    }

    protected getBugScale(timeScale: number): number {
        timeScale *= SpineUnitNode.TimeScale;
        return Math.sqrt(timeScale)
        // if (this._cacheMode == sp.AnimationCacheMode.REALTIME)
        //     return Math.sqrt(timeScale)
        // return timeScale
    }


    protected _play(animName: string, loop = false, timeScale?: number) {
        //@ts-ignore
        let lastAni = this.spine.isAnimationCached() ? this.spine._animationName : this.spine.getCurrent(0)?.animation.name;
        if (lastAni === animName && loop && this._loop === loop && this.spine.paused != true) {
            return;
        }
        this.spine.paused = false;
        // this._frames = this._spine.findAnimation(aniName)?.timelines.length || 0;
        let trackEntry = this.spine.setAnimation(0, animName, loop);
        if (this.isBreakSound) {
            this.stopSound()
        }
        // if (!trackEntry)
        //     GameTimer.ins().frameOnce(5, this, this.play, [animName, loop, timeScale])
        let spineState = this.spine.getState()
        if (spineState) {
            //获取当前播放状态
            this.eventList = spineState.data?.skeletonData?.events;
        }
        this.spine.timeScale = this.getBugScale(timeScale || this._timeScale || 1);

        if (this.savePlayToSetEvent) {
            let event = this.getEventByName(this.savePlayToSetEvent)
            if (event && event.intValue) {
                this.gotoAndPlay(event.intValue)
            }
            this.savePlayToSetEvent = null;
        }
    }

    protected _setNextPlay(animName: string, loop: boolean, delay: number): void {
        this.spine.addAnimation(0, animName, loop, delay);
    }


    /**
     * 暂停播放动画。
     * 恢复需要调用resume，从当前pause的帧开始播放
     */
    public pause() {
        if (this.isLoaded) {
            this.spine.paused = true;
        }
    }

    /**继续播放 */
    public resume() {
        if (this.isLoaded) {
            this.spine.paused = false;
        }
    }

    /**是否已暂停 */
    public isPasue(): boolean {
        return this.spine?.paused;
    }

    /**清理状态 */
    public clean() {
        super.clean();
        if (this.isLoaded) {
            this.spine.clearTracks();
            this.spine.clearAnimations();
        }
    }

    private savePlayToSetEvent: string;
    /***
     * 根据事件名字获取当前的动作下的事件
     * isPlayToSet 是否假如不存在eventlist的时候，先激励play的时候再执行
     *  */
    public getEventByName(name: string, isPlayToSet: boolean = false): sp.spine.EventData {
        if (this.eventList) {
            for (let i = 0; i < this.eventList.length; i++) {
                if (this.eventList[i].name == name)
                    return this.eventList[i]
            }
        }
        else if (isPlayToSet) {
            this.savePlayToSetEvent = name;
        }
    }

    private stopSound(): void {
        for (let i = 0; i < this.soundUrls.length; i++)
            AudioManager.ins().stopSkillSound(this.soundUrls[i])
        this.soundUrls.length = 0;
    }

    /***是否切换动作打断音效 */
    private isBreakSound: Boolean = false;
    private soundUrls: string[] = []
    private onEventHandler(track: sp.spine.TrackEntry, event: sp.spine.Event): void {
        if (event.data.audioPath) {
            let url = event.data.audioPath
            let mp3Index = url.indexOf(".mp3")
            if (mp3Index != -1)
                url = url.substring(0, mp3Index)
            if (event.data.stringValue.indexOf("break") != -1) {
                this.isBreakSound = true;
                this.soundUrls.push(url)
                AudioManager.ins().playSkillSound(url, 1)
            }
            else {
                AudioManager.ins().playSound(url, 1)
            }
        }

        if (!this.skipLoop && event.data.name?.match(/loop$|loop\d+/)) {
            //循环时间
            this.gotoAndPlay(event.data.intValue)
            // let curanimationEnd = this.spine.getState().getCurrent(0).animationEnd
            // this.spine.getState().getCurrent(0).animationStart = trackTime;
        }

        if (!this.skipLoop && event.data.name?.match(/loopStop$|loopStop\d+/)) {
            //循环时间
            this.gotoAndStop(event.data.intValue)
            // let curanimationEnd = this.spine.getState().getCurrent(0).animationEnd
            // this.spine.getState().getCurrent(0).animationStart = trackTime;
        }

        this._eventListener && this._eventListener(event.data.name);
    }

    /***是否跳过循环 */
    public skipLoop: boolean = false;
    public gotoAndPlay(frame: number): void {
        if (!this.isLoaded)
            return
        let trackEntry = this.spine.getState().getCurrent(0);
        if (trackEntry) {
            let curanimationEnd = trackEntry.animation.duration;//动作总秒数
            let targetTime = frame / SpineUnitNode.Fps;
            let track = this.spine.getState().getCurrent(0)
            if (track) {
                track.animationStart = targetTime;
                track.animationEnd = curanimationEnd;
                track.trackTime = 0;
                this.resume();
            }
        }
        this.savePlayToSetEvent = null;
    }

    /***停止在某帧 */
    public gotoAndStop(frame: number): void {
        if (!this.isLoaded)
            return
        this.resume();
        let trackEntry = this.spine.getState().getCurrent(0);
        if (trackEntry) {
            let curanimationEnd = trackEntry.animation.duration;//动作总秒数
            let maxFrame = curanimationEnd * SpineUnitNode.Fps;
            if (frame >= (maxFrame - 1)) {
                frame = maxFrame - 1
            }
            let targetTime = frame / SpineUnitNode.Fps;
            let track = this.spine.getState().getCurrent(0)
            if (track) {
                track.animationStart = targetTime;
                track.animationEnd = targetTime;
                track.trackTime = 0;
            }
        }
    }

    /**销毁前 */
    protected _onPreDestroy() {
        if (this.isLoaded) {
            this.spine && this.spine["removeAllAddListener"] && this.spine["removeAllAddListener"]();
        }

        return super._onPreDestroy();
    }

    /** 销毁处理，请用_onPreDestroy */
    // public destroy(): boolean {
    //     return super.destroy()
    // }
}