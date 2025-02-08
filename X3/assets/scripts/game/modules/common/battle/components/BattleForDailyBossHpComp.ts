import { Color } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { NumberRange } from "db://assets/scripts/core/utils/NumberRange";
import { WorldUnitTeam } from "db://assets/scripts/game/comm/battle/enum/BattleEnum";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { IBattleTeamHpChangeVo } from "db://assets/scripts/game/modules/battle/vo/IBattleTeamHpChangeVo";
import { BattleForDailyBossData } from "db://assets/scripts/game/modules/common/battle/structs/BattleForDailyBossData";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import ArrayUtils from "../../../../../core/utils/ArrayUtils";
import { IBattleResultVo } from "../structs/IBattleResultVo";

class BarData {
    // [0, 1]
    startPercent01: number = 0;
    // [0, 1]
    endPercent01: number = 0;

    hpRowCount: number = 0;
    alpha: number = 0;
    color: Color

    static readonly maxColorCount = 4;

    // 默认颜色, 兜底
    static readonly colorMap: Map<number, Color> = new Map([
        [0, new Color('#FFFF00')], // 黄色
        [1, new Color('#800080')], // 紫色
        [2, new Color('#FFA500')], // 橙色
        [3, new Color('#FF0000')], // 红色
        // [4, '#2f9736'], // 绿色
    ]);

    static getColorByHpRowCount(hpRowCount: number): Color {
        // 默认白色
        const maxSize = this.colorMap.size;
        let colorKey = hpRowCount % maxSize;
        if (hpRowCount > maxSize && colorKey == 0) {
            colorKey = maxSize - 2;
        }
        return BarData.colorMap.get(colorKey) || new Color('#FFFFFF');
    }

    static create(hpRowCount: number,
        config: table.dailyboss.DailyBossProgressConfig,
        isMaxHardId: boolean,
        maxHardHp: number
    ): BarData {
        const barData = new BarData();
        barData.hpRowCount = hpRowCount;
        // TODO
        if (isMaxHardId) {
            // 无尽难度
            barData.startPercent01 = config.progressStart * 10000 / maxHardHp;
            barData.endPercent01 = config.progressEnd * 10000 / maxHardHp;
        } else {
            barData.startPercent01 = config.progressStart / 10000;
            barData.endPercent01 = config.progressEnd / 10000;
        }

        // TODO 根据 hpRowCount 算出颜色
        const maxSize = this.colorMap.size;
        barData.color = BarData.getColorByHpRowCount(hpRowCount);
        barData.alpha = 1;
        return barData;
    }

    static createZero() {
        const barData = new BarData();
        barData.alpha = 0;
        barData.color = new Color('#FFFFFF');
        barData.hpRowCount = 0;
        return barData;

    }

    // 百分比中的百分比 [0,1]
    getSubPercentValue01(hpPercent: number,
        maxHp: number
    ): number {
        const curHp = maxHp * hpPercent;
        const startHp = maxHp * this.startPercent01;
        const endHp = maxHp * this.endPercent01;


        const diffHp = Math.max(0, curHp - startHp);
        if (diffHp <= 0) {
            return 0;
        }
        const maxDiffHp = endHp - startHp;
        if (maxDiffHp <= 0) {
            return 0;
        }
        // return math.clamp(diffHp / maxDiffHp, 0, 1);
        return diffHp / maxDiffHp;
    }

    static updateColorMap(dailyBossHpColorMap: Map<number, Color>) {
        this.colorMap.clear();
        for (let [key, value] of dailyBossHpColorMap) {
            this.colorMap.set(key, value);
        }
    }
}

/**
 * 每日boss血条
 */
export class BattleForDailyBossHpComp extends fgui.GComponent implements INotification {

    static pkgName: string = "commBattle";
    static viewName: string = "BattleForDailyBossHpComp";

    private _data: BattleForDailyBossData = null;
    // <队伍类型, 血量变化>
    private _teamToHpStateMap: Map<WorldUnitTeam, IBattleTeamHpChangeVo> = new Map<WorldUnitTeam, IBattleTeamHpChangeVo>();
    // <百分比范围, 血条数据>
    private _percentRangeToBarDataMap: Map<NumberRange, BarData> = new Map();
    // 第几条血：data
    private _hpRowCountToBarData: Map<number, BarData> = new Map();
    // 多少层血
    private _maxHpCount: number = 1;

