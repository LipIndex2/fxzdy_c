import BaseSingleton from "../../../core/base/BaseSingleton";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";

/** 活动预告 */
export class PredictionManager extends BaseSingleton {
    private _receivedPreviewIds: number[] = [];

    private _previewConfig: table.preview.PreviewConfig[] = [];

    //已开启的预告配置Id列表
    private _openPreviewIds: number[] = [];

    /** 配置 */
    public get previewConfig(): table.preview.PreviewConfig[] {
        if (this._previewConfig.length == 0) {
            this._previewConfig = TableManager.getAllData(table.preview.PreviewConfig);

            this._previewConfig.sort((a, b) => a.sort - b.sort);
        }

        return this._previewConfig;
    }

    /** 已领取奖励的预告配置Id列表 */
    public set receivedPreviewIds(value: number[]) {
        this._receivedPreviewIds = value;
    }
    public get receivedPreviewIds(): number[] {
        return this._receivedPreviewIds;
    }

    /** 添加已领取的奖励id */
    public addReceivedPreviewIds(id: number) {
        this._receivedPreviewIds.push(id);
    }

    /** 已开启的配置id */
    public get openPreviewIds() {
        return this._openPreviewIds;
    }

    /** 获取下一个未开启的功能配置 */
    public getNextPreviewConfig(): table.preview.PreviewConfig | null {
        let cfg;
        let previewConfig = this.previewConfig;
        for (let i = 0; i < previewConfig.length; i++) {
            let config = previewConfig[i];
            if (this._openPreviewIds.indexOf(config.id) == -1) {
                if (GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType[config.systemType])) {
                    this._openPreviewIds.push(config.id);
                } else {
                    if (!cfg) cfg = config;
                }
            }
        }
        return cfg;
    }

    /** 判断功能入口是否显示 */
    public isShowPreview(): boolean {
        return !this.getNextPreviewConfig() && this.receivedPreviewIds.length >= this.previewConfig.length;
    }
}
