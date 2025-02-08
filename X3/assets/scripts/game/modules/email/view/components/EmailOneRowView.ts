import { EmailVo } from "db://assets/scripts/game/modules/email/vo/EmailVo";
import { EventTouch } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { EmailContentViewOpenArgs } from "db://assets/scripts/game/modules/email/view/EmailContentView";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { DiffTime } from "../../../../comm/utils/DiffTime";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { UIEmailKeys } from "db://assets/scripts/game/modules/email/const/UIEmailKeys";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { EnumEmailState } from "db://assets/scripts/game/modules/email/enums/EnumEmailState";
import { Color } from "cc";

enum EnumWithRewardState {
    NO_REWARD = 0,
    HAVE_REWARD = 1,
}

enum EnumReadState {
    Unread = 0,
    HaveRead = 1,
    ReadAndReward = 2,
    Deleted = 3,
}

/**
 * 邮件内容一行
 */
export class EmailOneRowView extends FGUI.GComponent implements INotification {

    // 邮件ID
    private _emailVo: EmailVo = null;
    // 奖励物品列表
    private _rewardArray: NoOwnerItem[] = [];


    private get view(): ui.email.EmailOneRowView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            // RedDotKeys.email_row.toEventName(),
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            // case RedDotKeys.email_row.toEventName():
            //     this.refreshRedDot();
            //     break;
        }
    }

    onConstruct() {
        this.onInit();

        FacadeManager.ins().registerNotification(this);
    }


    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    public onInit() {

        this.view.on(FGUI.Event.CLICK, this.onTouch0, this)
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.listRendererForMail.bind(this);
    }

    private listRendererForMail(index: number, itemView: ItemFrameBtn): void {
        const noOwnerItem = this._rewardArray[index];
        if (!noOwnerItem) {
            return
        }

        itemView.resetByNoOwnerItem(noOwnerItem)
    }

    private onTouch0(event: EventTouch) {

        // 打开 UI + 已读
        G.UIManager.open(UIEmailKeys.UI_EMAIL_CONTENT_KEY, {
            emailId: this._emailVo.emailId,
        } as EmailContentViewOpenArgs)


        this.markRead()

        // refresh 
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE)
    }

    // 更新渲染
    reset(emailVo: EmailVo) {
        this._emailVo = emailVo;

        const readFlag = emailVo.readFlag;
        const gainFlag = emailVo.gainFlag

        const readStateController = this.view.getController("readState")
        const withRewardStateController = this.view.getController("withRewardState")
        // 是否有已读
        if (readFlag) {
            readStateController.selectedIndex = EnumReadState.HaveRead
            this.view.labelReadState.text = "已读"
            this.view.labelReadState.color = new Color("#62EE79")
        } else {
            readStateController.selectedIndex = EnumReadState.Unread
            this.view.labelReadState.text = "未读"
            this.view.labelReadState.color = new Color("#FF7171")
        }
        // 是否有奖励
        if (emailVo.isWithReward()) {
            withRewardStateController.selectedIndex = EnumWithRewardState.HAVE_REWARD
        } else {
            withRewardStateController.selectedIndex = EnumWithRewardState.NO_REWARD
            if (readFlag) {
                readStateController.selectedIndex = EnumReadState.ReadAndReward
            }
        }

        if (emailVo.gainFlag) {
            readStateController.selectedIndex = EnumReadState.ReadAndReward
            this.view.itemList._uiOpacity.opacity = 128
        } else {
            this.view.itemList._uiOpacity.opacity = 255
        }


        // txt
        this.view.labelSender
            .setVar("senderName", emailVo.senderName)
            .flushVars();
        const sendDateTimeText = DiffTime.createByAtTimeMs(emailVo.sendAtTimeMs).toMailSendTimeDescText()
        this.view.labelSendTime
            .setVar("sendTimeText", sendDateTimeText)
            .flushVars();

        this.view.labelTitle.text = emailVo.title;

        // 过期时间


        // TODO 多久之前发送 
        // this.view.labelTime.text = emailVo.emailTitle;


        // 渲染奖励
        this.updateRewardItemList(emailVo.rewardArray);

        this.refreshRedDot();
    }

    refreshRedDot() {
        const emailVo: EmailVo = this._emailVo;
        if (!emailVo) {
            return;
        }
        const emailId = emailVo.emailId;
        const emailState = emailVo.getEmailState();

        const isHaveReward = emailVo.isWithReward();

        const redDotCom = RedDotUtils.castComp(this.view.redDot);

        const isHaveRedDot = RedDotManager.ins().isHaveRedDot(RedDotKeys.email_row, [emailId]);
        if (!isHaveRedDot) {
            redDotCom.showByType(EnumRedDotShowType.NULL);
            return;
        }
        if (emailState == EnumEmailState.UNREAD) {
            if (isHaveReward) {
                redDotCom.showByType(EnumRedDotShowType.REWARD);

            } else {
                redDotCom.showByType(EnumRedDotShowType.NORMAL);

            }
        } else if (emailState == EnumEmailState.READ_NO_GAIN) {
            redDotCom.showByType(EnumRedDotShowType.REWARD);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }
    }

    private updateRewardItemList(rewardArray: Array<NoOwnerItem>) {
        this._rewardArray = rewardArray;

        this.view.itemList.numItems = this._rewardArray.length;

    }

    private markRead() {
        // 标记已读
        EmailModel.ins().markRead(this._emailVo.emailId)

    }

}