    // 旧的血条
    private _oldHpRowCount: number = 0;
    // bar state
    private _oldCurHpBarValue100: number = 100;
    private _oldShadowHpBarValue100: number = 100;
    private _isHaveResult: boolean = false;
    private _fightType: ServerEnums.FightType;
    // 是否是最大难度 = 无尽模式
    private _isMaxHardId: boolean = false;
    // 无尽模式的最大进度血量 
    private _maxHardHp: number = 0;
    // 无尽模式 - 循环血量
    private _maxHardCycleHpRowCount: number = 1;
    // 无尽模式的血条
    private _endlessHpCount: number = 0;
    // 第一个血条数据
    private _firstHpBarData: BarData;


    private get view(): ui.commBattle.battleView.hp.BattleForDailyBossHpComp {
        return this as any;
    }

    protected onConstruct(): void {


        // 上方小进度条
        this.view.percentBar.max = 100;
        // shadow hp bar
        this.view.hpBar2.alpha = 0.7;
        this.view.hpBar2.bar.color = new Color('#000000');

        BarData.updateColorMap(DailyBossConfigManager.getDailyBossHpColorMap());
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_HP_CHANGED,
            NotificationKey.BATTLE_RESULT,
            NotificationKey.BATTLE_START,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_HP_CHANGED:
                // 血条
                this.onChangeTeamHp(args as IBattleTeamHpChangeVo)
                break;
            case NotificationKey.BATTLE_RESULT:
                // 战斗结果
                this.onBattleEnd(args as IBattleResultVo)
                break;
            case NotificationKey.BATTLE_START:

                break;
        }

    }

    // @LogBusiness("战场 - 血量变化")
    private onChangeTeamHp(changeVo: IBattleTeamHpChangeVo) {
        if (!changeVo) {
            return;
        }
        G.Logger.debug(changeVo, " updateBattleData ")
        this._teamToHpStateMap.set(changeVo.teamId, changeVo);
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }

    reset(fightType: ServerEnums.FightType, data: BattleForDailyBossData) {
        this._fightType = fightType;

        const progressConfigs = DailyBossConfigManager.getProgressConfigArrayByHardId(data.hardId);
        if (ArrayUtils.isEmpty(progressConfigs)) {
            return;
        }
        this._isMaxHardId = progressConfigs[0].hardId == DailyBossConfigManager.getMaxDifficulty();
        this._data = data;

        this._percentRangeToBarDataMap = new Map();
        let hpRowCount = 1;
        let maxRowCount = 1;
        const configs = progressConfigs || [];
        if (this._isMaxHardId) {
            // 无尽模式
            // 最大血量
            this._maxHardHp = configs
                .toDataStream()
                .map(it => it.progressEnd)
                .maxByWeightNumber(it => it, 0)
                * 10000
                ;
            console.info(`无尽模式. boss one cycle maxHp = ${this._maxHardHp}`);
            maxRowCount = configs.length;

            // 换算成百分比
            let isFirst = true;
            for (let it of configs) {

                const restHpStart = Math.max(0, it.progressStart * 10000);
                const restHpEnd = Math.max(0, it.progressEnd * 10000);

                const startPercent = (restHpStart / this._maxHardHp) * 100;
                const endPercent = (restHpEnd / this._maxHardHp) * 100;

                const range = NumberRange.create(startPercent, endPercent);

                // reverse
                const data = BarData.create(hpRowCount, it, this._isMaxHardId, this._maxHardHp);
                if (isFirst) {
                    this._firstHpBarData = data;
                    isFirst = false;
                }
                this._percentRangeToBarDataMap.set(range, data);
                this._hpRowCountToBarData.set(hpRowCount, data);
                hpRowCount++;
            }
            this._maxHardCycleHpRowCount = hpRowCount - 1;
        } else {
            // 百分比模式
            for (let it of configs) {
                const startPercent = it.progressStart.toPercentNumber();
                const endPercent = it.progressEnd.toPercentNumber();
                const range = NumberRange.create(startPercent, endPercent);
                const data = BarData.create(hpRowCount, it, this._isMaxHardId, this._maxHardHp);
                this._percentRangeToBarDataMap.set(range, data);
                this._hpRowCountToBarData.set(hpRowCount, data);
                hpRowCount++;
            }
        }
        this._hpRowCountToBarData.set(hpRowCount, BarData.createZero());

        const maxHpCount = this._percentRangeToBarDataMap.size;
        this._maxHpCount = maxHpCount;
        this._oldHpRowCount = maxHpCount;

        // init hp
        if (this._isMaxHardId) {
            this.view.labelHpRowCount.text = `X${this._endlessHpCount}`;

        } else {
            this.view.labelHpRowCount.text = `X${Math.max(0, maxHpCount - 1)}`;

        }

        // 无尽, 从 0 开始
        if (this._isMaxHardId) {
            this.updateDialog(0);
        }
        // 默认颜色
        this.view.hpBar1.bar.color = BarData.getColorByHpRowCount(hpRowCount);
        this.view.hpBar1.bar.alpha = 1;

        // 战斗开始
        FacadeManager.ins().registerNotification(this);
        GameTimer.ins().frameLoop(30, this, this.updateHpBar);
        GameTimer.ins().frameLoop(6, this, this.updateShadowHpBar);
    }


    private updateHpBar() {
        if (this._fightType == ServerEnums.FightType.DAILY_BOSS && !this._data) {
            // no data
            return;
        }

        // 敌人血条 hp
        const hpChangeVo = this._teamToHpStateMap.get(WorldUnitTeam.Enemy);
        if (!hpChangeVo) {
            // 满血
            this.view.percentBar.value = 0;
            this.view.hpBar1.max = 1;
            this.view.hpBar1.value = 1;
            this.view.hpBar11.max = 1;
            this.view.hpBar11.value = 1;


            this.updateDialog(100);
            return;
        }


        // enemy hp/maxHp
        const cycleMaxHp = this._isMaxHardId ? this._maxHardHp : hpChangeVo.totalHP;
        let curHp = hpChangeVo.curHp % cycleMaxHp;
        let maxHp = hpChangeVo.totalHP % cycleMaxHp;
        if (maxHp <= 0) {
            maxHp = cycleMaxHp;
        }

        let hpPercent01 = 100;
        if (curHp <= 0 || maxHp <= 0) {
            hpPercent01 = 0;
        } else {
            hpPercent01 = curHp / maxHp;
        }

        // 血条 row
        let curHpRowCount = 0;
        const hpPercent100 = hpPercent01 * 100;
        let curHpBarData: BarData | null = this.chooseHpBarDataByPercent100(hpPercent100);

        curHpRowCount = curHpBarData?.hpRowCount;
        if (this._isMaxHardId) {
            // 无尽难度, 循环
            if (!curHpBarData) {
                console.info(`一个周期 hp 打满了. 切换到新的周期. hpRowCount=${this._oldHpRowCount}`);
                curHpBarData = this._firstHpBarData;
            }
        }

        // 下一管血?
        const isNextHp = Math.abs(this._oldHpRowCount - curHpRowCount) >= 1
        // 不能跳血条 + 1 on 1
        const isSkipHp = Math.abs(this._oldHpRowCount - curHpRowCount) > 1;
        if (isSkipHp) {
            if (this._oldCurHpBarValue100 > 0) {
                curHpBarData = this._hpRowCountToBarData.get(this._oldHpRowCount);
                if (curHpBarData == null && this._isMaxHardId) {
                    // 无尽难度
                    curHpBarData = this._hpRowCountToBarData.get(this._maxHardCycleHpRowCount);
                }
            } else {
                if (this._isMaxHardId) {
                    // 无尽难度
                    let nextRowCount = (this._oldHpRowCount - 1) % this._maxHardCycleHpRowCount;
                    if (nextRowCount == 0) {
                        nextRowCount = this._maxHardCycleHpRowCount;
                    }

                    curHpBarData = this._hpRowCountToBarData.get(nextRowCount);

                } else {
                    curHpBarData = this._hpRowCountToBarData.get(this._oldHpRowCount - 1);

                }
            }
        }
        this._oldHpRowCount = curHpBarData.hpRowCount;


        // bar1 - cur hp
        let curHpBarValue100 = 100;
        if (curHpBarData) {
            const data1 = curHpBarData;
            let subPercentValue = data1.getSubPercentValue01(hpPercent01, maxHp);
            if (this._isMaxHardId) {
                // 无尽模式
                if (subPercentValue > 1) {
                    // new hp cycle
                    subPercentValue = 0;
                }
            }
            curHpBarValue100 = subPercentValue * 100;

            this.view.hpBar1.alpha = data1.alpha;
            this.view.hpBar1.bar.color = data1.color;
            this.view.hpBar1.max = 100;
            const curHpPercent = Math.max(0, subPercentValue * 100);
            this.view.hpBar1.value = curHpPercent;

            if (this._isMaxHardId) {
                // 无尽模式
                this._oldCurHpBarValue100 = (curHpPercent + 100) % 100;
            } else {
                this._oldCurHpBarValue100 = curHpPercent;
            }
        }


        // next hp 
        let nextBarData!: BarData;
        if (this._isMaxHardId) {
            // 无尽模式 | 取下一个血条
            let nextHpRowCount = (curHpBarData.hpRowCount - 1) % this._maxHardCycleHpRowCount;
            if (nextHpRowCount == 0) {
                nextHpRowCount = this._maxHardCycleHpRowCount;
            }
            nextBarData = this._hpRowCountToBarData.get(nextHpRowCount);
        } else {
            // 百分比模式
            const nextHpRowCount = Math.max(0, curHpRowCount - 1);
            nextBarData = this._hpRowCountToBarData.get(nextHpRowCount);
        }
        if (nextBarData) {
            const data1 = nextBarData;
            let subPercentValue = data1.getSubPercentValue01(hpPercent01, maxHp);
            if (this._isMaxHardId) {
                // 无尽模式
                subPercentValue = 1;
            }
            this.view.hpBar11.alpha = data1.alpha;
            this.view.hpBar11.bar.color = data1.color;
            this.view.hpBar11.max = 100;
            this.view.hpBar11.value = subPercentValue * 100;
        } else {
            this.view.hpBar11.alpha = 0;
            this.view.hpBar11.bar.color = ColorUtils.COLOR_WHITE;

        }
        // hp count = x18
        if (this._isMaxHardId) {
            if (isNextHp) {
                this._endlessHpCount++;
            }
            // 无尽模式
            this.view.labelHpRowCount.text = `X${this._endlessHpCount}`;
        } else {
            this.view.labelHpRowCount.text = `X${Math.max(0, curHpRowCount - 1)}`;

        }

        // 总进度 [0, 100]
        if (this._isMaxHardId) {
            this.updateDialog(curHpBarValue100);
        } else {
            this.updateDialog(hpPercent100);
        }
    }

    /**
     * 选择进度条数据
     * @param hpPercent100
     * @private
     */
    private chooseHpBarDataByPercent100(hpPercent100: number) {
        for (let [range, data] of this._percentRangeToBarDataMap) {
            const isIn = range.isIn(hpPercent100);
            if (isIn) {
                return data;
            }
        }
        return null;
    }

    private updateDialog(hpPercent: number) {
        let hpPercent100 = hpPercent
        if (this._isMaxHardId) {
            // 无尽模式
            hpPercent100 = hpPercent % 100;
        }

        const nowReachPercent100 = 100 - hpPercent100;
        const hpPercent01 = hpPercent100 / 100 || 0;

        this.view.percentBar.value = nowReachPercent100;
        // this.view.labelPercent.text = `${finishPercent.toInt()}%`;


        const dialogOffsetX = this.view.percentBar.x + this.view.percentBar.width * (1 - hpPercent01);
        // reverse x
        this.view.dialogComp.x = dialogOffsetX - 30;
        this.view.dialogComp.labelTitle.text = `${nowReachPercent100.toInt()}%`;
    }

    private updateShadowHpBar() {
        let end = this._oldShadowHpBarValue100;
        let start = this._oldCurHpBarValue100;

        if (end > start) {
            // 不断减少
            const amplitude = Math.max(1, (end - start)) / 2 + 1;
            if (amplitude < 2) {
                end = start;
            } else {
                end = Math.max(start, end - amplitude);
            }
        } else if (end == 0 && start > 0) {
            // 本层血量为0, 进入下一个血条
            end = 100;
        } else if (start > end) {
            // next row
            end = 100;
        } else if (end == start) {
            // 血量不变
        } else {
            // 打完了
            end = 0;
        }
        this._oldShadowHpBarValue100 = end;

        this.view.hpBar2.value = end;
        // if (this._isHaveResult) {
        //     if (!this._isMaxHardId) {
        //         this.view.labelHpRowCount.text = `X0`;
        //     }
        // }
    }

    @LogBusiness("每日boss血条 - 战斗结束")
    private onBattleEnd(vo: IBattleResultVo) {
        this._isHaveResult = true;
        if (!vo.isWin) {
            return;
        }

        // 每日boss 没有特殊处理
        if (this._fightType == ServerEnums.FightType.DAILY_BOSS) {
            return;
        }

        for (let [teamId, hpChangeVo] of this._teamToHpStateMap) {
            if (teamId == WorldUnitTeam.Enemy) {
                hpChangeVo.curHp = 0;
                this.view.labelHpRowCount.text = `X0`;
            }
        }

    }
}