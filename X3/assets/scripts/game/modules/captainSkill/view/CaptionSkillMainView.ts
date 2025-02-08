import G from "db://assets/scripts/core/comm/G";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { CaptainSkillUtils } from "db://assets/scripts/game/modules/captainSkill/utils/CaptainSkillUtils";
import * as fgui from "fairygui-cc";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItemList1 } from "../../common/btn/BtnChangGui1WithItemList1";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { CaptainSkillHeaderItem } from "../components/CaptainSkillHeaderItem";
import { CaptionSkillLvMainAttrItem } from "../components/CaptionSkillLvMainAttrItem";
import { CaptionSkillLvMainBtn } from "../components/CaptionSkillLvMainBtn";

/**
 * 战队技能主界面
 * @author luohaojun
 */
export class CaptionSkillMainView extends UIPage {

    static pkgName: string = "captainSkill";
    static viewName: string = "CaptionSkillMainView";

    // 配置
    protected _skillConfigs: table.captain.CaptainConfig[];
    protected _headerItemIds: number[] = [];
    protected _skillBtns: CaptionSkillLvMainBtn[] = [];

    protected _curCoreCfg: table.captain.CaptainCoreLevelConfig = null;
    protected _nextCoreCfg: table.captain.CaptainCoreLevelConfig = null;

    private _isUp: boolean = false;
    private _isBackData: boolean = false

    private get view(): ui.captainSkill.main.CaptionSkillMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CAPTAIN_SKILL_CORE_LV_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CAPTAIN_SKILL_CORE_LV_UPDATE:
                this.updateMain();
                this._isBackData = true;
                this.playLvUpAni();
                break;
        }
    }

    public onInit(): void {
        this.view.btnBack.onClick(this.closeSelf, this);
        this.view.ruleBtn.onClick(this.onClickRule, this);
        this.view.btnUp.on(fgui.Event.TOUCH_BEGIN, this.onLvUpBegin, this);
        this.view.btnUp.on(fgui.Event.TOUCH_END, this.onLvUpEnd, this);

        this.view.listHeaderItem.itemRenderer = this.itemRendererForHeader.bind(this);
        this.view.listAttr.setVirtual();
        this.view.listAttr.itemRenderer = this.itemRendererForAttr.bind(this);

        this._skillBtns = [
            FguiScriptUtils.toMyScriptClass(this.view.btn1, CaptionSkillLvMainBtn),
            FguiScriptUtils.toMyScriptClass(this.view.btn2, CaptionSkillLvMainBtn),
            FguiScriptUtils.toMyScriptClass(this.view.btn3, CaptionSkillLvMainBtn),
            FguiScriptUtils.toMyScriptClass(this.view.btn4, CaptionSkillLvMainBtn),
            FguiScriptUtils.toMyScriptClass(this.view.btn5, CaptionSkillLvMainBtn),
            FguiScriptUtils.toMyScriptClass(this.view.btn6, CaptionSkillLvMainBtn),
        ];

        let skillCfgs = CaptainSkillUtils.getCaptainSkillConfigArray() || [];
        this._skillBtns.forEach((btn, index) => {
            if (index < skillCfgs.length) {
                btn.visible = true;
                btn.setCaptainCfg(skillCfgs[index]);
            } else {
                btn.visible = false;
            }
        });

        let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnUp, BtnChangGui1WithItemList1);
        btnComp.title = '升级';
        btnComp.setCostStyle(0);
        btnComp.setStyle(0);
        FguiScriptUtils.toMyScriptClass(this.view.btnUp.redDot, RedDotCom).reset(RedDotKeys.captainSkill_coreLvUp);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.CAPTAIN, this.view.ruleBtn);
    }

    protected onLvUpBegin(): void {
        this._isUp = true;
        this._isBackData = true;
        this.handleUpLv();
    }

    //取消长按
    protected onLvUpEnd(): void {
        this._isUp = false;
        G.GameTimer.clear(this, this.onLvUpBegin);
    }

    protected handleUpLv(): void {
        if (this._isUp) {
            if (this._isBackData) {
                //数据返回了 继续判断升级
                if (this._nextCoreCfg) {
                    if (GIns.backpackMgr.isCanPayTheseItemArrayByConfig(this._nextCoreCfg.costItems, true)) {
                        GIns.captainSkillModel.sendCaptainCoreUpLevel();
                    } else {
                        //道具不足
                        return;
                    }
                }
            }
            G.GameTimer.once(150, this, this.handleUpLv);
        }
    }

    protected itemRendererForHeader(index: number, item: CaptainSkillHeaderItem): void {
        item.setItemId(this._headerItemIds[index]);
    }

    protected itemRendererForAttr(index: number, item: CaptionSkillLvMainAttrItem): void {
        item.setData(this._curCoreCfg?.attrs[index], this._nextCoreCfg?.attrs[index]);
    }

    protected updateSkills(): void {

    }

    protected updateMain(): void {
        let coreLv = GIns.captainSkillModel.context.coreLv;
        this._curCoreCfg = G.TableManager.getDataById(table.captain.CaptainCoreLevelConfig, coreLv);
        this._nextCoreCfg = G.TableManager.getDataById(table.captain.CaptainCoreLevelConfig, coreLv + 1);


        let attrCnt: number = 0;
        if (this._curCoreCfg) {
            attrCnt = Math.max(attrCnt, this._curCoreCfg.attrs.length);
        }
        if (this._nextCoreCfg) {
            attrCnt = Math.max(attrCnt, this._nextCoreCfg.attrs.length);
        }
        this.view.listAttr.numItems = attrCnt;

        if (this._nextCoreCfg != null) {
            this.view.btnUp.visible = true;
            let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnUp, BtnChangGui1WithItemList1);
            let costItems: NoOwnerItem[] = [];
            this._nextCoreCfg?.costItems?.forEach((value) => {
                let item = NoOwnerItem.createByConfigKv(value);
                costItems.push(item);
            })
            btnComp.reset(costItems);
        } else {
            this.view.btnUp.visible = false;
        }
        this.view.lbLv.text = `Lv:${coreLv}`;
        this.view.lbLv2.text = `核心等级 ${coreLv}`;
    }

    protected updateUI(): void {
        this.updateMain();
        this.updateSkills();
    }


    protected playLvUpAni(): void {
        let aniNode = this.view.aniNode as ModelNode;
        aniNode.loadByPath('spine/ui/shengjibiaoxian/shengjibiaoxian1_upper')
        aniNode.playOrders([{
            name: 'enter',
            isLoop: false
        }])
    }

    public onOpen(): void {
        this._headerItemIds = CaptainSkillUtils.getCoreHeaderItemIds();
        this.view.listHeaderItem.numItems = this._headerItemIds.length;
        this.updateUI();
    }

    public onClose(): void {

    }
}