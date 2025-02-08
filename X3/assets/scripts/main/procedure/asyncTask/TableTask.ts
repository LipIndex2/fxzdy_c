import { TableManager } from "../../../core/table/TableManager";
import { Task } from "../../../core/task/TaskManager";
import { DebugUtils } from "../../../core/utils/DebugUtils";

/**
 * 数据表
 */
export default class TableTask extends Task {
    run(args?: any): void {
        DebugUtils.isDebugMode() && console.log(">> run TableTask");
        if (TableManager.isComplete()) {
            this.parseComplete(args);
        } else if (TableManager.isLoaded()) {
            TableManager.parserTableContinue(this.parseComplete.bind(this, args));
        }
        else {
            TableManager.loadTable(this.onLoadComplete.bind(this, args));
        }
    }

    private onLoadComplete(args: any, buffer: ArrayBuffer) {
        if (!buffer) {
            console.log('load_table_fail');
            return;
        }
        TableManager.parserTableByZipData(buffer, this.parseComplete.bind(this, args));
    }

    private parseComplete(args: any) {
        DebugUtils.isDebugMode() &&  console.log("Table complete");
        // 加载完成
        this.end();
    }
}