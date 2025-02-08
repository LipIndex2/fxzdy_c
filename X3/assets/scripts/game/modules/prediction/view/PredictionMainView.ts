import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { PredictionUiKey } from "../const/PredictionConst";

/**
 * 功能预告
 */
@bindScript(PredictionUiKey.PredictionMainView)
export class PredictionMainView extends UICommWin {
    static pkgName: string = "prediction";
    static viewName: string = "PredictionMainView";
    private get view(): ui.prediction.PredictionMainView {
        return this._view as any;
    }

    private _allCfg: table.preview.PreviewConfig[];

    listenNotifications(): string[] {
        return [NotificationKey.SYSTEM_OPEN_FUNCTION, NotificationKey.FUNCTION_NOTICE_UPDATE];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_OPEN_FUNCTION:
            case NotificationKey.FUNCTION_NOTICE_UPDATE:
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        this.view.list_award.itemRenderer = this.renderItem.bind(this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        // GIns.predictionModel.sendGetPreviewInfo();
        this.updateUI();
    }

    private updateUI() {
        this._allCfg = GIns.predictionMgr.previewConfig;

        this._allCfg.sort((a, b) => {
            if (GIns.predictionMgr.receivedPreviewIds.indexOf(a.id) != GIns.predictionMgr.receivedPreviewIds.indexOf(b.id)) {
                let aIndex = GIns.predictionMgr.receivedPreviewIds.indexOf(a.id);
                let bIndex = GIns.predictionMgr.receivedPreviewIds.indexOf(b.id);

                if ((aIndex == -1 || bIndex == -1) && aIndex != bIndex) {
                    return GIns.predictionMgr.receivedPreviewIds.indexOf(a.id) - GIns.predictionMgr.receivedPreviewIds.indexOf(b.id);
                }
                if (a.sort != b.sort) {
                    return a.sort - b.sort;
                }
            }
        });

        this.view.list_award.numItems = GIns.predictionMgr.previewConfig.length;
    }

    private renderItem(index: number, item: ui.prediction.PredictionAwardItem) {
        let cfg = this._allCfg[index];
        item.img_icon.icon = cfg.icon;
        item.T_title.text = cfg.name;
        if (cfg.type == 1) {
            //主线任务
            let taskId = GIns.trunkTaskModel.getCurrentTaskId();
            item.T_desc.text = `再完成${cfg.condition - taskId}个主线任务后开启`;
        } else if (cfg.type == 2) {
            item.T_desc.text = cfg.desc;
        }
        let ItemFrameBtn = item.item as any;
        ItemFrameBtn.reset(cfg.rewards[0].k, cfg.rewards[0].v);
        ItemFrameBtn.clearAnim();
        item.getController("c1").selectedIndex = 0;
        if (GIns.predictionMgr.openPreviewIds.indexOf(cfg.id) != -1) {
            if (GIns.predictionMgr.receivedPreviewIds.indexOf(cfg.id) == -1) {
                item.getController("c1").selectedIndex = 1;
                ItemFrameBtn.playEffect();
                ItemFrameBtn.isCanClick(false);
                ItemFrameBtn.clearClick();
            } else {
                item.getController("c1").selectedIndex = 2;
                ItemFrameBtn.isCanClick(true);
            }
            item.T_desc.text = cfg.desc;
        }

        ItemFrameBtn.onClick(() => {
            if (item.getController("c1").selectedIndex == 1) {
                GIns.predictionModel.sendReceivePreviewReward(cfg.id);
            }
        }, this);

        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.FunctionPreview_task, [cfg.id]);
    }
}
