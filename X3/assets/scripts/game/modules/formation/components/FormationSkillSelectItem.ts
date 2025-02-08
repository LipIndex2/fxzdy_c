import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { C_PetVo } from "../../pet/vo/PetContext";
import { FormationSkillType } from "../const/FormationSkillType";
import { FormationSkillVisitVo, FormationSkillVo } from "../vo/FormationSkillVo";

/** 布阵技能选择item */
@bindFguiExtension('ui://comm/FormationSkillSelectItem')
export class FormationSkillSelectItem extends fgui.GComponent {
    /**id*/
    protected _baseId: number = 0;
    /**星级*/
    protected _star: number = 0;
    /**技能名称*/
    protected _skillName: string = '';
    /**技能品质*/
    protected _skillQuality: number = 0;
    /**技能类型*/
    protected _type: number = 0;

    get view(): ui.comm.formation.FormationSkillSelectItem {
        return this as any
    }

    public set type(value: FormationSkillType) {
        this._type = value;
    }

    /**技能id*/
    public get baseId(): number {
        return this._baseId;
    }

    /**技能名称*/
    public get skillName(): string {
        return this._skillName;
    }

    /**技能品质*/
    public get skillQuality(): number {
        return this._skillQuality;
    }

    protected onInit(): void {
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this)
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem,) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    public updateData(baseId: number, star: number): void {
        if (this._baseId != baseId) {
            this._baseId = baseId;
            if (this._type == FormationSkillType.COLLECTIONS) {
                let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, baseId)
                if (itemCfg) {
                    let qualityCfg = G.TableManager.getDataById(table.quality.QualityConfig, itemCfg?.quality)
                    this.view.bgQuality.icon = qualityCfg?.petCardQualityBgPath
                    this.view.iconLoader.icon = itemCfg?.iconPath;
                    this._skillName = itemCfg.name;
                    this._skillQuality = itemCfg.quality;
                }
            } else if (this._type == FormationSkillType.PET) {
                let petCfg = G.TableManager.getDataById(table.pet.PetConfig, baseId)
                if (petCfg) {
                    let qualityCfg = G.TableManager.getDataById(table.quality.QualityConfig, petCfg?.quality)
                    this.view.bgQuality.icon = qualityCfg?.petCardQualityBgPath
                    this.view.iconLoader.icon = petCfg?.headPath;
                    this._skillName = petCfg.name;
                    this._skillQuality = petCfg.quality;
                }
            }
        }

        //刷新星级
        if (this._star != star) {
            this._star = star
            this.view.listStar.numItems = HeroUtils.getShowStarCount(star)
        }

        //默认不展示等级
        this.view.lbLv.visible = false;
        if (this._type == FormationSkillType.COLLECTIONS) {
            let isLimit:boolean = GIns.collectionsCfgMgr.isTimeLimitColl(this._baseId);
            if (isLimit == false) {
                //非限时收藏品才展示等级
                let lv = GIns.collectionsModel.context.getCollectionLV(this._baseId);
                this.view.lbLv.visible = true;
                this.view.lbLv.text = '+' + lv;
            }  
        }
    }

    public updateByVisitVo(vo: FormationSkillVisitVo): void {
        if (vo) {
            if (this._type == FormationSkillType.COLLECTIONS) {
                this.updateData((vo as Vo.formation.CollectiblesVisitVo).collectiblesId, vo.star);
            } else if (this._type == FormationSkillType.PET) {
                this.updateData((vo as Vo.formation.PetVisitVo).petBaseId, vo.star);
            }
        }
    }

    public updateByVo(vo: FormationSkillVo): void {
        if (vo) {
            if (this._type == FormationSkillType.COLLECTIONS) {
                this.updateData((vo as CollectionsVo).baseId, vo.star);
            } else if (this._type == FormationSkillType.PET) {
                this.updateData((vo as C_PetVo).petBaseId, vo.star);
            }
        }
    }
}