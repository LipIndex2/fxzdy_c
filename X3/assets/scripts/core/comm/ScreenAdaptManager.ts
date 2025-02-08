import { Rect } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import { view, Canvas, director, sys, Node, math, ResolutionPolicy, screen } from "cc";



/**
 * 屏幕适配管理器
 */
export class ScreenAdaptManager extends BaseSingleton {
    /**设计分辨率 */
    public static readonly desginWidth: number = 750;
    /**设计分辨率 */
    public static readonly desginHeight: number = 1334;

    /**设计最大支持分辨率 */
    public static readonly desginMaxWidth: number = 750;
    /**设计最大支持分辨率 */
    public static readonly desginMaxHeight: number = 1626;

    /**当前分辨率 */
    static viewWidth = 750;
    /**当前分辨率 */
    static viewHeight = 1334;

    /**当前屏幕渲染偏移 */
    static screenOffsetX = 0;

    /**顶安全距离*/
    public static safeTop: number = 0;
    /**底安全距离*/
    public static safeBottom: number = 0;

    /** 背景资源缩放比例 */
    public static bgScale: number = 1;

    public static rect: Rect = new Rect();


    public init(): void {
        this.initMiniGame();
        this.onScreenResize();
        view.resizeWithBrowserSize(true);
        view.on("canvas-resize", this.onScreenResize, this);
    }

