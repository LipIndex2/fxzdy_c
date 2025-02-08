import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { MagicCubeVo } from "../../magicCube/MagicCubeVo";
import GIns from "../../../GIns";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { TableManager } from "../../../../core/table/TableManager";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";

/** 魔方item */
@bindFguiExtension("ui://hero/MagicCubeInfoItem")
export class MagicCubeInfoItem extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "MagicCubeInfoItem";

    private _heroId: number;
    private _vo: MagicCubeVo;

    private get view(): ui.hero.item.MagicCubeInfoItem {
        return this as any;
    }

    protected onInit() {
        this.view.list_attr.itemRenderer = this.attrItem.bind(this);
    }

    public setHeroId(heroId: number) {
        this._heroId = heroId;
        this._vo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(heroId);
        if (!this._vo) return;

        this.view.list_attr.numItems = this._vo.getAttr().length;

        this.view.T_level.text = this._vo && this._vo.level > 0 ? `+${this._vo.level}` : "";
        this.view.img_item.icon = this._vo.cubeIcon;

        this.view.T_name.text = this._vo.name;
        const quality = this._vo.quality;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, quality);

        this.view.img_frame.icon = ItemUtils.getQualityIconResourcePath(quality);
    }

    private attrItem(index: number, item: ui.hero.item.HeroSkinFirstGetAttrItem) {
        let attrData = this._vo.getAttr()[index];
        let cfg = TableManager.getDataById(table.battle.AttributeConfig, attrData.id);
        item.lb_name.text = `${cfg.attrName}`;
        item.lb_attr.x = 280;
        if (cfg.isPermyriad) {
            item.lb_attr.text = `+${attrData.num / 100}%`;
        } else {
            item.lb_attr.text = `+${attrData.num}`;
        }
    }
}
