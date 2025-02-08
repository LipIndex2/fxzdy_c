import { Asset, assetManager, ImageAsset, isValid, Rect, Sprite, SpriteAtlas, SpriteFrame, Texture2D } from "cc";
import * as fgui from "fairygui-cc";

import { Res } from "../../res/Res";
import { Resource } from "../../res/Resource";
import { ResRef } from "../../res/ResRef";
import { url2Key } from "../../res/ResURL";
import { ResManager } from "../../res/ResManager";

export default class FGUILoader extends fgui.GLoader {

    private _ref: ResRef;

    private _9grid: Rect;

    get TAG(): string {
        return this.parent?.packageItem?.name || "FguiLoader";
    }

    /*
       开始外部载入，地址在url属性
       载入完成后调用onExternalLoadSuccess
       载入失败调用onExternalLoadFailed

       注意：如果是外部载入，在载入结束后，调用onExternalLoadSuccess或onExternalLoadFailed前，
       比较严谨的做法是先检查url属性是否已经和这个载入的内容不相符。
       如果不相符，表示loader已经被修改了。
       这种情况下应该放弃调用onExternalLoadSuccess或onExternalLoadFailed。
    */
    protected loadExternal() {
        let url = this.url;
        let callback = (asset: Asset) => {
            //因为是异步返回的，而这时可能url已经被改变，所以不能直接用返回的结果
            if (this.url != url || !isValid(this._node)) {
                this._ref?.dispose();
                this._ref = null;
                return;
            }
            if (!asset) {
                // 大概率策划写错单词了 / 资源不存在
                console.error(`[FGUI Loader] 获取资源失败. error asset url = ${url}`);
                return;
            }
            if (asset instanceof SpriteFrame) {
                this.onExternalLoadSuccess(asset);
            }
            else if (asset instanceof Texture2D) {
                let sf = this._content?.spriteFrame || new SpriteFrame();
                sf.texture = asset;
                this.onExternalLoadSuccess(sf);
            }
            else if (asset instanceof ImageAsset) {
                let sf = this._content?.spriteFrame || new SpriteFrame();
                let texture = new Texture2D();
                texture.image = asset;
                sf.texture = texture;
                this.onExternalLoadSuccess(sf);
            }
        };
        if (this.url.startsWith("http://")
            || this.url.startsWith("https://")
            || this.url.startsWith('/')) {
            assetManager.loadRemote(this.url, (asset: Asset) => {
                if (asset) {
                    let res = new Resource();
                    res.url2key = url2Key(this.url);
                    res.content = asset;
                    ResManager.ins().addRes(res);
                    this._ref = ResRef.createRef(asset, res.url2key, this.TAG);
                }
                callback(asset);
            })
        }
        else {
            if (this.url.indexOf("unpack") >= 0) {
                this.loadImage(callback);
            }
            else {
                this.loadByAtlas(callback);
            }
        }
    }

    /**
     * 加载图集
     */
    private loadByAtlas(callback: (asset) => void): void {
        let idx = this.url.lastIndexOf("/");
        let atlasUrl = this.url.substring(0, idx);
        let imgUrl = this.url.substring(idx + 1);

        Res.getResRef({ url: atlasUrl, type: SpriteAtlas }, this.TAG, (resRef) => {
            if (resRef) {
                this._ref = resRef;
                let atlas = resRef.content as SpriteAtlas;
                atlas.name = atlasUrl;
                let sf = atlas.getSpriteFrame(imgUrl);
                callback(sf);
            }
        })

    }

    /**
     * 加载图片
     */
    private loadImage(callback: (asset) => void): void {
        Res.getResRef({ url: this.url, type: Texture2D }, this.TAG, (resRef) => {
            if (resRef) {
                this._ref = resRef;
                let tex = resRef.content as Texture2D;
                tex.name = this.url;
                callback(tex);
            }
        })
    }

    /**
     * 释放外部载入的资源
     * （dispose时会调用）
     */
    protected freeExternal(spFrame: SpriteFrame) {
        if (this._ref) {
            this._ref.dispose();
        }
        if (spFrame) {
            spFrame.decRef();
        }
        this._ref = null;
    }

    protected onExternalLoadSuccess(spFrame: SpriteFrame): void {
        spFrame.texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
        spFrame.addRef();
        if (this._9grid) {
            spFrame.insetTop = this._9grid.x;
            spFrame.insetBottom = this._9grid.y;
            spFrame.insetLeft = this._9grid.width;
            spFrame.insetRight = this._9grid.height;
        }

        this._content.spriteFrame = spFrame;
        this._content.type = this._9grid ? Sprite.Type.SLICED : Sprite.Type.SIMPLE;

        if (this._content.sizeMode === Sprite.SizeMode.RAW) {
            this.sourceWidth = spFrame.originalSize.width;
            this.sourceHeight = spFrame.originalSize.height;
        } else {
            this.sourceWidth = spFrame.rect.width;
            this.sourceHeight = spFrame.rect.height;
        }

        //@ts-ignore
        if (this._autoSize)
            this.setSize(this.sourceWidth, this.sourceHeight);
        //@ts-ignore
        this.updateLayout();
    }

    /**
     * 设置9宫
     * @param top 
     * @param bottom 
     * @param left 
     * @param right 
     */
    public set9Grid(top: number, bottom: number, left: number, right: number): void {
        this._9grid = new Rect(top, bottom, left, right);
        if (this._content && this._content.spriteFrame) {
            this._content.spriteFrame.insetTop = this._9grid.x;
            this._content.spriteFrame.insetBottom = this._9grid.y;
            this._content.spriteFrame.insetLeft = this._9grid.width;
            this._content.spriteFrame.insetRight = this._9grid.height;
            this._content.type = Sprite.Type.SLICED;
        }
    }

    public dispose(): void {
        this._9grid = null;
        super.dispose();
    }
}