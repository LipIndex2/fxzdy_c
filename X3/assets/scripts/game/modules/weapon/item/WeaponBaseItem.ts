import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { ItemUtils } from "../../item/utils/ItemUtils";


/** 武器基础显示item */
export class WeaponBaseItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponBaseItem";


    private get view(): ui.comm.item.WeaponBaseItem {
        return this as any;
    }

    protected onInit() {

    }

    public setData(baseId: number, star:number = 0): void {
        let cfg = G.TableManager.getDataById(table.item.ItemConfig, baseId)
        this.setDataByItemCfg(cfg, star)
    }

    public setDataByItemCfg(cfg:table.item.ItemConfig, star:number = 0):void {
        if (cfg) {
            this.view.bg.icon = ItemUtils.getQualityIconResourcePath(cfg.quality)
            this.view.iconLoader.icon = cfg.smallIconPath

            this.view.bgStar.visible = star > 0
            this.view.listIcon.numItems = star
        }
    }
}