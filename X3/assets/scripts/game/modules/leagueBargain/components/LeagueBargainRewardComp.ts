import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";


@bindFguiExtension("ui://leagueBargain/LeagueBargainRewardComp")
export class LeagueBargainRewardComp extends FGUI.GComponent {
    private _item: NoOwnerItem;

    get v(): ui.leagueBargain.components.LeagueBargainRewardComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.v.onClick((event) => {
            FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                this._item.getItemConfig(),
                this.v._uiTrans
            ));
        }, this);
    }

    reset(item: NoOwnerItem) {
        if (!item) {
            this.v.visible = false;
            return;
        }
        this._item = item;
        this.v.visible = true;

        this.v.imageReward.icon = item.getIconPath();
        this.v.textCount.text = `x${item.count}`;

    }
}