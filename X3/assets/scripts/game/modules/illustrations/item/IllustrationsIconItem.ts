import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";


/** 图鉴奖励道具item */
export class IllustrationsIconItem extends fgui.GComponent {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsIconItem";

    public itemCfg:table.item.ItemConfig = null
    public count:number = 0

    private get view(): ui.illustrations.item.IllustrationsIconItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {

    }

    public setData(data: any): void {
        this.itemCfg = G.TableManager.getDataById(table.item.ItemConfig, data.k);
        // 物品配置
        if (this.itemCfg) {
            // 物品图标
            this.view.itemIcon.icon = this.itemCfg.iconPath;
        }

        // 品质
        const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, this.itemCfg?.quality);
        if (qualityConfig) {
            // 品质背景
            this.view.bg.icon = qualityConfig.itemQualityBgPath
        }

        // 物品数量
        this.count = data.v
        this.view.itemCount.text = "" + data.v;
    }
}