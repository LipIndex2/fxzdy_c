import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIHeroKey } from "../../../modules/hero/const/UIHeroConfig";
import { UIGameModeKeys } from "db://assets/scripts/game/modules/gameMode/UIGameModeKeys";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { CommonFooterView } from "db://assets/scripts/game/modules/common/footer/CommonFooterView";
import { UIMainKey } from "../const/UIMainConfig";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { UILeagueKey } from "../../../modules/league/const/UILeagueConst";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { MainPageManager } from "../MainPageManager";
import { IMainContainerPageOpenArgs } from "db://assets/scripts/game/ui/main/structs/IMainContainerPageOpenArgs";
import { ResURL } from "../../../../core/res/ResURL";
import { UIView } from "../../../../core/mvc/view/UIView";


@bindScript(UIMainKey.MainContainerPage)
export class MainContainerPage extends UIPage implements IContainer {

    static pkgName: string = "main";
    static viewName: string = "MainContainerPage";


    private static _uiKeys = [
        UIHeroKey.HERO_MAIN_VIEW,
        DrawCardUIKeys.DrawCardNormalView,
        UIGameModeKeys.GameModeMainView,
        UILeagueKey.LeagueMainView
    ];

    static preloadRes(openArg?: any): ResURL[] {
        let urls = [];
        let index = openArg?.page || 0;

        let UIClass: typeof UIView = UIScriptManager.getViewScriptClass(this._uiKeys[index]);
        if (UIClass) {
            urls.push({
                url: "ui/" + UIClass.pkgName,
                type: "fgui",
            } as ResURL);

            let preloadRes = UIClass.preloadRes();
            if (preloadRes?.length) {
                urls = urls.concat(preloadRes);
            }
        }
        return urls;
    }


    private _footerComp: CommonFooterView;
    // 抽卡类型
    private _drawCardType: ServerEnums.RecruitType;

    private get view(): ui.main.MainContainerPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {

    }

    public onInit(): void {
        this._footerComp = this.view.footer as any;
        this._footerComp.view.btnBack.onClick(this.onClickBack, this);

        this.viewContainer.setOwner(this);
        this.viewContainer.bindByGList(MainContainerPage._uiKeys, this._footerComp.view.pageList);
        //this.viewContainer.selectIndex = 0;
    }

    onPreChangeView(containerIndex: number) {
        // 抽卡页面
        if (containerIndex == 1) {
            return this._drawCardType;
        }
        return null;
    }

    protected onOpen(arg: IMainContainerPageOpenArgs,
        isReopen: boolean
    ): void {
        if (arg) {
            this._drawCardType = arg.drawCardType;

            if (!isReopen && arg.page != this.viewContainer.selectIndex) {
                this.viewContainer.selectIndex = arg.page;
            }
        }

        if (this.viewContainer.selectIndex == -1) {
            this.viewContainer.selectIndex = 0;
        }
    }

    public onClose(): void {
    }

    public onChangedView(index) {
        //this._footerComp.resetFooterLeftSideType(this._uiKeys[index] === UIMainKey.MAIN_PAGE ? EnumFooterLeftSideType.HANG_UP : EnumFooterLeftSideType.BACK);
    }

    private onClickBack() {
        this.closeSelf();
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
     */
    onClickTabAndCheck(index): boolean {
        return MainPageManager.ins().onClickTabAndCheck(index);
    }
}