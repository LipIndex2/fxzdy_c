import { NodeEventType } from "cc";
import * as fgui from "fairygui-cc";

/**直接使用cocos node的fgui组件 */
export default class FGUICocosNodeComponent extends fgui.GComponent {
    onConstruct() {
        super.onConstruct();
        this.node.on(NodeEventType.NODE_DESTROYED, this.dispose.bind(this));
    }
}
