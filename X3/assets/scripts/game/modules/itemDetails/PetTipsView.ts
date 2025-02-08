import { Color } from "cc";
import { bindScript } from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { QualityUtils } from "../common/quality/QualityUtils";
import { CommonPetSkillItem } from "../hero/item/CommonPetSkillItem";
import { HeroSkillItem } from "../hero/item/HeroSkillItem";
import { PetSkillItem } from "../pet/com/PetSkillItem";
import { ItemTipsViewOpenArgs } from "./ItemTipsView";
import { UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

/**
 * 星灵
 */
@bindScript(UIViewItemDetailsKey.PetTipsView)
export class PetTipsView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "PetTipsView";

    private get view(): ui.itemDetails.PetTipsView {
        return this._view as any;
    }

    protected onInit(): void {}

    protected onOpen(args: ItemTipsViewOpenArgs, isReopen?: boolean): void {
        let cfg = args.itemConfig;
        let qualityCfg = QualityUtils.getQualityConfigById(cfg.quality);
        let petCfg = TableManager.getDataById(table.pet.PetConfig, cfg.id);
        this.view.T_name.text = cfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_name, cfg.quality);
        // this.view.T_tips.text = cfg.desc;

        this.view.tipsItem.labelContent.text = cfg.desc;
        this.view.tipsItem.labelContent.color = new Color("#FFFFFF");
        this.view.tipsItem.labelContent.fontSize = 24;

        this.view.img_bg.icon = qualityCfg.petPropDetailsQualityBgIconPath;
        this.view.img_quality.icon = qualityCfg.petPropDetailsQualityIconPath;

        //@ts-ignore
        this.view.modelNode.loadByModelId(petCfg.showModelId);
        this.view.modelNode.setScale(0.5, 0.5);

        let maxStar = GIns.petCfgMgr.getMaxStar(petCfg.id);
        let skillData = GIns.petCfgMgr.getPetPureSkillDatasByParams(petCfg.id, maxStar);
        let skill = this.view.skillItem as any as CommonPetSkillItem;
        if (skillData) {
            skill.updateInfo(skillData, petCfg.id);
        }
    }
}
