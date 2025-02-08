/**@format */
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIPetKey } from "../const/UIPetConfig";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { PetHubModel } from "../PetHubModel";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import G from "db://assets/scripts/core/comm/G";

@bindScript(UIPetKey.PET_DRAW_CARD_INFO_PAGE)
export class PetHubSubPage extends UICommWin {
    static pkgName: string = "pet";
    static viewName: string = "PetHubInfoPage";
    private _allCfg: any = [];

    private get view(): ui.pet.page.PetHubInfoPage {
        return this._view as any;
    }

    /**绑定，注册，静态数据获取 （初始化） */
    protected onInit(): void {
        this.view.infoList.itemRenderer = this.onShowList.bind(this);
    }

    /**动态数据获取，界面逻辑 （界面打开，可能触发多次）*/
    protected onOpen(args?): void {
        let allCfg = PetHubModel.getAllPoolCfg();
        if (!allCfg) {
            return;
        }
        this._allCfg = allCfg;
        this.view.infoList.numItems = allCfg.length;
    }

    onShowList(index: number, item: ui.pet.com.PetHubInfoComp) {
        let data = this._allCfg[index];
        let itemInfo = NoOwnerItem.create(data.itemId, data.amount);
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, data.itemId);
        //@ts-ignore
        item.itemIcon.resetByNoOwnerItem(itemInfo);
        let itemName: string = itemCfg ? G.I18nManager.lang(itemCfg.name) : "";
        item.nameLabel.text = itemName;
        item.nameLabel2.text = `${data.showWeight / 100}%`;
        item.nameLabel3.text = `${data.gainWeight / 100}%`;
    }

    /*清理定时器、动画、临时数据 （界面关闭，注意这里不是销毁）*/
    protected onClose(): void {}

    /**用于界面清理缓存 （界面销毁）*/
    protected onPreDispose(): void {}
}
