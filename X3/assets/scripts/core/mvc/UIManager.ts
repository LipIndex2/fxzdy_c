import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import * as fgui from "fairygui-cc";
import BaseSingleton from "../base/BaseSingleton";
import G from "../comm/G";
import { EnumUIViewLayer, LayerManager } from "../comm/LayerManager";
import UIScriptManager from "../comm/UIScriptManager";
import { Logger } from "../log/Logger";
import { PoolManager } from "../pool/PoolManager";
import { Res } from "../res/Res";
import { ResManager } from "../res/ResManager";
import { ResURL } from "../res/ResURL";
import BaseNotificationKey from "./event/BaseNotificationKey";
import { UIView, ViewType } from "./view/UIView";


export class UIInfo {
    public uiKey: string;
    public view: UIView;
    public args: object;

    set(uiKey: string, view: UIView, args: object) {
        this.uiKey = uiKey;
        this.view = view;
        this.args = args;
    }
}

/**
 * UIManager界面管理类
 */
export class UIManager extends BaseSingleton {
    private _map: { [key: string]: UIView } = {};
    private _uiStack: UIInfo[] = [];
    protected _loadingCnt:number = 0;

    constructor() {
        super();
    }

    /**界面是否已打开 */
    isOpened(uiKey: string) {
        return !!this._map[uiKey];
    }

    /**界面已打开界面的实例 */
    getViewInstance(uiKey: string) {
        return this._map[uiKey] || null;
    }

    /**界面是否活跃 */
    isActive(uiKey: string) {
        let uiView = this._map[uiKey];
        return uiView && uiView._view.visible;
    }

    /**是否在UI最顶层 */
    isUiTop(uiKey: string) {
        if (!this.isOpened(uiKey)) return false;
        if (this.getLayerChildCount(EnumUIViewLayer.GUIDE)) return false;
        if (this.getLayerChildCount(EnumUIViewLayer.WARN)) return false;

        let UIInfo = this._uiStack[this._uiStack.length - 1];
        return UIInfo && UIInfo.uiKey == uiKey;
    }

    /**是否在UI层的最顶层 */
    isUILayerTop(uiKey: string) {
        if (!this.isOpened(uiKey)) return false;
        let UIInfo = this._uiStack[this._uiStack.length - 1];
        return UIInfo && UIInfo.uiKey == uiKey;
    }

    /**获取顶层page的uiKey */
    getTopPageKey() {
        for (let i = this._uiStack.length - 1; i >= 0; i--) {
            if (this._uiStack[i].view._viewType == ViewType.Page) {
                return this._uiStack[i].uiKey;
            }
        }
        return null;
    }

    /**
     * 返回按钮
     * 关闭顶层的uiKey
     */
    goToBack() {
        for (let i = this._uiStack.length - 1; i >= 0; i--) {
            if (this._uiStack[i].view._viewType) {
                this.close(this._uiStack[i].uiKey);
                return;
            }
        }
        return null;
    }

    /**
     * 加载描述文件和FairyGUI包依赖的资源（图集和音效）
     * @param pkgNames fgui包名
     * @param preloadRes 预加载的资源
     * @param uiKey 界面关键字(用于批量释放资源)
     */
    public loadPkg(pkgNames: string[], preloadRes: ResURL[], uiKey: string, complete: (state: boolean) => void) {
        let fuiFilenamePrefix = "ui/";
        let urls = pkgNames.map((pkgName) => {
            let url = {
                url: fuiFilenamePrefix + pkgName,
                type: "fgui",
                bundle: "resources",
            } as ResURL;
            return url;
        });

        if (preloadRes?.length) {
            urls = urls.concat(preloadRes);
        }

        Res.getResRefList(urls, uiKey, (resRefs) => {
            let state = !!resRefs;
            if (!state) {
                console.error(uiKey + " fgui 加载失败！！！");
                ResManager.ins().disposeRefGroupByRefKey(uiKey);
            }
            complete && complete(state);
        });
    }

