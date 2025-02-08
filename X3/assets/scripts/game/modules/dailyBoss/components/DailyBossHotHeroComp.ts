import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import * as fgui from "fairygui-cc";
import { HeroAvatar } from "db://assets/scripts/game/modules/common/hero/HeroAvatar";

/**
 * 热门英雄
 */
export class DailyBossHotHeroComp extends fgui.GComponent {

    private _heroIds: number[] = [];


    private get view(): ui.dailyBoss.components.DailyBossHotHeroComp {
        return this as any;
    }
    protected onConstruct() {
        super.onConstruct();

        this.view.heroList.itemRenderer = this.renderHeroItem.bind(this);

    }

    reset(config: table.dailyboss.DailyBossThemeConfig) {

        this._heroIds = (config.hotHeroIds || []) as Array<number>;
        this.view.heroList.numItems = this._heroIds.length;
        
        this.view.labelHeroTagDesc.text = config.heroTagDesc;
    }


    renderHeroItem(
        index: number,
        comp: HeroAvatar
    ) {
        const heroId = this._heroIds[index];
        comp.reset(heroId);
    }
}