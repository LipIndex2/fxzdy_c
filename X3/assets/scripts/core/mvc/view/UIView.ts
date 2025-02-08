import * as fgui from "fairygui-cc";
import { BaseNotification } from "../BaseNotification";
import { GameTimer } from "../../timer/GameTimer";
import { ScreenAdaptManager } from "../../comm/ScreenAdaptManager";
import { ViewBaseComp } from "./comp/ViewBaseComp";
import { ViewPageEffectComp } from "./comp/ViewPageEffectComp";
import ViewContainer from "../viewContainer/ViewContainer";
import { EnumUIViewLayer } from "../../comm/LayerManager";
import { ResManager } from "../../res/ResManager";
import G from "../../comm/G";
import { ResURL } from "../../res/ResURL";
import { DebugUtils } from "../../utils/DebugUtils";

export enum ViewAdaptType {
    /**满屏适配(默认) */
    FULL,
    /**顶底适配 */
    TOP_BOTTOM,
    /**顶适配 */
    TOP,
    /**底适配 */
    BOTTOM
}

export enum ViewType {
    /**视窗*/
    View = 1,
    /**弹窗 */
    Win,
    /**UI页面，功能页面的开始 */
    Page,
}


/**
 * 一个 FGUI 的逻辑基类
 * ps:
 * 1. 只能 override onXxx 方法, 其余部分是框架自己内部调用
 */
export class UIView extends BaseNotification {
    /**
     * 包名 | 对应 FairyGUI 的 packageName
     * @override
     */
    public static pkgName: string;

    /**
     * UI组件名 | FGUI package/ 下的唯一 ${viewName}
     * @override
     */
    public static viewName: string;


    /**预加载资源
     * @param {any} openArgs 打开界面的参数
     * @returns {ResURL[]}
     */
    static preloadRes(openArg?: any): ResURL[] {
        return null;
    }

    /**子类不要覆写和使用 */
    private _classKey: string;

    public _view: fgui.GComponent;
    public _viewType = ViewType.View;

    /**适配类型 */
    protected adaptType = ViewAdaptType.FULL;

    /**界面层级 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.UI;

    /**是否已打开过 */
    private _isOpened = false;

    /***组件数组 */
    public comps: ViewBaseComp<UIView>[] = [];

    /**获取UI层级 */
    get layerType() {
        return this._layer;
    }

    /**获取子界面容器 */
    get viewContainer(): ViewContainer {
        //@ts-ignore
        return this._view.viewContainer || null;
    }

    /**
     * 判断界面是切换 还是 重新打开
     * @returns true 重新打开（部分状态可以保留）
     */
    get isOpened() {
        return this._isOpened;
    }

    /**
     * 子类继承并实现
     * 绑定，注册，静态数据获取
     * @override
     * */
    protected onInit() { }

    /**
     * 子类继承并实现
     * 动态数据获取，界面逻辑
     * @override
     * @param {any} args 打开界面的参数
     * @param {boolean} isReopen 重新打开的界面（从后台恢复）
     * */
    protected onOpen(args: any, isReopen?: boolean) { }

    /**
     * 子类继承并实现
     * 清理定时器、动画、临时数据
     * @override
     */
    protected onClose(dontDispose: boolean = false) { }


    /**
     * 子类继承并实现
     * 用于界面清理缓存
     * @override
     */
    protected onPreDispose(): void {
    }

    /**
     * 子类不要覆写和使用
     * */
    private doInit() {
        if (this.viewContainer) {
            this.viewContainer.setOwner(this);
        }
        this.onResize();
        this.onInit();
        this.initEvent();
        this.initComp();
    }

    /***组件初始化 (仅用作组件化脚本的初始化) */
    protected initComp(): void {
    }

    /**
     * 子类不要覆写和使用
     * 关闭界面
     * @param {boolean} dontDispose 不要销毁
     */
    private doClose(dontDispose: boolean = false) {
        if (this.viewContainer) {
            this.viewContainer.onClose(dontDispose);
        }

        if (this._isOpened) {
            this._isOpened = false;
            this.triggerAllComp("onCloseBefore");
            this.onClose(dontDispose);
            this.removeNotification();
            this.triggerAllComp("onClose");
        }
        if (!dontDispose) {
            GameTimer.ins().callLater(this, this.doDispose); //异步关闭临时处理
        }
    }

    /**
     * 子类不要覆写和使用
     * @param {object} args 打开界面的参数
     * @param {boolean} isReopen 重新打开的界面（从后台恢复）
     */
    private doOpen(args, isReopen = false) {
        this._isOpened = true;

        if (this.viewContainer) {
            this.viewContainer.onOpen(isReopen);
        }
        this.addNotification();
        this.onOpen(args, isReopen);
        this.triggerAllComp("onOpen");
    }


