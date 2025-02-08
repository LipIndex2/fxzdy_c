import { Node, director } from "cc";
import BaseSingleton from "../../../core/base/BaseSingleton";

/**
 * WorldManager世界管理类
 */
export class WorldManager extends BaseSingleton {

    /**角色底下层 */
    private _underLayer: Node;

    /**隐藏层 用于节点隐藏 */
    private _hideLayer: Node;

    /**背景层 */
    private _bgLayer: Node;

    /**阴影层 */
    private _shadowLayer: Node;

    /**角色层 */
    private _roleLayer: Node;

    /**特效层 */
    private _effectLayer: Node;

    /**特效次高层 */
    private _effectSecondTopLayer: Node;

    /**特效最高层 */
    private _effectTopLayer: Node;

    /**飘字层 */
    private _floatLayer: Node;

    // UI层
    private _uiLayer: Node;

    // 提示层
    private _tipsLayer: Node;

    /**角色底下层 */
    public get underLayer() {
        return this._underLayer;
    }

    /**隐藏层 用于动态节点隐藏*/
    public get hideLayer() {
        return this._hideLayer;
    }

    /**背景层 */
    public get bgLayer() {
        return this._bgLayer;
    }

    /**阴影层 */
    public get shadowLayer() {
        return this._shadowLayer;
    }

    /**角色层 */
    public get roleLayer() {
        return this._roleLayer;
    }

    /**特效层 */
    public get effectLayer() {
        return this._effectLayer;
    }

    /**特效次高层 */
    public get effectSecondTopLayer() {
        return this._effectSecondTopLayer;
    }

    /**特效最高层 */
    public get effectTopLayer() {
        return this._effectTopLayer;
    }

    /**飘字层 */
    public get floatLayer() {
        return this._floatLayer;
    }

    /**UI层 */
    get uiLayer(): Node {
        return this._uiLayer;
    }

    /**提示层 */
    get tipsLayer(): Node {
        return this._tipsLayer;
    }

    protected createLayer(root: Node, name: string) {
        const layer = new Node;
        layer.name = name;
        root.addChild(layer);
        return layer;
    }

    /**初始化世界层级 */
    public initWorldLayer(root: Node, upperRoot: Node, underLayer?: Node) {
        this._underLayer = underLayer ? this.createLayer(underLayer, "underLayer") : null;
        this._hideLayer = this.createLayer(root, "hideLayer");
        this._bgLayer = this.createLayer(root, "bgLayer");
        this._shadowLayer = this.createLayer(root, "shadowLayer");
        this._roleLayer = this.createLayer(root, "roleLayer");
        this._effectLayer = this.createLayer(root, "effectLayer");
        this._effectSecondTopLayer = this.createLayer(root, "effectSecondTopLayer");
        this._effectTopLayer = this.createLayer(root, "effectTopLayer");
        this._floatLayer = this.createLayer(upperRoot, "floatLayer");
        this._uiLayer = this.createLayer(upperRoot, "uiLayer");
        this._tipsLayer = this.createLayer(upperRoot, "tipsLayer");

        this._hideLayer.active = false;
    }
}