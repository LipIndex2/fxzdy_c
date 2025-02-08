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
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";

@bindScript(UIPetDungeonConfig.PetDungeonChallengeWin)
export class PetDungeonChallengeWin extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonChallengeWin";

    protected _curFloorId: number;
    protected _historyFirstCnt: number;
    protected _seasonFirstCnt: number;
    protected _rewards: { k: number, v: number }[] = [];
    protected _heroModels: ModelNode[] = [];
    protected _isGainFloorReward:boolean = false;

    private get view(): ui.petDungeon.view.PetDungeonChallengeWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.btnChallenge.onClick(this.onClickChallenge, this);
        this.view.btnEdit.onClick(this.onClickEdit, this);
        this._heroModels = [
            this.view.modelNode1 as ModelNode,
            this.view.modelNode2 as ModelNode,
            this.view.modelNode3 as ModelNode,
            this.view.modelNode4 as ModelNode,
            this.view.modelNode5 as ModelNode,
            this.view.modelNode6 as ModelNode,
        ]
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForReward(index: number, item: ui.comm.item.ItemFrameBtnWithFirst): void {
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        let data = this._rewards[index];
        let itemFrame = FguiScriptUtils.toMyScriptClass(item.itemFrame, ItemFrameBtn);
        itemFrame.resetByConfigKv(data);
        if (index < this._historyFirstCnt) {
            item.pFirst.visible = true;
            item.getController('style').selectedIndex = 1;
        } else if (index >= this._historyFirstCnt && index < this._historyFirstCnt + this._seasonFirstCnt) {
            item.pFirst.visible = true;
            item.getController('style').selectedIndex = 2;
            itemFrame.setHaveGain(myInfo.seasonMaxFloor >= this._curFloorId);
        } else {
            itemFrame.setHaveGain(this._isGainFloorReward);
            item.pFirst.visible = false;
        }
    }

    protected onClickChallenge(): void {
        if (GIns.petDungeonMgr.challenge(this._curFloorId)) {
            this.closeSelf();
        }
    }

    protected onClickEdit(): void {
        G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, { type: FightType.PET_DUNGEON });
    }

    protected updateUI(): void {
        this._rewards.length = 0;
        let myInfo = GIns.petDungeonModel.activityInfo?.playerInfoVo;
        if (!myInfo) {
            return;
        }
        let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, this._curFloorId);
        if (cfg) {
            if (cfg.historyFirstRewards?.length > 0 && myInfo.historyMaxFloor < this._curFloorId) {
                //生涯首通 只在没通关时显示
                this._historyFirstCnt = cfg.historyFirstRewards.length;
                this._rewards = this._rewards.concat(cfg.historyFirstRewards);
            } else {
                this._historyFirstCnt = 0;
            }
            if (cfg.seasonFirstRewards?.length > 0) {
                this._seasonFirstCnt = cfg.seasonFirstRewards.length;
                this._rewards = this._rewards.concat(cfg.seasonFirstRewards);
            } else {
                this._seasonFirstCnt = 0;
            }

            if (cfg.floorRewards?.length > 0) {
                this._rewards = this._rewards.concat(cfg.floorRewards);
            }

            // 怪物配置
            let monsters: table.monster.MonsterAttributeConfig[] = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(cfg.battleConfigId);
            this._heroModels.forEach((modelNode, index) => {
                if (index < monsters.length) {
                    modelNode.visible = true;
                    modelNode.loadByModelId(monsters[index].modelId);
                } else {
                    modelNode.visible = false;
                }
            })
            // 战斗力
            const power = BattleUIUtils.getPowerByBattleConfigId(cfg.battleConfigId);
            this.view.labelPower.text = power.toString();

            this.view.labelTitle.text = cfg.name;
        }

        let times:number = 0;
        if (myInfo.floorRewardTimesMap[this._curFloorId]) {
            times = myInfo.floorRewardTimesMap[this._curFloorId]
        }
        this._isGainFloorReward = times >= GIns.petDungeonModel.constCfg.floorRepeatRewardTimes;

        this.view.listReward.numItems = this._rewards.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._curFloorId = args;
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}