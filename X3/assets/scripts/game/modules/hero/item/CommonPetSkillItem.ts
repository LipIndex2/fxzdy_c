import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import type { SkillInfoWinOpenArgs } from "../../hero/view/SkillInfoWin";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";

/** 公用宠物技能item */
@bindFguiExtension("ui://comm/CommonPetSkillItem")
export class CommonPetSkillItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "CommonPetSkillItem";

    private _groupId: string = "";

    private _petCfgId: number;

    private _skillData: IPet.PetSkillData;

    private get view(): ui.comm.hero.components.CommonPetSkillItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);

        // this.updateInfo();
    }

    //更新UI信息
    public updateInfo(skillData: IPet.PetSkillData, petCfgId: number) {
        if (!skillData) return;
        this._skillData = skillData;
        this._groupId = skillData.groupId;
        this._petCfgId = petCfgId;
        let self = this.view;

        self.getController("c1").selectedIndex = skillData.unlock ? 1 : 0;

        //等级
        self.T_level.text = "" + skillData.level;
        //技能图标
        self.img_skill.img_skill.icon = skillData.cfg.icon;
    }

    /** 预览技能 */
    private onBtnClick() {
        if (this._groupId) G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this._groupId, data: this._skillData, petCfgId: this._petCfgId } as SkillInfoWinOpenArgs);
    }
}