    /**
     * 打开 UI 界面
     * @param keyObj UI Key
     * @param args 参数对象  args == object
     * @param completeCallback open 成功后的
     */
    open<T extends UIView>(keyObj: string | UIBindingKey<T>, args?: any, completeCallback?: () => void) {
        let uiKey: string = keyObj instanceof UIBindingKey ? keyObj.key : keyObj;
        let UIClass: typeof UIView = UIScriptManager.getViewScriptClass(uiKey);
        if (!UIClass) {
            return;
        }

        Logger.system("尝试打开界面，name = " + uiKey);

        if (this._map[uiKey]) {
            //重用界面
            this.onReopen(uiKey, args);
            if (completeCallback) completeCallback();
            G.FacadeManager.emit(BaseNotificationKey.OPEN_ViEW, uiKey);
            return;
        }

        const fguiPackageName = UIClass.pkgName;
        let preloadRes = UIClass.preloadRes(args);
        this._loadingCnt++;
        this.loadPkg([fguiPackageName], preloadRes, uiKey, (state) => {
            this._loadingCnt--;
            if (state) {
                // 这个 onLoad 里面进行了同步的 FGUI 创建节点
                const uiView = this.onLoad(uiKey, args);
                if (!uiView) return;
                uiView._view.node.name = uiKey;

                if (completeCallback) completeCallback();

                Logger.system("打开界面，name = " + uiKey);
                G.FacadeManager.emit(BaseNotificationKey.OPEN_ViEW, uiKey);
            }
        });
    }

    /**
     * 根据 UI Key 获取 UI 实例
     * @param uiKey ui Key
     */
    getUIByKey<T extends UIView>(uiKey: string): T | null {
        return this._map[uiKey] as T;
    }

    private pushUIStack(uiKey: string, view: UIView, args: object) {
        if (view.layerType == EnumUIViewLayer.UI) {
            let uiInfo = PoolManager.getItem(UIInfo);
            uiInfo.set(uiKey, view, args);
            this._uiStack.push(uiInfo);
        }
    }

    /**增加子节点 */
    private pushUI(uiKey: string, uiView: UIView, args: object) {
        if (uiView._viewType === ViewType.Page) {
            this.hideBeforePageUI();
        }

        uiView._view.visible = true;
        LayerManager.ins().addChild(uiView.layerType, uiView._view);

        this.pushUIStack(uiKey, uiView, args);
    }

    /**重用界面 */
    private onReopen(uiKey: string, args: object) {
        let uiView = this._map[uiKey];
        this.doClose(uiKey, true);

        // 这里面会再 open 一次
        this.pushUI(uiKey, uiView, args);

        //@ts-ignore
        uiView.doOpen(args);
        return uiView;
    }

    /**
     * 加载 UI 界面
     * @param uiKey UI 唯一名称
     * @param args 参数
     */
    private onLoad(uiKey: string, args: Object): UIView {
        if (this._map[uiKey]) {
            //在open 已有处理
            return this.onReopen(uiKey, args);
        }

        let UIClass = UIScriptManager.getViewScriptClass(uiKey);

        let uiView: UIView = new UIClass();

        // create node by FGUI
        let view = fgui.UIPackage.createObject(UIClass.pkgName, UIClass.viewName).asCom;

        uiView._view = view;
        //@ts-ignore
        uiView._classKey = uiKey;

        this.pushUI(uiKey, uiView, args);

        Logger.startLowTime(uiKey);

        //@ts-ignore
        uiView.doInit();

        this._map[uiKey] = uiView;

        //@ts-ignore
        uiView.doOpen(args);
        Logger.endLowTime(uiKey);

        return uiView;
    }

