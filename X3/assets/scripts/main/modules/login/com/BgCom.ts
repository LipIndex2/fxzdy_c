import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { Res } from "db://assets/scripts/core/res/Res";
import { Node } from "cc";
import { UILoginKey } from "../const/UILoginConfig";
import { ResRef } from "db://assets/scripts/core/res/ResRef";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { sp } from "cc";
import { AssetBundleKeys } from "db://assets/scripts/core/res/AssetBundleKeys";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { ResManager } from "db://assets/scripts/core/res/ResManager";


@bindFguiExtension("ui://login/BgCom")
export default class BgCom extends fgui.GComponent {

    private _bgSpineUrl: string = "login/spine/dengluye_beijing";
    private _heroSpineUrl: string = "login/spine/dengluye_juese";

    private _resKey = "LoginBgCom";

    public get view(): ui.login.com.BgCom {
        return (this as any);
    }

    protected onInit(): void {
        this.spine(this._bgSpineUrl, this.view.bgModelNode.node, "idle");
        this.spine(this._heroSpineUrl, this.view.heroModelNode.node, "idle", "appear");
    }


    protected spine(url: string, modelNode: Node, idea: string, appear: string = null) {
        Res.getResRef({ url: url, type: sp.SkeletonData }, this._resKey, (ref: ResRef) => {
            //第2次加载可能因为COCOS那边直接抛出完成事件而没等骨骼解析，导致第1次播放动画是失效的
            //所以加上calllater解决
            GameTimer.ins().callLater(this, () => {
                if (!ref || !ref.content) {
                    // 加载错了要打日志
                    Logger.error(`Failed to load asset. assetPath = ${url}`);
                    return;
                }

                if (!modelNode.isValid) {
                    ref.dispose();
                    return;
                }

                let spine: sp.Skeleton = modelNode.getComponent(sp.Skeleton);
                if (!spine) {
                    spine = modelNode.addComponent(sp.Skeleton);
                }
                // spine.setAnimationCacheMode(sp.AnimationCacheMode.REALTIME);
                spine.premultipliedAlpha = false;
                spine.skeletonData = ref.content;

                if (appear) {
                    spine.setAnimation(0, appear, false);
                    spine.setCompleteListener((track: sp.spine.TrackEntry) => {
                        if (track.animation.name == appear) {
                            spine.setAnimation(0, idea, true);
                        }
                    });
                } else {
                    spine.setAnimation(0, idea, true);
                }
            })
        });
    }

    public setBgImg(url: string) {
        if (url) {
            this.view.bg.icon = null;
            this.view.bg.icon = url;
        }
    }

    public setLogoImg(url: string) {
        if (url) {
            this.view.logo.icon = null;
            this.view.logo.icon = url;
        }
    }

    protected onPreDispose() {
        ResManager.ins().disposeRefGroupByRefKey(this._resKey);
    }

}