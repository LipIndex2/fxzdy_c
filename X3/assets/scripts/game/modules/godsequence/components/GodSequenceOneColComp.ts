import G from "db://assets/scripts/core/comm/G";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { WeekDay } from "db://assets/scripts/core/time/WeekDay";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { GodSequenceUIKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceUIKeys";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import {
    GodSequenceChallengeViewOpenArgs
} from "db://assets/scripts/game/modules/godsequence/structs/GodSequenceChallengeViewOpenArgs";
import { RaceConfigManager } from "db://assets/scripts/game/modules/race/config/RaceConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { GodSequenceController } from "../GodSequenceController";
import { ItemUtils } from "../../item/utils/ItemUtils";

export class GodSequenceOneColComp extends FGUI.GComponent {
    private _config: table.ladder.LadderTypeConfig;


    private get view(): ui.godSequence.components.GodSequenceOneColComp {
        return this as any;
    }


    protected onConstruct(): void {
        this.view.btnOk.onClick(this.onBtnOkClick, this);
    }

    onBtnOkClick() {
        const type: ServerEnums.Career = ServerEnums.Career[this._config.id];
        const maxPassLevel = GodSequenceModel.ins().context.getLayerNumByType(type);

        UIManager.ins().open(GodSequenceUIKeys.GodSequenceChallengeView, GodSequenceChallengeViewOpenArgs.create(
            type,
            maxPassLevel + 1
        ));
    }


    reset(config: table.ladder.LadderTypeConfig) {
        const context = GodSequenceModel.ins().context;
        if (!config) {
            return;
        }
        this._config = config;


        let raceType: ServerEnums.Career = ServerEnums.Career[config.id];
        let typeConfig = GodSequenceConfigManager.getTypeConfigByType(raceType);
        if (!typeConfig) {
            return;
        }

        // 进度条
        this.view.barProgress.bg.icon = typeConfig.bg;
        this.view.barProgress.bar.icon = typeConfig.fg;

        let layerNumByType = context.getLayerNumByType(raceType);
        this.view.labelTitle.text = config.name;
        // layerNum
        this.view.labelLayerNum.text = `${layerNumByType}`;

        this.view.imageRace.icon = ItemUtils.getCareerIcon(raceType);
        if (ArrayUtils.isNotEmpty(config.openDayOfWeek)) {
            const str = config.openDayOfWeek.join("/");
            this.view.labelNotOpen.text = `周${str}开启`;
        } else {
            this.view.labelNotOpen.text = "未开启";
        }

        let weekDays = config.openDayOfWeek as number[];

        let humanWeekDayNum = WeekDay.getWeekDayByTimeMs(G.TimeManager.serverNow).getHumanWeekDayNum();
        let isIn = weekDays.indexOf(humanWeekDayNum) != -1 || GodSequenceController.ins().isOpenAll;
        this.view.getController("isOpen").selectedIndex = isIn ? 1 : 0;

        this.view.barProgress.value = context.getProgressPercent100(raceType);
    }
}