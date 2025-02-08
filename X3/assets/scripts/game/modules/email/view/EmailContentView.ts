import G from "db://assets/scripts/core/comm/G";
import { sys, Vec3 } from "cc";
import * as fgui from "fairygui-cc";
import { TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { EmailVo } from "db://assets/scripts/game/modules/email/vo/EmailVo";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { DiffTime } from "../../../comm/utils/DiffTime";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EmailI18nKeys } from "db://assets/scripts/game/modules/email/const/EmailI18nKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NativeAPI } from "db://assets/scripts/core/native/NativeAPI";
import GIns from "../../../GIns";


const { GObject } = fgui;

/**
 * 奖励领取状态
 */
enum EnumRewardGainState {
    // 未领取
    NO_GAIN = 0,
    // 已领取
    HAVE_GAIN = 1,
}

/**
 * 是否有奖励
 */
enum EnumWithRewardState {
    // 没有奖励
    NO_REWARD = 0,
    // 所有奖励
    HAVE_REWARD = 1,
}

export interface EmailContentViewOpenArgs {
    emailId: number;
}

/**
 * 邮箱内容
 */
export class EmailContentView extends UICommWin {

    private _defaultHeight: number;
    // 多少行
    private _lineSize: number = 0;
    // 邮箱id
    private _emailId: number = 0;
    // 这封邮件
    private _emailVo: EmailVo = null;
    // 奖励物品
    private _rewardArray: Array<NoOwnerItem>;

    static pkgName: string = "email";

    static viewName: string = "EmailContentView";

