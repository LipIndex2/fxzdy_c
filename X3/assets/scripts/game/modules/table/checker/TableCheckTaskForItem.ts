import {ITableCheckTask} from "db://assets/scripts/game/modules/table/TableCheckerManager";
import G from "db://assets/scripts/core/comm/G";


/**
 * 道具业务检查
 */
export class TableCheckTaskForItem implements ITableCheckTask{
    
    taskName(): string {
        return "Item 道具检查";
    }
    
    
    
    checkBusinessIsOk(): boolean {

        // 来源途径
        const comFromItemIdArray = G.TableManager.getAllData(table.item.ItemComeFromConfig)
            .toDataStream()
            .distinct((it) => it.itemId)
            .map((it) => it.itemId)
            .toList();
        for (let comeFromItemId of comFromItemIdArray) {
            const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, comeFromItemId);
            if (!itemConfig) {
                G.Logger.error(`ItemComeFromConfig 表中, 配置了不存在的 itemId = ${comeFromItemId}`)
            }
        }
        return true;
    }

    getErrorTipsStr(): string {
        return "道具配置表关系有问题，请检查";
    }
    
    
}