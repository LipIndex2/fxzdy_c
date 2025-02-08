import { Rect, Vec2 } from "cc";


/**
 * 对象池继承基类
 */
export interface IPosition {
    /**
     * 获取位置
     */
    get pos(): Vec2;
    /***是否可以选择 */
    // canSelect(): boolean;
}

/**
 * 矩形接口，定义了矩形对象的基本属性和方法。
 * @property {Rect} rect - 获取矩形对象。
 * @method {boolean} isTrueInside?(point: Vec2) - 判断点是否在内部，可选方法。
 */
export interface IRect {
    /**获取箱体 */
    get rect(): Rect;

    /**是否在内部，一般用于多边形计算 */
    isInside?(point: Vec2): boolean;
}
