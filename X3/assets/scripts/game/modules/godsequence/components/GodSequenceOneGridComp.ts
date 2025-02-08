import G from "db://assets/scripts/core/comm/G";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { BattleConfigManager } from "db://assets/scripts/game/comm/battle/config/BattleConfigManager";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { UIBattleKeys } from "db://assets/scripts/game/modules/battle/UIBattleKeys";
import {
    CommonChallengeViewOpenArgs
} from "db://assets/scripts/game/modules/common/battle/structs/CommonChallengeViewOpenArgs";
import {
    FormationMainViewOpenArgs,
    UIFormationKey
} from "db://assets/scripts/game/modules/formation/const/UIFormationConfig";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { GodSequenceDialog } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceDialog";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { GodSequenceI18nKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceI18nKeys";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "../../../GIns";

@bindFguiExtension("ui://godSequence/GodSequenceOneGridComp")
export class GodSequenceOneGridComp extends FGUI.GButton {
    private _config: table.ladder.LadderConfig;
    private _isLeft: boolean;
    private _isPass: boolean = false;


    private get view(): ui.godSequence.components.GodSequenceOneGridComp {
        return this as any;
    }


    protected onConstruct(): void {
        this.view.onClick(this.onClick0, this);

        this.view.dialog.bg.scaleY = -1;
    }

    // 挑战
    onClick0() {

        if (!this._config) {
            console.error("没有配置");
            return;
        }
        if (this._isPass) {
            GIns.floatingTextMgr.showTips("该关卡已通关");
            console.warn(`玩家已通关 configId = ${this._config?.id}`);
            return;
        }

        // 打开战斗界面
        let type = ServerEnums.Career[this._config.type];
        if (!type) {
            console.error("type is null")
            return;
        }

        const typeConfig = GodSequenceConfigManager.getTypeConfigByType(type)
        if (!typeConfig) {
            console.error(`typeConfig is null | type = ${type}`)
            return;
        }


        let context = GodSequenceModel.ins().context;

        // 是否能继续挑战
        const isCanContinue = context.isCanContinueChallenge(type, true);
        if (!isCanContinue) {
            GIns.floatingTextMgr.showTips("当前序列挑战已到极限,请挑战其他序列后再来尝试")
            return;
        }

        // 先检查是否有阵型
        const isHaveSetUp = FormationManager.ins().isHveFormationByFightType(ServerEnums.FightType.LADDER, 0, type.toString());
        if (!isHaveSetUp) {
            // empty formation !
            UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
                FightType.LADDER,
                type,
            ))
            return;
        }

        // 上一关卡是否通关
        let layerNum = this._config.layerNum;
        let prevLayerNum = layerNum - 1;
        let isPass = GodSequenceModel.ins().context.isPassByLayerNum(type, prevLayerNum);
        if (!isPass) {
            GIns.floatingTextMgr.showTips("请先通关上一关卡");
            return;
        }


        const battleConfigId = this._config.battleConfigId;

        const typeName = I18nManager.ins().translate(typeConfig.name);
        const levelName = typeName + this._config.layerNum;
        let subType = ServerEnums.Career[this._config.type];
        // 挑战面板
        UIManager.ins().open(UIBattleKeys.CommonChallengeView, CommonChallengeViewOpenArgs.create(
            FightType.LADDER,
            subType,
            levelName,
            this._config.fight,
            battleConfigId,
            ItemUtils.parseKvArrayToItemArray(this._config.rewards),
            () => {

                const config = GodSequenceConfigManager.getConfigByTypeAndLayer(type, layerNum);
                const levelId = config?.id || 0;

                //记录参数 在布阵返回后 处理
                FormationManager.ins().addAutoFightParam(FightType.LADDER, levelId);
                // 阵容设置 | 主地图阵容
                G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
                    FightType.LADDER,
                    subType,
                ));

                // // pk
                // GodSequenceModel.ins().sendChallengeLadder({
                //     ladderConfigId: this._config.id,
                // });
            },
            null,
            this._config.id
        ));

    }

    reset(config: table.ladder.LadderConfig,
        isLeft: boolean,
    ) {
        if (!config) {
            return;
        }
        this._config = config;
        this._isLeft = isLeft;

        let dialog = FguiScriptUtils.toMyScriptClass(this.view.dialog, GodSequenceDialog);
        // 奖励
        let noOwnerItem = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards);
        if (noOwnerItem) {
            dialog.visible = true;
            dialog.reset(isLeft, noOwnerItem);
        } else {
            dialog.visible = false;
        }

        let layerNum = config.layerNum;

        let context = GodSequenceModel.ins().context;

        const isPass = context.isPass(config)
        if (isPass) {
            this.view.labelContent.text = GodSequenceI18nKeys.layerDone;
        } else {
            this.view.labelContent.text = GodSequenceI18nKeys.layerLock;
        }
        this._isPass = isPass;


        // cur ?
        const isCurrentChallenge = context.isCurrentChallenge(config)
        if (isCurrentChallenge) {
            this.view.labelContent.text = GodSequenceI18nKeys.layerChallenge;

            this.view.labelContent.color = ColorUtils.createColor("#fff3a0");
            this.view.labelContent.strokeColor = ColorUtils.createColor("#b64202");
        } else {
            this.view.labelContent.color = ColorUtils.createColor("#95D6FF");
            this.view.labelContent.strokeColor = ColorUtils.createColor("#032688");
        }
        this.view.getController("isCurrent").selectedIndex = isCurrentChallenge ? 1 : 0;


        // 置灰
        // this.view.grayed = context.isNotCanChallenge(config);

        this.view.labelLv.text = `等级${config.monsterLv}`;
        this.view.labelNum.text = `${config.layerNum}`;


        this.view.getController("isLeft").selectedIndex = isLeft ? 1 : 0;
        this.view.getController("isPass").selectedIndex = isPass ? 1 : 0;

        this.view.dialog.bg.scaleY = -1;

        // hero
        this.view.imageHero.icon = BattleConfigManager.getFirstMonsterHalfBodyAssetPath(config.battleConfigId);

    }
}