import { Res } from "../../../../core/res/Res";
import { SpriteAtlas } from "cc";
import { Logger } from "../../../../core/log/Logger";
import { FrameAnim } from "../../../../core/cocos/component/FrameAnim";
import { AnimBaseUnitNode } from "./AnimBaseUnitNode";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";

export class SpriteFrameUnitNode extends AnimBaseUnitNode {
    TAG: string = "SpriteFrameUnitNode";

    constructor() {
        super();
    }

    get frameAnim(): FrameAnim {
        return this._anim as FrameAnim;
    }

    protected _loadCfg() {
        this.load(this.cfg.framePath);
    }

    protected onLoad(url: string) {
        Res.getResRef({ url: url, type: SpriteAtlas, bundle: AssetBundleKeys.SPRITE_FRAME }, null, (ref) => {
            if (this._currentUrl == url) {
                if (!ref || !ref.content) {
                    Logger.error(`Failed to load asset. assetPath = ${this._currentUrl}`);
                    return;
                }

                if (!this.isValid) {
                    Logger.warn(this.TAG + " isDestroyed " + url);
                    ref.dispose();
                    return;
                }

                if (this._ref) {
                    //清理旧资源
                    this._ref.dispose();
                }
                this._ref = ref;
                this._loading = false;

                this.onLoaded(ref.content);
            } else if (ref && ref.content) {
                //已经更换了纹理
                ref.dispose();
            }
        });
    }

    protected onLoaded(spriteAtlas: SpriteAtlas) {

        let frameAnim = this.frameAnim;
        if (!frameAnim) {
            frameAnim = this._anim = this._animNode.addComponent(FrameAnim);
            frameAnim.setCompleteListener(this._onAnimComplete.bind(this));
        }

        frameAnim.initAtlas(spriteAtlas);
        let rect = frameAnim.modelRect;
        if (rect) {
            this.modelWidth = rect.width * 0.8;
            this.modelHeight = rect.height + 20;

            if (this.cfg.frameAnchor) {
                this._animNode._uiProps.uiTransformComp.anchorX = this.cfg.frameAnchor.x;
                this._animNode._uiProps.uiTransformComp.anchorY = this.cfg.frameAnchor.y;
            } else {
                let ax = (rect.originWeight * 0.5 + rect.x) / rect.originWeight + 0.05;
                // let ay = ((rect.originHeight - rect.height) * 0.5 + rect.y) / rect.originHeight;
                // console.log(ax + " / " + ay + " => " + JSON.stringify(rect));
                this._animNode._uiProps.uiTransformComp.anchorX = ax;
                this._animNode._uiProps.uiTransformComp.anchorY = 0.2;
            }

        }

        this._aniNames = this.frameAnim.getAnimNames();

        this.onLoadedCompleted();
    }

    /**动画播放完成 */
    protected _onAnimComplete() {
        this._eventProcessor && this.emit("onAnimComplete", this._currentPlayName);
        if (this._completeCallback) {
            this._completeCallback(this._currentPlayName, this);
        }
    }

    protected _play(animName: string, loop = false, timeScale?: number) {
        if (this.frameAnim?.curAnimName === animName && loop && this._loop === loop && this.frameAnim?.paused != true) {
            return;
        }
        this.frameAnim.paused = false;
        // this._frames = this._spine.findAnimation(aniName)?.timelines.length || 0;
        this.frameAnim.setAnimation(0, animName, loop);

        //this.spine.timeScale = this.getBugScale(timeScale || this._timeScale || 1);
    }

    protected _setNextPlay(animName: string, loop: boolean, delay: number): void {
        //this.frameAnim.addAnimation(0, animName, loop, delay);
    }

    /**  
     * 暂停播放动画。
     * 恢复需要调用resume，从当前pause的帧开始播放
     */
    public pause() {
        if (this.isLoaded) {
            this.frameAnim.paused = true;
        }
    }

    /**继续播放 */
    public resume() {
        if (this.isLoaded) {
            this.frameAnim.paused = false;
        }
    }

    /**是否已暂停 */
    public isPasue(): boolean {
        return this.frameAnim?.paused;
    }

    /**清理状态 */
    public clean() {
        super.clean();
        if (this.isLoaded) {
            this.frameAnim.clearAnimations();
        }
    }
}

window["SpriteFrameUnitNode"] = SpriteFrameUnitNode;