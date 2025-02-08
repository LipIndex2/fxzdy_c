import { UIView } from "../../../../core/mvc/view/UIView";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { FGUIMaskUtils } from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";
import { TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import { EmailOneRowView } from "db://assets/scripts/game/modules/email/view/components/EmailOneRowView";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { EmailVo } from "db://assets/scripts/game/modules/email/vo/EmailVo";
import { ConstEmailKvConfig } from "db://assets/scripts/game/modules/email/const/ConstEmailKvConfig";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EmailI18nKeys } from "db://assets/scripts/game/modules/email/const/EmailI18nKeys";
import { CommonI18nKeys } from "db://assets/scripts/game/modules/common/i18n/CommonI18nKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { BtnConfirmViewOpenArgs } from "db://assets/scripts/game/modules/common/confirm/BtnConfirmView";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import GIns from "../../../GIns";


const { GObject } = fgui;

/**
 * 邮箱主界面
 */
export class EmailBoxView extends UICommWin {

    // 最大数量
    private _maxCount: number = 0
    // 显示的邮件
    private _emailVoList: EmailVo[] = [];

    static pkgName: string = "email";

    static viewName: string = "EmailBoxView";

    private get view(): ui.email.EmailBoxView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_EMAIL_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_EMAIL_CHANGE: {
                this.refreshView();
                break;
            }
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        const redDotCom = RedDotUtils.castComp(this.view.btnGainAll.redDot);
        redDotCom.reset(RedDotKeys.email_CanGain);

        this.view.btnGainAll.title = "一键领取";
        this.view.btnDeleteRead.title = "删除已读";

        this.view.btnGainAll.onClick(this.onClickGainAll, this);
        this.view.btnDeleteRead.onClick(this.onClickDeleteRead, this);

        this.view.mailList.setVirtual();
        this.view.mailList.itemRenderer = this.irMailRow.bind(this);
        this.view.mailList.isLoadInFrames = true;

    }

    public onOpen(): void {
        G.Logger.debug(" onOpen ")

        // 触摸外部
        // this.view.onClick(this.onFguiClick0, this);

        this._maxCount = G.TableManager.getDataById(table.email.EmailConstantConfig, ConstEmailKvConfig.SYSTEM_EMAIL_MAX_COUNT).content.toInt()

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)

        // email list 
        this.refreshView();
        UiTweenMgr.ins().listShowEffect(this.view.mailList, this.view.fg)

    }


    public onClose(): void {
        this.view.offClick(this.onFguiClick0, this);
        this.view.btnGainAll.offClick(this.onClickGainAll, this);
        this.view.btnDeleteRead.offClick(this.onClickDeleteRead, this);

        G.Logger.debug(" onClose ")
        UiTweenMgr.ins().removeTweenEffect(this.view.mailList, this.view.fg)
    }

    private onFguiClick0(event: fgui.Event) {
        G.Logger.debug(event, " onTouchEnd ")

        // 点击空白处关闭
        if (TouchUtils.isFguiTouchInUi(event, this.view.bg._uiTrans)) {
            return
        }
        this.closeSelf()
    }

    /**
     * 物品类型
     * @private
     */
    private irMailRow(index: number, view: EmailOneRowView) {
        const emailVo = this._emailVoList[index];
        if (!emailVo) {
            G.Logger.error("邮件预览内容显示有问题");
            return
        }
        view.reset(emailVo)
    }


    private updateMailList() {
        this._emailVoList = EmailModel.ins().getMailList()

        this.view.mailList.numItems = this._emailVoList.length
    }


    private onClickDeleteRead() {
        const filterReadMailArray = this._emailVoList.toDataStream()
            .filter((it) => it.isHaveReadOrGain())
            .toArray();
        // 没有可删除的邮件
        if (filterReadMailArray.length <= 0) {
            GIns.floatingTextMgr.showTips(EmailI18nKeys.ONE_KEY_DELETE_FAIL)
            return
        }

        // G.UIManager.openUIByBindingKey(UICommonBindingKeys.BtnConfirmView, (confirmView: BtnConfirmView) => {
        //     confirmView.setBtnNoTitle("取消")
        //     confirmView.setBtnYesTitle("确认")
        //     confirmView.setContent("是否删除所有已读邮件");
        //
        //     // 点击确认
        //     confirmView.onBtnYes(() => {
        //         EmailModel.ins().sendRemoveEmails()
        //     })
        // })

        G.UIManager.open(UICommonKey.BtnConfirmView, {
            title: null,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            content: EmailI18nKeys.ONE_KEY_DELETE_ALL_READ,
            onBtnYes: () => {
                EmailModel.ins().sendRemoveEmails()
            }
        } as BtnConfirmViewOpenArgs)


    }

    private onClickGainAll() {
        const canGainEmailList = this._emailVoList.toDataStream()
            .filter((it) => it.isCanReadOrGain())
            .toArray();
        if (canGainEmailList.length <= 0) {
            GIns.floatingTextMgr.showTips(EmailI18nKeys.ONE_KEY_GAIN_FAIL)
            return
        }
        EmailModel.ins().sendDrawEmailRewards()

    }

    refreshView() {
        this.updateMailList();

        // haveCount
        this.view.labelEmailCount
            .setVar("haveCount", this._emailVoList.length.toString())
            .setVar("maxCount", this._maxCount.toString())
        if (this._emailVoList.length >= this._maxCount) {
            this.view.labelEmailCount.setVar("colorHex", "#FF7171")
        } else {
            this.view.labelEmailCount.setVar("colorHex", "#62EE79")
        }
        this.view.labelEmailCount.flushVars()


        // this.view.mailList.refreshVirtualList()
    }
}