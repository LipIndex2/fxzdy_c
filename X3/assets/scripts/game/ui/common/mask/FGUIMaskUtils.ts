import { EnumUIColor } from "../../../../core/mvc/ui/EnumUIColor";
import { Vec3 } from "cc";
import FGUI from "db://assets/scripts/core/fgui/FGUI";


/**
 * FGUI 遮罩工具
 */
export class FGUIMaskUtils {

    /**
     * 创建背景遮罩
     * @param uiView FGUI 打开的 UI
     */
    static createBackgroundMask(uiView: FGUI.GComponent): FGUI.GGraph {
        // 背包的背景遮罩
        const fguiGraph = new FGUI.GGraph();
        let parent = uiView.parent;
        if (parent == null) {
            return;
        }

        // width first
        fguiGraph.width = parent.width * 2;
        fguiGraph.height = parent.height * 2;
        if (parent.height > 0) {
            const diffY = parent.height / 2;
            const diffX = parent.width / 2;
            fguiGraph.node.setPosition(new Vec3(-diffX, diffY, 0));
        }

        fguiGraph.addRelation(uiView, FGUI.RelationType.Size);
        const fillColor = EnumUIColor.COLOR_FOR_BACKGROUND_MASK
        fguiGraph.drawRect(1, fillColor, fillColor)
        uiView.addChildAt(fguiGraph, 0)
        return fguiGraph
    }
}