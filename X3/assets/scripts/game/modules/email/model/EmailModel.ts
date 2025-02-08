import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import G from "db://assets/scripts/core/comm/G";
import { EmailVo } from "db://assets/scripts/game/modules/email/vo/EmailVo";
import { EmailContext } from "db://assets/scripts/game/modules/email/context/EmailContext";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { EmailI18nKeys } from "db://assets/scripts/game/modules/email/const/EmailI18nKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import GIns from "../../../GIns";

/**
 * Email 模块号及指令定义
 * @author GameCreator
 */
export class EmailModel extends BaseModel {
    // 邮件数据
    private _emailContext: EmailContext;

    // region 协议部分
    /**
     * 模块标识
     */
    private MODULE = 16;

    constructor() {
        super();
        this.regist();
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any) {
        switch (event) {
        }
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        GameTimer.ins().loop;
        // 定时清理过期邮件
        GameTimer.ins().loop(
            10 * 1000,
            this,
            () => {
                this._emailContext.clearExpireEmails();
            },
            null,
            true,
            false
        );

        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recReadSystemEmail);
        this.registerMsg(moduleId, 2, this.recDrawSystemEmail);
        this.registerMsg(moduleId, 3, this.recRemoveSystemEmail);
        this.registerMsg(moduleId, 4, this.recDrawEmailRewards);
        this.registerMsg(moduleId, 5, this.recRemoveEmails);
        this.registerMsg(moduleId, 6, this.recReadSystemEmails);
        this.registerMsg(moduleId, -1, this.pushSendSystemEmails);
        this.registerMsg(moduleId, -2, this.pushRemoveEmails);
    }

    /*********************************协议发送*********************************/

    /**
     * 读取邮件
     * 模块号：16	指令号：1
     */
    public sendReadSystemEmail(c2s: Vo.email.ReadSystemEmailC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 读取+领取, 邮件奖励
     * 模块号：16	指令号：2
     */
    public sendDrawSystemEmail(c2s: Vo.email.DrawSystemEmailC2S): void {
        G.Logger.net(c2s, "邮件模块：领取邮件附件奖励, request!");

        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 删除邮件
     * 模块号：16	指令号：3
     */
    public sendRemoveSystemEmail(c2s: Vo.email.RemoveSystemEmailC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 一键领取所有邮件
     * 模块号：16	指令号：4
     */
    public sendDrawEmailRewards(): void {
        this.send(this.MODULE, 4);
    }

    /**
     * 一键移除已读或者已领取奖励的系统邮件
     * 模块号：16	指令号：5
     */
    public sendRemoveEmails(): void {
        this.send(this.MODULE, 5);
    }

    /**
     * 一键阅读系统邮件
     * 模块号：16	指令号：6
     */
    public sendReadSystemEmails(): void {
        this.send(this.MODULE, 6);
    }

    /*********************************协议监听*********************************/

    /**
     * 读取
     * 模块号：16	指令号：1
     */
    public recReadSystemEmail(data: Vo.email.ReadSystemEmailS2C, c2s: Vo.email.ReadSystemEmailC2S): void {
        if (data.code < 0) {
            G.Logger.printError(data, "邮件模块：阅读无附件系统邮件失败，原因：");
            return;
        }

        this._emailContext.markRead(c2s.emailId);

        G.Logger.net(data, "读取邮件 ok");
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /**
     * 领取奖励
     * 模块号：16	指令号：2
     */
    public recDrawSystemEmail(data: Vo.email.DrawSystemEmailS2C, c2s: Vo.email.DrawSystemEmailC2S): void {
        if (data.code < 0) {
            G.Logger.net(data, `领取失败. code=${data.code}`);
            // GIns.floatingTextMgr.showTips(G.I18nManager.translate(EmailI18nKeys.GAIN_EMAIL_REWARD_FAILED))
            return;
        }

        this.markReadAndGain(c2s.emailId);

        G.Logger.net(data, "邮件模块：领取邮件奖励 ok");
        const rewards = data.content;

        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, rewards as Array<Vo.reward.RewardResult>);
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /**
     * 删除系统邮件
     * 模块号：16	指令号：3
     */
    public recRemoveSystemEmail(data: Vo.email.RemoveSystemEmailS2C, c2s: Vo.email.RemoveSystemEmailC2S): void {
        const emailId = c2s.emailId;
        const mailById = EmailModel.ins().getMailById(emailId);
        if (data.code < 0) {
            G.Logger.net(data, "邮件模块：删除邮件失败.");
            const isExpire = mailById?.isExpire();
            if (isExpire) {
                G.Logger.error(`清理过期邮件失败, 但清空成功. code=${data.code}`, data);
            } else {
                GIns.floatingTextMgr.showTips(EmailI18nKeys.DELETE_EMAIL_FAILED);
                return;
            }
        }

        this._emailContext.removeMailById(emailId);
        G.Logger.net(data, "邮件模块：删除邮件 ok");

        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
        AudioManager.ins().playSound(SoundType.delete);
    }

    /**
     * 一键领取
     * 模块号：16	指令号：4
     */
    public recDrawEmailRewards(data: Vo.email.DrawEmailRewardsS2C): void {
        if (data.code < 0) {
            G.Logger.net(data, "邮件模块：领取邮件奖励失败,");
            GIns.floatingTextMgr.showTips(EmailI18nKeys.ONE_KEY_GAIN_FAIL);
            return;
        }

        const result = data.content;
        const doneEmailIds = result.drawIds;
        if (doneEmailIds) {
            doneEmailIds.forEach((it) => {
                this.markReadAndGain(it);
            });
        }
        const readEmails = result.readIds;
        if (readEmails) {
            readEmails.forEach((it) => {
                this.markRead(it);
            });
        }

        // const isAllReadAndGain = this._emailContext.isAllReadAndGain();
        // if (isAllReadAndGain) {
        //     G.Logger.net(data, "邮件模块：领取邮件奖励 ok");
        // } else {
        //     G.Logger.net(data, "邮件模块：领取邮件奖励 ok. 但还有部分邮件奖励超出背包上限未领取");
        //     GIns.floatingTextMgr.showTips(EmailI18nKeys.ONE_KEY_GAIN_SUCCESS_BUT_OVERFLOW);
        // }

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, result.rewardResults);
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /**
     * 一键移除已读或者已领取奖励的系统邮件
     * 模块号：16	指令号：5
     */
    public recRemoveEmails(data: Vo.email.RemoveEmailsS2C): void {
        if (data.code < 0) {
            G.Logger.error(`【邮件模块】 邮件一键移除失败`, data);
            return;
        }

        G.Logger.model("【邮件模块】 一键移除已读或者已领取奖励的系统邮件 ok");

        data.content.forEach((emailId) => {
            this._emailContext.removeMailById(emailId);
        });

        GIns.floatingTextMgr.showTips(EmailI18nKeys.DELETE_EMAIL_SUCCESS);
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
        AudioManager.ins().playSound(SoundType.delete);
    }

    /**
     * 一键阅读系统邮件
     * 模块号：16	指令号：6
     */
    public recReadSystemEmails(data: Vo.email.ReadSystemEmailsS2C): void {
        if (data.code < 0) {
            G.Logger.error("一键阅读邮件失败", data);
            return;
        }

        data.content.forEach((emailId) => {
            this._emailContext.markRead(emailId);
        });

        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /*********************************协议推送*********************************/

    /**
     * 批量发送系统邮件
     * 模块号：16	指令号：-1
     */
    public pushSendSystemEmails(vo: Vo.email.SystemEmailVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        G.Logger.net(vo, "邮件模块：收到server推送 ok");

        this._emailContext.addEmailByServerPush(vo);

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /**
     * 推送移除邮件
     * 模块号：16	指令号：-2
     */
    public pushRemoveEmails(emailIds: number[]): void {
        if (!emailIds) {
            return;
        }
        for (let emailId of emailIds) {
            this._emailContext.removeMailById(emailId);
        }

        G.Logger.net(emailIds, `【邮件模块】 server push 删除邮件 ok`);

        // event
        G.FacadeManager.emit(NotificationKey.EVENT_EMAIL_CHANGE);
    }

    /*********************************私有方法**********/

    // endregion

    initData(vo: Vo.email.EmailInfoVo) {
        const emailBox = new EmailContext();
        emailBox.initData(vo);

        this._emailContext = emailBox;
    }

    getMailList(): EmailVo[] {
        return this._emailContext.mailArray;
    }

    getMailById(_emailId: number) {
        return this._emailContext.getMailById(_emailId);
    }

    // 标记已读
    markRead(emailId: number) {
        G.Logger.net(`【邮件模块】 邮件 ${emailId} 已标记为已读`);
        this.sendReadSystemEmail({
            emailId: emailId,
        });
    }

    public markReadAndGain(emailId: number) {
        this._emailContext.markRead(emailId);
        this._emailContext.markGain(emailId);

        this.refreshRedDot();
    }

    clearAllEmail() {
        const mailArray = this._emailContext.mailArray;
        mailArray.forEach((mail) => {
            this.sendRemoveSystemEmail({
                emailId: mail.emailId,
            });
        });
    }

    refreshRedDot() {
        this._emailContext.refreshRedDot();
    }
}
