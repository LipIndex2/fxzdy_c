import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { math, Node, Tween, tween, v3, Vec2 } from "cc";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import {
    DailyBossBalanceGridComp
} from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossBalanceGridComp";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { IconItem } from "db://assets/scripts/game/modules/common/item/IconItem";
import * as fgui from "fairygui-cc";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import RandomUtils from "db://assets/scripts/core/utils/RandomUtils";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { DailyBossUIKeys } from "db://assets/scripts/game/modules/dailyBoss/DailyBossUIKeys";
import {
    DailyBossUnlockNewHardViewOpenArgs
} from "db://assets/scripts/game/modules/dailyBoss/view/DailyBossUnlockNewHardView";
import { DailyBossBattleResultViewOpenArgs } from "../interface/IDailyBossArgs";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";


/**
 * 每日 Boss | 战斗结果界面
 */
export class DailyBossBattleResultView extends UICommWin {

    static pkgName: string = "dailyBoss";

    static viewName: string = "DailyBossBattleResultView";

    protected _leastTime: number = 3000;

    // 持续时间
    private __damageChangeDurationSec: number = 0.4;
    // config
    private _configs: table.dailyboss.DailyBossProgressConfig[];
    private _indexForConfig: number = 0;
    // 是否是新纪录
    private _isNewRecord: boolean = false;
    private _oldPos2DForLabelDamage: Vec2 = Vec2.ZERO;
    private _isWin: boolean = false;

    // 伤害
    private _curDamage: number = 0;
    private _targetDamage: number = 0;
    // 开始时间
    private _startTimeMs: number = 0;
    private _isDamageAnimFinish: boolean = false;
    private _hardId: number;
    private _bossType: number;

    private _progressValueReached: number;
    private _tweenForBackpack: Tween<Node>
    private _isNextHard: boolean = false;

    private _animTimeKey: string;

    private get view(): ui.dailyBoss.DailyBossBattleResultView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    protected onInit() {

        this.view.btnData.onClick(this.onClickBtnData, this);
        this.view.gridList.setVirtual();
        this.view.gridList.itemRenderer = this.itemRendererForProgressGrid.bind(this);

        // 伤害位置
        this._oldPos2DForLabelDamage = new Vec2(
            this.view.labelDamage.x,
            this.view.labelDamage.y,
        );

        this.view.btnBackpack.visible = false;

        GameTimer.ins().frameLoop(3, this, this.updateDamageLabel);


    }

    @LogBusiness("打开界面")
    public onOpen(args: DailyBossBattleResultViewOpenArgs): void {
        const isWin = args.winFlag;
        this._isWin = isWin;
        this._isNextHard = args.isNextHard;
        this._isNewRecord = args.isNewRecord;
        this._hardId = args.hardId;
        this._progressValueReached = args.progressValueOrHurt;
        const myBattleTempData = DailyBossModel.ins().context.getMyBattleTempData();
        this._bossType = myBattleTempData.bossType;
        this._targetDamage = DailyBossModel.ins().context.getTempDamage();

        this._startTimeMs = TimeManager.serverNow;

        const modelNode = this.view.modelNode as ModelNode;
        if (isWin) {
            modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
            modelNode.playOrders(
                [
                    {
                        name: "unlocking1",
                        isLoop: false
                    },
                    {
                        name: "idle1",
                        isLoop: true
                    },
                ]
            );
        } else {
            modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath());
            modelNode.playOrders(
                [
                    {
                        name: "unlocking2",
                        isLoop: false
                    },
                    {
                        name: "idle2",
                        isLoop: true
                    },
                ]
            );
        }
        this.view.getTransition("enter")
            .play(() => {
                this._startTimeMs = TimeManager.serverNow;
                this._animTimeKey = null
                this.tryGainRewardFlyAnimGridByGrid();
            });

        this.reset();
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        G.GameTimer.clearAll(this);
        this._tweenForBackpack?.stop();

        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        // 下一关?
        if (this._isNextHard) {
            const nextHardId = this._hardId + 1;
            const config = DailyBossConfigManager.getDifficultyConfig(nextHardId);
            if (config) {
                setTimeout(() => {
                    // 解锁新难度
                    UIManager.ins().open(DailyBossUIKeys.DailyBossUnlockNewHardView, DailyBossUnlockNewHardViewOpenArgs.create(
                        nextHardId,
                    ))
                }, 200);
            }
        }

