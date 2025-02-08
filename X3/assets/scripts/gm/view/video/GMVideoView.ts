import { EnumUIViewLayer } from "../../../core/comm/LayerManager";
import { bindScript } from "../../../core/comm/UIScriptManager";
import { UIView } from "../../../core/mvc/view/UIView";
import NotificationKey from "../../../game/event/NotificationKey";
import { UIGmKeys } from "../../const/UIGmKeys";


/**
 * 性能调试
 */
@bindScript(UIGmKeys.GMVideoView)
export class GMVideoView extends UIView {

    static pkgName: string = "gm";

    static viewName: string = "GMVideoView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.GUIDE;

    private get view(): ui.gm.video.GMVideoView {
        return this._view as any;
    }

    protected onInit() {
        this.view.btnClose.onClick(this.closeSelf, this);
        this.view.btnChange.onClick(this.onClickChange, this);

    }

    protected onOpen(): void {

    }

    private onClickChange() {
        let scale: number = 1
        if (this.view.editBoxScale.text) {
            scale = Number(this.view.editBoxScale.text)
        }
        if (isNaN(scale)) {
            return
        }
        this.emit(NotificationKey.VIDEO_SCALE_CHANGE, scale)
    }
}