import { Node, Size, sys, UITransform, VideoClip, VideoPlayer } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import { Res } from "../../../../core/res/Res";
import { ResRef } from "../../../../core/res/ResRef";
import NotificationKey from "../../../event/NotificationKey";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";

export enum VideoNodeFillType {
    /**填满容器*/
    ALL = 1,
    /**宽适配*/
    WIDTH,
    /**高适配*/
    HEIGHT
}

@bindFguiExtension('ui://comm/VideoNode')
export class VideoNode extends fgui.GComponent implements INotification {
    static pkgName: string = "comm"
    static viewName: string = "VideoNode"

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName);
    }

    /**填充方式 默认宽适配*/
    protected _fillType: VideoNodeFillType = VideoNodeFillType.WIDTH
    protected _url: string = ''
    protected _bundleName: string = ''
    protected _path: string = ''
    protected _videoPlayer: VideoPlayer = null
    protected _isLoaded: boolean = false
    protected _videoSize: Size = new Size(0, 0)

    listenNotifications(): string[] {
        return [
            NotificationKey.VIDEO_SCALE_CHANGE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.VIDEO_SCALE_CHANGE:
                if (this._videoPlayer) {
                    this._videoPlayer.node?.setScale(args, args)
                }
                break
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this)
    }

    protected onPreDispose() {
        G.FacadeManager.removeNotification(this)
    }

    protected initVideoPlayerNode(): void {
        if (this._videoPlayer == null) {
            let node = new Node()
            node.name = 'VideoPlayer'
            this._videoPlayer = node.addComponent(VideoPlayer)
            let uiTrans = node.getComponent(UITransform)
            let parentTrans = this.node.getComponent(UITransform)
            uiTrans.setAnchorPoint(0.5, 0.5)
            node.on(VideoPlayer.EventType.READY_TO_PLAY, this.onLoadVideoComplete, this)
            node.on(VideoPlayer.EventType.COMPLETED, this.onPlayVideoComplete, this)
            this.node.addChild(node)
            node.setPosition((0.5 - parentTrans.anchorX) * parentTrans.width, (0.5 - parentTrans.anchorY) * parentTrans.width)
            this._videoPlayer.loop = true
            this._videoPlayer.playOnAwake = true
            this._videoPlayer.keepAspectRatio = true
        }
    }

    set url(value: string) {
        if (this._url != value) {
            this._isLoaded = false
            this.videoPlayer.resourceType = VideoPlayer.ResourceType.REMOTE
            this._url = value
            this._videoPlayer.remoteURL = value
        }
    }

    get url(): string {
        return this._url
    }

    get videoPlayer(): VideoPlayer {
        this.initVideoPlayerNode()
        return this._videoPlayer
    }

    get fillType(): VideoNodeFillType {
        return this._fillType
    }

    set fillType(value: VideoNodeFillType) {
        if (this._fillType != value) {
            this._fillType = value
            this.resizeVideoNode()
        }
    }

    protected onLoadVideoComplete(): void {
        this._isLoaded = true
        this._videoPlayer?.play()
    }

    protected onPlayVideoComplete(): void {
        if (sys.isNative) {
            //原生平台不会触发循环播放
            this._videoPlayer.play()
        }
    }

    public resizeVideoNode(): void {
        if (this.node?.isValid && this.videoPlayer && this._videoSize.width != 0 && this._videoSize.height != 0) {
            let parentTrans = this.node.getComponent(UITransform)
            let scaleX = parentTrans.width / this._videoSize.width
            let scaleY = parentTrans.height / this._videoSize.height
            if (sys.isBrowser) {
                //h5使用缩放 H5加载完成后会自动设置宽高到视频大小
                let scale = 1
                if (this._fillType == VideoNodeFillType.ALL) {
                    scale = Math.min(scaleX, scaleY)
                } else if (this._fillType == VideoNodeFillType.WIDTH) {
                    scale = scaleX
                } else if (this._fillType == VideoNodeFillType.HEIGHT) {
                    scale = scaleY
                }
                this._videoPlayer.node.setScale(scale, scale)
            } else {
                //其他平台使用设置宽高 其他平台会根据宽高属性自适应视频大小
                let w: number = parentTrans.width
                let h: number = parentTrans.height
                if ((this._fillType == VideoNodeFillType.ALL && scaleX <= scaleY) || this._fillType == VideoNodeFillType.WIDTH) {
                    //宽适配
                    h = scaleX * this._videoSize.height
                } else if ((this._fillType == VideoNodeFillType.ALL && scaleX > scaleY) || this._fillType == VideoNodeFillType.HEIGHT) {
                    //高适配
                    w  = scaleY * this._videoSize.width
                }
                this.videoPlayer.node?.getComponent(UITransform).setContentSize(w, h)
            }

        }
    }

    public play(cfg: table.video.VideoConfig): void {
        if (cfg == null) {
            return
        }
        this._videoSize.set(cfg.size[0], cfg.size[1])
        this.resizeVideoNode()
        if (cfg.path.startsWith('http') || cfg.path.startsWith('https')) {
            //代表是远程加载
            this.url = cfg.path
        } else {
            this.playByPath(cfg.path)
        }
    }

    public playByPath(path: string, bundleName: string = AssetBundleKeys.VIDEO): void {
        if (this._path != path || this._bundleName != bundleName) {
            this._isLoaded = false
            this.videoPlayer.resourceType = VideoPlayer.ResourceType.LOCAL
            this._path = path
            this._bundleName = bundleName
            Res.getResRef({ bundle: bundleName, url: path, type: VideoClip }, null,
                (res: ResRef) => {
                    if (!res) {
                        console.error('加载视频错误', this._path)
                        return
                    }
                    if (this._bundleName == null || this._path == null) {
                        return;
                    }
                    if (this.node?.isValid && this._path) {
                        this._videoPlayer.node.active = false
                        this._videoPlayer.clip = res.content
                        this._videoPlayer.node.active = true
                        this._isLoaded = true
                    }
                }
            )
        }
    }

    public clearVideo(): void {
        if (this._isLoaded) {
            this._videoPlayer?.stop()
        }
        this._videoPlayer.clip = null
        this._path = null
        this._bundleName = null
        this._isLoaded = false
    }
}