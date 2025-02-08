import * as fgui from "fairygui-cc";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import G from "db://assets/scripts/core/comm/G";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { PVPDefendViewOpenArgs } from "db://assets/scripts/game/modules/pvp/view/PVPDefendView";
import { PVPChooseOppoView } from "db://assets/scripts/game/modules/pvp/view/PVPChooseOppoView";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";

export class PVPChallengeOtherOneRowComp extends fgui.GComponent {

    private _config: table.arena.ArenaRankConfig;
    private _vo: Vo.arena.ArenaOpponentVo;
    private _oppoId: number = 0;
    private _parentView: PVPChooseOppoView;
    // 玩家是否是机器人
    private _isRobot = false;

    private get view(): ui.pvp.components.PVPChallengeOtherOneRowComp {
        return this as any;
    }

    public onInit() {
        this.view.rankStarList.starList.setVirtual();
        this.view.rankStarList.starList.itemRenderer = this.itemRenderForStar.bind(this);

        this.view.btnShowInfoTips.onClick(this.onClickSeeInfo, this)
        this.view.btnShowInfo.onClick(this.onClickSeeInfo, this)
        this.view.btnChallenge.onClick(this.onClickChallenge, this)
    }

    onClickSeeInfo() {
        G.UIManager.open(PVPUIKeys.PVPDefendView, PVPDefendViewOpenArgs.create(this._oppoId))
    }

    onClickChallenge() {

        // 挑战 x ?
        const isRobot = this._vo.robotBaseVo != null;
        console.info(`玩家挑战了一个 ${isRobot ? "robot" : "player"}`);


        // 发送挑战
        PVPModel.ins().sendChallenge({
            defenderId: this._vo.baseVo?.id || this._vo.robotBaseVo?.id || 0,
        });

        this._parentView?.closeSelf();

    }

    reset(config: table.arena.ArenaRankConfig,
          vo: Vo.arena.ArenaOpponentVo,
          parentView: PVPChooseOppoView
    ) {
        this._parentView = parentView;
        this._config = config;
        this._vo = vo;
        const robotId = vo.robotBaseVo?.id || 0;
        this._oppoId = vo.baseVo?.id || robotId;

        const isRobot = robotId != 0;
        if (isRobot) {
            this._isRobot = isRobot;
        }
        this.view.avatarComp.touchable = !isRobot;
        
        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatarComp, PlayerAvatar);
        if (robotId == 0) {
            // 玩家
            playerAvatar.resetByPlayerInfo(vo.baseVo);
        } else {
            // 机器人
            playerAvatar.resetByRobotJJC(vo.robotBaseVo);
        }

        this.view.labelRankScore.text = vo.score.toString();
        this.view.imagePvpRank.icon = config.logoSmallAssetPath;
        this.view.rankStarList.starList.numItems = config.starMaxCount;


    }

    itemRenderForStar(index: number, starComp: ui.pvp.list.PVPRankStarComp) {
        const myStarCount = this._config.starCount;
        const isCanSee = myStarCount >= (index + 1);
        starComp.getController("reachFlag").selectedIndex = isCanSee ? 1 : 0;

    }

}