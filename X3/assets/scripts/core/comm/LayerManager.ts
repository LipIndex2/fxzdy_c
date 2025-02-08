import { director, Node } from "cc";
import BaseSingleton from "../base/BaseSingleton";
import * as fgui from "fairygui-cc";

/**
 * UI 层级
 */
export enum EnumUIViewLayer {
    /**子界面 (内嵌界面)*/
    SUBVIEW = -1,
    /** 地图背景层 （不可触控）*/
    BACKGROUND = 1,
    /** 控制层*/
    CONTROLLER,
    // UI 层 | default
    UI,
    //引导层
    GUIDE,
    //警告层
    WARN,
    //提示层
    TIPS,
}


/** 界面层级管理器 */
export class LayerManager extends BaseSingleton {

    private _layerMap: Map<EnumUIViewLayer, fgui.GComponent> = new Map();
    private _cachePoolLayer: fgui.GComponent;
    private isInit = false;

    init() {
        if (this.isInit) return;
        this.isInit = true;

        this.initLayers();
        this.initViewPool();
    }

    private initViewPool() {
        let layerNode = new fgui.GComponent();
        layerNode.node.name = "CACHE_POOL";
        fgui.GRoot.inst.addChild(layerNode);

        layerNode.visible = false; //不需要显示
        this._cachePoolLayer = layerNode;
    }

    /**初始化层级 */
    private initLayers() {
        let fguiRoot = fgui.GRoot.create();
        let start = EnumUIViewLayer.BACKGROUND;
        let end = EnumUIViewLayer.TIPS;
        for (let index = start; index <= end; index++) {
            let layerNode = new fgui.GComponent();
            layerNode.node.name = EnumUIViewLayer[index];
            layerNode.width = fguiRoot.width;
            layerNode.height = fguiRoot.height;
            this._layerMap.set(index, layerNode);

            if (index == EnumUIViewLayer.BACKGROUND) {
                //在地图层
                let bgRoot = director.getScene().getChildByPath("Canvas/Background");
                bgRoot.addChild(layerNode.node);
                let scale = bgRoot.getScale();
                let pos = fguiRoot.node.getPosition();
                layerNode.node.setScale(scale.x, scale.y);
                layerNode.node.setPosition(pos.x * scale.x, pos.y * scale.y);
            } else {
                //UI层
                fguiRoot.addChild(layerNode);
            }
        }

        fguiRoot.on(fgui.Event.SIZE_CHANGED, this.onResize, this);
    }

    /**添加界面 */
    addChild(layerId: EnumUIViewLayer, node: fgui.GComponent) {
        let layer = this._layerMap.get(layerId);
        if (!layer) {
            throw new Error(`不存在的层级 ${layerId}:${EnumUIViewLayer[layerId]}`);
        }
        layer?.addChild(node);
    }

    onResize() {
        let fguiRoot = fgui.GRoot.inst;
        let start = EnumUIViewLayer.BACKGROUND;
        let end = EnumUIViewLayer.TIPS;
        for (let index = start; index <= end; index++) {
            let layerNode = this._layerMap.get(index);
            layerNode.width = fguiRoot.width;
            layerNode.height = fguiRoot.height;

            if (index == EnumUIViewLayer.BACKGROUND) {
                let bgRoot = director.getScene().getChildByPath("Canvas/Background");
                let scale = bgRoot.getScale();
                let pos = fguiRoot.node.getPosition();
                layerNode.node.setScale(scale.x, scale.y);
                layerNode.node.setPosition(pos.x * scale.x, pos.y * scale.y);
            }
        }
    }

    /**加入缓存池 */
    addPool(node: fgui.GComponent) {
        node.removeFromParent();
        this._cachePoolLayer.addChild(node);
    }

    getLayerChildCount(la: EnumUIViewLayer): number {
        return this._layerMap.get(la)?.numChildren || 0;
    }
}