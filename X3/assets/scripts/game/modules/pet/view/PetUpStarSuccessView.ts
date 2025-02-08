import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PetSkillItem } from "../com/PetSkillItem";
import { UIPetKey } from "../const/UIPetConfig";
import { PetConfigManager } from "../PetConfigManager";
import { C_PetVo } from "../vo/PetContext";

declare global {
    namespace IPet {
        interface IPetUpStarSuccessUIArgs {
            petCfgId: number; //petconfig.xlsx id
        }
    }
}

enum EUnlockSkill {
    nounlock = 0, //不显示解锁技能
    unlock = 1, //显示解锁技能
    upLV = 2, //技能升级
}

/** 升星成功界面 */
@bindScript(UIPetKey.PET_UP_STAR_SUCCESS_VIEW)
export class PetUpStarSuccessView extends UIWin {
    static pkgName: string = "pet";
    static viewName: string = "PetUpStarSuccessView";

    private get view(): ui.pet.view.PetUpStarSuccessView {
        return this._view as any;
    }

    private _lastStar: number;
    private _curStar: number;

    private _closeBtnInitY: number;
    /** 当前属性 */
    // private _newAttt = {};
    /** 旧属性 */
    // private _oldAttr = {};

    //变化属性,新
    private changeAttrDatas1: AttrData[] = [];
    //变化属性,旧
    private changeAttrDatas2: AttrData[] = [];

    protected onInit() {
        let view = this.view;

        view.closeBtn.onClick(this.closeSelf, this);

        view.listStarCur.itemRenderer = this.curStarItem.bind(this);
        view.listStarLast.itemRenderer = this.lastStarItem.bind(this);

        view.list_attr.itemRenderer = this.attrItemRenderer.bind(this);

        this._closeBtnInitY = view.closeBtn.y;
    }

    protected onOpen(args: IPet.IPetUpStarSuccessUIArgs, isReopen?: boolean) {
        let view = this.view,
            { TableManager } = G,
            { petCfgId } = args;
        let petCfg = TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfgId);
        this._curStar = petVo.star;
        this._lastStar = this._curStar - 1;
        let unlockSkill: EUnlockSkill;

        let model = view.modelNode as any as ModelNode;
        model.loadByModelId(petCfg.showModelId);

        let curStarCfg = GIns.petCfgMgr.getPetStarCfg(petCfgId, this._curStar);
        let lastStarCfg = GIns.petCfgMgr.getPetStarCfg(petCfgId, this._lastStar);

        // if(GIns.petCfgMgr.hasNewUnLockSkill(petCfg.id, petVo.star)){
        //     unlockSkill = EUnlockSkill.unlock
        // } else
        let petSkillChgInfo = GIns.petCfgMgr.skillChgInfo(petCfg.id, petVo.star);

        if(!petSkillChgInfo){
            unlockSkill = EUnlockSkill.nounlock;
        } else if (petSkillChgInfo.isUnlock) {
            unlockSkill = EUnlockSkill.unlock;
        } else {
            unlockSkill = EUnlockSkill.upLV;
        }

        if(unlockSkill != EUnlockSkill.nounlock) {
            let skillData = GIns.petCfgMgr.getPetPureSkillDatasByParams(petCfg.id);
            let skill = view.skill as any as PetSkillItem;
            if (skillData) {
                skill.updateInfo(skillData, petCfg.id);
            }
        }
        view.getController("unlockSkill").selectedIndex = unlockSkill;

        view.listStarCur.numItems = HeroUtils.getShowStarCount(this._curStar);
        view.listStarLast.numItems = HeroUtils.getShowStarCount(this._lastStar);

        if (unlockSkill == EUnlockSkill.nounlock) {
            view.getTransition("t0").play();
            view.closeBtn.y = this._closeBtnInitY - 147;
        } else {
            view.getTransition("t1").play();
            view.closeBtn.y = this._closeBtnInitY;
        }

        this.getChangerAttr(petCfgId);

        let keys = Object.keys(this.changeAttrDatas1);
        view.list_attr.numItems = keys.length;
    }

    private lastStarItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._lastStar);
    }
    private curStarItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._curStar);
    }

    private attrItemRenderer(index: number, item: ui.pet.com.PetUpSuccessCell) {
        // let keys = Object.keys(this.changeAttrDatas1);
        // let key = keys[index];

        let AttrData = this.changeAttrDatas1[index];
        let newNum = this.changeAttrDatas1[index].num;
        let oldNum = this.changeAttrDatas2[index].num;
        let attrCfg = TableManager.getDataById(table.battle.AttributeConfig, AttrData.id);
        item.txName.text = "队伍" + attrCfg.attrName;
        if (attrCfg.isPermyriad) {
            item.txLastNum.text = newNum / 100 + "%";
            item.txCurNum.text = oldNum / 100 + "%";
        } else {
            item.txLastNum.text = newNum.toString();
            item.txCurNum.text = oldNum.toString();
        }

        item.bg.visible = index % 2 ? false : true;
    }

    //更新变更属性
    private getChangerAttr(petCfgId: number) {
        //当前属性
        let attrDatas: AttrData[] = [];
        GIns.petCfgMgr.getLVStageAttr(attrDatas);

        //整合后的当前属性
        let newAttr = [];
        //整合后的上一星属性
        let oldAttr = [];
        //整合当前属性
        for (let attr of attrDatas) {
            if (attr) {
                if (newAttr[attr.id]) {
                    newAttr[attr.id] += attr.num;
                } else {
                    newAttr[attr.id] = attr.num;
                }
            }
        }

        let petCfg = TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfgId);
        //升星的属性
        if (petVo.star > petCfg.initStar) {
            let attr: AttrData[] = [];
            for (let starAttr of petCfg.starAttrs) {
                let attr2 = {
                    id: starAttr.k as Attribute,
                    num: -Number(starAttr.v),
                };
                let data = GIns.attrMgr.convertDataFormat(attr2.id, attr2.num);
                attr.push(data);
            }
            attrDatas.push(...attr);
        }
        //整合上一星属性
        for (let attr of attrDatas) {
            if (attr) {
                if (oldAttr[attr.id]) {
                    oldAttr[attr.id] += attr.num;
                } else {
                    oldAttr[attr.id] = attr.num;
                }
            }
        }

        //抽出变化属性
        for (let key in newAttr) {
            if (newAttr[key] != oldAttr[key]) {
                let attr1 = {
                    id: key as Attribute,
                    num: newAttr[key],
                };
                let attr2 = {
                    id: key as Attribute,
                    num: oldAttr[key],
                };

                let data1 = GIns.attrMgr.convertDataFormat(attr1.id, attr1.num);
                let data2 = GIns.attrMgr.convertDataFormat(attr2.id, attr2.num);
                this.changeAttrDatas1.push(data1);
                this.changeAttrDatas2.push(data2);
            }
        }
    }
}
