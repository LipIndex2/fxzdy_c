import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import {
    EventGMKeys
} from "db://assets/scripts/gm/event/EventGMKeys";
import {ItemUtils} from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import {LongForNetwork} from "db://assets/scripts/core/prototypes/LongForNetwork";


/**
 * GM 邮件
 */
export class GMEmailView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMEmailView";

    // endregion


    private get view(): ui.gm.email.GMEmailView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {

        this.view.btnOk.labelTitle.text = "发送邮件"
        this.view.inputBoxTitle.labelTitle.text = "邮件标题"
        this.view.inputBoxContent.inputName.text = "title"
        this.view.inputBoxContent.labelTitle.text = "邮件内容"
        this.view.inputBoxContent.inputName.text = "xxxxxxxxxxxxxx"
        this.view.inputBoxRewardText.labelTitle.text = "后端奖励文本"
        this.view.inputBoxExpireTimeMs.labelTitle.text = "过期时间戳毫秒"
        this.view.inputBoxSendTimeMs.labelTitle.text = "发送时间戳毫秒"

        const serverNowTimeMs = G.TimeManager.serverNow;
        this.view.inputBoxSendTimeMs.inputName.text = serverNowTimeMs.toString()
        this.view.inputBoxSendTimeMs.inputName.text = "后端不支持"
        this.view.inputBoxRewardText.inputName.text = "4:10;5:100"
        // 30days after
        this.view.inputBoxExpireTimeMs.inputName.text = (serverNowTimeMs + 1000 * 60 * 60 * 24 * 30).toString()

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

    }


    private onClickOk() {
        const title = this.view.inputBoxTitle.inputName.text;
        const content = this.view.inputBoxContent.inputName.text;
        const rewardText = this.view.inputBoxRewardText.inputName.text;
        const expireTimeMs = this.view.inputBoxExpireTimeMs.inputName.text.toInt();
        const sendTimeMs = this.view.inputBoxSendTimeMs.inputName.text;

        const expireMinutes = ((expireTimeMs - G.TimeManager.serverNow) / 1000 / 60).toInt();
        const serverRewardItems = ItemUtils.parseStringToServerRewardItem(rewardText);

        G.FacadeManager.emit(
            EventGMKeys.GM_SEND_EMAIL_DIY,
            {
                title,
                content,
                rewards: serverRewardItems,
                expireMinutes: LongForNetwork.fromNumber(expireMinutes)
            } as  Vo.gm.SendEmailC2S
        )

    }
}