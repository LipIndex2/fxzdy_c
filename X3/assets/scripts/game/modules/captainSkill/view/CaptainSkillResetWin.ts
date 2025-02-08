import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { CaptainSkillUtils } from "../utils/CaptainSkillUtils";
import { CaptainSkillInitLv } from "../context/CaptainSkillContext";

/**
 * 战队技能重置
 * @author luohaojun
 */
export class CaptainSkillResetWin extends UICommWin {

    static pkgName: string = "captainSkill";
    static viewName: string = "CaptainSkillResetWin";

    protected _endTime: number = 0;
    protected _timerKey: string = null;
    protected _rewards: { k: number, v: number }[] = [];
    private get view(): ui.captainSkill.CaptainSkillResetWin {
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
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);

        this.view.btnReset.onClick(this.onClickReset, this);
    }

    protected onPreDispose(): void {
        this.removeTimer();
    }

    protected get btnResetComp(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnReset, BtnChangGui1WithItem);
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected onClickReset(): void {
        if (this._rewards.length <= 0) {
            GIns.floatingTextMgr.showTips('没有需要重置的职业');
            return
        }
        if (!this.btnResetComp.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(this.btnResetComp.getNoPayTip())
            return
        }
        // if (GIns.captainSkillModel.context.resetTimes > 0) {
        //     let cdHour: number = Math.ceil(CaptainSkillUtils.getResetCdMinutes() / 60);
        //     G.UIManager.open(UICommonKey.BtnConfirmView, {
        //         title: null,
        //         titleConfirm: CommonI18nKeys.confirm,
        //         titleCancel: CommonI18nKeys.cancel,
        //         content: `本次重置后${cdHour}小时，可再次重置，是否确认？`,
        //         onBtnYes: () => {
        //             GIns.captainSkillModel.sendCaptainReset();
        //         }
        //     } as BtnConfirmViewOpenArgs);
        // } else {
            //首次重置
            GIns.captainSkillModel.sendCaptainReset();
        // }
    }

    protected addTimer(): void {
        if (this._timerKey == null) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer);
        }
        this.onTimer();
    }

    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
    }
    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._endTime - nowTime;
        if (remainTime <= 0) {
            this.removeTimer();
            this.view.btnReset.enabled = true;
            this.view.lbTime.visible = false;
            return;
        }
        this.view.btnReset.enabled = false;
        this.view.lbTime.visible = true;
        let timeStr: string = TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
        this.view.lbTime.text = `冷却中[color=#12FF00]${timeStr}后[/color]可再次重置`;
    }

    protected updateUI(): void {
        let rewardMap: Map<number, { k: number, v: number }> = new Map();
        const idtoLvMap = GIns.captainSkillModel.getCaptainIdToLvMap();
        idtoLvMap?.forEach((lv: number, id: number) => {
            let totolCosts = CaptainSkillUtils.getCaptainSkillTotalCostMap(id, lv, CaptainSkillInitLv);
            totolCosts?.forEach((value) => {
                if (rewardMap.has(value.k)) {
                    rewardMap.get(value.k).v += value.v;
                } else {
                    rewardMap.set(value.k, { k: value.k, v: value.v });
                }
            })
        })
        this._rewards = Array.from(rewardMap.values());
        this.view.listReward.numItems = this._rewards.length;


        G.GameTimer.clearAll(this);
        let nowTime: number = G.TimeManager.serverNow;

        let resetTimes: number = GIns.captainSkillModel.context.resetTimes;
        // let lastResetTime: number = GIns.captainSkillModel.context.lastResetTime;
        if (resetTimes > 0) {
            //非首次重置
            //取消重置间隔
            this._endTime = 0;
            // this._endTime = lastResetTime + CaptainSkillUtils.getResetCdMinutes() * 60000;
            this.btnResetComp.reset('确定', NoOwnerItem.createByConfigKv(CaptainSkillUtils.getNotFirstResetCosts()[0]))
        } else {
            //首次重置
            this._endTime = 0;
            this.btnResetComp.reset('确定', NoOwnerItem.create(CaptainSkillUtils.getNotFirstResetCosts()[0].k, 0));
        }
        if (this._endTime > nowTime) {
            this.addTimer();
        } else {
            this.onTimer();
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}