import { Layers, Node, sp } from "cc";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { Res } from "db://assets/scripts/core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { SpineAnimationKeys } from "db://assets/scripts/game/comm/const/SpineAnimationKeys";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { BtnConfirmViewOpenArgs } from "db://assets/scripts/game/modules/common/confirm/BtnConfirmView";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { HangUpPerHourIconComp } from "db://assets/scripts/game/modules/hangup/components/HangUpPerHourIconComp";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { HangUpI18nKeys } from "db://assets/scripts/game/modules/hangup/HangUpI18nKeys";
import { HangUpUIKeys } from "db://assets/scripts/game/modules/hangup/HangUpUIKeys";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpPerHourData } from "db://assets/scripts/game/modules/hangup/structs/HangUpPerHourData";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { PrivilegeAdditionController } from "db://assets/scripts/game/modules/vip/PrivilegeAdditionController";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ResRef } from "../../../../core/res/ResRef";
import { TableManager } from "../../../../core/table/TableManager";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import NotificationKey from "../../../event/NotificationKey";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../formation/const/UIFormationConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import { ModelNode } from "../../common/node/ModelNode";


const { GObject } = fgui;

export class HangUpChallengeViewOpenArgs {
    // 关卡ID
    levelId: number;

    static create(levelId: number): HangUpChallengeViewOpenArgs {
        let args = new HangUpChallengeViewOpenArgs();
        args.levelId = levelId;
        return args;
    }
}

/**
 * 挂机挑战 - 备战界面
 */
@bindScript(HangUpUIKeys.HangUpChallengeView)
export class HangUpChallengeView extends UICommWin {

    // 关卡ID
    private _levelId: number = 0;
    // 通关提升的数值
    private _passHangUpItemArray: Array<HangUpPerHourData> = [];
    // 通关道具奖励
    private _passBigRewardItemArray: Array<NoOwnerItem> = [];
    private _posToHeroNodeMap: Map<number, ModelNode> = new Map();

    static pkgName: string = "hangUp";

    static viewName: string = "HangUpChallengeView";

