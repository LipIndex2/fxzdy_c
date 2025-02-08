import { Rect } from "cc";
import { isValid, Node } from "cc";

/**
 * cocos node 工具
 */
export class NodeUtils {

    private static _tempNodeRect: Rect = new Rect();

    /**
     * 是否合法节点
     * @param node
     * @param strictMode 严厉模式，将销毁也属于非法
     */
    static isValidNode(node: Node, strictMode?: boolean): boolean {
        if (node == null) {
            return false;
        }
        return isValid(node, strictMode);
    }

    /**非法节点 ?
     * @param node
     * @param strictMode 严厉模式，将销毁也属于非法
    */
    static isNotValidNode(node: Node, strictMode?: boolean): boolean {
        return !this.isValidNode(node, strictMode);
    }

    // 是否活跃节点
    static isActive(node: Node): boolean {
        if (!node || !node.active) return false;
        if (node.name != "Canvas") {
            return this.isActive(node.parent);
        }
        return true;
    }

    /**获取节点范围 */
    static tempRect(node: Node): Rect {
        if (!node?._uiProps) return this._tempNodeRect.set(0, 0, 0, 0);

        const width = node._uiProps.uiTransformComp.width;
        const height = node._uiProps.uiTransformComp.height;
        const anchorX = node._uiProps.uiTransformComp.anchorX;
        const anchorY = node._uiProps.uiTransformComp.anchorY;
        const x = node.position.x;
        const y = node.position.y;
        this._tempNodeRect.set(
            x - anchorX * width,
            y - anchorY * height,
            width,
            height,
        );
        return this._tempNodeRect;
    }
}