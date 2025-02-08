import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";

@bindFguiExtension("ui://hangUp/HangUpTimeRewardTipsComp")
export class HangUpTimeRewardTipsComp extends fgui.GComponent {

    private _config: table.trunkinstance.TrunkInstanceConfig;

    private get view(): ui.hangUp.components.HangUpTimeRewardTipsComp {
        return this as any;
    }


    reset(type: EnumHangUpType,
          config: table.trunkinstance.TrunkInstanceConfig,
    ) {
        if (!config) {
            return;
        }
        this._config = config;

        const isCurrent = config.id == HangUpModel.ins().getCurrentLevelId();


        const itemId = HangUpUtils.getGainItemIdByHangUpType(config, type);
        this.view.imageItem.icon = ItemUtils.getItemConfigByItemId(itemId)?.smallIconPath;

        // 挂机效益
        const hangUpPerHourData = HangUpPerHourData.create(type, config);
        const showText = hangUpPerHourData.getShowTextForPerHour();
        const typeText = hangUpPerHourData.getHangUpTypeText();


        const isGreater = hangUpPerHourData.isBonusGreaterThanPreLevel();

        this.view.getController("isAdd").selectedIndex = isGreater ? 1 : 0;

        if (isGreater) {
            this.view.labelText.text = `${typeText}:[color=#00FF00]${showText}[/color]`;
        } else {
            this.view.labelText.text = `${typeText}:${showText}`;
        }
    }
}