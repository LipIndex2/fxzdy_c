import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";

@bindFguiExtension("ui://heroSupply/HeroSupplyItemComp")
export class HeroSupplyItemComp extends FGUI.GComponent {
    private _day: number = 0;

    get view(): ui.heroSupply.item.HeroSupplyItemComp {
        return this as any;
    }

    protected onInit() {
        this.view.emptyBtn.onClick(() => {
            const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
            if (!vo) {
                return;
            }

            // no buy 
            if (!vo.isBuy()) {
                UIManager.ins().open(UIActivityKey.HeroSupplyBuyTipsWin);
                return;
            }

            // have buy
            if (this._day > 0) {
                // no gain
                if (vo.isCanGain(this._day)) {
                    if (!vo.isGain(this._day)) {
                        vo.sendOneKeyGain();
                        return;
                    }
                }

            }

            this.view.item.fireClick();

        }, this);
    }

    reset(config: table.activity.HeroSupply.HeroSupplyRewardConfig) {
        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }

        const day: number = config.openDay;
        this._day = day;
        const item: NoOwnerItem = ItemUtils.parseKvArrayToItemArray(config.rewards)[0]

        this.view.labelDay.text = `${day}`;

        if (item) {

            FguiScriptUtils.toMyScriptClass(this.view.item, ItemFrameBtn)
                .reset(item.itemId, 0, false);

            this.view.labelItemCount.text = `x${item.count}`;
        } else {
            this.view.labelItemCount.text = `x0`;
        }

        RedDotUtils.castComp(this.view.redDot)
            .reset(RedDotKeys.HeroSupply_day, [day]);

        const isGain = vo.isGain(day);
        this.view.getController("isGain").selectedIndex = isGain ? 1 : 0;
    }

}