import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import {bindFguiExtension} from "../../../../core/comm/UIScriptManager";
import type {SkillInfoWinOpenArgs} from "../../hero/view/SkillInfoWin";
import {UIHeroKey} from "../../hero/const/UIHeroConfig";
import {ECollectiblesSkillTargetType, UICollectionsKey} from "../../collections/const/UICollectionsConfig";

let c1 = {
    lock: 0,
    unlock: 1,
}

/** 公用收藏品技能item */
@bindFguiExtension("ui://comm/CommonCollectionSkillItem")
export class CommonCollectionSkillItem extends fgui.GButton {
    static pkgName: string = "comm"
    static viewName: string = "CommonCollectionSkillItem"

    private skillEffId: string

    private get view(): ui.comm.hero.components.CommonCollectionSkillItem {
        return this as any;
    }

    protected onInit() {
        this.view.on(fgui.Event.CLICK, this.onBtnClick, this);

        // this.updateInfo();
    }

    //更新UI信息
    /**
     *
     * @param param
     */
    public updateInfo(param: XJ.collections.ICollectionSkill) {
        let view = this.view;
        this.skillEffId = param.id;
        let seCfg = G.TableManager.getDataById(table.collectibles.CollectiblesSkillEffectConfig, param.id);
        if (seCfg.targetType == ECollectiblesSkillTargetType.COLLECTIBLES) {
            let collSkillCfg = G.TableManager.getDataById(table.battle.CollectionSkillConfig, seCfg.skillId);
            view.img_skill.img_skill.icon = collSkillCfg.icon;
        } else if (seCfg.targetType == ECollectiblesSkillTargetType.HERO) {
            let skillCfg = G.TableManager.getDataById(table.battle.SkillConfig, seCfg.skillId);
            view.img_skill.img_skill.icon = skillCfg.icon;
        }

        view.getController("c1").selectedIndex = param.unlock === false ? c1.lock : c1.unlock;
    }

    /** 预览技能 */
    private onBtnClick() {
        let param: XJ.collections.ISkillInfoWinParam = {
            id: this.skillEffId
        };
        G.UIManager.open(UICollectionsKey.SKILL_INFO_WIN, param);
    }
}
