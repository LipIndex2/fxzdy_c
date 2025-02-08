import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BattleUIUtils } from "../../battle/utils/BattleUIUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { ICollectiblesDungeonLevelVo } from "../model/vo/ICollectiblesDungeonLevelVo";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonChallengeWin)
export class CollectiblesDungeonChallengeWin extends UICommWin {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonChallengeWin";

    protected _levelId: number;
    protected _levelVo: ICollectiblesDungeonLevelVo = null;
    protected _rewardLastIdxs: number[];
    protected _rewards: { k: number, v: number }[] = [];
    /**已领取的奖励数量*/
    protected _getRewardCnt: number = 0;
    protected _heroModels: ModelNode[] = [];
    protected _stars: ui.collectiblesDungeon.component.CollectiblesDungeonStar[] = [];

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonChallengeWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE,
            NotificationKey.COLLECTIBLES_DUNGEON_CHALLENGE_START,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
            case NotificationKey.COLLECTIBLES_DUNGEON_CHALLENGE_START:
                this.closeSelf();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listCond.itemRenderer = this.itemRendererForCond.bind(this);
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.btnChallenge.onClick(this.onClickChallenge, this);
        this._heroModels = [
            this.view.modelNode1 as ModelNode,
            this.view.modelNode2 as ModelNode,
            this.view.modelNode3 as ModelNode,
            this.view.modelNode4 as ModelNode,
            this.view.modelNode5 as ModelNode,
            this.view.modelNode6 as ModelNode,
        ];

        this._stars = [
            this.view.star1,
            this.view.star2,
            this.view.star3,
        ];
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForCond(index: number, item: ui.collectiblesDungeon.item.CollectiblesDungeonChallCondItem): void {
        item.lbCond.text = this._levelVo.conditions[index].desc;
    }

    protected itemRendererForReward(index: number, item: ui.comm.item.ItemFrameBtnWithFirst): void {
        let data = this._rewards[index];
        let itemFrame = FguiScriptUtils.toMyScriptClass(item.itemFrame, ItemFrameBtn);
        itemFrame.resetByConfigKv(data);
        item.pFirst.visible = true;
        item.getController('style').selectedIndex = 3;
        if (index < this._getRewardCnt) {
            itemFrame.setHaveGain(true);
        } else {
            itemFrame.setHaveGain(false);
        }
        if (index < this._rewardLastIdxs[0]) {
            item.lbFrist.text = '一星';
        } else if (index < this._rewardLastIdxs[1]) {
            item.lbFrist.text = '二星';
        } else {
            item.lbFrist.text = '三星';
        }
    }

    protected onClickChallenge(): void {
        if (GIns.collectiblesDungeonModel.vo.challengeCount <= 0) {
            GIns.floatingTextMgr.showTips('今日剩余挑战次数不足');
            return;
        }
        GIns.collectiblesDungeonMgr.openFormationView(this._levelId);
    }

    protected onClickEdit(): void {
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, { type: FightType.PET_DUNGEON });
    }

    //不需要刷新的UI
    protected initUI(): void {
        // 怪物配置
        let monsters: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(this._levelVo.cfg.battleConfigId);
        this._heroModels.forEach((modelNode, index) => {
            if (index < monsters.length) {
                modelNode.visible = true;
                modelNode.loadByModelId(monsters[index].modelId);
            } else {
                modelNode.visible = false;
            }
        })
        // 战斗力
        const power = BattleUIUtils.getPowerByBattleConfigId(this._levelVo.cfg.battleConfigId);
        this.view.labelPower.text = power.toString();

        this.view.listCond.numItems = this._levelVo.conditions.length;

        this._rewards.length = 0;
        this._rewardLastIdxs = [0, 0, 0];
        let rewards = [this._levelVo.cfg.firstRewardsOne, this._levelVo.cfg.firstRewardsTwo, this._levelVo.cfg.firstRewardsThree];
        rewards.forEach((list, index) => {
            if (list && list.length > 0) {
                this._rewards = this._rewards.concat(list);
                this._rewardLastIdxs.forEach((value, i) => {
                    if (i >= index) {
                        this._rewardLastIdxs[i] = value + list.length;
                    }
                })
            }
        });
    }

    //需要刷新的UI
    protected updateUI(): void {

        this._getRewardCnt = 0;
        if (this._levelVo.curStar > 0) {
            this._getRewardCnt = this._rewardLastIdxs[this._levelVo.curStar - 1];
        }
        this.view.listReward.numItems = this._rewards.length;

        this._stars.forEach((star, index) => {
            if (index < this._levelVo.curStar) {
                star.getController('state').selectedIndex = 0;
            } else {
                star.getController('state').selectedIndex = 1;
            }
        });
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._levelId = args;
        this._levelVo = GIns.collectiblesDungeonModel.getLevelVo(this._levelId);
        if (this._levelVo == null) {
            this.closeSelf();
            return;
        }
        this.initUI();
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}