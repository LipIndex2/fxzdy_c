import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 联盟对决
 */
export class GVGUtils {

    /**
     * 计算血条数
     * @param hp
     */
    static calcHpCount(hp: number): number {
        if (hp <= 0) {
            return 0;
        }
        return Math.floor((hp - 1) / 10000) + 1;
    }

    /**
     * 计算血量百分比
     * @param hp
     */
    static calcHpPercent(hp: number): number {
        if (hp <= 0) {
            return 0;
        }
        const thp = hp % 10000;
        if (thp == 0) {
            return 10000;
        }
        return thp;
    }

    /**获取各个阶段倒计时展示
     * @param style 倒计时样式 1 XX天XX时XX分xx秒 2 00:00:00 
    */
    static getAllStatusTimeText(labelTips: FGUI.GRichTextField | FGUI.GTextField, style: number = 1): void {
        if (NodeUtils.isNotValidNode(labelTips?.node)) {
            return;
        }
        // no 
        if (!labelTips.node.active) {
            return;
        }
        // 满足报名条件
        const context = GVGModel.ins().context;
        const restTimeMs: number = context.getRestTimeMs();
        let timeStr: string = '';
        if (style == 1) {
            timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecondText(restTimeMs);
        } else {
            timeStr = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        }
        let timePrefix: string = '';
        switch (context.getStage()) {
            case ServerEnums.LeagueWarStatus.SIGN_UP:
                timePrefix = '报名中:';
                break;
            case ServerEnums.LeagueWarStatus.SET_FORMATION:
                timePrefix = '准备中:';
                break;
            case ServerEnums.LeagueWarStatus.BATTLE:
                timePrefix = '对战中:';
                break;
            case ServerEnums.LeagueWarStatus.SETTLE:
                timePrefix = '结算中:';
                break;
            case ServerEnums.LeagueWarStatus.END:
                timePrefix = '开启倒计时:';
                break;
        }
        if (labelTips instanceof FGUI.GRichTextField) {
            labelTips.text = `${timePrefix}[color=#00ff00]${timeStr}[/color]`;
        } else {
            labelTips.text = `${timePrefix}${timeStr}`;
        }
    }

    /**
     * 设置阶段剩余时间
     * @param labelTips
     */
    static setStageRestTimeText(labelTips: FGUI.GRichTextField | FGUI.GTextField) {
        if (NodeUtils.isNotValidNode(labelTips?.node)) {
            return;
        }
        // no 
        if (!labelTips.node.active) {
            return;
        }

        const context = GVGModel.ins().context;

        const isJoin = context.isJoin();
        if (!isJoin) {
            // 不满足报名条件 = 不显示文字和倒计时, 点击弹出报名详情
            labelTips.text = "";
            return;
        }

        // 满足报名条件
        const restTimeMs = context.getRestTimeMs();
        const timeStr = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);

        // 阶段
        const stage = context.getStage();
        if (stage == ServerEnums.LeagueWarStatus.SET_FORMATION) {
            // 布阵阶段
            if (labelTips instanceof FGUI.GRichTextField) {
                labelTips.text = `准备中: [color=#00ff00]${timeStr}[/color]`;
            } else {
                labelTips.text = `准备中: ${timeStr}`;
            }

        } else if (stage == ServerEnums.LeagueWarStatus.BATTLE) {
            // 对战阶段
            if (labelTips instanceof FGUI.GRichTextField) {
                labelTips.text = `对战中: [color=#00ff00]${timeStr}[/color]`;
            } else {
                labelTips.text = `对战中: ${timeStr}`;
            }
        } else {
            labelTips.text = "";
        }
    }

    /**
     * 计算血量百分比
     * @param changeHp
     */
    static calcHpPercentText(changeHp: number) {
        const hpPercent = this.calcHpPercent(changeHp);
        if (hpPercent <= 0) {
            return "0%"
        }
        return Math.floor((hpPercent / 100)) + "%";
    }


}