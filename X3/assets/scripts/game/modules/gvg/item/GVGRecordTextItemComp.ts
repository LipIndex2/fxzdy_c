import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUtils } from "db://assets/scripts/game/modules/gvg/utils/GVGUtils";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";

@bindFguiExtension("ui://gvg/GVGRecordTextItemComp")
export class GVGRecordTextItemComp extends FGUI.GComponent {


    private get view(): ui.gvg.item.GVGRecordTextItemComp {
        return this as any;
    }


    protected onConstruct(): void {
    }

    reset(
        item: Vo.leaguewar.LeagueWarFightReportVo
    ) {
        const context = GVGModel.ins().context;

        const attackPlayerName = item.attackName;
        const attackLeagueName = item.attackLeagueName;
        const defenceLeagueName = item.defenceLeagueName;
        const defencePlayerName = item.defenceName;

        // 变更部分
        const changeStarCount = item.changeStar;
        const changeHp = item.changeHp;

        // 是否自己人进攻 | TODO 有问题
        const isOurTeamAttack = item.attackLeagueId == context.getLeagueId(EnumGVGTeamType.MY);
        const isAttackWin = item.attackWin;
        
        // color
        const green = "#19df51";
        const red = "#ff5555";
        const attackerColor = isOurTeamAttack ? green : red;
        const defenceColor = isOurTeamAttack ? red : green;
        // 变化血量百分比 10%
        const hppText = GVGUtils.calcHpPercentText(changeHp);
        // 是否是星数变化
        const isChangeStarCount = changeStarCount > 1;
        
        
        if (isOurTeamAttack) {
            // 我方进攻
            if (isAttackWin) {
                // win
                this.view.textContent.text = `[color=${attackerColor}][${attackLeagueName}]${attackPlayerName}[/color] 战胜敌方 [color=${defenceColor}][${defenceLeagueName}]${defencePlayerName}[/color], 为联盟贡献 ${changeStarCount} [img]ui://8da0bf52k3sy11u[/img]`;
            } else {
                // fail
                this.view.textContent.text = `[color=${attackerColor}][${attackLeagueName}]${attackPlayerName}[/color] 未能战胜 [color=${defenceColor}][${defenceLeagueName}]${defencePlayerName}[/color], 消耗 ${hppText} 血量值, 为联盟贡献 ${changeStarCount} [img]ui://8da0bf52k3sy11u[/img]`;
            }
        } else {
            // 敌方进攻
            if (isAttackWin) {
                // 我方防御 fail
                this.view.textContent.text = `[color=${defenceColor}][${defenceLeagueName}]${defencePlayerName}[/color], 被敌方战胜，[color=${attackerColor}][${attackLeagueName}]${attackPlayerName}[/color] 获得 ${changeStarCount} 星`;
            } else {
                // 我方防御 win
                this.view.textContent.text = `[color=${defenceColor}][${defenceLeagueName}]${defencePlayerName}[/color] 成功抵御 [color=${attackerColor}][${attackLeagueName}]${attackPlayerName}[/color], 仅被消耗 ${hppText} 血量值, [color=${attackerColor}][${attackLeagueName}]${attackPlayerName}[/color]获得 ${changeStarCount} [img]ui://8da0bf52k3sy11u[/img]`;
            }
        }
    }
}