        super.onClose();
    }

    reset() {
        // damage
        this._curDamage = 0;
        this.view.labelDamage.text = "0";
        this.view.getController("isNewRecord").selectedIndex = 0;

        // 进度格子
        const progressConfigs = DailyBossConfigManager.getProgressConfigArrayByHardId(this._hardId);
        this._configs = progressConfigs || [];
        this.view.gridList.numItems = this._configs.length;

    }

    updateDamageLabel() {
        if (this._startTimeMs == 0) {
            // no reset
            return;
        }
        if (this._isDamageAnimFinish) {
            // have done
            return;
        }
        const curTimeMs = TimeManager.serverNow;
        const diffTimeMs = curTimeMs - this._startTimeMs;
        if (diffTimeMs <= 0) {
            this.onDamageAnimDone();
            return;
        }
        const diffSec = diffTimeMs / 1000; // 计算已过时间，单位：秒
        if (diffSec >= this.__damageChangeDurationSec) {
            this.onDamageAnimDone();
            return;
        }

        // 计算当前的 damageValue
        const progress = diffSec / this.__damageChangeDurationSec;
        const diffDamage = Math.max(0, (this._targetDamage - this._curDamage));
        // new 
        this._curDamage = Math.floor(this._curDamage + (diffDamage * progress));

        this.view.labelDamage.text = `${this._curDamage}`;

    }

    private onDamageAnimDone() {
        // done
        this._curDamage = this._targetDamage;
        this.view.labelDamage.text = `${Math.floor(this._curDamage)}`;
        this._isDamageAnimFinish = true;


        // tips
        const tipsX = this.view.labelDamage.x + this.view.labelDamage.width;
        const tipsY = this.view.imageNewDamage.y
        this.view.imageNewDamage.setPosition(tipsX - 10, tipsY);
        this.view.getController("isNewRecord").selectedIndex = this._isNewRecord ? 1 : 0;
    }

    itemRendererForProgressGrid(index: number, comp: DailyBossBalanceGridComp) {
        const dailyBossProgressConfig = this._configs[index];

        const progressId = dailyBossProgressConfig.id;
        // 历史已经获取过

        comp.reset(dailyBossProgressConfig);

        // 标记是否已经获取过
        const isHave = DailyBossModel.ins().context.isHaveGainProgressId(progressId);
        if (isHave) {
            comp.setHaveGain(true);
            return;
        }

        if (index < this._indexForConfig) {
            // reach !
            comp.setHaveGain(true);
            return;
        }

        // 未到达
        comp.setHaveGain(false);
    }

    protected endGainRewardFlyAni(): void {
        if (this._animTimeKey) {
            GameTimer.ins().clearByKey(this._animTimeKey);
        }
        this.view.gridList.refreshVirtualList();
    }

    protected tryNextGainRewardFlyAni(): void {
        this._indexForConfig++;
        this.tryGainRewardFlyAnimGridByGrid()
    }

    private tryGainRewardFlyAnimGridByGrid() {
        if (!this._configs) {
            this.endGainRewardFlyAni()
            return;
        }

        const config = this._configs[this._indexForConfig]
        if (!config) {
            this.endGainRewardFlyAni()
            return;
        }
        const progressId = config.id;

        // reach ? 

        const myProgress = this._progressValueReached;
        const needProgress = config.progressEnd;
        let isReach = needProgress <= myProgress;
        if (DailyBossConfigManager.getMaxDifficulty() == this._hardId) {
            isReach = myProgress >= needProgress;
        }
        if (!isReach) {
            this.endGainRewardFlyAni()
            return;
        }

        // 已经领取过
        const isHave = DailyBossModel.ins().context.isHaveGainProgressId(progressId);
        if (isHave) {
            // GameTimer.ins().clearByKey(this._animTimeKey);
            // this.view.gridList.refreshVirtualList();
            this.tryNextGainRewardFlyAni()
            return;
        }
        const item = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards);
        if (!item) {
            this.tryNextGainRewardFlyAni()
            return;
        }

        this.view.btnBackpack.visible = true;
        this.view.gridList.scrollToView(this._indexForConfig, true);

        // 飞奖励动画
        const flyCount = math.clamp(item.count, 1, 1);
        for (let i = 0; i < flyCount; i++) {
            const childIndex = this.view.gridList.itemIndexToChildIndex(this._indexForConfig);
            const gridComp = this.view.gridList.getChildAt(childIndex) as DailyBossBalanceGridComp;
            if (!gridComp) {
                // 没找到子节点
                console.warn(`can not find gridComp at index ${this._indexForConfig}`);
                continue;
            }

            const flyItemComp = fgui.UIPackage.createObject("comm", "IconItem") as IconItem;
            // 大图标, 缩小先
            flyItemComp.setIcon(item.getIconPath());

            this.view.addChild(flyItemComp);


            const isAdd = i % 2 == 0;

            const randomLen = RandomUtils.random(-20, 20);

            flyItemComp.node.worldPosition = gridComp.getRewardWorldPos();
            const durationS = 1;
            flyItemComp.flyByBezierCurvePath(
                this.view.flyPos1.node.position.clone().add3f(randomLen, randomLen, 0),
                // this.view.btnBackpack.node.position.clone(),
                this.view.btnBackpack.node.position.clone(),
                durationS
            );
            GameTimer.ins().once(durationS, this, () => {
                this.onBackpackGainItem();
            });
        }
        this.view.gridList.refreshVirtualList();
        // TODO 播放飞奖励动画
        this._animTimeKey = G.GameTimer.once(200, this, this.tryNextGainRewardFlyAni);
    }

    private onBackpackGainItem() {
        if (NodeUtils.isNotValidNode(this.view.node)) {
            return;
        }

        this._tweenForBackpack?.stop();
        const oldScale = v3(1, 1, 1);
        this.view.btnBackpack.node.scale = oldScale;
        this._tweenForBackpack = tween(this.view.btnBackpack.node)
            .to(0.2, { scale: v3(1.2, 1.2, 1) })
            .to(0.2, { scale: oldScale })
            .start();

    }


    onClickBtnData() {

        // 战斗数据
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.DAILY_BOSS, this._isWin);
    }

}

UIScriptManager.bindScript(DailyBossUIKeys.DailyBossBattleResultView, DailyBossBattleResultView);