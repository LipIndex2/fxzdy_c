import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { IllustrationsI18nKeys } from "../const/IllustrationsI18nKeys";
import { IllustrationsScoreState } from "../model/IllustrationsModel";
import { Color } from "cc";
import { math } from "cc";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";

/** 积分按钮 */
export class IllustrationsScoreBtn extends fgui.GButton {
    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsScoreBtn";

    public state: IllustrationsScoreState = IllustrationsScoreState.NotDraw
    protected _grayColor = math.color(200, 200, 200)

    private get view(): ui.illustrations.btn.IllustrationsScoreBtn {
        return this as any;
    }

    protected onInit() {
        this.view.lbFull.text = G.I18nManager.lang(IllustrationsI18nKeys.isFullStar)
    }

    public updateByScoreAndState(score: number, state: IllustrationsScoreState): void {
        this.state = state
        if (state == IllustrationsScoreState.DrewAll) {
            //已领取完成
            this.grayed = true
            this.view.bg.color = this._grayColor
            this.enabled = false
            this.view.lbFull.visible = true
            this.view.pScore.visible = false
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.HIGH, false)
            return
        }
        this.enabled = true
        this.view.lbFull.visible = false
        this.view.pScore.visible = true
        this.view.lbScore.text = '+' + score
        if (state == IllustrationsScoreState.CanDraw) {
            //可领取
            this.view.grayed = false
            this.view.bg.color = Color.WHITE
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.HIGH, true)
        } else {
            //不可领取
            this.view.grayed = true
            this.view.bg.color = this._grayColor
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).resetListCell(EnumRedDotShowType.HIGH, false)
        }
    }
}