    /**
     * 初始化小游戏屏幕适配管理。
     * 如果当前平台是微信小游戏，则设置屏幕常亮。
     */
    private initMiniGame() {
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            // @ts-ignore
            wx?.setKeepScreenOn({
                keepScreenOn: true
            })
        }
    }

    /**
     *
     * @private
     */
    private onScreenResize() {
        this.adaptScreen();
    }

    /**
     * 适配
     * @private
     */
    private adaptScreen(): void {
        //console.log(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        ScreenAdaptManager.screenOffsetX = 0;
        let screenSize = screen.windowSize;

        let renderW = ScreenAdaptManager.desginWidth;
        let renderH = ScreenAdaptManager.desginHeight;

        let canvas = director.getScene().getChildByName('Canvas');
        let Can = canvas.getComponent(Canvas);

        let cameraRect = ScreenAdaptManager.rect;
        if (screenSize.width / screenSize.height > renderW / renderH) {
            view.setDesignResolutionSize(ScreenAdaptManager.desginWidth, ScreenAdaptManager.desginHeight, ResolutionPolicy.SHOW_ALL);

            let curWidth = screenSize.width / screenSize.height * renderH;
            let s = renderW / curWidth;

            ScreenAdaptManager.screenOffsetX = (1 - s) / 2 * screenSize.width;
            // console.log("screenOffsetX " + ScreenAdaptManager.screenOffsetX);

            Can.cameraComponent.rect = cameraRect.set((1 - s) / 2, 0, s, 1);

            //宽屏
            //renderW = screenSize.width / screenSize.height * renderH;
            //fgui.GRoot.inst.width = renderW / renderH * fgui.GRoot.inst.height;
            //view.setDesignResolutionSize(renderW, renderH, ResolutionPolicy.FIXED_WIDTH);
            //ScreenAdaptManager.bgScale = Math.max(1, renderW / ScreenAdaptManager.desginMaxWidth);
        } else {
            Can.cameraComponent.rect = cameraRect.set(0, 0, 1, 1);
            //长屏
            renderH = screenSize.height / screenSize.width * renderW;
            view.setDesignResolutionSize(renderW, renderH, ResolutionPolicy.FIXED_HEIGHT);
            ScreenAdaptManager.bgScale = Math.max(1, renderH / ScreenAdaptManager.desginMaxHeight);
        }

        ScreenAdaptManager.viewWidth = renderW;
        ScreenAdaptManager.viewHeight = renderH;

        this.initAdaptOffset();
    }


    /**刘海屏适配*/
    private initAdaptOffset() {
        let top = 0;
        let bottom = 0;
        if (sys.isNative || sys.platform === sys.Platform.WECHAT_GAME) {
            let rect = sys.getSafeAreaRect();
            // console.log(rect);
            top = rect.yMin;
            if (sys.os == sys.OS.IOS) {
                if (top > 100) top -= 22; // iphone 15
                else if (top > 80) top -= 26; //iphone 14
            }

            if (top > 50 && ScreenAdaptManager.viewHeight > 1400) {
                bottom = 20;
            }
        } else {
            let userAgent = window.navigator.userAgent;
            if (userAgent.indexOf("safeTop:") > -1) {
                let ret = userAgent.match(/safeTop:[0-9]+/);
                if (ret && ret[0]) {
                    let arr = ret[0].split(":");
                    top = +arr[1];
                }
            }

            if (userAgent.indexOf("safeBottom:") > -1) {
                let ret = userAgent.match(/safeBottom:[0-9]+/);
                if (ret && ret[0]) {
                    let arr = ret[0].split(":");
                    bottom = +arr[1];
                }
            }
        }
        ScreenAdaptManager.safeTop = top;
        ScreenAdaptManager.safeBottom = bottom;

        let resolutionSize = view.getDesignResolutionSize();
        if (resolutionSize.height > ScreenAdaptManager.desginMaxHeight) {
            let delta = resolutionSize.height - ScreenAdaptManager.desginMaxHeight;// - 1626 - 上下底框
            //有效显示过长 上下留安全区域
            if (ScreenAdaptManager.safeTop + ScreenAdaptManager.safeBottom < delta) {
                let half = delta / 2;
                if (ScreenAdaptManager.safeTop < half) ScreenAdaptManager.safeTop = half;
                if (ScreenAdaptManager.safeBottom < half) ScreenAdaptManager.safeBottom = half;
            }
        }

    }
    /*
    private adaptScreenSize() {
        Laya.stage.scaleMode = Laya.Stage.SCALE_EXACTFIT;

        //this.initAdaptOffset();

        let width = Math.min(Laya.Browser.width, Laya.Browser.height);
        let height = Math.max(Laya.Browser.width, Laya.Browser.height);

        if (height / width > DeviceManager.DesginMaxH / DeviceManager.DesginW) {
            //超过背景图尺寸，计算背景放大比例
            let maxHeight = Math.floor(width * DeviceManager.DesginMaxH / DeviceManager.DesginW);
            ScreenAdaptManager.bgScale = height / maxHeight;
        }
        Laya.stage.size(width, height);
        return { width, height };
    }*/

    /*
    private adaptScreenOnPhone(): void {
        let size = this.adaptScreenSize();

        let width = size.width;
        let height = size.height;

        if ((width / height) > (1000 / 1334)) {
            //超宽屏处理
            ScreenAdaptManager.rawTop = ScreenAdaptManager.top;
            ScreenAdaptManager.rawBottom = ScreenAdaptManager.bottom;
            Laya.stage.width = 1000;
            Laya.stage.height = 1334;
            DeviceManager.RenderW = ScreenAdaptManager.rawWidth = 1000;
            DeviceManager.RenderH = ScreenAdaptManager.rawHeight = 1334;
            ScreenAdaptManager.adaptScale = 1;
            Laya.stage.scaleMode = Laya.Stage["SCALE_NOSCALE_FULL"];
            return;
        }

        //设备屏幕尺寸
        DeviceManager.RenderW = width;
        DeviceManager.RenderH = height;

        let scaleW = DeviceManager.RenderW / DeviceManager.DesginW;
        let scaleH = DeviceManager.RenderH / DeviceManager.DesginH;
        ScreenAdaptManager.adaptScale = Math.min(scaleW, scaleH);

        ScreenAdaptManager.rawWidth = DeviceManager.RenderW / ScreenAdaptManager.adaptScale;
        ScreenAdaptManager.rawHeight = DeviceManager.RenderH / ScreenAdaptManager.adaptScale;

        ScreenAdaptManager.rawTop = ScreenAdaptManager.top / ScreenAdaptManager.adaptScale;
        ScreenAdaptManager.rawBottom = ScreenAdaptManager.bottom / ScreenAdaptManager.adaptScale;

        if (ScreenAdaptManager.rawHeight > DeviceManager.DesginMaxH) {
            let delta = ScreenAdaptManager.rawHeight - DeviceManager.DesginMaxH - 80;// - 1626 - 上下底框
            //有效显示过长 上下留安全区域
            if (ScreenAdaptManager.rawTop + ScreenAdaptManager.rawBottom < delta) {
                let half = delta / 2;
                if (ScreenAdaptManager.rawTop < half) ScreenAdaptManager.rawTop = half;
                if (ScreenAdaptManager.rawBottom < half) ScreenAdaptManager.rawBottom = half;
            }
        }
    }*/
}