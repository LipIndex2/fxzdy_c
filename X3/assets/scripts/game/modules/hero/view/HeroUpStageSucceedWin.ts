import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { PositionVo } from "../../formation/vo/PositionVo";
import { FormationManager } from "../../formation/FormationManager";
import { HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import { TableManager } from "../../../../core/table/TableManager";
import { AttrManager } from "../../attr/AttrManager";
import G from "../../../../core/comm/G";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { bindScript } from "../../../../core/comm/UIScriptManager";

/** 英雄进阶成功弹窗 */
@bindScript(UIHeroKey.HERO_UP_STAGE_SUCCED_WIN)
export class HeroUpStageSucceedWin extends UIWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroUpStageSucceedWin";

    private _posVo: PositionVo;
    private _heroVo: HeroVo;
    private _groupId;

    private get view(): ui.hero.view.HeroUpStageSucceedWin {
        return this._view as any;
    }

    protected onOpen(posId: number): void {
        if (!posId) return;
        this._posVo = FormationManager.ins().getPosVoById(posId);
        this._heroVo = HeroManager.ins().getHeroVoByID(this._posVo.heroId);
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
        self.img_bg.on(fgui.Event.CLICK, this.closeSelf, this);
        self.list_attr.itemRenderer = this.itemRenderer.bind(this);

        self.skill.on(fgui.Event.CLICK, this.skillClick, this);
        self.G_skill.alpha = 0;
    }

    private updateUI() {
        let self = this.view;
        self.getController("c1").selectedIndex = 1;
        // let cfg:table.hero.HeroStageConfig = TableManager.getDataById(table.hero.HeroStageConfig,this._posVo.stage-1)
        // let nextCfg:table.hero.HeroStageConfig = TableManager.getDataById(table.hero.HeroStageConfig,this._posVo.stage)
        self.stageOld.T_stageNum.text = `${this._posVo.level - 1}`;
        self.stageNew.T_stageNum.text = `${this._posVo.level}`;

        const modelId = this._heroVo.showModelId;
        let modelNode = FguiScriptUtils.toMyScriptClass(self.anim, ModelNode);
        modelNode.loadByModelId(modelId);
        if (modelNode.animNode) {
            modelNode.animNode.modelScale = HeroConfigManager.scaleForHeroModel;
        }

        self.list_attr.numItems = 4;

        let stageCfg = TableManager.getDataById(table.hero.HeroStageConfig, this._heroVo.stage);
        if (stageCfg && stageCfg.skillPos) {
            self.getController("c1").selectedIndex = 0;
            let skillData = this._heroVo.getSkillDataBySlotId(stageCfg.skillPos);
            //@ts-ignore
            self.skill.updateInfo(skillData, this._heroVo.baseId);
            this._groupId = skillData.groupId;
            this._heroVo.updateSkillDataByGroupId(skillData.groupId);
            self.skill.getController("c1").selectedIndex = 2;
            this.view.getTransition("t0").play();
        } else {
            this.view.getTransition("t1").play();
        }
    }

    private itemRenderer(index: number, item: ui.hero.item.HeroStarUpAttrOneRowItem) {
        const isOdd = index % 2 == 0;
        item.getController("isOdd").selectedIndex = isOdd ? 1 : 0;

        let posVo = FormationManager.ins().getPosVoById(this._heroVo.posId);
        if (index == 0) {
            item.T_name.text = "等级上限";
            let cfg = TableManager.getDataById(table.hero.HeroStageConfig, posVo.stage + 1);
            if (cfg) {
                item.T_nextNum.text = cfg.levelCondition + "";
            } else {
                item.T_nextNum.text = posVo.level + "";
            }
            item.T_num.text = posVo.level - 1 + "";
        } else {
            item.T_name.text = AttrManager.ins().getAttrName(index);
            item.T_num.text = AttrManager.ins().getPanelAttrByHeroId(posVo.heroId, index, null, posVo.stage - 1, null) + "";
            item.T_nextNum.text = AttrManager.ins().getPanelAttrByHeroId(posVo.heroId, index) + "";
        }
    }
    private skillClick() {
        if (this._groupId) G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this._groupId, heroId: this._heroVo.baseId });
    }
}
