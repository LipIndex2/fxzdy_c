import { Color } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { HeroManager } from "../../hero/HeroManager";
import { HeroVo } from "../../hero/HeroVo";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponAttrItem } from "../item/WeaponAttrItem";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";
import { WeaponSkillListItem } from "../item/WeaponSkillListItem";
import { TableManager } from "../../../../core/table/TableManager";
import { SortUtils } from "../../../../core/utils/SortUtils";


/** 武器属性展示panel */
export class WeaponAttrPanel extends fgui.GComponent {
    private weaponVo: WeaponVo
    private get view(): ui.weapon.panel.WeaponAttrPanel {
        return this as any;
    }

    protected onInit() {
        this.view.lbAttributeBonus.text = '【' + G.I18nManager.lang(WeaponI18nKeys.attributeBonus) + '】'
    }

    public setData(data: WeaponVo): void {
        this.weaponVo = data;
        let attrs = [this.view.attr1, this.view.attr2, this.view.attr3]
        let changeH: number = 0
        attrs.forEach((value: ui.weapon.item.WeaponAttrItem, index: number) => {
            //@ts-ignore
            let comp: WeaponAttrItem = value as WeaponAttrItem
            if (index < data.attrs.length) {
                comp.visible = true
                comp.setData(data.attrs[index])
            } else {
                comp.visible = false
                changeH += comp.height
            }
        })

        if (data.cfg?.skillInfo) {
            //有附带技能
            this.view.panelHero.visible = true
            this.view.panelHero.y -= changeH

            if (data.cfg.heroBaseId) {
                let heroCfg = TableManager.getDataById(table.hero.HeroConfig, data.cfg.heroBaseId);
                this.view.lbExclusiveBonus.text = '【' + G.I18nManager.lang(WeaponI18nKeys.exclusiveBonus) + '·' + heroCfg.name + '】'
            }
            else {
                this.view.lbExclusiveBonus.text = '【' + G.I18nManager.lang(WeaponI18nKeys.texingjiacheng) + '】'
            }

            // const isUnlock = data.base.heroBaseId > 0
            //专属武器技能
            let heroWeaponSkills = this.getSkillListByStar(data.base.star);
            let lastHeight = 0;
            for (let i = 0; i < heroWeaponSkills.length; i++) {
                let item = fgui.UIPackage.createObject(this.packageItem.owner.name, "WeaponTipsSkillItem") as WeaponSkillListItem;
                item.setData(heroWeaponSkills[i])
                this.view.nodePoint.addChild(item);
                item.y = lastHeight + 10;
                lastHeight = item.y + item.height;
            }
            this.view.nodePoint.height = lastHeight;
        }
        else {
            this.view.panelHero.visible = false
        }

        this.height = Math.min(500, this.view.nodePoint.y + this.view.nodePoint.height)
    }

    public getSkillListByStar(star: number = 0): { skillId: string, lock: boolean, lockLabe: string }[] {
        let skillIds: { skillId: string, lock: boolean, lockLabe: string }[] = [];
        if (this.weaponVo.cfg.skillInfo) {
            let skillList = SortUtils.sortBy2(this.weaponVo.cfg.skillInfo, ["k"], [true], true)
            for (let i = 0; i < skillList.length; i++) {
                if (skillList[i].k <= star) {
                    skillIds.push({ skillId: skillList[i].v, lock: false, lockLabe: "" })
                }
                else {
                    skillIds.push({ skillId: skillList[i].v, lock: true, lockLabe: `(${skillList[i].k}星时解锁)` })
                }
            }
        }
        return skillIds
    }
}