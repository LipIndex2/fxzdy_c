import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";


@bindFguiExtension("ui://leagueBargain/LeagueBargainRowItemComp")
export class LeagueBargainRowItemComp extends FGUI.GComponent {

    get v(): ui.leagueBargain.item.LeagueBargainRowItemComp {
        return this as any;
    }


    reset(index: number,
          data: Vo.league.LeagueBargainMemberVo
    ) {

        this.v.textName.text = `${data.name}`;
        const offlineTimeMs = data.offlineTime;
        if (offlineTimeMs <= 0) {
            this.v.textTime.text = `在线`;
            return;
        }
        const curTimeMs = TimeManager.serverNow;

        const diffTimeMs = Math.max(0, curTimeMs - offlineTimeMs);
        const s = TimeUtils.formatDiffTimeMsToFriendOfflineTimeText(diffTimeMs);
        this.v.textTime.text = `${s}`;
    }
}