import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ErrorCodeUtils } from "db://assets/scripts/game/modules/errorcode/utils/ErrorCodeUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import GIns from "../../GIns";


export class ErrorCodeController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.SERVER_ERROR_CODE
        ];
    }

    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.SERVER_ERROR_CODE:
                this.handleServerErrorCode(args as number);
                return;
        }
    }

    private handleServerErrorCode(code: number) {
        const i18nId = ErrorCodeUtils.getErrorCodeI18nId(code);
        console.warn(`Server error code: ${code}, i18nId: ${i18nId}`);

        // 正常 tips
        const i18nText = I18nManager.ins().translateOrBlank(i18nId);
        if (StringUtils.isBlank(i18nText)) {
            // TODO 大概率 Server 导出的 error.txt 错误码配置表有缺漏 
            console.error(`Cannot find i18n text for server ErrorCode = ${code}. i18nId =  ${i18nId}`);
            return;
        }
        GIns.floatingTextMgr?.showTips(i18nText);
    }
}

ErrorCodeController.ins().doInit();