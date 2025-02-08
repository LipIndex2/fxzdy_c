import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";


@bindFguiExtension("ui://leagueBargain/LeagueBargainBuyItemComp")
export class LeagueBargainBuyItemComp extends FGUI.GComponent {

    get v(): ui.leagueBargain.item.LeagueBargainBuyItemComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


    }

    reset(index: number,
          data: Vo.league.LeagueBargainMemberVo,
          config: table.league.LeagueBargainGiftConfig
    ) {

        const maxP = config.initPrice;

        this.v.labelName.text = `${index + 1}.${data.name} `;
        const bargainDiscount = data.bargainDiscount;

        let minusPrice = 0;
        if (bargainDiscount > 0) {
            minusPrice = bargainDiscount / 10000 * maxP;
        }
        this.v.labelCount.text = `${Math.floor(minusPrice)}`;
        

        const isBuy = data.buy;
        this.v.getController("isBuy").selectedIndex = isBuy ? 1 : 0;
        this.v.getController("is1").selectedIndex = index % 2 == 0 ? 1 : 0;

    }
}