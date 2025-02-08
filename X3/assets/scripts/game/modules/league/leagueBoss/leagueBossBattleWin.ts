import G from "../../../../core/comm/G";
import { I18nManager } from "../../../../core/i18n/I18nManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ShopModel } from "../../shop/model/ShopModel";

import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LeagueModel } from "../LeagueModel";
import { LeagueManager } from "../leagueManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

/**
 * 联盟boss挑战结束
 */
@bindScript(UILeagueKey.LeagueBossChallengeSuccess)
export class LeagueBossBattleWin extends UICommWin {
    static pkgName: string = "leagueBoss";

    static viewName: string = "leagueBossBattleSuccess";

    private get view(): ui.leagueBoss.leagueBossBattleSuccess {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

        }
    }


    protected onInit() {
        super.onInit();
        this.view.btnData.onClick(this.onClickBtnData, this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.LEAGUE_BOSS, true);
    }


    private mLeagueBossChallengeVo: Vo.league.LeagueBossChallengeVo;

    protected onOpen(data: Vo.league.LeagueBossChallengeVo): void {

        this.mLeagueBossChallengeVo = data;
        let str = StringUtils.numShortToKM(data.hurt)
        this.view.totalDamage.text = `${str}`;
        let lastHurt = LeagueManager.ins().mPlayerLeagueLoginVo.bossMaxHurtMap[data.bossConfigId];
        if (!lastHurt || data.hurt > lastHurt) {
            this.view.newDamage.visible = true;
            LeagueManager.ins().mPlayerLeagueLoginVo.bossMaxHurtMap[data.bossConfigId] = data.hurt;
        }
        else {
            this.view.newDamage.visible = false;
        }


        const items = ItemUtils.convertToNoOwnerItemArrayByServerRewards(data.rewardResults);
        FguiScriptUtils.toMyScriptClass(this.view.rewards, ItemListComp)
            .reset(items);

        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
        modelNode.playOrders(
            [
                {
                    name: "unlocking1",
                    isLoop: false
                },
                {
                    name: "idle1",
                    isLoop: true
                },
            ]
        );
        this.view.touchable = false;
        this.view.getTransition("ani").play(() => {
            this.view.touchable = true;
        });

    }

    protected onClose(): void {
        //退出战斗

        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);



    }






}