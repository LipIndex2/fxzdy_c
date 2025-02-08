import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { Color } from "cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";


/**
 * 抽卡获得道具
 */
@bindFguiExtension("ui://drawCard/DrawCardNormalHeadRewardComp")
export class DrawCardNormalHeadRewardComp extends FGUI.GComponent {

    private _config: table.recruit.NormalRecruitProgressConfig;
    private _reward: NoOwnerItem;

    protected onConstruct() {
        super.onConstruct();


        this.view.onClick(this.onClickItem, this)
    }

    onClickItem(event: FGUI.Event) {
        if (!this._reward) {
            return;
        }
        FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            this._reward.getItemConfig(),
            this.view._uiTrans,
        ));
    }


    private get view(): ui.drawCard.components.DrawCardNormalHeadRewardComp {
        return this as any;
    }


    protected onPreDispose() {

        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    reset(config: table.recruit.NormalRecruitProgressConfig) {
        if (!config) {
            return;
        }
        this._config = config;
        this._reward = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards)


        const needScore = config.id;

        this.view.imageHero.icon = config.headAssetPath;
        this.view.labelTitle.text = `累计招募${needScore}次`;
        this.view.labelContent.text = config.desc;
        this.view.labelContent.color = new Color(config.descFontColor);

    }
}