import { Tween, tween } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import { QualityUtils } from "../../../common/quality/QualityUtils";

/**
 * 职业招募banner弹框item
 */
@bindFguiExtension("ui://activityAutoPop/ActivityAutoPopZYZMItem")
export class ActivityAutoPopZYZMItem extends fgui.GComponent {
    static pkgName: string = "activityAutoPop";
    static viewName: string = "ActivityAutoPopZYZMItem";

    protected _itemId: number = 0;
    protected _isInitY: boolean = false;
    protected _initY: number = 0;

    private get view(): ui.activityAutoPop.item.ActivityAutoPopZYZMItem {
        return this as any;
    }

    protected onInit(): void {

    }

    protected onPreDispose() {
        Tween.stopAllByTarget(this.view);
    }

    public setItemId(itemId: number): void {
        if (this._itemId != itemId) {
            this._itemId = itemId;
            let cfg = G.TableManager.getDataById(table.item.ItemConfig, itemId);
            if (cfg) {
                this.view.iconItem.iconLoader.icon = cfg.iconPath;
                let qualityCfg = QualityUtils.getQualityConfigById(cfg.quality);
                if (qualityCfg) {
                    this.view.bgLoader.icon = qualityCfg.drawHeadBg;
                }
            }
            if (this._isInitY == false) {
                this._isInitY = true;
                this._initY = this.view.y;
            }

            Tween.stopAllByTarget(this.view);
            let num = Math.random() * 1;
            let tween1 = tween(this.view)
                .to(0.5, { y: this._initY + 3 })
                .to(0.5, { y: this._initY - 3 });
            tween(this.view).delay(num).repeat(99999, tween1).start();
        }
    }
}
