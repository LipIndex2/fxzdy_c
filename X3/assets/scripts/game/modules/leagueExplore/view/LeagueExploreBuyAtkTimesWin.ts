import { RichText } from "cc";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { RichTextUtils } from "db://assets/scripts/core/utils/RichTextUtils";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { LocalStorageUtils } from "../../../../core/utils/LocalStorageUtils";
import GIns from "../../../GIns";
import { ILeagueExploreBuyAtkTimesOpenArgs, UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";

/**
 * 二次确认框
 */
@bindScript(UILeagueExploreConfig.LeagueExploreBuyAtkTimesWin)
export class LeagueExploreBuyAtkTimesWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreBuyAtkTimesWin";

    //打开参数
    private _args: ILeagueExploreBuyAtkTimesOpenArgs = null;
    protected _initCancelX: number;
    protected _initConfirmX: number;

    private get view(): ui.leagueExplore.view.LeagueExploreBuyAtkTimesWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void { }

    protected onInit(): void {
        this.view.btnConfirm.onClick(this.onClickConfirm, this);
        this.view.btnCancel.onClick(this.onClickCancel, this);
        this.view.btnClose.onClick(this.closeSelf, this);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onClickConfirm(): void {
        let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnConfirm, BtnChangGui1WithItem);
        if (btnComp.isCanPay(true) == false) {
            //货币不足
            GIns.floatingTextMgr.showTips(btnComp.getNoPayTip());
            this.closeSelf();
            return;
        }
        if (this._args.onClickConfirm) {
            this._args.onClickConfirm();
        }
        this.closeSelf();
    }

    protected onClickCancel(): void {
        this.closeSelf();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as ILeagueExploreBuyAtkTimesOpenArgs;
        if (this._args) {
            this.view.lbTitle.text = "购买次数";

            this.view.btnConfirm.title = '购买';
            this.view.btnCancel.title = '取消';
            let curTimes: number = GIns.leagueExploreModel.activityinfo.playerInfoVo.attackLimitResetTimes;
            let cfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreResetAttackLimitConfig, curTimes + 1);
            let content: string = '当前处于进攻冷却状态中，是否取消本次进攻冷却？';

            if (cfg && cfg.costItems?.length > 0) {
                let costItem = cfg.costItems[0];
                let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnConfirm, BtnChangGui1WithItem);
                btnComp.reset('购买', NoOwnerItem.createByConfigKv(costItem));
                let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, costItem.k);
                let iconPath = itemCfg ? itemCfg.smallIconPath : '';
                let lastIndex = iconPath.lastIndexOf('/');
                if (lastIndex != -1) {
                    let atlasPath = iconPath.substring(0, lastIndex);
                    let itemIcon = iconPath.substring(lastIndex + 1);
                    content = `当前处于进攻冷却状态中，是否消耗${costItem.v}<img src='${itemIcon}'/>取消本次进攻冷却？`;
                    RichTextUtils.setTextWithImg(content, this.view.lbContent.node.getComponent(RichText), atlasPath);
                } else {
                    this.view.lbContent.text = content;
                }
            } else {
                this.view.lbContent.text = content;
            }
            this.view.lbTip.text = "本日不再弹出";

            //判断战败时间
            let attackLimitTime: number = GIns.leagueExploreModel.activityinfo.playerInfoVo.attackLimitTime;
            let nowTime: number = G.TimeManager.serverNow;
            if (attackLimitTime > nowTime) {
                G.GameTimer.once(attackLimitTime - nowTime, this, this.closeSelf);
            }
        } else {
            this.closeSelf();
        }
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._args.localKey && this.view.btnGouXuan.selected) {
            //选中了今日只提示一次
            let todayZero: number = G.TimeManager.todayZero;
            LocalStorageUtils.set(this._args.localKey, todayZero);
        }
    }
}
