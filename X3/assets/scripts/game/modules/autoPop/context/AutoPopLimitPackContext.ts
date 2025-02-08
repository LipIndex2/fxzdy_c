import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { UILimitPackConfig } from "../../limitPack/const/UILimitPackConfig";
import { AutoPopBaseContext } from "./AutoPopBaseContext";

/** 限时礼包自动弹框 */
export class AutoPopLimitPackContext extends AutoPopBaseContext {

    protected _waitShowId: number = -1

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_POPUP,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_POPUP:
                this._waitShowId = args
                this.onAutoPopDataChange();
                break
        }
    }

    protected openPopupWin(defaultId: number = -1): void {
        G.UIManager.open(UILimitPackConfig.LIMITPACK_MAIN_WIN, defaultId)
    }

    public checkPopNext(): boolean {
        let result: boolean = false;
        if (this._waitShowId > 0) {
            if (G.UIManager.isOpened(UILimitPackConfig.LIMITPACK_MAIN_WIN)) {
                return;
            }

            //只打开主界面
            if (G.UIManager.isUiTop(UIMainKey.MAIN_PAGE)) {
                if (GIns.mallModel.popupDataMap.size > 0) {
                    this.openPopupWin(this._waitShowId);
                    result = true;
                }
                this._waitShowId = -1;
            }
        }
        return result;
    }
}
