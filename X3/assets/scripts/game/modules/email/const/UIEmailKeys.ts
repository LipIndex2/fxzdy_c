import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import {EmailBoxView} from "db://assets/scripts/game/modules/email/view/EmailBoxView";
import {EmailContentView} from "db://assets/scripts/game/modules/email/view/EmailContentView";

// UI keys
export enum UIEmailKeys {

    // 邮箱
    UI_EMAIL_BOX_KEY = "EmailBoxView",
    // 内容
    UI_EMAIL_CONTENT_KEY = "EmailContentView",

}

UIScriptManager.bindScript(UIEmailKeys.UI_EMAIL_BOX_KEY, EmailBoxView);
UIScriptManager.bindScript(UIEmailKeys.UI_EMAIL_CONTENT_KEY, EmailContentView);