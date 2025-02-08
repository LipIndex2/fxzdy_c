import { SkillInfoWinOpenArgs } from "db://assets/scripts/game/modules/hero/view/SkillInfoWin";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { HeroStarConfigDatas } from "../../../table/hero/HeroStarConfigDatas";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroSkillData, HeroVo } from "../HeroVo";


/** 英雄技能item */
export class HeroSkillItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "HeroSkillItem";

    private _groupId: string = "";

    private _heroId;

    private _skillData: HeroSkillData

    private get view(): ui.comm.hero.components.HeroSkillItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);

        // this.updateInfo();
    }

    //更新UI信息
    public updateInfo(skillData: HeroSkillData, heroId: number = 0) {
        if (!skillData) return;
        this._skillData = skillData
        this._groupId = skillData.groupId;
        this._heroId = heroId;
        let self = this.view;

        self.getController("c1").selectedIndex = skillData.unlock ? 1 : 0;

        //是否是必杀技能
        self.img_bs.visible = skillData.isUltimateSkill;
        //等级
        self.T_level.text = "" + skillData.level;
        //技能图标
        self.img_skill.img_skill.icon = skillData.cfg.icon;

        if (skillData.unlock == false) {
            //未解锁展示解锁需要星级

            if (heroId > 0) {
                let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, heroId);
                let unlockStar: number = HeroStarConfigDatas.ins().getSkillUnlockStarByPos(heroCfg?.quality, skillData.slotId);
                self.lbLockTip.text = `${unlockStar}`;
            } else {
                self.lbLockTip.text = ``;
            }
        }
    }

    /** 预览技能 */
    private onBtnClick() {
        // G.FacadeManager.emit(NotificationKey.HERO_SHOW_SKILL_INFO, [true,this._skillId]);
        if (this._groupId)
            G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this._groupId, heroId: this._heroId, data: this._skillData } as SkillInfoWinOpenArgs)
    }

}