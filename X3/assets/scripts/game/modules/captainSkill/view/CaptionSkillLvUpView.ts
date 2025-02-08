import { Tween } from "cc";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    CaptainSkillDescPanelComp
} from "db://assets/scripts/game/modules/captainSkill/components/CaptainSkillDescPanelComp";
import { CaptainSkillOneComp } from "db://assets/scripts/game/modules/captainSkill/components/CaptainSkillOneComp";
import { CaptainSkillModel } from "db://assets/scripts/game/modules/captainSkill/model/CaptainSkillModel";
import { CaptainSkillUtils } from "db://assets/scripts/game/modules/captainSkill/utils/CaptainSkillUtils";
import G from "../../../../core/comm/G";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import GIns from "../../../GIns";
import { ModelNode } from "../../common/node/ModelNode";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { UICaptainSkillKeys } from "../UICaptainSkillKeys";
import { CaptainSkillHeaderItem } from "../components/CaptainSkillHeaderItem";

/**
 * 战队技能
 * @author luohaojun
 */
export class CaptionSkillLvUpView extends UIPage {

    static pkgName: string = "captainSkill";
    static viewName: string = "CaptionSkillLvUpView";

    // 配置
    private _skillConfigs: table.captain.CaptainConfig[];
    private _chooseIndex: number = -1;
    private _headerItemIds: number[] = [];

    protected _isFirst: boolean = true;

    private get view(): ui.captainSkill.CaptionSkillLvUpView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CAPTAIN_SKILL_LV_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CAPTAIN_SKILL_LV_UPDATE:
                this.reset();
                if (args) {
                    this.playLvUpAni();
                }
                break;
        }
    }

    public onInit(): void {
        this.view.skillList.setVirtual();
        this.view.skillList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.skillList.node.uuid, this.irSkillItem, this, { delay2: 100 })// this.itemRendererForSkill.bind(this);

        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);
        // this.view.modelComp.getTransition("t0").play();

        this.view.ruleBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.CAPTAIN, this.view.ruleBtn)
        }, this);

        this.view.btnReset.onClick(this.onClickReset, this);

        this.view.listHeaderItem.itemRenderer = this.itemRendererForHeader.bind(this);
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view.modelComp.iconLoader.node);
    }

    protected onClickReset(): void {
        G.UIManager.open(UICaptainSkillKeys.CaptainSkillResetWin);
    }

    protected itemRendererForHeader(index: number, item: CaptainSkillHeaderItem): void {
        item.setItemId(this._headerItemIds[index]);
    }

    public onOpen(args: number): void {
        GIns.captainSkillModel.context.saveLocalRedDotLvMap();
        this._skillConfigs = CaptainSkillUtils.getCaptainSkillConfigArray() || [];
        if (this._chooseIndex == -1) {
            let defaultIndex: number = this._skillConfigs.findIndex((value) => value.id == args);
            if (defaultIndex == -1) {
                defaultIndex = 0;
            }
            this._chooseIndex = defaultIndex;
        }
        this.reset();
        this._headerItemIds = CaptainSkillUtils.getHeaderItemIds();
        this.view.listHeaderItem.numItems = this._headerItemIds.length;
    }

    public onClose(): void {
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.skillList.node.uuid)
    }

    private reset() {
        this.view.skillList.numItems = this._skillConfigs.length;
        this.view.skillList.refreshVirtualList();
        this.updateContent();
    }


    private irSkillItem(index: number, comp: CaptainSkillOneComp): void {
        const config = this._skillConfigs[index];
        // 是否选中
        const isChoose = this._chooseIndex == index;
        comp.reset(this, index, config, isChoose);
    }

    // 更新内容
    private updateContent() {
        const config = this._skillConfigs[this._chooseIndex];
        if (!config) {
            return;
        }

        // this.view.bgLogo.icon = config.iconPathForBig;

        // 模型
        this.view.modelComp.iconLoader.icon = config.iconPathForBig;
        if (this._isFirst) {
            this._isFirst = false
            TweenUtils.yoyoOnAxisY(this.view.modelComp.iconLoader.node, 1, 18);
        }

        const skillId = config.id;
        const lv = CaptainSkillModel.ins().getLvBySkillId(skillId);

        const comp = FguiScriptUtils.toMyScriptClass(this.view.contentComp, CaptainSkillDescPanelComp);
        comp.reset(skillId, lv);
    }

    protected playLvUpAni(): void {
        let aniNode = this.view.modelComp.aniNode as ModelNode
        aniNode.loadByPath('spine/ui/shengjibiaoxian/shengjibiaoxian1_upper')
        aniNode.playOrders([{
            name: 'enter',
            isLoop: false
        }])
    }

    choose(index: number) {
        this._chooseIndex = index;
        this.view.skillList.refreshVirtualList();
        this.updateContent();
    }
}