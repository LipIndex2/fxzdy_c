import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { LocalStorageUtils } from "../../../core/utils/LocalStorageUtils";
import { IBtnConfirmViewOnceTodayOpenArgs } from "./confirm/IBtnConfirmViewOnceTodayOpenArgs";
import { UICommonKey } from "./const/UICommonConfig";

export class UICommonMgr extends BaseSingleton {

    /**打开今日只显示一次的提示*/
    public openConfirmViewTodayOnce(args:IBtnConfirmViewOnceTodayOpenArgs):void {
        if (args.localKey) {
            let localKey:Number = LocalStorageUtils.get(args.localKey, Number);
            let localTime:number = 0;
            if (localKey) {
                localTime = localKey.toInt();
            }
            if (localTime > 0) {
                let todayZero:number = G.TimeManager.todayZero;
                if (localTime == todayZero) {
                    //代表还没过记录时间 不弹提示 直接确认
                    if (args.onClickConfirm) {
                        args.onClickConfirm();
                        return
                    }
                }
            }
        }
        G.UIManager.open(UICommonKey.BtnConfirmOnceTodayWin, args);
    }
}