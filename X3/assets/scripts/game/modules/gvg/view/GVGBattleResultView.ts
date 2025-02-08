import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GVGPlayerBalanceComp } from "db://assets/scripts/game/modules/gvg/components/GVGPlayerBalanceComp";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { BattleConfigManager } from "db://assets/scripts/game/comm/battle/config/BattleConfigManager";
import { GVGCaches } from "db://assets/scripts/game/modules/gvg/cache/GVGCaches";
import { PlayerAvatarData } from "db://assets/scripts/game/modules/common/playerInfo/structs/PlayerAvatarData";
import { GVGBattleResultViewOpenArgs } from "db://assets/scripts/game/modules/gvg/structs/GVGBattleResultViewOpenArgs";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";


/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGBattleResultView)
export class GVGBattleResultView extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGBattleResultView";

    private _args: GVGBattleResultViewOpenArgs;
    private _oppoInfo: PlayerAvatarData;

    private get view(): ui.gvg.GVGBattleResultView {
        return this._view as any;
    }

    protected onInit() {
        // TODO 初始化
        this.view.btnData.onClick(this.onClickData, this);

        GameTimer.ins().once(2000, this, () => {

        });
    }

    @LogBusiness("打开界面")
    public onOpen(args: GVGBattleResultViewOpenArgs): void {
        this._args = args;
        this._oppoInfo = GVGCaches.oppoAvatarData;

        this.view.getTransition("enter").play();

        this.reset();
    }


    @LogBusiness("关闭界面")
    protected onClose() {

        FacadeManager.ins().emit(NotificationKey.CLOSE_BATTLE_VIEW);

        super.onClose();


    }

    onClickData() {

        // 战斗数据
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.LEAGUE_WAR, this._args.isWin);
    }

    private reset() {
        const args = this._args;

        const isWin = args.isWin;

        const modelNode = FguiScriptUtils.toMyScriptClass(this.view.modelNode, ModelNode);
        if (isWin) {
            modelNode.loadByPath(BattleConfigManager.winResultSpineAssetPath);
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
        } else {
            // 失败
            modelNode.loadByPath(BattleConfigManager.failResultSpineAssetPath);
            modelNode.playOrders(
                [
                    {
                        name: "unlocking2",
                        isLoop: false
                    },

                    {
                        name: "idle2",
                        isLoop: true
                    },
                ]
            );
        }

        const context = GVGModel.ins().context;

        // 头像信息
        FguiScriptUtils.toMyScriptClass(this.view.playerL.avatar, PlayerAvatar)
            .resetMe();
        FguiScriptUtils.toMyScriptClass(this.view.playerR.avatar, PlayerAvatar)
            .resetByData(this._oppoInfo);

        // name
        this.view.playerL.labelPlayerName.text = PlayerModel.ins().playerName;
        this.view.playerR.labelPlayerName.text = this._oppoInfo?.playerName || "";

        // 奖励
        const rewards = args.rewards || [];
        FguiScriptUtils.toMyScriptClass(this.view.itemListComp, ItemListComp)
            .reset(rewards);

        const myHp = context.getHp();
        const oppoCurHp = args.oppoCurHp;
        const oppoChangeHp = args.oppoChangeHp;
        const changeStarCount = args.gainStar || 0;

        this.view.labelChangeStar.text = `+${changeStarCount}`;

        // hp 变化
        FguiScriptUtils.toMyScriptClass(this.view.playerL, GVGPlayerBalanceComp)
            .resetHp(myHp, 0);
        FguiScriptUtils.toMyScriptClass(this.view.playerR, GVGPlayerBalanceComp)
            .resetHp(oppoCurHp, oppoChangeHp);

    }

}