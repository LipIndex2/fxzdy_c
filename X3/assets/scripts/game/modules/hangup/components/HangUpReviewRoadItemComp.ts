import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { HangUpTimeRewardTipsComp } from "db://assets/scripts/game/modules/hangup/components/HangUpTimeRewardTipsComp";
import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";

@bindFguiExtension("ui://hangUp/HangUpReviewRoadItemComp")
export class HangUpReviewRoadItemComp extends fgui.GComponent {

    private _config: table.trunkinstance.TrunkInstanceConfig;

    private get view(): ui.hangUp.item.HangUpReviewRoadItemComp {
        return this as any;
    }


    reset(config: table.trunkinstance.TrunkInstanceConfig) {
        if (!config) {
            return;
        }
        this._config = config;

        const context = HangUpModel.ins().context;

        const isPass = context.isPassNextLevel(config.id);
        const isCurrent = config.id == HangUpModel.ins().getCurrentLevelId();
        this.view.getController("isCurrent").selectedIndex = isCurrent ? 1 : 0;


        const array = [
            this.view.tips1,
            this.view.tips2,
            this.view.tips3,
        ];
        for (let i = 0; i < array.length; i++) {
            const type: EnumHangUpType = i + 1;
            // 每一个加成
            const comp = FguiScriptUtils.toMyScriptClass(array[i], HangUpTimeRewardTipsComp);
            comp.reset(type, config);
        }

        this.view.labelLevelId.text = config.showLevelId?.toString() || "0";
        this.view.labelTitle.text = `进度达到: ${config.showLevelId}`;
        this.view.labelMaxLv.text = `最高等级: ${config.dropEquipLv} 级`;
        
        // TODO 进度条
        this.view.bar.value = isPass ? 100 : 0;
        
        
        // equipLv
        const preConfig = HangUpConfigManager.getConfigByShowId(config.showLevelId - 1);
        const isGtEquipLv = config.dropEquipLv > preConfig.dropEquipLv;
        if (isGtEquipLv) {
            this.view.labelMaxLv.text = `最高等级: [color=#00FF00]${config.dropEquipLv}[/color] 级`;
        } else {
            this.view.labelMaxLv.text = `最高等级: ${config.dropEquipLv} 级`;
        }
        this.view.imageAdd.visible = isGtEquipLv;
    }
}