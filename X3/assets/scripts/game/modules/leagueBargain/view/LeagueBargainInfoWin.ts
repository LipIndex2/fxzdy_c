import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { LeagueBargainUIKeys } from "db://assets/scripts/game/modules/leagueBargain/LeagueBargainUIKeys";
import { LeagueBargainRowItemComp } from "db://assets/scripts/game/modules/leagueBargain/item/LeagueBargainRowItemComp";
import { LeagueModel } from "db://assets/scripts/game/modules/league/LeagueModel";

@bindScript(LeagueBargainUIKeys.LeagueBargainInfoWin)
export class LeagueBargainInfoWin extends UICommWin {

    static pkgName = "leagueBargain"
    static viewName = "LeagueBargainInfoWin"

    private _datas: Vo.league.LeagueBargainMemberVo[] = []

    get view(): ui.leagueBargain.LeagueBargainInfoWin {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();

        this.view.rowList.setVirtual()
        this.view.rowList.itemRenderer = this.irItem.bind(this);

    }


    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);


        const bargainContext = LeagueModel.ins().bargainContext;

        this._datas = bargainContext.getNoBargainMemberArray()
        this.view.rowList.numItems = this._datas.length;
    }

    irItem(index: number, comp: LeagueBargainRowItemComp) {

        comp.reset(index, this._datas[index]);
    }
}