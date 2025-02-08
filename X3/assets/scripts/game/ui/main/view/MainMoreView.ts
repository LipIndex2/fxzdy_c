import { tween } from "cc";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { EnumTabSideType } from "db://assets/scripts/game/ui/main/const/EnumTabSideType";
import { MainPageUtils } from "db://assets/scripts/game/ui/main/utils/MainPageUtils";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import  { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { ConditionManager } from "../../../modules/condition/ConditionManager";
import { UIMainKey } from "../const/UIMainConfig";
import { MainMoreBtnComp } from "db://assets/scripts/game/ui/main/components/MainMoreBtnComp";


@bindScript(UIMainKey.MAIN_MORE_VIEW)
export class MainMoreView extends UICommWin {

    static pkgName: string = "main";
    static viewName: string = "MainMoreView";

    private enterAnimation;
    private closeAnimation;

    // 配置
    private _configs: table.mainpage.MainPageTabItemConfig[] = [];

    private get view(): ui.main.MainMoreView {
        return this._view as any;
    }

    /***组件初始化 */
    // protected initComp(): void {
    //     this.addComp(new ViewBlackBgComp())
    // }

    listenNotifications(): string[] {
        return [
            NotificationKey.CHANGE_NAME
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.CHANGE_NAME:
                this.updateInfo();
                break;
        }
    }

    protected onInit(): void {

        // 按钮列表
        this.view.btnList.setVirtual();
        this.view.btnList.itemRenderer = this.itemRendererForBtn.bind(this);

        let cfgs = MainPageUtils.getTabItemConfigArrayBySideType(EnumTabSideType.MORE);

        this._configs = [];

        cfgs.forEach(config => {
            if (config.conditionText) {
                let unlock = ConditionManager.ins().checkCondition(config.conditionText);
                if (unlock) {
                    this._configs.push(config);
                }

            } else {
                this._configs.push(config);
            }
        });


        // player info
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        avatar.setCanShowMe(true);
        avatar.resetMe();


        this.view.btnList.numItems = this._configs.length;

        this.view.btn_close.on(fgui.Event.CLICK, this.closeAnim, this);

        this.enterAnim();
        this.updateInfo();

    }

    /** 入场动画 */
    private enterAnim() {
        this.view.G_main.x = 474 + this.view.G_main.width
        this.enterAnimation = tween(this.view.G_main).to(0.3, {x: 474}, {easing: "backOut"});
        this.enterAnimation.start();
    }

    /** 关闭动画 */
    private closeAnim() {
        this.closeAnimation = tween(this.view.G_main).to(0.3, {x: 678}).call(this.closeView);
        this.closeAnimation.start();
    }

    private updateInfo() {
        const vo = PlayerModel.ins().Vo;

        // player info
        this.view.T_name.text = vo.name;
        const playerId = vo.id;
        this.view.T_ID.text = `ID: ${playerId}`;
    }

    private closeView() {
        G.UIManager.close(UIMainKey.MAIN_MORE_VIEW);
    }

    itemRendererForBtn(index: number, comp: MainMoreBtnComp) {
        const config = this._configs[index];
        comp.reset(config);
    }
}
