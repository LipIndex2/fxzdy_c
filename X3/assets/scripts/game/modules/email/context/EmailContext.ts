import { EmailVo } from "db://assets/scripts/game/modules/email/vo/EmailVo";
import G from "db://assets/scripts/core/comm/G";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { EnumEmailState } from "db://assets/scripts/game/modules/email/enums/EnumEmailState";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ModuleOpenManager } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 整个邮箱
 */
export class EmailContext {

    // 所有邮件
    private _mailIdMap: Map<number, EmailVo> = new Map<number, EmailVo>();

    // 邮件数组
    get mailArray(): Array<EmailVo> {
        return this._mailIdMap.toDataStream()
            .map(it => it.value)
            // TODO 后端没有处理未来邮件, 会导致有问题
            // // 说需要过滤掉过期邮件
            // .filter(it => G.TimeManager.serverNow >= it.sendAtTimeMs)
            // 越新的时间在前面
            .sortByWeightReverse((it) => it.sendAtTimeMs)
            .toArray();
    }


    // 初始化数据
    initData(vo: Vo.email.EmailInfoVo) {
        if (!vo) {
            return;
        }
        this._mailIdMap = vo.mailVos.toDataStream()
            .map((it: Vo.email.SystemEmailVo) => {
                return EmailVo.from(it);
            })
            .toMap((it: EmailVo) => it.emailId, it => it)

    }

    getMailById(emailId: number): EmailVo | null {
        return this._mailIdMap.get(emailId);
    }

    markRead(emailId: number) {
        const mail = this.getMailById(emailId);
        if (!mail) {
            return;
        }
        mail.readFlag = true;

        this.refreshRedDot();
    }

    markGain(emailId: number) {
        const mail = this.getMailById(emailId);
        if (!mail) {
            return;
        }
        mail.gainFlag = true;

        this.refreshRedDot();
    }

    addEmailByServerPush(vo: Vo.email.SystemEmailVo) {
        const emailVo = EmailVo.from(vo)
        this._mailIdMap.set(emailVo.emailId, emailVo);

        this.refreshRedDot();
    }

    removeMailById(emailId: number) {
        const isOk = this._mailIdMap.delete(emailId);
        if (isOk) {
            G.Logger.model(`【邮件模块】 邮件删除成功! ${emailId}`);
        }

        this.refreshRedDot();
    }

    clearExpireEmails() {
        this._mailIdMap.forEach((mail: EmailVo) => {
            if (mail.expireTimeAtTimeMs >= G.TimeManager.serverNow) {
                return;
            }

            console.log("定时清理过期邮件")
            EmailModel.ins().sendRemoveSystemEmail({
                emailId: mail.emailId,
            })
        })
    }

    isAllReadAndGain() {
        return this._mailIdMap.toDataStream()
            .map(it => {
                const emailVo = it.value;
                if (emailVo.isWithReward()) {
                    return emailVo.readFlag && emailVo.gainFlag;
                }
                return emailVo.readFlag;
            })
            .reduce((acc, cur) => acc && cur, true)
    }

    // 红点
    refreshRedDot() {
        if (!ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.EMAIL)) {
            return;
        }
        RedDotManager.ins().clearAll(RedDotKeys.email_row);

        let hasReward:boolean = false
        for (let [mailId, data] of this._mailIdMap) {
            const emailState = data.getEmailState();
            if (emailState == EnumEmailState.UNREAD) {
                RedDotManager.ins().setRedDot(RedDotKeys.email_row, true, [mailId]);
                if (data.isWithReward()) {
                    hasReward = true
                }
            } else if (emailState == EnumEmailState.READ_NO_GAIN) {
                RedDotManager.ins().setRedDot(RedDotKeys.email_row, true, [mailId]);
                hasReward = true
            } else {
                RedDotManager.ins().setRedDot(RedDotKeys.email_row, false, [mailId]);
            }
        }
        RedDotManager.ins().setRedDot(RedDotKeys.email_CanGain, hasReward);
    }

}