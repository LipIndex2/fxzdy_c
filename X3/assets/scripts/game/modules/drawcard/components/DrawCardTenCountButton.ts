import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";


/**
 * 抽卡按钮
 */

@bindFguiExtension("ui://drawCard/DrawCardTenCountButton")
export class DrawCardTenCountButton extends FGUI.GButton {
    private _type: ServerEnums.RecruitType;


    protected onConstruct() {
        super.onConstruct();

    }

    get view(): ui.drawCard.components.DrawCardTenCountButton {
        return this as any;
    }

    reset(type: ServerEnums.RecruitType,
        useItemPerDraw: NoOwnerItem,
        drawCount: number,
        isBuy: boolean
    ) {
        this._type = type;
        if (!useItemPerDraw) {
            console.error("item is null!")
            return;
        }

        this.view.costCom.imageItem.icon = useItemPerDraw.getItemSmallIconPath();
        this.view.costCom.labelCount.text = (useItemPerDraw.count * drawCount).toString();
        if (isBuy) {
            this.view.labelBig.text = `购买x${drawCount}`;
        } else {
            this.view.labelBig.text = `招募${drawCount}次`;
        }

    }
}