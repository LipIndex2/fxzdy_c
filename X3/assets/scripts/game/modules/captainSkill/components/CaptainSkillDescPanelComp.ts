import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import {
    CaptainSkillContentComp
} from "db://assets/scripts/game/modules/captainSkill/components/CaptainSkillContentComp";
import { CaptainSkillModel } from "db://assets/scripts/game/modules/captainSkill/model/CaptainSkillModel";
import { CaptainSkillUtils } from "db://assets/scripts/game/modules/captainSkill/utils/CaptainSkillUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import GIns from "../../../GIns";
import { BtnChangGui1WithItemList1 } from "../../common/btn/BtnChangGui1WithItemList1";

/**
 * 描述面板
 */
export class CaptainSkillDescPanelComp extends fgui.GComponent {

    // 战队技能id
    private _captainSkillId: number;
    // 战队技能lv
    private _lv: number;
    // 消耗的道具
    private _costItems: NoOwnerItem[];
    // 技能配置
    private _config: table.captain.CaptainConfig;
    private _nextLvConfig: table.captain.CaptainLevelConfig | null;

    private get view(): ui.captainSkill.components.CaptainSkillDescPanelComp {
        return this as any;
    }


    protected onPreDispose() {
    }

    protected onInit() {
        this.view.btnLvUp.onClick(this.onLvUpClick, this);

        let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnLvUp, BtnChangGui1WithItemList1);
        btnComp.title = '升级';
        btnComp.setCostStyle(0);
        btnComp.setStyle(0);
    }


    @LogBusiness("重置描述面板")
    public reset(skillId: number, lv: number) {
        this._captainSkillId = skillId;
        this._lv = lv;

        const config = CaptainSkillUtils.getCaptainSkillConfig(skillId);
        if (!config) {
            return;
        }

        this._config = config;

        let isMaxLv = false;
        const nextLv = lv + 1;
        let nextLvConfig = CaptainSkillUtils.getCaptainSkillLvConfigByIdAndLv(skillId, nextLv);
        this._nextLvConfig = nextLvConfig;
        isMaxLv = nextLvConfig == null;
        // 顶部标题
        // 等级
        if (lv >= 0) {
            this.view.bgTitle.labelLv.text = `Lv.${lv}`;
        } else {
            this.view.bgTitle.labelLv.text = `未解锁`;
        }
        // 名称
        this.view.bgTitle.labelName.text = `${config.name}`;


        if (lv < 0) {
            //未解锁
            this.view.getController('state').selectedIndex = 0;
        } else if (nextLvConfig) {
            //可升级
            this.view.getController('state').selectedIndex = 1;
            this._costItems = ItemUtils.parseKvArrayToItemArray(nextLvConfig.costItems) || [];
            if (nextLvConfig.needCaptainCoreLevel > GIns.captainSkillModel.context.coreLv) {
                //核心科技等级不足
                this.view.btnFull.visible = true;
                this.view.btnLvUp.visible = false;
                this.view.btnFull.title = `职业核心${nextLvConfig.needCaptainCoreLevel}级后可升级`;
            } else {
                this.view.btnFull.visible = false;
                this.view.btnLvUp.visible = true;
                let btnComp = FguiScriptUtils.toMyScriptClass(this.view.btnLvUp, BtnChangGui1WithItemList1);
                btnComp.reset(this._costItems);
            }
        } else {
            //已满级
            this.view.getController('state').selectedIndex = 2;
        }

        let contentComp = FguiScriptUtils.toMyScriptClass(this.view.contentComp, CaptainSkillContentComp);
        contentComp.reset(skillId, lv);
        this.refreshRedDot();
    }

    refreshRedDot() {
        // 红点
        const redDotCom = RedDotUtils.castComp(this.view.btnLvUp.redDot);
        redDotCom.reset(RedDotKeys.captainSkill_lvUp, [this._captainSkillId])
        // if (this._lv >= 0) {
        //     redDotCom.reset(RedDotKeys.captainSkill_lvUp, [this._captainSkillId])
        // } else {
        //     redDotCom.reset(RedDotKeys.captainSkill_unlock, [this._captainSkillId])
        // }
    }

    private onLvUpClick() {
        // 无消耗物
        if (!this._costItems) {
            return;
        }
        if (!this._config) {
            return;
        }

        const isCanLvUp = ConditionManager.ins().checkCondition(this._nextLvConfig?.unlockConditionText, true, true);
        if (!isCanLvUp) {
            return;
        }

        const isCanPay = BackpackManager.ins().isCanPayTheseItemArray(this._costItems);
        if (!isCanPay) {
            // tips 购买失败
            GIns.floatingTextMgr.showTips("道具不足!");
            // 弹出首个不足的道具来源
            BackpackManager.ins().tryPopUpNoEnoughItem(this._costItems, true);
            return;
        }

        // net 升级
        CaptainSkillModel.ins().sendCaptainUpLevel({
            captainId: this._captainSkillId,
        });
    }
}