    // 关闭 UI
    close<T extends UIView>(uiKey: string | UIBindingKey<T>) {
        let key = uiKey instanceof UIBindingKey ? uiKey.key : uiKey;
        if (!this._map[key]) {
            return;
        }
        Logger.system("关闭界面，nema = " + key);
        this.doClose(key);
        G.FacadeManager.emit(BaseNotificationKey.CLOSE_ViEW, uiKey);
    }

    /**关闭界面
     * @param uiKey
     * @param [isReopen=false] 是否要被重新打开
     */
    private doClose(uiKey: string, isReopen: boolean = false) {
        let uiView = this._map[uiKey];

        if (uiView.layerType == EnumUIViewLayer.UI) {
            //UI层 需处理uiStack
            if (uiView._viewType == ViewType.Page) {
                //该页后的界面都关闭
                let needCloseViews = [];
                for (let i = this._uiStack.length - 1; i >= 0; i--) {
                    var view = this._uiStack[i].view;
                    needCloseViews.push(view);
                    if (view == uiView) {
                        this._uiStack.splice(i, this._uiStack.length - i);
                        break;
                    }
                }
                this.doCloseViews(needCloseViews, isReopen);
                this.showBeforePageUI();
            } else {
                //关闭单个视窗
                for (let i = this._uiStack.length - 1; i >= 0; i--) {
                    if (this._uiStack[i].view == uiView) {
                        this._uiStack.splice(i, 1);
                        break;
                    }
                }
                this.doCloseView(uiView, isReopen);
            }
        } else {
            //非UI层 直接处理
            this.doCloseView(uiView, isReopen);
        }
    }

    /**关闭界面 */
    private doCloseView(uiView: UIView, isReopen = false) {
        if (!isReopen) {
            //@ts-ignore
            this._map[uiView._classKey] && delete this._map[uiView._classKey];
        }

        //@ts-ignore
        uiView.doClose(isReopen);
    }

    /**关闭界面组 */
    private doCloseViews(uiViews: UIView[], isReopenLast = false) {
        let last = uiViews.length - 1;
        for (let i = 0; i <= last; i++) {
            var view = uiViews[i];

            if (i != last || !isReopenLast) {
                //@ts-ignore
                this._map[view._classKey] && delete this._map[view._classKey]; //防止二次关闭
            }

            //@ts-ignore
            uiViews[i].doClose(isReopenLast && i == last);
        }
    }

    /**隐藏掉前面所有的UI */
    private hideBeforePageUI() {
        for (let i = this._uiStack.length - 1; i >= 0; i--) {
            let view: UIView = this._uiStack[i].view;
            view._view.visible = false;
            //@ts-ignore
            view.doClose(true);
            LayerManager.ins().addPool(view._view);
            if (view._viewType == ViewType.Page) {
                break;
            }
        }
    }

    /**显示前面页所有的UI */
    private showBeforePageUI() {
        let infos: UIInfo[] = [];
        for (let i = this._uiStack.length - 1; i >= 0; i--) {
            let view: UIView = this._uiStack[i].view;
            infos.push(this._uiStack[i]);
            if (view._viewType == ViewType.Page) {
                break;
            }
        }

        for (let i = infos.length - 1; i >= 0; i--) {
            let view = infos[i].view;
            LayerManager.ins().addChild(view.layerType, view._view);
            view._view.visible = true;
            //@ts-ignore
            view.doOpen(infos[i].args, true);
        }
    }

    /**
     * 关闭从 startUiKey 到 endUiKey 之间的所有视图。
     * 如果 includeEnd 为 true，则包括 endUiKey 对应的视图也会被关闭。
     * 该方法会从当前栈顶开始遍历，找到 startUiKey 后开始关闭后续的视图，直到遇到 endUiKey。
     *
     * @param startUiKey 起始视图的键值
     * @param endUiKey 结束视图的键值
     * @param includeEnd 是否包括结束视图，默认为 false
     */
    public closeBetweenView(startUiKey: string, endUiKey: string, includeEnd: boolean = false) {
        let isStart = false;
        for (let i = this._uiStack.length - 1; i >= 0; i--) {
            if (isStart) {
                if (endUiKey == this._uiStack[i].uiKey) {
                    if (includeEnd) {
                        this.doCloseView(this._uiStack[i].view);
                    }
                    break;
                } else {
                    this.doCloseView(this._uiStack[i].view);
                }
            } else if (startUiKey == this._uiStack[i].uiKey) {
                isStart = true;
            }
        }
    }

