import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import FGUI from "../../../../../core/fgui/FGUI";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import { TableManager } from "../../../../../core/table/TableManager";

import NotificationKey from "../../../../event/NotificationKey";
import { ItemUtils } from "../../../item/utils/ItemUtils";


@bindFguiExtension("ui://petGift/PetGiftDayBtn")
export class PetGiftDayBtn extends FGUI.GComponent {

    private _day: number = 1;
    private _cfg: table.activity.PetGift.PetGiftConfig;
    private _isUnlock: boolean = false;


    get view(): ui.petGift.component.PetGiftDayBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
        this.view.starList.itemRenderer = this.addStars.bind(this);
    }

    onClickDay() {
        FacadeManager.ins().emit(NotificationKey.PET_GIFT_CHOOSE_DAY, this._day);
    }

    reset(cfg: table.activity.PetGift.PetGiftConfig, chooseDay: number) {
        this._day = cfg.openDay;
        this._cfg = cfg;

        //当前是选中
        if (this._day == chooseDay) {
            this.view.selImg.visible = true;
        } else {
            this.view.selImg.visible = false;
        }

        this.view.labelTitle.text = `第 ${cfg.severDay} 天`

        this.view.starList.numItems = cfg.stars;

        let itemCfg = ItemUtils.getItemConfigByItemId(cfg.showItemId);
        if (itemCfg) {
            this.view.iconLoader.icon = itemCfg.iconPath;
            // 品质
            let qualityConfig = TableManager.getDataById(table.quality.QualityConfig, itemCfg.quality);
            if (qualityConfig) {
                this.view.bgLoader.icon = qualityConfig.itemQualityBgPath
            }
        }
    }

    addStars(index: number, item: ui.petGift.component.PetGiftStarBtn) {
        // item.starImg.visible = false;
        item.starImg.icon = this._cfg.starIcon;
    }

}