import { EventTouch, UITransform, v2, Vec3 } from "cc";
import G from "../comm/G";
import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Vec2 } from "cc";

export enum EnumOpenSide {

    // 上
    TOP = "top",
    // 下
    BOTTOM = "bottom",
    // 左
    LEFT = "left",
    // 右
    RIGHT = "right",
}

/**
 * 触摸检测工具
 */
export class TouchUtils {


    /**
     * 计算 FGUI 打开的 UI 坐标
     * @param clickItemUITransform
     * @param openUITransform
     * @param side
     * @param sideToOffsetFunc 方向对应的偏移
     */
    @LogBusiness("FGUI 计算打开位置")
    static calculateFguiOpenUILocalPosition(
        clickItemUITransform: UITransform,
        openUITransform: UITransform,
        side: EnumOpenSide,
        sideToOffsetFunc: (side: EnumOpenSide) => Vec2 | null,
    ): Vec3 {
        // 转换点击UI的世界坐标
        const clickItemWorldPos = clickItemUITransform.convertToWorldSpaceAR(Vec3.ZERO);

        // 计算打开UI的位置
        const newV3 = new Vec3();

        const xF = clickItemWorldPos.x;
        const yF = -(-clickItemWorldPos.y + G.Canvas.getComponent(UITransform).height);

        const weightForOpenUI = clickItemUITransform.width;
        const heightForOpenUI = clickItemUITransform.height;

        let offset = v2(0, 0);
        if (sideToOffsetFunc) {
            offset = sideToOffsetFunc(side);
        }
        
        switch (side) {
            case EnumOpenSide.TOP:
                newV3.x = xF
                    + offset.x;
                newV3.y = yF
                    - heightForOpenUI
                    - offset.y;
                break;
            case EnumOpenSide.BOTTOM:
                newV3.x = xF
                    + offset.x;
                newV3.y = yF
                    + heightForOpenUI
                    + offset.y;
                break;
            // ... 其他方向的计算 ...
        }

        // return G.CameraForUI.convertToUINode(openUIWorldPos, openUITransform.node).clone();
        return newV3.clone();
    }


    /**
     * 是否点击在 UI 内部
     * @param event 触摸事件
     * @param uiTransform UI 节点的 transform
     */
    static isTouchInUi(event: EventTouch, uiTransform: UITransform): boolean {
        // ui 位置
        let uiPos = event.getUILocation(v2(0, 0));
        let boundingBox = uiTransform.getBoundingBoxToWorld();
        return boundingBox.contains(uiPos);
    }

    /**
     * 根据点击的 UI 节点获取打开方向
     * @param uiTransform
     */
    static getOpenSideByClickItemUI(uiTransform: UITransform): EnumOpenSide {
        const canvasCenterWorldPosition: Vec3 = G.CanvasCenterWorldPosition;

        const uiWorldPosition: Vec3 = uiTransform.node.worldPosition;

        // 在上方 return 往下打开
        return uiWorldPosition.y > canvasCenterWorldPosition.y ? EnumOpenSide.TOP : EnumOpenSide.BOTTOM;
    }

    /**
     * FGUI 是否点击在 UI 内部
     * @param event
     * @param uiTransform
     */
    static isFguiTouchInUi(event: fgui.Event, uiTransform: UITransform): boolean {
        // ui 位置
        let uiPos = event.pos.clone();

        // 将 FGUI 触摸事件坐标转换为全局坐标
        let boundingBox = uiTransform.getBoundingBoxToWorld();
        return boundingBox.contains(uiPos);
    }

}