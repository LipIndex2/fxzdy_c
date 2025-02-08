import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { ActivityLimitTimeCareerDrawVo } from "../../model/ActivityLimitTimeCareerDrawVo";
import { TableManager } from "../../../../../core/table/TableManager";
import GIns from "../../../../GIns";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";

/**
 * 限时职业招募
 * 选择心愿职业
 */
@bindScript(UIActivityKey.LimitTimeCareerDrawWishWin)
export class LimitTimeCareerDrawWishWin extends UICommWin {
    static pkgName: string = "activityLimitTimeCareerDraw";
    static viewName: string = "LimitTimeCareerDrawWishWin";

    private get view(): ui.activityLimitTimeCareerDraw.LimitTimeCareerDrawWishWin {
        return this._view as any;
    }

    private _vo: ActivityLimitTimeCareerDrawVo;

    private selId: number;

    protected onInit(): void {
        this.view.btn_get.on(fgui.Event.CLICK, this.onGet, this);

        this.view.list_career.itemRenderer = this.careerItemRenderer.bind(this);
    }

    protected onOpen(vo: ActivityLimitTimeCareerDrawVo, isReopen?: boolean): void {
        this._vo = vo;

        this.selId = this._vo.selId;
        this.view.list_career.numItems = this._vo.cfgs.length;
        this.updateUI();
    }

    private updateUI() {
        let cfg = TableManager.getDataById(table.activity.CareerRecruit.CareerRecruitConfig, this.selId);
        if (cfg) {
            let careerCfg = TableManager.getDataById(table.hero.HeroClassConfig, cfg.career);
            this.view.selItem.img_career.icon = careerCfg?.assetPath;
            // this.view.selItem.img_career.setScale(0.25, 0.25);
            this.view.selItem.T_name.text = careerCfg?.name;
        } else {
            this.view.selItem.img_career.icon = ``;
            this.view.selItem.T_name.text = ``;
        }
    }

    private careerItemRenderer(index: number, item: ui.activityLimitTimeCareerDraw.item.DrawWishItem) {
        let cfg = this._vo.cfgs[index];
        if (this.selId === cfg.id) {
            this.view.list_career.selectedIndex = index;
        }

        let careerCfg = TableManager.getDataById(table.hero.HeroClassConfig, cfg.career);
        item.T_name.text = careerCfg.name;
        item.img_career.icon = careerCfg.assetPath;

        item.clearClick();
        item.onClick(() => {
            this.selId = cfg.id;
            this.view.list_career.selectedIndex = index;
            this.updateUI();
        }, this);
    }

    private onGet() {
        if (!this.selId) {
            GIns.floatingTextMgr.showTips("请先选择心愿职业");
            return;
        }
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "CHOOSE",
            otherParams: this.selId.toString(),
        } as ActivitySyncData;
        GIns.activityModel.sendBuyGoods(syncData);

        this.closeSelf();
    }
}
