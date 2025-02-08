import * as fgui from 'fairygui-cc';
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { StringUtils } from '../../../../core/utils/StringUtils';
import GIns from "../../../GIns";
import { SkillConfigDatas } from '../../../table/battle/SkillConfigDatas';
import { CollectionsVo } from '../../collections/vo/CollectionsVo';
import { ItemUtils } from "../../item/utils/ItemUtils";
import { FormationSkillType } from '../const/FormationSkillType';
import { FormationSkillVo } from '../vo/FormationSkillVo';
import { FormationSkillSelectItem } from './FormationSkillSelectItem';

@bindFguiExtension('ui://formation/FormationSkillChooseComp')
export class FormationSkillChooseComp extends fgui.GComponent {
    protected _type: number = 0;
    /**数据列表*/
    private _vos: FormationSkillVo[];
    //id
    private _baseId: number = 0;
    private _descList: string[] = [];
    protected _excludes: number[] = null;
    protected _bg: fgui.GGraph = null;
    /**选择回调*/
    public changeIdCallback: (baseId: number) => void = null;

    get view(): ui.formation.skill.FormationSkillChooseComp {
        return this as any
    }

    public get type(): number {
        return this._type;
    }

    protected onInit() {
        this.view.descList.setVirtual();
        this.view.descList.itemRenderer = this.itemRendererForDesc.bind(this);
        this.view.skillList.setVirtual();
        this.view.skillList.itemRenderer = this.itemRendererForSkill.bind(this);
        this.view.bg.onClick(this.onClickBg, this);
    }

    protected onClickBg(): void {
        this.view.visible = false;
    }

    reset(baseId: number, type: FormationSkillType, excludes: number[] = null) {
        this._baseId = baseId;
        this._type = type;
        this._excludes = excludes;

        this._vos = [];
        if (this._type == FormationSkillType.COLLECTIONS) {
            //收藏品
            let activeIds: number[] = GIns.collectionsModel.context.getAllActiveCollections();
            activeIds?.forEach((id) => {
                let vo = GIns.collectionsModel.context.getCollectionById(id);
                if (vo && vo.getUnlockBattleSkill()?.length > 0) {
                    //可上阵
                    this._vos.push(vo as CollectionsVo);
                }
            })
        } else if (this._type == FormationSkillType.PET) {
            //宠物
            let allPetIds = GIns.petModel.petContext.getAllActivePetId()
            allPetIds?.forEach((id) => {
                this._vos.push(GIns.petModel.petContext.getDataByCfgId(id))
            })
        }

        this.view.skillList.numItems = this._vos.length;
        this.updateDescContent();
    }

    protected itemRendererForStar(i: number, index: number, item: ui.comm.item.StarIconItem,) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._vos[i].star);
    }

    private itemRendererForSkill(index: number, item: FormationSkillSelectItem): void {
        item.type = this._type;
        item.updateByVo(this._vos[index]);

        // 是否选中
        const isChoose = this._baseId == item.baseId;
        item.getController("chooseFlag").selectedIndex = isChoose ? 1 : 0;

        if (this._excludes && this._excludes.indexOf(item.baseId) != -1) {
            //被占用
            item.getController("occupy").selectedIndex = 1;
            item.touchable = false
        } else {
            item.getController("occupy").selectedIndex = 0;
            item.touchable = true
        }

        // click skill
        item.clearClick();
        item.onClick(() => {
            this._baseId = item.baseId;
            this.view.skillList.refreshVirtualList();
            this.updateDescContent();
            this.onItemSelectCallback();
        }, this);
    }

    private onItemSelectCallback() {
        this.changeIdCallback && this.changeIdCallback(this._baseId);
    }

    private itemRendererForDesc(index: number, comp: ui.formation.skill.FormationSkillDescItemComp): void {
        const desc = this._descList[index];
        comp.labelContent.text = desc;
        comp.height = comp.labelContent.actualHeight + comp.margin.top + comp.margin.bottom;
    }

    // 更新内容
    private updateDescContent() {
        if (this._baseId == 0) {
            this.view.labelTitle.text = "";
            this.view.descList.numItems = 0;
            return;
        } else {
            this.updateDescList();
            // 获取已解锁的描述
            this.view.descList.numItems = this._descList.length;
            this.view.descList.refreshVirtualList();
        }
    }

    protected updateDescList(): void {
        this._descList = []
        if (this._type == FormationSkillType.COLLECTIONS) {
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, this._baseId);
            this.view.labelTitle.text = itemCfg ? itemCfg.name : '';
            let collectionsVo = GIns.collectionsModel.context.getCollectionById(this._baseId);
            if (collectionsVo) {
                let skillIds:string[] = collectionsVo.getUnlockBattleSkill();
                skillIds?.forEach((id) => {
                    let desc = GIns.collectionsCfgMgr.getSkillDesByEffectId(id);
                    if (desc) {
                        this._descList.push(desc);
                    }
                })
            }
        } else if (this._type == FormationSkillType.PET) {
            let cfg = G.TableManager.getDataById(table.pet.PetConfig, this._baseId);
            this.view.labelTitle.text = cfg ? cfg.name : '';
            let skillLvs = GIns.petCfgMgr.getPetSkillLvs(this._baseId);
            cfg.skillIds?.forEach((skillId: string, index: number) => {
                if (index < skillLvs.length) {
                    let skillCfg = SkillConfigDatas.ins().getConfigsByGroup(skillId)
                    skillCfg?.forEach((cfg) => {
                        if (cfg.level <= skillLvs[index]) {
                            let skillDes = StringUtils.repleaceDescToAtkImage(cfg.desc)
                            if (skillDes) {
                                this._descList.push(skillDes)
                            }
                        }
                    })
                }
            });
            if (this._descList.length <= 0) {
                //没有读取到技能描述 就读宠物描述
                if (cfg?.desc) {
                    this._descList.push(cfg.desc)
                }
            }
        }
    }

    /**获取选择的 id*/
    get baseId(): number {
        return this._baseId;
    }
}