    /**生命周期结束 */
    private doDispose() {
        this.onPreDispose();
        if (this.viewPageController)
            this.viewPageController.off(fgui.Event.STATUS_CHANGED, this.onViewPageSelect, this);
        this.triggerAllComp("doDispose");
        this._view.dispose();
        this.removeAllComp();
        ResManager.ins().disposeRefGroupByRefKey(this._classKey);
        this.onDestroy();
    }

    /**
     * 一般情况下时重新 @see UIView.onPreDispose 
     * 如子类重写必须 调用super.onDestroy();
     */
    protected onDestroy(): void {
        super.onDestroy();
    }

    public closeSelf() {
        G.UIManager.close(this._classKey);
    }

    public get viewPageController(): fgui.Controller {
        return null;
    }

    protected initEvent(): void {
        if (this.viewPageController) {
            this.viewPageController.on(fgui.Event.STATUS_CHANGED, this.onViewPageSelect, this);
            // this.addComp(new ViewPageEffectComp([this._view]))
        }
    }

    protected onViewPageSelect(controller: fgui.Controller): void {
        let comp = this.getComp(ViewPageEffectComp)
        if (comp) {
            comp.execute("onOpen");
        }

    }

    private onResize(): void {
        if (!this._view.parent) {
            DebugUtils.isDebugMode() && console.log("没有父节点：" + this._classKey);
            return;
        }

        let rootWidth = this._view.parent.width;
        let rootHeight = this._view.parent.height;
        if (this.adaptType && this._layer != EnumUIViewLayer.SUBVIEW) {
            switch (this.adaptType) {
                case ViewAdaptType.TOP_BOTTOM:
                    rootHeight -= ScreenAdaptManager.safeTop + ScreenAdaptManager.safeBottom;
                    this._view.y = ScreenAdaptManager.safeTop;
                    break;
                case ViewAdaptType.TOP:
                    rootHeight -= ScreenAdaptManager.safeTop;
                    this._view.y = ScreenAdaptManager.safeTop;
                    break;
                case ViewAdaptType.BOTTOM:
                    rootHeight -= ScreenAdaptManager.safeBottom;
                    break;
            }
        }

        if (this._view) {
            //@ts-ignore
            if (this._view.adapt_bg) {
                //@ts-ignore
                let adapt_bg: fgui.GObject = this._view.adapt_bg;
                let pivotX = 0.5;
                let pivotY = 0.5;
                if (adapt_bg.data === "bottom") {
                    pivotY = 1;
                } else if (adapt_bg.data === "top") {
                    pivotY = 0;
                }
                adapt_bg.setPivot(pivotX, pivotY, true);

                adapt_bg.relations.clearAll();
                let point = fgui.GRoot.inst.localToGlobal(fgui.GRoot.inst.width * pivotX, fgui.GRoot.inst.height * pivotY);
                point = adapt_bg.parent.globalToLocal(point.x, point.y);
                adapt_bg.setPosition(point.x, point.y);
                adapt_bg.setScale(ScreenAdaptManager.bgScale, ScreenAdaptManager.bgScale);
            }

            //@ts-ignore
            this._view.top_bg && (this._view.top_bg.visible = ScreenAdaptManager.safeTop > 0);
            //@ts-ignore
            this._view.bottom_bg && (this._view.bottom_bg.visible = ScreenAdaptManager.safeBottom > 0);
        }

        this._view.setSize(rootWidth, rootHeight);
        this.triggerAllComp("onResize");
    }

    /***添加插件 */
    public addComp(comp: ViewBaseComp<UIView>): ViewBaseComp<UIView> {
        for (var i = 0; i < this.comps.length; i++) {
            if (this.comps[i].className == comp.className) {
                //先移除相同的
                this.comps[i].destroy();
                this.comps.splice(i, 1)
                break;
            }
        }
        comp.owner = this;
        comp.onInit()
        this.comps.push(comp);
        return comp
    }

    /***添加一堆插件 */
    public addComps(comps: any[]): void {
        var len: number = comps.length / 2;
        for (var i: number = 0; i < len; i++) {
            var index: number = i * 2;
            this.addComp(new comps[index](comps[index + 1]));
        }
    }

    /***触发组件 */
    public triggerAllComp(name: string): void {
        for (var i = 0; i < this.comps.length; i++) {
            this.comps[i].execute(name);
        }
    }

    /***获取组件 */
    public getComp(cls: typeof ViewBaseComp<UIView>): ViewBaseComp<UIView> {
        for (var i = 0; i < this.comps.length; i++) {
            if (this.comps[i].className == cls.className) {
                return this.comps[i];
            }
        }
        return null;
    }

    /***移除所有组件 */
    public removeAllComp(): void {
        for (var i = 0; i < this.comps.length; i++) {
            this.comps[i].destroy();
        }
        this.comps.length = 0;
    }
}