    private get view(): ui.email.EmailContentView {
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
                this.updateData(this._emailId)
                break;
            }
        }

    }

    public onInit(): void {
        G.Logger.debug(" onInit ")


        // this.view.btnGain.title = "领取"
        // this.view.btnDelete.title = "删除"

        // 触摸外部
        // this.view.onClick(this.onFguiClick0, this);
        this.view.btnGain.on(fgui.Event.CLICK, this.onClickGain, this);
        this.view.btnDelete.on(fgui.Event.CLICK, this.onClickDelete, this);

        this.view.emailContentPart.emailContent.on(fgui.Event.LINK, this.onClickUrlLink, this);

        this._defaultHeight = this.view.emailContentPart.emailContent.height
    }

    public onOpen(args: EmailContentViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)

        // email list 
        this.view.rewardUI.itemList.setVirtual();
        this.view.rewardUI.itemList.itemRenderer = this.listRendererForMail.bind(this);

        this.updateData(args.emailId)
    }


    updateData(emailId: number) {
        this._emailId = emailId
        const mailById1 = EmailModel.ins().getMailById(emailId);
        if (!mailById1) {
            G.Logger.error("邮件没搜索到");
            return
        }
        this._emailVo = mailById1

        if (!mailById1.isWithReward()) {
            const oldHeight = this.view.emailContentPart.height;
            this.view.emailContentPart.height = oldHeight * 1.2;
        }

        this.view.emailContentPart.scrollPane.posX = 500;

        // 读取 + 领取状态
        const readFlag = this._emailVo.readFlag;
        const haveRewardFlag = this._emailVo.isWithReward();
        const gainFlag = this._emailVo.gainFlag;

        this.view.labelTitle.text = this._emailVo.title;
        this.view.emailContentPart.emailContentTitle.text = "亲爱的探险家: ";

        // 内容
        const content = this._emailVo.content;
        if (content) {
            this._lineSize = content.split("\n").length;
        }
        this.view.emailContentPart.emailContent.text = content;
        this.view.emailContentPart.emailContent.flushVars()

        // 显示发送时间
        this.view.labelSendTime.text = DiffTime.createByAtTimeMs(this._emailVo.sendAtTimeMs).toMailSendTimeDescText();

        // 显示发送者和过期时间
        const expireTimeText = DiffTime.createByAtTimeMs(this._emailVo.expireTimeAtTimeMs).toMailExpireTimeDescText();
        this.view.emailContentPart.labelSenderAndTime
            .setVar("senderName", this._emailVo.senderName)
            .setVar("expireTimeText", expireTimeText)
            .flushVars()


        if (haveRewardFlag) {
            this.view.getController("withRewardState").selectedIndex = EnumWithRewardState.HAVE_REWARD;
            this.view.btnGain.enabled = true;
        } else {
            this.view.getController("withRewardState").selectedIndex = EnumWithRewardState.NO_REWARD;
            this.view.btnGain.enabled = false;
        }

        if (gainFlag) {
            this.view.getController("rewardGainState").selectedIndex = EnumRewardGainState.HAVE_GAIN;
            this.view.btnGain.visible = false;
        } else {
            // 可能没有奖励
            if (this._emailVo.isWithReward()) {
                this.view.getController("rewardGainState").selectedIndex = EnumRewardGainState.NO_GAIN;
            } else {
                this.view.getController("rewardGainState").selectedIndex = EnumRewardGainState.HAVE_GAIN;
                this.view.btnGain.visible = false;
            }
            this.view.btnGain.enabled = true;
        }

        this.view.btnDelete.visible = !this.view.btnGain.visible;


        // 内容定位
        this.view.emailContentPart.emailContent.height = this._defaultHeight + (this.view.emailContentPart.emailContent.fontSize + this.view.emailContentPart.emailContent.leading) * this._lineSize;

        // 署名
        const position = this.view.emailContentPart.labelSenderAndTime.node.position;
        const relativeY = this.view.emailContentPart.emailContent.node.position.y;
        const height = this.view.emailContentPart.emailContent._uiTrans.height;
        this.view.emailContentPart.labelSenderAndTime.node.position = new Vec3(position.x, (relativeY - height - 30), position.z)

        // 奖励列表
        this.updateMailRewardList();
    }

    public onClose(): void {

        this.view.offClick(this.onFguiClick0, this);
        G.Logger.debug(" onClose ")

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
    private listRendererForMail(index: number, view: ItemFrameBtn) {
        const noOwnerItem = this._rewardArray[index];
        if (!noOwnerItem) {
            G.Logger.error("邮件预览内容显示有问题");
            return
        }
        view.resetByNoOwnerItem(noOwnerItem)
    }


    // 刷新奖励列表
    private updateMailRewardList() {
        this._emailVo = EmailModel.ins().getMailById(this._emailId)
        if (!this._emailVo) {
            G.Logger.error("[邮件] 邮件没搜索到");
            return
        }

        this._rewardArray = this._emailVo.rewardArray;
        this.view.rewardUI.itemList.numItems = this._rewardArray.length
    }


    private onClickGain() {
        if (this._emailVo.expireTimeAtTimeMs < G.TimeManager.serverNow) {
            GIns.floatingTextMgr.showTips(EmailI18nKeys.GAIN_EMAIL_BUT_EXPIRE_EMAIL)
            G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE)
            this.closeSelf()
            return
        }
        G.Logger.debug("【邮件内容-领取】 点击领取全部奖励 ")

        // const isOk = ItemModel.ins().isCanAddItems(this._emailVo.rewardArray)
        // if (!isOk) {
        //     G.Logger.error("背包已满，无法领取奖励")
        //     GIns.floatingTextMgr.showTips(EmailI18nKeys.GAIN_EMAIL_BAG_FULL)
        //     return
        // }

        // net
        EmailModel.ins().sendDrawSystemEmail({
            emailId: this._emailId
        })

        this.updateData(this._emailId)

        // refresh 
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE)
    }

    private onClickDelete() {

        // net 删除
        EmailModel.ins().sendRemoveSystemEmail({
            emailId: this._emailId
        })

        // refresh 
        GIns.floatingTextMgr.showTips(EmailI18nKeys.DELETE_EMAIL_SUCCESS)
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE)

        // event
        this.closeSelf()
    }


    private onClickUrlLink(url: string, obj: any) {
        G.Logger.debug("点击邮件中的链接", url)

        const platform = sys.platform;

        if (platform == sys.Platform.ANDROID
            || platform == sys.Platform.IOS
        ) {
            // 原生浏览器打开
            NativeAPI.openUrl(url);
            return;
        } else {
            window.open(url);
        }
    }

}