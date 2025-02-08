import FGUI from "db://assets/scripts/core/fgui/FGUI";

/**
 * GList 工具
 */
export class FguiGListUtils {

    /**
     * 可以看到的最大 index
     * @param glist
     */
    static getCanSeeMaxIndex(glist: FGUI.GList): number {
        const scrollPane = glist.scrollPane;
        if (!scrollPane) {
            return 0;
        }

// 获取当前的垂直滚动位置
        const currentPosY = scrollPane.posY;

// 获取列表项的高度（假设所有列表项高度相同）
        const itemHeight = Math.max(1, glist.virtualItemSize.height + glist.lineGap);

// 获取当前可视范围内的最大索引
        const visibleItemCount = Math.ceil(scrollPane.viewHeight / itemHeight);
        const startIndex = Math.floor(currentPosY / itemHeight);
        const maxVisibleIndex = startIndex + visibleItemCount - 1;
        // no oo count
        const canSeeMaxIndex = Math.min(maxVisibleIndex, glist.numItems - 1);

        return canSeeMaxIndex;
    }

    /**
     * 可以看到的最小 index
     * @param glist
     */
    static getCanSeeMinIndex(glist: FGUI.GList): number {
        const scrollPane = glist.scrollPane;
        if (!scrollPane) {
            return 0;
        }

// 获取当前的垂直滚动位置
        const currentPosY = scrollPane.posY;
        
        // item
        const itemHeight = Math.max(1, glist.virtualItemSize.height + glist.lineGap);

        // calc
        const visibleItemCount = Math.ceil(scrollPane.viewHeight / itemHeight);
        const startIndex = Math.floor(currentPosY / itemHeight);
        return startIndex;
    }

}