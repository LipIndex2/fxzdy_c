import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { Color } from "cc";
import { StringUtils } from "../../../../core/utils/StringUtils";

export class WeaponSkillListItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "WeaponTipsSkillItem";

    private get view(): ui.weapon.item.WeaponTipsSkillItem {
        return this as any;
    }

    protected onInit() {
    }

    public setData(data: { skillId: string, lock: boolean, lockLabe: string }): void {
        let skillCfg = TableManager.getDataById(table.battle.SkillConfig, data.skillId)
        this.view.lbDesForHero.color = !data.lock ? new Color("#E9ECEE") : new Color("#9D9E9F");
        this.view.lockImg.visible = data.lock;
        this.view.unlockLab.visible = !data.lock;
        this.view.lbDesForHero.text = StringUtils.repleaceDescToAtkImage(skillCfg.desc + (data.lockLabe || ""));
    }
}