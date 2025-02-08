import { Layers, Node, sp } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { Res } from "db://assets/scripts/core/res/Res";
import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { SpineAnimationKeys } from "db://assets/scripts/game/comm/const/SpineAnimationKeys";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { BattleUIUtils } from "db://assets/scripts/game/modules/battle/utils/BattleUIUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { HangUpI18nKeys } from "db://assets/scripts/game/modules/hangup/HangUpI18nKeys";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ResRef } from "../../../../core/res/ResRef";
import { TableManager } from "../../../../core/table/TableManager";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../formation/const/UIFormationConfig";
import { FormationManager } from "../../formation/FormationManager";
import {
    CommonChallengeViewOpenArgs
} from "db://assets/scripts/game/modules/common/battle/structs/CommonChallengeViewOpenArgs";


const {GObject} = fgui;

/**
 * 挑战确认
 */
export class CommonChallengeView extends UICommWin {


    static pkgName: string = "commBattle";

    static viewName: string = "CommonChallengeView";

    // 辅助
    private _posToHeroNodeMap: Map<number, Node> = new Map();
    // 挑战 callback
    private _challengeCallback: Function;
    private _autoChallengeCallback: Function;
    // 通关道具奖励
    private _rewards: Array<NoOwnerItem> = [];
    private _battleConfigId: number;
    private _args: CommonChallengeViewOpenArgs;

    private get view(): ui.commBattle.battle.CommonChallengeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    public onInit(): void {
        G.Logger.debug(" onInit ")

        // 3个按钮 = 自动挑战, 挑战, 设置阵容
        this.view.btnAutoChallenge.onClick(this.onClickAutoChallenge0, this);
        this.view.btnChallenge.onClick(this.onClickChallenge0, this);
        this.view.btnSetSchema.onClick(this.onClickSetSchema0, this);

        // outside
        // this.view.onClick(this.onTouchOutSide, this);

        // 奖励道具
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.renderItemForItemList.bind(this);


    }

    /**
     * 点击挑战
     */
    onClickChallenge0() {
        G.Logger.debug(" onClickChallenge0 ")


        // 挑战
        this._challengeCallback && this._challengeCallback();


        this.closeSelf()

    }

    /**
     * 点击自动挑战
     */
    onClickAutoChallenge0() {
        G.Logger.debug(" onClickAutoChallenge0 ")

        // 序列
        if (this._args.fightType == FightType.LADDER) {
            //记录参数 在布阵返回后 处理
            FormationManager.ins().addAutoFightParam(this._args.fightType, this._args.param)
            // 阵容设置
            G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
                this._args.fightType,
                this._args.subType,
            ));
            return;
        }

        // 挑战
        this._autoChallengeCallback && this._autoChallengeCallback();

    }

    /**
     * 拉起设置阵容界面
     */
    onClickSetSchema0() {
        G.Logger.debug(" onClickSetSchema0 ")

        //记录参数 在布阵返回后 处理
        FormationManager.ins().addAutoFightParam(this._args.fightType, this._args.param)
        // 阵容设置 | 主地图阵容
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
            this._args.fightType,
            this._args.subType,
        ));
        this.closeSelf()
    }

    public onOpen(args: CommonChallengeViewOpenArgs): void {
        G.Logger.debug(" onOpen ")


        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view);

        this._args = args;
        this._challengeCallback = args.challengeCallback;
        this._autoChallengeCallback = args.autoChallengeCallback;
        this._rewards = args.rewards;
        this._battleConfigId = args.battleConfigId;

        this.reset();

    }


    private reset() {


        // 奖励
        let rewardItems = this._rewards;
        const isHaveBigReward = ArrayUtils.isNotEmpty(rewardItems)


        // 战斗配置
        let battleConfigId = this._battleConfigId;
        // 怪物配置
        const monsterAttributeConfigArray: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);

        // clear old
        this._posToHeroNodeMap.forEach((node) => {
            node.destroy();
        });
        this._posToHeroNodeMap.clear();

        // 敌方阵容
        [
            this.view.spine1,
            this.view.spine2,
            this.view.spine3,
            this.view.spine4,
            this.view.spine5,
            this.view.spine6,
        ].forEach((fguiSpineNode, index) => {
            const nodeForSpine = fguiSpineNode.node
            if (monsterAttributeConfigArray.length < index) {
                return;
            }
            // 怪物资源
            let monsterResourceConfig = monsterAttributeConfigArray[index];
            if (!monsterResourceConfig) {
                return;
            }
            let spineModelId = monsterResourceConfig.modelId;

            let spinePath = TableManager.getDataById(table.model.ModelConfig, spineModelId);
            Res.getResRef({bundle: AssetBundleKeys.SPINE, url: spinePath.modelPath, type: sp.SkeletonData}, null,
                (res: ResRef) => {
                    if (!res) {
                        G.Logger.error("加载 spine 失败")
                        return
                    }
                    if (this.view?.node?.isValid) {
                        // 加载 spine
                        const spineNode = new Node();
                        spineNode.setScale(1, 1);
                        spineNode.position = nodeForSpine.position;
                        spineNode.layer = Layers.Enum.ALL;
                        // spine anim
                        const spineSkeleton = spineNode.addComponent(sp.Skeleton);
                        spineSkeleton.skeletonData = res.content;
                        // parent
                        nodeForSpine.parent.addChild(spineNode)

                        // play idle anim
                        spineSkeleton.setAnimation(0, SpineAnimationKeys.idle, true)

                        G.Logger.debug("加载 spine 完成")

                        this._posToHeroNodeMap.set(index, spineNode)
                    }
                })
        })

        // 道具
        let noOwnerItems = rewardItems;
        this._rewards = noOwnerItems;
        if (ArrayUtils.isNotEmpty(noOwnerItems)) {
            this.view.itemList.numItems = noOwnerItems.length;
        } else {
            this.view.itemList.numItems = 0;
        }

        // title 关卡奖励
        const fightType = this._args.fightType;
        if (fightType == FightType.TRUNK_INSTANCE) {
            this.view.labelLevelTitle.text = HangUpI18nKeys.LEVEL_REWARD;
        } else if (fightType == FightType.LADDER) {
            this.view.labelLevelTitle.text = "关卡奖励";
        } else {
            this.view.labelLevelTitle.text = "关卡奖励";
        }
        this.view.labelTitle.text = this._args.title;
        // 敌方战斗力
        this.view.labelPower.text = this._args.enemyPower.toString();
    }

    public onClose(): void {

        G.Logger.debug(" onClose ");

    }


    private onTouchOutSide(event: fgui.Event) {
        G.Logger.debug(event, " onTouchEnd ")

        // 点击空白处退出背包面板
        let isIn = TouchUtils.isFguiTouchInUi(event, this.view.bg._uiTrans)
        if (isIn) {
            return
        }
        this.closeSelf()
    }


    renderItemForItemList(index: number, item: ui.comm.item.ItemFrameBtn): void {
        let noOwnerItem = this._rewards[index];
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