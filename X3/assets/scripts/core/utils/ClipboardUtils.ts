import { native, sys } from "cc";
import { DebugUtils } from "./DebugUtils";


export class ClipboardUtils {

    static copy(text: string) {

        if (sys.platform === sys.Platform.WECHAT_GAME) {
            //@ts-ignore
            wx?.setClipboardData({
                data: text,
                success: () => {
                    DebugUtils.isDebugMode() && console.log("复制成功！");
                }
            });
        } else if (sys.platform === sys.Platform.DESKTOP_BROWSER || sys.platform === sys.Platform.MOBILE_BROWSER) {
            // web
            // Web Platform
            this.copyToClipboardInWeb0(text)
        } else if (sys.isNative) {
            // native | 此处判定不完善
            native.copyTextToClipboard(text)
        }
    }


    // Custom function for copying to clipboard on the web
    private static copyToClipboardInWeb0(text: string) {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error("Failed to copy text:", err);
        }

        document.body.removeChild(tempTextArea);
    }
}