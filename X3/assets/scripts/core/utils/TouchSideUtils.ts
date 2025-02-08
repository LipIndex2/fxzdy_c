import {ccenum, EventTouch, UITransform, Vec2} from "cc";
import G from "db://assets/scripts/core/comm/G";

export enum EnumTouchSide {
    // 未命中
    NULL = "null",

    // 坐上
    LEFT_TOP = "left-top",
    // 右上
    RIGHT_TOP = "right-top",
    // 左下
    LEFT_BOTTOM = "left-bottom",
    // 右下
    RIGHT_BOTTOM = "right-bottom",
}

ccenum(EnumTouchSide)


/**
 * 触摸区域计算工具
 */
export class TouchSideUtils {

    /**
     * 基于画布计算
     * @param event 点击事件
     */
    public static getTouchSideInCanvas(event: EventTouch): EnumTouchSide {
        try {
            const canvasUI = G.Canvas.getComponent(UITransform);
            return TouchSideUtils.getTouchSide(canvasUI, event);
        } catch (error) {
            console.error(error);
            return EnumTouchSide.NULL;
        }
    }

    /**
     * 获取触摸方位
     * @param uiPos
     */
    public static getTouchSideByPosInCanvas(uiPos: Vec2): EnumTouchSide {
        try {
            const canvasUI = G.Canvas.getComponent(UITransform);
            return TouchSideUtils.getTouchSideByUILocation(canvasUI, uiPos);
        } catch (error) {
            console.error(error);
            return EnumTouchSide.NULL;
        }
    }

    /**
     * 触摸位置在 Canvas 的哪里
     * @param touchLocation
     */
    public static getTouchSideInCanvasByClickPos(touchLocation: Vec2): EnumTouchSide {
        try {
            const canvasUI = G.Canvas.getComponent(UITransform);
            return TouchSideUtils.getTouchSideByUILocation(canvasUI, touchLocation);
        } catch (error) {
            console.error(error);
            return EnumTouchSide.NULL;
        }
    }

    /**
     * 获取触摸位置
     * @param touchArea 触摸区域
     * @param event 触摸事件
     * @returns 触摸位置
     */
    public static getTouchSide(touchArea: UITransform, event: EventTouch): EnumTouchSide {

        if (!event) {
            return EnumTouchSide.NULL;
        }
        if (!event.type) {
            return EnumTouchSide.NULL;
        }
        // 只处理 cocos 原生 event
        if (event.type !== "touch-end") {
            return EnumTouchSide.NULL;
        }

        // 触摸位置
        const touchLocation = event.getUILocation();

        return TouchSideUtils.getTouchSideByUILocation(touchArea, touchLocation);
    }

    public static getTouchSideByUILocation(touchArea: UITransform,
                                           touchLocation: Vec2
    ): EnumTouchSide {
        // 不含有这个触摸
        const touchBoundingBox = touchArea.getBoundingBoxToWorld();
        if (!touchBoundingBox.contains(touchLocation)) {
            return EnumTouchSide.NULL;
        }


        // ui
        const screenSize = touchArea.node.getComponent(UITransform).contentSize;
        const screenX = touchLocation.x / screenSize.x;
        const screenY = touchLocation.y / screenSize.y;


        // Determine the touch side based on screen coordinates
        let touchSide = EnumTouchSide.NULL
        if (screenX < 0.5 && screenY > 0.5) {
            touchSide = EnumTouchSide.LEFT_TOP;
        } else if (screenX > 0.5 && screenY > 0.5) {
            touchSide = EnumTouchSide.RIGHT_TOP;
        } else if (screenX < 0.5 && screenY < 0.5) {
            touchSide = EnumTouchSide.LEFT_BOTTOM;
        } else if (screenX > 0.5 && screenY < 0.5) {
            touchSide = EnumTouchSide.RIGHT_BOTTOM;
        }

        return touchSide
    }

    /**
     * FGUI 触摸位置在 Canvas 的哪里
     * @param event
     */
    static getTouchSideByFgui(event: fgui.Event) {
        const touchLocation = event.pos.clone();
        return this.getTouchSideInCanvasByClickPos(touchLocation)
    }
}