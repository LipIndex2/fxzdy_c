import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FguiUtils from "db://assets/scripts/core/utils/FguiUtils";
import { AttrConfigEffect } from "db://assets/scripts/game/modules/attr/structs/AttrConfigEffect";
import { CaptainSkillUtils, ICaptainFetterSkillData } from "db://assets/scripts/game/modules/captainSkill/utils/CaptainSkillUtils";
import * as fgui from "fairygui-cc";
import { StringUtils } from "../../../../core/utils/StringUtils";

/**
 * 描述面板
 */
export class CaptainSkillContentComp extends fgui.GComponent {
    /**技能id*/
    protected _captainSkillId: number = 0;
    // 战队技能lv
    private _lv: number = 0;
    // 技能特效
    private _skillEffects: ICaptainFetterSkillData[] = [];
    // 全队属性
    private _attrAllDatas: AttrConfigEffect[] = [];
    // 职业属性
    private _attrCareerDatas: AttrConfigEffect[] = [];

    private get view(): ui.captainSkill.components.CaptainSkillContentComp {
        return this as any;
    }

    protected onInit() {
        //全队加成
        // this.view.listAttrAll.setVirtual();
        // this.view.listAttrAll.itemRenderer = this.itemRendererForAttrAll.bind(this);
        // 属性加成
        this.view.listAttrCareer.setVirtual();
        this.view.listAttrCareer.itemRenderer = this.itemRendererForAttrCareer.bind(this);
        // 特效加成
        // this.view.listEffect.setVirtual();
        this.view.listEffect.itemRenderer = this.itemRendererForEffect.bind(this);

        this.view.gAll.layout = fgui.GroupLayoutType.Vertical;
        this.view.gAll.columnGap = 10;
    }

    protected onPreDispose() {
    }

    // protected itemRendererForAttrAll(index: number, item: ui.captainSkill.components.CaptainSkillAddAttrComp) {
    //     let effect = this._attrAllDatas[index];
    //     item.labelValue.text = effect.getShowValueTextWithSymbol();
    //     item.imageIcon.icon = effect.getIconPath();
    // }

    protected itemRendererForAttrCareer(index: number, item: ui.captainSkill.components.CaptainSkillAddAttrComp) {
        let effect = this._attrCareerDatas[index];
        item.labelValue.text = effect.getShowValueTextWithSymbol();
        item.imageIcon.icon = effect.getIconPath();
    }

    protected itemRendererForEffect(index: number, comp: ui.captainSkill.components.CaptainSkillOneEffectComp) {
        const data: ICaptainFetterSkillData = this._skillEffects[index];
        const needLv = data.captainLv;
        const isUnlock = this._lv >= needLv;

        comp.getController("unlockFlag").selectedIndex = isUnlock ? 1 : 0;
        let desc: string = ''
        if (data.passiveId) {
            //是技能
            let cfg = G.TableManager.getDataById(table.battle.SkillConfig, data.passiveId);
            if (cfg) {
                desc = StringUtils.repleaceDescToAtkImage(cfg.desc)
            }
        } else if (data.captainSkillId) {
            let cfg = G.TableManager.getDataById(table.captain.CaptainSkillConfig, data.captainSkillId);
            if (cfg) {
                desc = G.I18nManager.translateOrBlank(cfg.desc);
            }
        }
        if (isUnlock) {
            // unlock
            comp.labelSkill.text = desc;
        } else {
            // lock
            const outputText = FguiUtils.replaceRichTextWithFontColor(desc, comp.labelSkill)
            comp.labelSkill.text = outputText + ` (${needLv}级解锁)`;
        }

        comp.height = comp.labelSkill.y + comp.labelSkill.height;
    }

    @LogBusiness("[战队技能] 内容面板")
    public reset(skillId: number, lv: number) {
        if (skillId == null || lv == null) {
            console.error("[战队技能] 内容面板")
        }
        this._captainSkillId = skillId;
        this._lv = lv;
        this._attrAllDatas.length = 0;
        this._attrCareerDatas.length = 0;
        let cfg = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(skillId, lv);
        if (cfg == null && lv <= 0) {
            //0级展示1级属性
            cfg = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(skillId, 1);
        }
        if (cfg) {
            if (cfg.addAttrArray1?.length > 0) {
                let attrs = cfg.addAttrArray1.map((value) => { return AttrConfigEffect.create(value.k, lv <= 0 ? 0 : value.v) });
                this._attrAllDatas = attrs;
            }
            if (cfg.effectType2 && cfg.addAttrArray2?.length > 0) {
                let attrs = cfg.addAttrArray2.map((value) => { return AttrConfigEffect.create(value.k, lv <= 0 ? 0 : value.v) });
                this._attrCareerDatas = attrs;
            }
            //全队加成
            // this.view.listAttrAll.numItems = this._attrAllDatas.length;
            // this.view.listAttrAll.resizeToFit();
            //属性加成
            this.view.listAttrCareer.numItems = this._attrCareerDatas.length;
            this.view.listAttrCareer.resizeToFit();

            // 技能特效
            let skillEffects = CaptainSkillUtils.getCaptainSkillEffects(skillId);
            this._skillEffects.length = 0;
            let unlockCnt: number = 0;
            for (let i = 0; i < skillEffects.length; i++) {
                this._skillEffects.push(skillEffects[i]);
                if (skillEffects[i].captainLv > this._lv) {
                    //未解锁
                    unlockCnt++;
                    if (unlockCnt >= CaptainSkillUtils.getShowUnlockSkillCnt()) {
                        //达到展示上限
                        break;
                    }
                }
            }

            this.view.listEffect.numItems = this._skillEffects.length;
            // this.view.effectComp.listEffect.resizeToFit();
            // this.view.effectComp.height = this.view.effectComp.listEffect.y + this.view.effectComp.listEffect.height;
            this.view.gAll.ensureSizeCorrect();

            this.view.listEffect.height = this.view.height - this.view.listEffect.y;

            let unlockIndex: number = this._skillEffects.findIndex((value) => value.captainLv > this._lv);
            if (unlockIndex > 3) {
                //只解锁3条以内还是置顶显示
                //有未解锁的项目 需要滚动到展示未解锁项目
                // let scollIndex: number = Math.max(0, unlockIndex - 2);
                let scollY: number = 0;
                if (unlockIndex > 0) {
                    for (let i = 0; i <= unlockIndex; i++) {
                        let childIndex = this.view.listEffect.itemIndexToChildIndex(i);
                        let item = this.view.listEffect.getChildAt(childIndex);
                        if (item) {
                            scollY += item.height + this.view.listEffect.lineGap;
                        }
                    }
                }
                let posY: number = Math.max(0, scollY - this.view.listEffect.height);
                this.view.listEffect.scrollPane.setPosY(posY);
            } else {
                this.view.listEffect.scrollToView(0, false, true);
            }
            let careerCfg = G.TableManager.getDataById(table.hero.HeroClassConfig, cfg.effectType2);
            let careerName: string = careerCfg ? careerCfg.name : '';
            this.view.lbTitle.text = `全部${careerName}英雄享有加成`;
        }
    }
}