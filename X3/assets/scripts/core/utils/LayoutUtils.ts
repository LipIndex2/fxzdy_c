import { ScreenAdaptManager } from "../comm/ScreenAdaptManager";
import * as fgui from "fairygui-cc";


/**
 * 排版相关工具
 */

export class LayoutUtils {

    /**
     * 对显示的子组件垂直居中 (未测试验证)
     * @param relative  相对组件
     * @param children 子组件列表
     * @param gap 间隙 可以是负值
     * @param isBrother 与相对组件是兄弟组件
     */
    static verticalCenter(relative: fgui.GObject, children: fgui.GObject[], gap: number = 0, isBrother: boolean = false) {
        if (!relative && children.length <= 0) return;
        let ph = relative.height;
        let th = 0;
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            if (node.visible) {
                if (th > 0) th += gap;
                th += (node.height * node.scaleY);
            }
        }

        let y = (ph - th) / 2;
        if (isBrother) {
            let ry = relative.pivotAsAnchor ? relative.y - (relative.pivotY * relative.height * relative.scaleY) : relative.y;
            y = y + ry;
        }

        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            if (node.visible) {
                if (node.pivotAsAnchor) {
                    node.y = y + node.height * node.scaleY * node.pivotY;
                } else {
                    node.y = y - node.height * (1 - node.scaleY) * node.pivotY;
                }
                y += gap + node.height * node.scaleY;
            }
        }
    }


    /**
     * 对显示的子组件水平居中 (未测试验证)
     * @param relative  相对组件
     * @param children 子组件列表
     * @param gap 间隙 可以是负值
     * @param isBrother 与相对组件是兄弟组件
     */
    static horizontalCenter(relative: fgui.GObject, children: fgui.GObject[], gap: number = 0, isBrother: boolean = false) {
        if (!relative && children.length <= 0) return;
        let pw = relative.width;
        let tw = 0;
        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            if (node.visible) {
                if (tw > 0) tw += gap;
                tw += (node.width * node.scaleX);
            }
        }

        let x = (pw - tw) / 2;
        if (isBrother) {
            let rx = relative.pivotAsAnchor ? relative.x - (relative.pivotX * relative.width * relative.scaleX) : relative.x;
            x = x + rx;
        }

        for (let i = 0; i < children.length; i++) {
            let node = children[i];
            if (node.visible) {
                if (node.pivotAsAnchor) {
                    node.x = x + node.width * node.scaleX * node.pivotX;
                } else {
                    node.x = x - node.width * (1 - node.scaleX) * node.pivotX;;
                }
                x += gap + node.width * node.scaleX;
            }
        }
    }

    /** 锚点位置顶对齐顶部 （适配全面屏）
     * @param view 适配对象
     * @param adaptScale 是否进行长屏放大适配
    */
    static setScreenTop(view: fgui.GObject, adaptScale: boolean = true) {
        let pos = fgui.GRoot.inst.localToGlobal(0, 0);
        pos = view.parent.globalToLocal(0, pos.y);
        view.y = pos.y;
        if (adaptScale) {
            view.setScale(ScreenAdaptManager.bgScale, ScreenAdaptManager.bgScale);
        }
    }

    /** 锚点位置底对齐底部 （适配全面屏）
     * @param view 适配对象
     * @param adaptScale 是否进行长屏放大适配
    */
    static setScreenBottom(view: fgui.GObject, adaptScale: boolean = true) {
        let pos = fgui.GRoot.inst.localToGlobal(0, fgui.GRoot.inst.height);
        pos = view.parent.globalToLocal(0, pos.y);
        view.y = pos.y;
        if (adaptScale) {
            view.setScale(ScreenAdaptManager.bgScale, ScreenAdaptManager.bgScale);
        }
    }

    /** 锚点位置中间对齐 （适配全面屏）
     * @param view 适配对象
     * @param adaptScale 是否进行长屏放大适配
    */
    static setScreenCenter(view: fgui.GObject, adaptScale: boolean = true) {
        let pos = fgui.GRoot.inst.localToGlobal(fgui.GRoot.inst.width * 0.5, fgui.GRoot.inst.height * 0.5);
        let point = view.parent.globalToLocal(pos.x, pos.y);
        view.x = point.x;
        view.y = point.y;
        if (adaptScale) {
            view.setScale(ScreenAdaptManager.bgScale, ScreenAdaptManager.bgScale);
        }
    }
}

