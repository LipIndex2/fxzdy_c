import G from "db://assets/scripts/core/comm/G";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GodSequenceOneColComp } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceOneColComp";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { GodSequenceI18nKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceI18nKeys";
import { GodSequenceUIKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceUIKeys";
import { RankUIKeys } from "db://assets/scripts/game/modules/rank/RankUIKeys";
import { RankMainViewOpenArgs } from "db://assets/scripts/game/modules/rank/view/RankMainView";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { GodSequenceController } from "../GodSequenceController";
import RankingType = ServerEnums.RankingType;
import GIns from "../../../GIns";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { EnumJumpType } from "../../jump/const/EnumJumpType";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 序列验证 | 选择界面
 */
export class GodSequenceChooseView extends UIPage {
    static pkgName: string = "godSequence";
    static viewName: string = "GodSequenceChooseView";

    // 类型配置
    private _typeConfigArray: Array<table.ladder.LadderTypeConfig> = [];

    protected _timerKey: string = null;
    /**跳转id*/
    protected _jumpId:number = 1102;

    private get view(): ui.godSequence.GodSequenceChooseView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.GOD_SEQUENCE_CHANGE_LAYER, NotificationKey.SYSTEM_NEW_DAY, NotificationKey.GOD_SEQUENCE_OPEN_STATE_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SYSTEM_NEW_DAY:
            case NotificationKey.GOD_SEQUENCE_CHANGE_LAYER:
            case NotificationKey.GOD_SEQUENCE_OPEN_STATE_CHANGE:
                this.reset();
                break;
        }
    }

    protected onInit() {
        this.view.colList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.colList.node.uuid, this.onItemRenderer, this);

        this.view.labelTips.text = GodSequenceI18nKeys.chooseTips;

        this.view.btnBack.onClick(this.onClickBack, this);
        this.view.btnRank.onClick(this.onClickRank0, this);
        this.view.btnDraw.onClick(this.onClickDraw, this);
        this.view.btnInfo.onClick(this.onClickInfo, this);

        this.view.btn_jj.onClick(this.onClickJump, this);

        let jumpCfg = G.TableManager.getDataById(table.jump.JumpConfig, this._jumpId);
        if (jumpCfg && jumpCfg.type == EnumJumpType.Activity) {
            FguiScriptUtils.toMyScriptClass(this.view.btn_jj.redDot, RedDotCom).reset(RedDotKeys.Pass_item, [jumpCfg.keyName]);
        }
    }

    onClickRank0() {
        const firstC = GodSequenceConfigManager.getFirstTypeConfig();

        UIManager.ins().open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(RankingType.LADDER, ServerEnums.Career[firstC.id]));
    }

    protected onClickDraw(): void {
        let jumpId: number = GodSequenceConfigManager.openAllActivityId;
        if (jumpId > 0) {
            GIns.jumpManager.jumpById(jumpId);
        }
    }

    protected onClickInfo(): void {
        RuleController.ins().openRule(EnumRuleKeys.GOD_SEQUENCE, this.view.btnInfo);
    }

    onClickBack() {
        this.closeSelf();
    }

    onItemRenderer(index: number, comp: GodSequenceOneColComp) {
        let config = this._typeConfigArray[index];
        comp.reset(config);
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        G.Logger.debug(" onOpen ");

        this.reset();

        this.view.btn_jj.getController("c1").selectedIndex = this.canSkipBattle() ? 0 : 1;
    }

    /***是否能开启跳过战斗 */
    canSkipBattle(): boolean {
        let skipBattleCond = TableManager.getDataById(table.ladder.LadderConstantConfig, "LADDER:CAN_SKIP_BATTLE");
        let arr = StringUtils.strToArr(skipBattleCond.content);
        return GIns.conditionMgr.checkCondition(arr);
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.colList.node.uuid);

        this.removeTimer();

        super.onClose();
    }

    private reset() {
        this._typeConfigArray = GodSequenceConfigManager.getTypeConfigArray();
        this.view.colList.numItems = this._typeConfigArray.length;

        if (GodSequenceController.ins().isOpenAll) {
            this.view.btnDraw.visible = true;
            this.addTimer();
        } else {
            this.view.btnDraw.visible = false;
            this.removeTimer();
        }
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer);
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
    }

    protected onTimer(): void {
        let remainTime: number = GodSequenceController.ins().allOpenEndTime - G.TimeManager.serverNow;
        if (isNaN(remainTime) || remainTime <= 0) {
            remainTime = 0;
            this.removeTimer();
        }
        this.view.btnDraw.labelTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
    }

    private onClickJump() {
        GIns.jumpManager.jumpById(this._jumpId);
    }
}

UIScriptManager.bindScript(GodSequenceUIKeys.GodSequenceChooseView, GodSequenceChooseView);
