import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ChatComp } from "../../../ui/main/components/ChatComp";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ShopModel } from "../../shop/model/ShopModel";
import { LeagueModel } from "../LeagueModel";

@bindFguiExtension('ui://league/leagueMenuItem1')
export class leagueMenuItem1 extends fgui.GComponent {
    static pkgName: string = "league";

    static viewName: string = "leagueMenuItem1";

    private get view(): ui.league.leagueMain.com.leagueMenuItem1 {
        return this as any;
    }

    protected onInit(): void {
        // 只关心联盟消息
        FguiScriptUtils.toMyScriptClass(this.view.chat, ChatComp).setOnlyCareChannelType(ServerEnums.ChannelType.LEAGUE);
        this.view.challengeBtn.onClick(this.oepnLeagueChallenge, this);
        this.view.shopBtn.onClick(this.openShopView, this);
        //红点绑定
        FguiScriptUtils.toMyScriptClass(this.view.challengeBtn.redDot, RedDotCom).reset(RedDotKeys.League_challenge);
        FguiScriptUtils.toMyScriptClass(this.view.shopBtn.redDot, RedDotCom).reset(RedDotKeys.League_shop);
    }

    private openShopView(): void {
        ShopModel.ins().openShopMain(104);
    }

    /**打开联盟挑战 */
    private oepnLeagueChallenge(): void {
        LeagueModel.ins().openLeagueChallenge();
    }

    public updateChat(notice:string):void {
        this.view.noticeCom.notice.notice.text = notice
    }
}