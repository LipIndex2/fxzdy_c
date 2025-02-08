import * as fgui from "fairygui-cc";
import { UIManager } from "../../../../core/mvc/UIManager";
import GIns from "../../../GIns";
import { UIMagicCubeKey } from "../../magicCube/const/UIMagicCubeConfig";
import { MagicCubeVo } from "../../magicCube/MagicCubeVo";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/** 魔方item */
@bindFguiExtension("ui://hero/MagicCubeBtnItem")
export class MagicCubeBtnItem extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "MagicCubeBtnItem";

    private _heroId: number;
    private _vo: MagicCubeVo;

    private get view(): ui.hero.item.MagicCubeBtnItem {
        return this as any;
    }

    protected onInit() {
        this.view.btn_openInfo.on(fgui.Event.CLICK, this.onOpenInfoClick, this);
    }

    public setHeroId(heroId: number) {
        this._heroId = heroId;
        this._vo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(heroId);
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Null);

        if (!this._vo) {
            //激活红点
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Cube_activate, [heroId]);
        } else {
            if (this._vo.isCanUp(false)) {
                //升级红点
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Cube_upgrade, [heroId]);
            } else {
                //转换红点
                // FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Cube_convert, [heroId]);
            }
        }

        let cfg = TableManager.getDataById(table.magiccube.MagicCubeConstantConfig, "MAGICCUBE_NAME");
        this.view.T_name.text = cfg.content;
        this.view.T_level.text = this._vo && this._vo.level > 0 ? `+${this._vo.level}` : "";
        if (!this._vo) {
            this.view.btn_openInfo.T_tips.text = "去解锁";
            this.view.img_suo.visible = true;
            this.view.img_item.icon = "image/item/MF_999";
            this.view.img_frame.icon = ItemUtils.getQualityIconResourcePath(1);
        } else {
            this.view.btn_openInfo.T_tips.text = "去转换";
            this.view.img_suo.visible = false;
            this.view.img_item.icon = this._vo.cubeCfg.icon;
            this.view.img_frame.icon = ItemUtils.getQualityIconResourcePath(this._vo.quality);
        }
    }

    //打开详情界面
    private onOpenInfoClick() {
        UIManager.ins().open(UIMagicCubeKey.MagicCubeMainWin, this._heroId);
    }
}
