import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { FormationManager } from "../../game/modules/formation/FormationManager";
import { HeroManager } from "../../game/modules/hero/HeroManager";
import GIns from "../../game/GIns";
import { AttrData, AttrManager } from "../../game/modules/attr/AttrManager";
import { ServerEnums } from "../../libs/extras/ServerEnums";
import { AttrConfigManager } from "../../game/modules/attr/config/AttrConfigManager";
import { Attribute, AttributeType, AttrType } from "../../game/modules/attr/AttrEnum";
import { TableManager } from "../../core/table/TableManager";
import { AttrUtils } from "../../game/modules/attr/utils/AttrUtils";
import { AttrEnum } from "../../game/comm/battle/attribute/AttrEnum";
import ObjectUtils from "../../core/utils/ObjectUtils";

/**
 * GM 英雄属性
 */
export class GMHeroAttrView extends fgui.GComponent {
    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMHeroAttrView";

    // endregion

    private get view(): ui.gm.GMHeroAttrView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    public onInit() {
        this.view.heroAttrInputBox.labelTitle.text = "英雄id";
        // button
        this.view.btnOk.labelTitle.text = "获 取";

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this);
    }

    private onClickOk() {
        const heroId = this.view.heroAttrInputBox.inputName.text.toInt();

        GmModel.ins().sendLoadHeroAttribute(heroId);
        let heroVo = GIns.heroMgr.getHeroVoByID(heroId);

        console.log("================================ 英雄属性 =========================================");

        //面板属性  一级属性
        console.log("面板属性  一级属性：");
        let attrDatas: AttrData[] = [];
        /********************基础面板属性*****************/
        let atk = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Attack);
        let def = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Defense);
        let hp = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Blood);
        //攻击
        let AttrATKCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.ATK);
        let atkData: AttrData = new AttrData();
        atkData.id = Attribute.ATK;
        atkData.type = AttributeType.PANEL_ATTR;
        atkData.num = atk;
        atkData.worth = AttrATKCfg.cpWorth;
        atkData.mod = AttrATKCfg.cpMod;
        attrDatas.push(atkData);

        //血量
        let AttrHPCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.HP);
        let hpData: AttrData = new AttrData();
        hpData.id = Attribute.HP;
        hpData.type = AttributeType.PANEL_ATTR;
        hpData.num = hp;
        hpData.worth = AttrHPCfg.cpWorth;
        hpData.mod = AttrHPCfg.cpMod;
        attrDatas.push(hpData);

        //防御
        let AttrDEFCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.DEF);
        let defData: AttrData = new AttrData();
        defData.id = Attribute.DEF;
        defData.type = AttributeType.PANEL_ATTR;
        defData.num = def;
        defData.worth = AttrDEFCfg.cpWorth;
        defData.mod = AttrDEFCfg.cpMod;
        attrDatas.push(defData);

        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("英雄初始二级属性：");
        attrDatas = [];
        if (heroVo.heroCfg.baseSecondAttrs) {
            for (let attr of heroVo.heroCfg.baseSecondAttrs) {
                let data = AttrManager.ins().convertDataFormat(attr.k, attr.v);
                attrDatas.push(data);
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("英雄技能属性：");
        attrDatas = [];
        let skillAttrs = heroVo.getHeroAllSkillAttr();
        if (skillAttrs) {
            for (let attr of skillAttrs) {
                attrDatas.push(attr);
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("魔方属性：");
        attrDatas = [];
        if (heroVo.magicCubeVo) {
            for (let attr of heroVo.magicCubeVo.getAttr()) {
                if (attr) {
                    attrDatas.push(attr);
                }
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("装备属性：");
        attrDatas = [];
        let equipAttrs = GIns.equipMgr.allEquipAttrs;
        for (let attr of equipAttrs) {
            if (attr) {
                attrDatas.push(attr);
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("专武属性：");
        attrDatas = [];
        heroVo.updateWeaponAttr(attrDatas);
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("皮肤属性：");
        attrDatas = [];
        let skinAttrs = GIns.heroMgr.getSkinAttrs();
        if (skinAttrs) {
            for (let attr of skinAttrs) {
                attrDatas.push(attr);
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("星灵属性：");
        attrDatas = [];
        GIns.petCfgMgr.getLVStageAttr(attrDatas);
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }
        //星灵羁绊
        console.log("星灵羁绊:");
        attrDatas = [];
        GIns.petModel.petGroupContext.getGroupAttr(attrDatas);
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("收藏品属性：");
        attrDatas = [];
        for (let v of GIns.collectionsModel.context.getMergedAddAttrDataArray()) {
            if (v.unitEffectiveType && v.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.attackRange] && v.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.career]) {
                continue;
            }
            attrDatas.push(v);
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("英雄潜能属性：");
        attrDatas = [];
        const dnaData = heroVo.getDNAInfo();
        if (dnaData && dnaData.awaken) {
            for (const index in dnaData.awaken) {
                const info = dnaData.awaken[index];
                if (!info || !info.attrs || !info.attrs[0]) {
                    continue;
                }
                let attrId = AttrEnum[info.attrs[0].k] as Attribute;
                let data = AttrManager.ins().convertDataFormat(attrId, info.attrs[0].v);
                attrDatas.push(data);
            }
        }
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }

        console.log("天赋属性：");
        const otherAttrArray1 = GIns.talentMgr.getMergedAllAddAttrDataArray();
        let attrMap = {};
        for (let attr of otherAttrArray1) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.career]
            ) {
                continue;
            }

            if (attr) {
                //@ts-ignore
                let id = attr.id || attr._id;
                if (attrMap[id]) {
                    attrMap[id] += attr.num;
                } else {
                    attrMap[id] = attr.num;
                }
            }
        }
        let keys = Object.keys(attrMap);
        for (let key of keys) {
            console.log("属性id：" + key + ", 属性总值：" + attrMap[key]);
        }

        console.log("战队科技属性：");
        let otherAttrArray2 = GIns.captainSkillMgr.getMergedAllAddAttrDataArray();
        attrMap = {};
        for (let attr of otherAttrArray2) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.career]
            ) {
                continue;
            }

            if (attr) {
                //@ts-ignore
                let id = attr.id || attr._id;
                if (attrMap[id]) {
                    attrMap[id] += attr.num;
                } else {
                    attrMap[id] = attr.num;
                }
            }
        }
        keys = Object.keys(attrMap);
        for (let key of keys) {
            console.log("属性id：" + key + ", 属性总值：" + attrMap[key]);
        }

        console.log("联盟属性：");
        attrDatas = [];
        let otherAttrArray3 = GIns.LeagueManager.getMergedAllAddAttrDataArray();
        attrMap = {};
        for (let attr of otherAttrArray3) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.career]
            ) {
                continue;
            }

            if (attr) {
                //@ts-ignore
                let id = attr.id || attr._id;
                if (attrMap[id]) {
                    attrMap[id] += attr.num;
                } else {
                    attrMap[id] = attr.num;
                }
            }
        }
        keys = Object.keys(attrMap);
        for (let key of keys) {
            console.log("属性id：" + key + ", 属性总值：" + attrMap[key]);
        }

        console.log("设置属性（头像和称号那些？）：");
        attrDatas = [];
        let otherAttrArray4 = GIns.settingsMgr.getMergedAllAddAttrDataArray();
        attrMap = {};
        for (let attr of otherAttrArray4) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[heroVo.heroCfg.career]
            ) {
                continue;
            }

            if (attr) {
                //@ts-ignore
                let id = attr.id || attr._id;
                if (attrMap[id]) {
                    attrMap[id] += attr.num;
                } else {
                    attrMap[id] = attr.num;
                }
            }
        }
        keys = Object.keys(attrMap);
        for (let key of keys) {
            console.log("属性id：" + key + ", 属性总值：" + attrMap[key]);
        }

        console.log("英雄技能：");
        let heroSkill = HeroManager.ins().getHeroSkillIdByFight(heroVo.heroCfg.id);
        for (let skill of heroSkill) {
            if (skill) {
                console.log("英雄技能id：" + skill);
            }
        }

        console.log("英雄总属性：");
        attrDatas = [];
        attrDatas = heroVo.allAttrDataArr();
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        for (let attr of attrDatas) {
            //@ts-ignore
            let id = attr.id || attr._id;
            console.log("属性id：" + id + ", 属性总值：" + attr.num);
        }
    }
}
