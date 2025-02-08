import { v2, Vec2 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { TableManager } from "db://assets/scripts/core/table/TableManager";

// 主线任务
export class TrunkTaskUtils {

    // 完成时动画
    static readonly completeSpineAssetPath = "TrunkTask:completeSpineAssetPath";
    // spine 偏移
    static readonly spineRootOffsetVec3 = "TrunkTask:completeSpineRootOffsetVec3";
    /**任务最少展示时间 */
    static readonly showTaskMinTime = "TrunkTask:ShowTaskMinTime";


    // 动画路径
    static getTrunkTaskCompleteSpineAssetPath(): string {
        return G.TableManager.getDataById(table.trunktask.TrunkTaskKvConfig, this.completeSpineAssetPath)?.content;
    }

    // 动画路径
    static getShowTaskMinTime(): number {
        return Number(G.TableManager.getDataById(table.trunktask.TrunkTaskKvConfig, this.showTaskMinTime)?.content);
    }

    // 动画 offset Vec3
    static getSpineRootOffsetVec3(): Vec2 {
        const str = G.TableManager.getDataById(table.trunktask.TrunkTaskKvConfig, this.spineRootOffsetVec3)?.content || "[0, 0]";
        try {
            const array = JSON.parse(str);
            return v2(array[0], array[1]);
        } catch (e) {
            return v2(0, 0);
        }
    }
}