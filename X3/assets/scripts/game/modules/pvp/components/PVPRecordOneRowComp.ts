import * as fgui from "fairygui-cc";
import { PVPInfoUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPInfoUtils";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { PVPRankStarListComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankStarListComp";
import G from "db://assets/scripts/core/comm/G";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { BattleRecordManager } from "../../../comm/battle/BattleRecordManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";

export class PVPRecordOneRowComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;
    private _vo: Vo.arena.ArenaChallengeRecord;

    private get view(): ui.pvp.list.PVPRecordOneRowComp {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.view.btnData.onClick(this.onBtnDataClick, this)

        this.view.logoRank.starComp.starList.setVirtual();
        this.view.logoRank.starComp.starList.itemRenderer = this.itemRenderForStar.bind(this);

    }


    reset(vo: Vo.arena.ArenaChallengeRecord) {
        if (!vo) {
            return;
        }
        this._vo = vo;

        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        const myPlayerId = PlayerModel.ins().playerId;
        if (vo.defenderBaseVo?.id == myPlayerId) {
            playerAvatar.resetByPlayerInfo(vo.attackerBaseVo);
        } else if (vo.defenderBaseVo) {
            //敌方玩家
            playerAvatar.resetByPlayerInfo(vo.defenderBaseVo);
        } else if (vo.defenderRobotBaseVo) {
            //敌方机器人
            playerAvatar.resetByRobotJJC(vo.defenderRobotBaseVo);
        } else {
            //都没数据 就不处理了
        }

        // 我的分数
        const beforeScore = vo.beforeScore;
        const changeScore = vo.changeScore;
        const afterScore = beforeScore + changeScore;

        // config
        const preConfig = PVPUtils.getConfigByScore(beforeScore);
        if (!preConfig) {
            return;
        }
        this._config = preConfig;

        // start count
        this.view.logoRank.starComp.starList.numItems = preConfig.starMaxCount;

        // 对手名字
        this.view.labelPlayerName.text = PVPInfoUtils.getNameByRecord(vo);

        // TODO 记录 | 怎么区分攻守 ? 

        const attacker = vo.attackerBaseVo;


        // 段位

        // logo
        this.view.logoRank.imageRankLogo.icon = preConfig.logoSmallAssetPath;
        // @ts-ignore
        const starComp = this.view.logoRank.starComp as PVPRankStarListComp;
        starComp.reset(preConfig);


        // my score change
        if (changeScore >= 0) {
            this.view.labelScore.text = `${afterScore}[color=#00ff00]+${changeScore}[/color]`;
        } else {
            this.view.labelScore.text = `${afterScore}[color=#ff0000]${changeScore}[/color]`;
        }

        // time
        const diffTimeMs = G.TimeManager.serverNow - vo.time;
        const text = TimeUtils.formatDiffTimeMsToPVPChallengeRecordTimeText(diffTimeMs);
        this.view.labelTime.text = `[color=#00ff00]${text}[/color]`;

    }


    itemRenderForStar(index: number, comp: ui.pvp.list.PVPRankStarComp) {
        const count = index + 1;

        const myStarCount = this._config.starCount;
        const isReach = myStarCount >= count;

        comp.getController("reachFlag").selectedIndex = isReach ? 1 : 0;

    }

    onBtnDataClick() {
        BattleRecordManager.ins().showRecordViewByArena(this._vo);
    }
}