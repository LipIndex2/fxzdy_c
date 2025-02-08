import { math } from "cc";
import G from "db://assets/scripts/core/comm/G";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import {
    FormationMainViewOpenArgs,
    UIFormationKey
} from "db://assets/scripts/game/modules/formation/const/UIFormationConfig";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import {
    GodSequenceLeftRightComp
} from "db://assets/scripts/game/modules/godsequence/components/GodSequenceLeftRightComp";
import { GodSequenceConfigManager } from "db://assets/scripts/game/modules/godsequence/config/GodSequenceConfigManager";
import { EventGodSequenceTop3 } from "db://assets/scripts/game/modules/godsequence/event/EventGodSequenceTop3";
import { GodSequenceI18nKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceI18nKeys";
import { GodSequenceUIKeys } from "db://assets/scripts/game/modules/godsequence/GodSequenceUIKeys";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import {
    GodSequenceChallengeViewOpenArgs
} from "db://assets/scripts/game/modules/godsequence/structs/GodSequenceChallengeViewOpenArgs";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { RankUIKeys } from "db://assets/scripts/game/modules/rank/RankUIKeys";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { RankMainViewOpenArgs } from "db://assets/scripts/game/modules/rank/view/RankMainView";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import RankingType = ServerEnums.RankingType;

/**
 * 序列验证 | 挑战
 */
export class GodSequenceChallengeView extends UIPage {

    static pkgName: string = "godSequence";
    static viewName: string = "GodSequenceChallengeView";

    private _args: GodSequenceChallengeViewOpenArgs;
    private _configs: Array<table.ladder.LadderConfig> = [];
    private _top3List: Array<RankCommonData> = [];
    private _typeRewardItems: NoOwnerItem[] = [];

    private get view(): ui.godSequence.GodSequenceChallengeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GOD_SEQUENCE_RANK_TOP_3,
            NotificationKey.GOD_SEQUENCE_CHANGE_LAYER,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.GOD_SEQUENCE_OPEN_STATE_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GOD_SEQUENCE_RANK_TOP_3:
                this.resetTop3(args as EventGodSequenceTop3);
                break;
            case NotificationKey.CLOSE_ViEW:
                this.updateLayerNum();
                break;
            case NotificationKey.GOD_SEQUENCE_CHANGE_LAYER:
                this.reset(false);
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                this.closeSelf();
                break;
        }

    }

    protected onInit() {
        this.view.btnChallenge.onClick(this.onClickChallenge, this);

        this.view.btnRule.onClick(this.onClickRule, this);
        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(
            this.view.rowList.node.uuid,
            this.iRRow,
            this
        );
        this.view.rowList.on(FGUI.Event.SCROLL, this.onRowScroll, this);

        this.view.rewardList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(
            this.view.rewardList.node.uuid,
            this.iRReward,
            this
        );
        this.view.topPlayerAvatarList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(
            this.view.topPlayerAvatarList.node.uuid,
            this.iRPlayerAvatar,
            this
        );

        this.view.topPlayerAvatarList.onClick(this.onClickRank0, this);


        this.view.btnBack.onClick(this.onBack, this);
        this.view.btnBuZhen.onClick(this.onBtnBuZhenClick, this);
    }

    onClickChallenge() {

        const type = this._args.type;
        const layerNum = this._args.layerNum;

        const config = GodSequenceConfigManager.getConfigByTypeAndLayer(type, layerNum);
        const levelId = config?.id || 0;

        //记录参数 在布阵返回后 处理
        FormationManager.ins().addAutoFightParam(FightType.LADDER, levelId);
        // 阵容设置 | 主地图阵容
        const subType = type?.toString() || "";
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.LADDER,
            subType,
        ));
    }

    onClickRule() {
        RuleController.ins().openRule(EnumRuleKeys.GOD_SEQUENCE, this.view.btnRule);
    }

    onRowScroll(event: FGUI.Event) {
        const scrollingPosY = this.view.rowList.scrollPane.scrollingPosY;

        const context = GodSequenceModel.ins().context;
        const isPassAll = context.isPassAllByType(this._args.type)
        if (isPassAll) {
            this.view.getController("isCanChallenge").selectedIndex = 1;
        } else {
            if (scrollingPosY <= 200) {
                this.view.getController("isCanChallenge").selectedIndex = 0;
            } else {
                this.view.getController("isCanChallenge").selectedIndex = 1;
            }
        }
    }

    onClickRank0() {
        let type = this._args.type;

        UIManager.ins().open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(
            RankingType.LADDER,
            type
        ));
    }

    onBack() {
        this.closeSelf();
    }

    onBtnBuZhenClick() {
        let type = this._args?.type;
        if (!type) {
            console.error("type is null")
            return;
        }
        const typeConfig = GodSequenceConfigManager.getTypeConfigByType(type);

        if (!typeConfig) {
            console.error("typeConfig is null")
            return;
        }

        let subType = type.toString();
        UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            FightType.LADDER,
            subType,
        ))
    }

    iRRow(index: number, item: GodSequenceLeftRightComp) {
        // 对齐
        const maxLength = this._configs.length % 2 == 0 ? this._configs.length : this._configs.length + 1;
        let rowId = maxLength - index * 2 - 2;
        const configL = this._configs[rowId];
        const configR = this._configs[rowId + 1];


        item.reset(configL, configR);

    }

    iRReward(index: number, item: ui.godSequence.components.GodSequenceRewardItemComp) {
        let noOwnerItem = this._typeRewardItems[index];
        item.imageItem.icon = noOwnerItem.getItemSmallIconPath();

    }

    iRPlayerAvatar(index: number, item: PlayerAvatar) {
        const configL = this._top3List[index];

        item.resetByPlayerInfo(configL.baseVo);
        item.touchable = false;
    }

    @LogBusiness("打开界面")
    public onOpen(args: GodSequenceChallengeViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

        this._args = args;

        this.reset(true);

    }

    updateLayerNum() {
        if (this._args) {
            const type = this._args.type;
            const maxPassLevel = GodSequenceModel.ins().context.getLayerNumByType(type);

            this._args.layerNum = maxPassLevel + 1
        }
    }

    reset(isFirst: boolean) {
        let context = GodSequenceModel.ins().context;

        let args = this._args;
        if (!args) {
            return;
        }


        let type = args.type;
        let curLayerNum = args.layerNum;
        if (!isFirst) {
            curLayerNum = context.getLayerNumByType(type);
        }

        let isCan = context.isCanContinueChallenge(type, true);
        this.view.btnChallenge.visible = isCan;
        
        // this.view.getController("isCanChallenge").selectedIndex = isCan ? 1 : 0;
        // this.view.getController("isCanChallenge").selectedIndex = 0;

        // 提示需要其他层数打上去, 当前爬塔才能继续
        const minLevel = context.getMinLayerNum() + 1;
        this.view.labelTipsLock.text = I18nManager.ins().lang(
            GodSequenceI18nKeys.lockChallengeTips,
            minLevel
        );

        let typeConfig = GodSequenceConfigManager.getTypeConfigByType(type);
        if (!typeConfig) {
            console.error("typeConfig is null")
            return;
        }
        this.view.labelTitle.text = typeConfig.name;
        //隐藏这里的提示文本
        this.view.labelFootTips.visible = false;
        // this.view.labelFootTips.text = typeConfig.limitHeroTips;


        this._typeRewardItems = ItemUtils.parseKvArrayToItemArray(typeConfig.rewards) || [];
        this.view.rewardList.numItems = this._typeRewardItems.length;

        this._configs = GodSequenceConfigManager.getPlayerCanSeeLayerConfigArrayByType(type);
        if (this._configs.length == 0) {
            this.view.rowList.numItems = 0;
        } else {
            this.view.rowList.numItems = Math.ceil(this._configs.length / 2);

        }


        GodSequenceModel.ins().sendLoadTopLadder({
            ladderType: type,
        });

        if (isFirst) {
            this.view.rowList.scrollPane.scrollBottom();

            GameTimer.ins().once(200, this, () => {
                if (this.view?.node?.isValid) {
                    let layerNumByType = context.getLayerNumByType(type);

                    let rowId = Math.floor(layerNumByType / 2);
                    if (rowId <= 1) {
                        return;
                    }

                    console.info(`玩家当前挑战层数 = ${rowId} | 关卡 = [${rowId * 2 - 1}, ${rowId * 2}] `);

                    // let childIndex = this.view.rowList.itemIndexToChildIndex(rowId);
                    // if (childIndex < 0) {
                    //     return;
                    // }
                    const toRowIndex = this.calculateScrollRowIndex(rowId)
                    this.view.rowList.scrollToView(toRowIndex, true);
                }
            })
        } else {

            this.scrollToRow(curLayerNum);
        }
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    private resetTop3(event: EventGodSequenceTop3) {
        if (!event) {
            return;
        }
        this._top3List = event.top3List || [];
        this.view.topPlayerAvatarList.numItems = this._top3List.length;

    }

    private scrollToRow(curLayerNum: number) {
        if (!this._configs) {
            return;
        }
        let rowId = Math.floor(curLayerNum / 2);

        let curRow = this.calculateScrollRowIndex(rowId);
        this.view.rowList.scrollToView(curRow, true);
    }

    private calculateScrollRowIndex(rowId: number) {
        let maxRow = Math.floor(this._configs.length / 2);

        return math.clamp(maxRow - rowId - 2, 0, maxRow - 1);
    }
}

UIScriptManager.bindScript(GodSequenceUIKeys.GodSequenceChallengeView, GodSequenceChallengeView);