import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { GVGChallengeConfirmWinOpenArgs } from "db://assets/scripts/game/modules/gvg/view/GVGChallengeConfirmWin";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { GVGUtils } from "db://assets/scripts/game/modules/gvg/utils/GVGUtils";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "db://assets/scripts/game/modules/player/structs/PlayerInfoMainViewOpenArgs";
import { Logger } from "db://assets/scripts/core/log/Logger";

/**
 * 每一个挑战单位
 */
@bindFguiExtension("ui://gvg/GVGOneChallengeItemComp")
export class GVGOneChallengeItemComp extends FGUI.GComponent {

    private _fightData: Vo.leaguewar.LeagueWarDefenderVo
    private _isOppo: boolean = true;

    private get view(): ui.gvg.item.GVGOneChallengeItemComp {
        return this as any;
    }

    protected onConstruct(): void {

        this.view.heroModel.onClick(this.onClickSeePlayer, this)

        this.view.btnFighterInfo.onClick(this.onClickChallenge0, this);
        this.view.btnChallenge.onClick(this.onClickChallenge0, this);
    }

    onClickSeePlayer() {
        const playerId = this._fightData?.playerId || 0;
        if (playerId <= 0) {
            Logger.game("机器人没有玩家信息")
            return;
        }

        // 挑战
        UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(playerId));
    }

    onClickChallenge0() {
        // 挑战
        UIManager.ins().open(GVGUIKeys.GVGChallengeConfirmWin, {
            isOppo: this._isOppo,
            fighterData: this._fightData
        } as GVGChallengeConfirmWinOpenArgs);

    }

    reset(index: number,
          isOppo: boolean,
          fightData: Vo.leaguewar.LeagueWarDefenderVo
    ) {
        this._fightData = fightData;
        this._isOppo = isOppo;
        
        const isOdd = index % 2 == 0;
        this.view.getController("isRight").selectedIndex = isOdd ? 0 : 1;
        this.view.getController("isOppo").selectedIndex = isOppo ? 1 : 0;

        // TODO 等后端给血量
        let hp = fightData.hps[0];
        if (hp == null) {
            hp = GVGConfigManager.getInitMaxHpCount();
        }

        const playerName = fightData.name;
        const fightNum = fightData.fight;

        // 是否死亡
        const isDie = hp <= 0;
        this.view.getController("isDie").selectedIndex = isDie ? 1 : 0;

        // hp
        const curHpPercent = GVGUtils.calcHpPercent(hp);
        const restHpCount = GVGUtils.calcHpCount(hp);

        const modelId = SettingsConfigManager.getModelIdByImageId(fightData.imageId);

        const modelNode = FguiScriptUtils.toMyScriptClass(this.view.heroModel, ModelNode);
        modelNode.loadByModelId(modelId);
        // TODO 
        // modelNode.setScale(2, 2);
        modelNode.setScale(1.5, 1.5);
        if (isDie) {
            modelNode.setLoadCompleteListener(() => {
                modelNode.gotoAndStop(1);
                modelNode.animNode?.setColor(ColorUtils.COLOR_GRAY);
            })

        } else {
            modelNode.play("idle", true);

        }


        this.view.barHp.value = curHpPercent;
        this.view.barHp.max = 10000;
        this.view.barCircleHp.value = restHpCount;
        this.view.barCircleHp.max = 3;
        this.view.barCircleHp.labelTitle.text = `x${restHpCount}`;

        this.view.labelPlayerName.text = playerName;
        // fight num
        this.view.fightNumComp.labelFightNum.text = StringUtils.getFightStr(fightNum);
    }
}