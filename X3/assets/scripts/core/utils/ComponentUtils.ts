

import {__private, Component, Node, Constructor, UITransform} from 'cc';

/**
 * cc Component 工具
 */
export class ComponentUtils {

    /**
     * 必定获得 Component
     * @param node 节点
     * @param componentType 组件
     */
    static getOrCreateComponent<T extends Component>(node: Node,
                                                     componentType: __private._types_globals__Constructor<T>
    ): T {
        let component = node.getComponent(componentType);

        if (!component) {
            component = node.addComponent(componentType);
        }

        return component;
    }


    static createNodeWithComponent<T extends Component>(type: Constructor<T>,
                                                        parent: Node,
    ): T {
        const node: any = new Node();
        node.addComponent(UITransform);
        const component = node.getComponent(type) || node.addComponent(type);
        node.parent = parent;
        node.layer = parent.layer;
        return component;
    }

}
