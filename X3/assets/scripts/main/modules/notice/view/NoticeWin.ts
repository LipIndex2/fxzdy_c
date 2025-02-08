import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NativeAPI } from "../../../../core/native/NativeAPI";
import { TimeManager } from "../../../../core/time/TimeManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import LoginModel from "../../login/model/LoginModel";
import { INoticeVo } from "../../login/vo/ILoginVo";
import { UINoticeKey, UINoticePriorityType } from "../const/UINoticeConfig";
import * as fgui from "fairygui-cc";

/**
 * 公告界面
 */
@bindScript(UINoticeKey.NoticeWin)
export class NoticeWin extends UICommWin {
    static pkgName: string = "loginNotice";
    static viewName: string = "NoticeWin";


    /**最近不可关公告的到期时间 */
    private _canCloseTime = 0;
    private _hasLockNotice = false;

    private _notices: INoticeVo[];

    private get view(): ui.loginNotice.NoticeWin {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();
        this.view.titleList.setVirtual();
        this.view.titleList.itemRenderer = this.onTitleRender.bind(this);
        this.view.titleList.on(fgui.Event.CLICK_ITEM, this.onSelectNotice, this);
        this.view.noticeCom.noticeTxt.on(fgui.Event.LINK, this.onClickUrlLink, this);
    }

    protected onOpen(args?: any) {
        this.updateView();
        if (this._notices.length > 0 && this.view.titleList.selectedIndex < 0) {
            this.view.titleList.selectedIndex = 0;
            this.onSelectNotice();
        }
    }

    protected onClose() {
        G.GameTimer.clearAll(this);
    }

    private updateView() {
        let curTime = TimeManager.serverNow;
        let notices = LoginModel.ins().vo.notices || [];

        notices = notices.filter((a) => {
            return a.start <= curTime && a.end > curTime;
        });

        notices.sort((a, b) => {
            if (a.priority != b.priority) {
                return a.priority - b.priority;
            }
            return b.start - a.start;
        });

        this._notices = notices;

        // let isLock = this.checkLockNotive(notices);
        // this.view.btn_close.visible = !isLock;

        // if (this._hasLockNotice && !isLock) {
        // this.closeSelf();
        // return;
        // }

        this.view.titleList.numItems = notices.length;
    }

    /**是否不可关公告 */
    private isLockNotice(notice: INoticeVo) {
        return notice.priority === UINoticePriorityType.LOCKPRIORITY;
    }

    /**
     * 是否有不可关公告
     * @param notices
     * @returns 是否不可关闭
     */
    // private checkLockNotive(notices: INoticeVo[]) {
    //     let curTime = TimeManager.serverNow;
    //     this._canCloseTime = 0;
    //     for (let i = 0; i < notices.length; i++) {
    //         const notice = notices[i];
    //         if (this.isLockNotice(notice) && notice.end > curTime) {
    //             if (!this._canCloseTime || notice.end < this._canCloseTime) {
    //                 //不可关的公告,刷新公告 (拿最近的时间)
    //                 this._canCloseTime = notice.end;
    //             }
    //         }
    //     }

    //     if (this._canCloseTime > curTime) {
    //         G.GameTimer.loop(1000, this, this.checkTime);
    //         this._hasLockNotice = true;
    //         return true;
    //     }
    //     return false;
    // }

    private checkTime() {
        if (TimeManager.serverNow >= this._canCloseTime) {
            G.GameTimer.clear(this, this.checkTime);
            this.updateView();
        }
    }

    private onTitleRender(index: number, item: ui.loginNotice.item.TitleItem) {
        item.titleName.text = this._notices[index].name;
    }

    private onSelectNotice() {
        let index = this.view.titleList.selectedIndex;
        let notice = this._notices[index];
        if (notice) {
            this.view.noticeCom.noticeTxt.text = notice.content;
        }
    }

    /**打开链接 */
    private onClickUrlLink(url: string, obj: any) {
        NativeAPI.openUrl(url);
    }
}