    private get view(): ui.hangUp.HangUpChallengeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.MONTHCARD_DATA_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this.updateAutoBtn()
                break
        }

    }

    public onInit(): void {
        Logger.debug(" onInit ")

        // 3个按钮 = 自动挑战, 挑战, 设置阵容
        this.view.btnAutoChallenge.onClick(this.onClickAutoChallenge0, this);
        this.view.btnChallenge.onClick(this.onClickChallenge0, this);
        this.view.btnSetSchema.onClick(this.onClickSetSchema0, this);


        this.updateAutoBtn()
        // outside
        // this.view.onClick(this.onTouchOutSide, this);

        // 奖励道具
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.renderItemForItemList.bind(this);
        // 挂机升级
        this.view.hangUpItemList.setVirtual();
        this.view.hangUpItemList.itemRenderer = this.renderItemForHangUpItem.bind(this);


    }

    protected updateAutoBtn(): void {
        // 是否解锁了终身卡 -> 自动挑战
        let isHave = PrivilegeAdditionController.ins().hasTrunkInstanceHangUp();
        this.view.btnAutoChallenge.getController("isLock").selectedIndex = isHave ? 0 : 1;
    }

    /**
     * 点击挑战
     */
    onClickChallenge0() {
        Logger.debug(" onClickChallenge0 ")

        const model = HangUpModel.ins();
        // net 发起挑战

        model.sendChallengeTrunkInstance({
            instanceId: this._levelId
        });


        UIManager.ins().close(HangUpUIKeys.HangUpChallengeView);

    }

    /**
     * 点击自动挑战
     */
    onClickAutoChallenge0() {
        Logger.debug(" onClickAutoChallenge0 ")


        // UIManager.ins().open(HangUpUIKeys.HangUpAutoChallengeConfirmView, {
        //     levelId: this._levelId
        // });

        // 是否解锁了终身卡
        let isHave = PrivilegeAdditionController.ins().hasTrunkInstanceHangUp();
        if (!isHave) {
            // 二次确认框
            UIManager.ins().open(UICommonKey.BtnConfirmView, {
                title: "提示",
                titleCancel: "取消",
                titleConfirm: "前往",
                content: "激活终身卡后可使用挂机托管功能",
                onBtnYes: () => {
                    // 跳转终身卡
                    JumpManager.ins().jumpById(HangUpConfigManager.jumpIdForUnlockAutoChallenge);
                },
            } as BtnConfirmViewOpenArgs);
            return;
        }

        // 后台战斗
        UIManager.ins().open(HangUpUIKeys.HangUpInBgConfirmWin);

        this.closeSelf();
    }

    /**
     * 拉起设置阵容界面
     */
    onClickSetSchema0() {
        Logger.debug(" onClickSetSchema0 ")

        // 阵容设置 | 主地图阵容
        UIManager.ins().open(UIFormationKey.FORMATION_MAIN_VIEW, {
            type: FightType.TRUNK_MAP
        } as FormationMainViewOpenArgs);
    }

    public onOpen(args: HangUpChallengeViewOpenArgs): void {
        Logger.debug(" onOpen ")


        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view);

        let levelId = args.levelId;
        this.reset(levelId);

    }


    private reset(levelId: number) {
        // 自动挑战
        const context = HangUpModel.ins().context;
        this.view.btnAutoChallenge.visible = context.isCanAutoHangUpInBg();

        this._levelId = levelId;
        if (!levelId) {
            Logger.error(`levelId = ${levelId}`)
            return;
        }

        // 挂机关卡配置
        let levelConfig = HangUpUtils.getHangUpConfigByLevelId(levelId);
        if (!levelConfig) {
            Logger.error("config is null")
            return;
        }

        // 关卡收益
        this._passHangUpItemArray = HangUpUtils.createHangUpPerHourDataArrayByConfig(levelConfig);
        this.view.hangUpItemList.numItems = this._passHangUpItemArray.length;

        // 奖励
        let rewardItems = ItemUtils.parseKvArrayToItemArray(levelConfig.rewards);
        const isHaveBigReward = ArrayUtils.isNotEmpty(rewardItems)

        this.view.getController("haveBigRewardFlag").selectedIndex = isHaveBigReward ? 1 : 0;


        // 战斗配置
        let battleConfigId = levelConfig.battleConfigId;
        // 怪物配置
        const monsterAttributeConfigArray: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);

        // clear old
        this._posToHeroNodeMap.forEach((modelNode) => {
            modelNode.clear();
        });
        this._posToHeroNodeMap.clear();

        // 敌方阵容
        [
            this.view.modelNode1,
            this.view.modelNode2,
            this.view.modelNode3,
            this.view.modelNode4,
            this.view.modelNode5,
            this.view.modelNode6,
        ].forEach((modelNode: ModelNode, index) => {
            if (monsterAttributeConfigArray.length < index) {
                return;
            }
            // 怪物资源
            let monsterResourceConfig = monsterAttributeConfigArray[index];
            if (!monsterResourceConfig) {
                return;
            }
            let spineModelId = monsterResourceConfig.modelId;
            modelNode.loadByModelId(spineModelId);
            this._posToHeroNodeMap.set(index, modelNode);
        })

        // 道具
        let noOwnerItems = rewardItems;
        this._passBigRewardItemArray = noOwnerItems;
        if (ArrayUtils.isNotEmpty(noOwnerItems)) {
            this.view.itemList.numItems = noOwnerItems.length;
        } else {
            this.view.itemList.numItems = 0;
        }

        // title 关卡奖励
        this.view.labelLevelTitle.text = HangUpI18nKeys.LEVEL_REWARD;
        this.view.labelTitle.text = levelConfig.title;
        // 战斗力
        const power = BattleUIUtils.getPowerByBattleConfigId(battleConfigId);
        this.view.labelPower.text = power.toString();
    }

    public onClose(): void {

        Logger.debug(" onClose ");

    }

    /**
     * 挂机收益
     * @param index
     * @param comp
     */
    renderItemForHangUpItem(index: number, comp: HangUpPerHourIconComp): void {
        let hangUpPerHourData = this._passHangUpItemArray[index];
        comp.reset(hangUpPerHourData);

    }

    renderItemForItemList(index: number, item: ui.comm.item.ItemFrameBtn): void {
        let noOwnerItem = this._passBigRewardItemArray[index];
        if (!noOwnerItem) {
            return;
        }

        let config = noOwnerItem.getItemConfig();
        if (!config) {
            return;
        }

        item.item.img_item.icon = config.iconPath;
        item.item.T_num.text = "" + noOwnerItem.count;
        item.item.img_frame.icon = noOwnerItem.getQualityIconPath();

        // @ts-ignore
        let itemComp = item as ItemFrameBtn;
        itemComp.resetByNoOwnerItem(noOwnerItem);

    }
}