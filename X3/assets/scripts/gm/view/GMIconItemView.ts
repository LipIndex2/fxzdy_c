import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import {GMItemView} from "db://assets/scripts/gm/view/GMItemView";
import {ItemUtils} from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";

/**
 * GM 物品 icon
 */
export class GMIconItemView extends fgui.GComponent {

    // GM 物品面板
    private _gmItemView: GMItemView;
    // 道具配置
    private _itemConfig: table.item.ItemConfig;

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "iconItem";

    // endregion


    private get view(): ui.gm.iconItem {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }


    public onInit() {

        this.view.on(fgui.Event.CLICK, this.onClick0, this);
    }


    private onClick0() {
        this._gmItemView.setChooseItem(this._itemConfig);
    }

    updateData(gmItemView: GMItemView,
               itemConfig: table.item.ItemConfig,
               bigIconFlag: boolean = true
    ) {
        this._gmItemView = gmItemView;
        this._itemConfig = itemConfig;

        if (bigIconFlag) {
            this.view.itemIcon.icon = itemConfig.iconPath;
        } else {
            this.view.itemIcon.icon = itemConfig.smallIconPath;
        }
        this.view.labelItemId.text = itemConfig.id.toString();
        this.view.itemName.text = G.I18nManager.translate(itemConfig.name);
        this.view.bg.icon = ItemUtils.getQualityIconResourcePath(itemConfig.quality);

        QualityUtils.setFGUIFontColorByQuality(this.view.itemName, itemConfig.quality);
    }
}