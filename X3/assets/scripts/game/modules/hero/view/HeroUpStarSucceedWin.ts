import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { HeroManager } from "../HeroManager";
import { HeroVo } from "../HeroVo";
import { AttrManager } from "../../attr/AttrManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import G from "../../../../core/comm/G";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HeroStarConfigDatas } from "../../../table/hero/HeroStarConfigDatas";
import { HeroStageConfigDatas } from "../../../table/hero/HeroStageConfigDatas";

@bindScript(UIHeroKey.HERO_UP_STAR_SUCCEED_WIN)
export class HeroUpStarSucceedWin extends UIWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroUpStarSucceedWin";

    private _heroVo: HeroVo;

    private _groupId1;
    private _groupId2;

    private get view(): ui.hero.view.HeroUpStarSucceedWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    protected onOpen(heroId: number): void {
        if (!heroId) return;
        this._heroVo = HeroManager.ins().getHeroVoByID(heroId);
        this.updateUI();

        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath("spine/ui/gongxihuode/ui_biaotidianzui_tongyong");
        modelNode.playOrders([
            {
                name: "animation",
                isLoop: true,
            },
        ]);
    }

    protected onInit(): void {
        let self = this.view;

        self.btn_good.on(fgui.Event.CLICK, this.closeSelf, this);
        self.adapt_bg.on(fgui.Event.CLICK, this.closeSelf, this);

        self.list_star1.itemRenderer = this.starItem.bind(this);
        self.list_star2.itemRenderer = this.starItem2.bind(this);

        self.list_attr.itemRenderer = this.itemRenderer.bind(this);

        self.skill1.on(fgui.Event.CLICK, this.skillClick1, this);
        self.skill2.on(fgui.Event.CLICK, this.skillClick2, this);

        self.G_skill.alpha = 0;
    }

    private updateUI() {
        let self = this.view;
        self.getController("c1").selectedIndex = 1;

        let modelNode = FguiScriptUtils.toMyScriptClass(self.anim, ModelNode);
        const modelId = this._heroVo.showModelId;
        modelNode.loadByModelId(modelId);
        if (modelNode.spineNode) {
            modelNode.spineNode.modelScale = HeroConfigManager.scaleForHeroModel;
        }

        let num1 = (this._heroVo.star - 1) % 5;
        self.list_star1.numItems = num1 == 0 ? 5 : num1;
        let num2 = this._heroVo.star % 5;
        self.list_star2.numItems = num2 == 0 ? 5 : num2;
        self.list_attr.numItems = 3;

        let starCfg = this._heroVo.getHeroStarCfg();
        let showSkillDatas: { skillPos: number, nowLv: number, lastLv: number }[] = []
        let maxNum = 2
        for (let i = 0; i < starCfg.skillPosLevelContent.length; i++) {
            let skillPos = starCfg.skillPosLevelContent[i].k;
            let nowLv = HeroStarConfigDatas.ins().getSkillLevel(this._heroVo.heroCfg.quality, this._heroVo.star, skillPos);
            let lastLv = HeroStarConfigDatas.ins().getSkillLevel(this._heroVo.heroCfg.quality, this._heroVo.star - 1, skillPos);
            if (nowLv > lastLv) {
                //新的
                showSkillDatas.push({ skillPos: skillPos, nowLv: nowLv, lastLv: lastLv })
                if (showSkillDatas.length >= maxNum) {
                    break
                }
            }
        }


        self.skillMc1.visible = self.skillMc2.visible = false;
        if (showSkillDatas.length) {
            self.getController("c1").selectedIndex = 0;
            for (let j = 0; j < showSkillDatas.length; j++) {
                let skillData = this._heroVo.getSkillDataBySlotId(showSkillDatas[j].skillPos);
                self["skillMc" + (j + 1)].visible = true
                self["T_skillLevel" + (j + 1)].text = "LV." + showSkillDatas[j].lastLv;
                self["T_skillNextLevel" + (j + 1)].text = "LV." + showSkillDatas[j].nowLv;
                self["skill" + (j + 1)].updateInfo(skillData, this._heroVo.baseId);
                self["skill" + (j + 1)].getController("c1").selectedIndex = 2;
                this["_groupId" + (j + 1)] = skillData.groupId;
                this._heroVo.updateSkillDataByGroupId(skillData.groupId);
            }
            this.view.getTransition("t0").play();
        }
        else {
            this.view.getTransition("t1").play();
        }
        // let starCfg = this._heroVo.getHeroStarCfg();
        // if (starCfg && starCfg.skillPos && starCfg.skillLevel) {
        //     self.getController("c1").selectedIndex = 0;
        //     let skillData = this._heroVo.getSkillDataBySlotId(starCfg.skillPos);
        //     //@ts-ignore
        //     self.skill.updateInfo(skillData, this._heroVo.baseId);
        //     this._groupId = skillData.groupId;
        //     this._heroVo.updateSkillDataByGroupId(skillData.groupId);
        //     self.skill1.getController("c1").selectedIndex = 2;

        //     self.T_skillLevel1.text = "LV." + (starCfg.skillLevel - 1);
        //     self.T_skillNextLevel1.text = "LV." + starCfg.skillLevel;
        //     this.view.getTransition("t0").play();
        // } else {
        //     this.view.getTransition("t1").play();
        // }
    }

    private itemRenderer(index: number, item: ui.hero.item.HeroStarUpAttrOneRowItem) {
        const isOdd = index % 2 == 0;
        item.getController("isOdd").selectedIndex = isOdd ? 1 : 0;

        item.T_name.text = AttrManager.ins().getAttrName(index + 1);
        item.T_num.text = AttrManager.ins().getPanelAttrByHeroId(this._heroVo.baseId, index + 1, null, null, this._heroVo.star - 1) + "";
        item.T_nextNum.text = AttrManager.ins().getPanelAttrByHeroId(this._heroVo.baseId, index + 1) + "";
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        let starCnt = this._heroVo.star - 1;
        item.starIcon.icon = ItemUtils.getStarIcon(starCnt);
    }

    private starItem2(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }

    private skillClick1() {
        if (this._groupId1) G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this._groupId1, heroId: this._heroVo.baseId });
    }

    private skillClick2() {
        if (this._groupId2) G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this._groupId2, heroId: this._heroVo.baseId });
    }
}
