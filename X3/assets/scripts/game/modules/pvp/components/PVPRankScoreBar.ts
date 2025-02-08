import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { math } from "cc";

/**
 * 排位分进度条
 */
export class PVPRankScoreBar extends fgui.GProgressBar {
    private _config: table.arena.ArenaRankConfig;

    private get view(): ui.pvp.bar.PVPRankScoreBar {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
    }

    /**
     * 设置排位分进度条
     */
    @LogBusiness("[排位分] reset")
    reset(
        minScore: number,
        maxScore: number,
        startScore: number,
        endScore: number,
        onUpdateCallback?: (currentScore: number, maxScore: number) => void,
        onMaxScoreCallback?: Function,
        self?: any,
    ) {
        const curBarValue = startScore - minScore;
        const maxBarValue = maxScore - minScore;
        const diffScore = endScore - minScore;

        this.view.value = curBarValue;
        this.view.max = maxBarValue;
        this.view.labelTitle.text = `${startScore}/${maxScore}`

        // 升段位了
        const isLvUp = endScore >= maxScore;

        const durationSec = 1;
        if (isLvUp) {
            const self = this;
            this.view.tweenValue(maxBarValue, durationSec)
                .onComplete(() => {
                    onMaxScoreCallback && onMaxScoreCallback.call(self);
                })
            ;
        } else {
            this.view.tweenValue(diffScore, durationSec)
                .onComplete(() => {
                    this.view.value = diffScore;
                })
            ;
        }

        GameTimer.ins().clearAll(this);
        let ratioValue = 0;
        GameTimer.ins().loop(0.1, this, () => {
            
            const targetScore = Math.min(maxScore, endScore);
            const currentScore = math.lerp(startScore, targetScore, ratioValue).toInt();
            this.view.labelTitle.text = `${currentScore}/${maxScore}`

            if (onUpdateCallback) {
                onUpdateCallback.bind(self);
                onUpdateCallback(currentScore, maxScore);
            }
            ratioValue += 0.02;
            ratioValue = Math.min(1, ratioValue);
        });

    }

}