    /**是否正在加载UI*/
    public get isLoadingUI():boolean {
        return this._loadingCnt > 0;
    }

    /************************************************** 子界面 **************************************************/
    /**重用子界面 */
    private onReopenSubview(parent: fgui.GComponent, uiKey: string, args: object) {
        let uiView = this._map[uiKey];
        this.doClose(uiKey, true);

        parent.addChild(uiView._view);
        //@ts-ignore
        uiView.doOpen(args);
        return uiView;
    }

    /**
     * 打开 UI 子界面
     * @param keyObj UI Key
     * @param args 参数对象
     * @param completeCallback open 成功后的
     */
    openSubview<T extends UIView>(parent: fgui.GComponent, keyObj: string | UIBindingKey<T>, args?: object, completeCallback?: () => void) {
        let uiKey: string = keyObj instanceof UIBindingKey ? keyObj.key : keyObj;
        let UIClass: typeof UIView = UIScriptManager.getViewScriptClass(uiKey);
        if (!UIClass) {
            return;
        }

        if (this._map[uiKey]) {
            this.onReopenSubview(parent, uiKey, args);
            if (completeCallback) completeCallback();
            G.FacadeManager.emit(BaseNotificationKey.OPEN_ViEW, uiKey);
            return;
        }

        const fguiPackageName = UIClass.pkgName;
        let preloadRes = UIClass.preloadRes(args);
        this.loadPkg([fguiPackageName], preloadRes, uiKey, (state) => {
            if (state) {
                // 这个 onLoad 里面进行了同步的 FGUI 创建节点
                const uiView = this.onLoadSubView(parent, uiKey, args);
                if (!uiView) return;
                uiView._view.node.name = uiKey;
                if (completeCallback) completeCallback();
                Logger.system("打开界面，nema = " + uiKey);
                G.FacadeManager.emit(BaseNotificationKey.OPEN_ViEW, uiKey);
            }
        });
    }

    /**
     * 加载 UI 界面
     * @param uiKey UI 唯一名称
     * @param args 参数
     */
    private onLoadSubView(parent: fgui.GComponent, uiKey: string, args: Object): UIView {
        if (parent.isDisposed) {
            //父节点已经被销毁
            return;
        }

        if (this._map[uiKey]) {
            //在open 已有处理
            return this.onReopenSubview(parent, uiKey, args);
        }

        let UIClass = UIScriptManager.getViewScriptClass(uiKey);

        let uiView: UIView = new UIClass();

        if (uiView.layerType !== EnumUIViewLayer.SUBVIEW) {
            throw new Error(`添加子界面: uiKey => ${uiKey} != SUBVIEW`);
        }
        uiView._viewType = ViewType.View;

        // create node by FGUI
        let view = fgui.UIPackage.createObject(UIClass.pkgName, UIClass.viewName).asCom;

        uiView._view = view;
        //@ts-ignore
        uiView._classKey = uiKey;

        parent.addChild(uiView._view);

        Logger.startLowTime(uiKey);

        //@ts-ignore
        uiView.doInit();
        //@ts-ignore
        uiView.doOpen(args);

        Logger.endLowTime(uiKey);

        this._map[uiKey] = uiView;

        return uiView;
    }

    getLayerChildCount(layer: EnumUIViewLayer): number {
        return LayerManager.ins().getLayerChildCount(layer);
    }
}

window["UIManager"] = UIManager;
