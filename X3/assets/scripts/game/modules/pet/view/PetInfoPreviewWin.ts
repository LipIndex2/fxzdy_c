import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import { DataStream } from "../../../../core/utils/DataStream";
import { StringUtils } from "../../../../core/utils/StringUtils";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PetSkillItem } from "../com/PetSkillItem";
import { UIPetKey } from "../const/UIPetConfig";

declare global {
    namespace IPet {
        type TPetInfoPreviewWin_param = TViewParamMax

        interface IPreviewInfo {
            petCfg: table.pet.PetConfig
            itemCfg: table.item.ItemConfig
            allAttrKV: { k: any; v: any; }[]
            petSharelv: number
            star: number
            fight: number
        }
    }
}

//显示满级信息
type TViewParamMax = {
    petCfgId: number
    showMaxInfo: true   //显示满星信息
}

/**
 * 宠物信息预览界面
 */
@bindScript(UIPetKey.PET_INFO_PREVIEW_VIEW)
export class PetInfoPreviewWin extends UICommWin {

    static pkgName: string = "pet";
    static viewName: string = "PetInfoPreviewWin";

    protected _previewInfo: IPet.IPreviewInfo

    private get view(): ui.pet.view.PetInfoPreviewWin {
        return this._view as any;
    }

    // listenNotifications(): string[] {
    //     return []
    // }

    // notificationHandler(event: string, args?: any): void {

    // }

    /***组件初始化 */
    protected onInit(): void {
        //界面初始化
        this.view.PetSwitch.list_star1.itemRenderer = this.itemRendererForStar.bind(this);
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._previewInfo.star);
    }

    public onOpen(param: IPet.TPetInfoPreviewWin_param): void {
        if (param.showMaxInfo) {
            this.buildMaxPreviewInfo(param)
        }

        this.updateUI()
    }

    private updateUI() {
        let view = this.view;
        let { PetSwitch, PetUpLevel } = view;
        let { petCfg } = this._previewInfo;
        //名字
        PetSwitch.T_name.text = petCfg.name;
        PetSwitch.T_name.color = QualityUtils.getQualityColor(petCfg.quality)
        //星级
        PetSwitch.list_star1.numItems = HeroUtils.getShowStarCount(this._previewInfo.star);
        //模型
        let model = PetSwitch.modelNode as any as ModelNode;
        model.loadByModelId(petCfg.showModelId);
        //战力
        PetSwitch.T_power.text = StringUtils.getFightStr(this._previewInfo.fight);
        //等级
        PetUpLevel.T_level.text = `Lv.${this._previewInfo.petSharelv}`;
        //属性
        AttrUtils
            .parseKvArrayToAttrArray(this._previewInfo.allAttrKV)
            .forEach(v => {
                switch (v.attrId) {
                    case Attribute.ATK_BONUS:
                        PetUpLevel.T_attack.text = v.getValueStringForUIShow();
                        break;
                    case Attribute.HP_BONUS:
                        PetUpLevel.T_blood.text = v.getValueStringForUIShow();
                        break;
                    case Attribute.DEF_BONUS:
                        PetUpLevel.T_defense.text = v.getValueStringForUIShow();
                        break;
                }
            })
        //技能

        let skillData = GIns.petCfgMgr.getPetPureSkillDatasByParams(petCfg.id, this._previewInfo.star);
        let skill: PetSkillItem = PetUpLevel.skill as any;
        if (skillData) {
            skill.updateInfo(skillData, petCfg.id);
        }
    }

    private buildMaxPreviewInfo(param: TViewParamMax) {
        let { petCfgId } = param;
        let { TableManager } = G;
        let { petCfgMgr } = GIns;
        let petCfg = TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let itemCfg = TableManager.getDataById(table.item.ItemConfig, petCfgId);

        // 宠物属性+最高级的属性+最高阶级的属性+最高星级的属性
        let maxLVCfg = TableManager.getDataById(table.pet.PetLevelConfig, petCfgMgr.maxShareLV);
        let maxStageCfg = TableManager.getDataById(table.pet.PetStageConfig, petCfgMgr.maxShareStage);
        let petCftAttrKV = [
            { k: Attribute.ATK_BONUS, v: petCfg.atkMod },
            { k: Attribute.HP_BONUS, v: petCfg.hpMod },
            { k: Attribute.DEF_BONUS, v: petCfg.defMod },
        ];

        petCfgMgr.getStarAttrKV(petCfgId, petCfgMgr.getMaxStar(petCfgId));
        let allAttrKV = petCftAttrKV.concat(maxLVCfg.heroAttrAdditions, maxStageCfg.heroAttrAdditions);
        
        let maxStar = petCfgMgr.getMaxStar(petCfgId);
        this._previewInfo = {
            petCfg: petCfg,
            itemCfg: itemCfg,
            allAttrKV: allAttrKV,
            petSharelv: petCfgMgr.maxShareLV,
            star: maxStar,
            fight: petCfgMgr.getIllustrationFight(petCfgId),
        };
    }
}