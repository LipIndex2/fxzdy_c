import { game, tween } from "cc";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { ChatConfigManager } from "../config/ChatConfigManager";
import { PostVo } from "../vo/PostVo";

/**
 * 跑马灯
 */
@bindScript(UICommonKey.PostView)
export class PostView extends UIView implements INotification {

    static pkgName: string = "comm1";
    static viewName: string = "PostView";

    /** 跑马灯在tip层 点击穿透 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.TIPS;

    private get view(): ui.comm1.chat.PostView {
        return this._view as any;
    }

    protected onPreDispose(): void {
        game.targetOff(this)
    }

    protected onPlayComplete(): void {
        this.closeSelf()
    }

    protected onOpen(args: PostVo, isReopen?: boolean): void {
        this.view.textComp.lbPost.text = args.content;

        let startX = this.view.textComp.width;
        let endX = -this.view.textComp.lbPost.width
        this.view.textComp.lbPost.x = startX;

        this.view.getController('type').selectedIndex = args.byStyle != 1 ? 2 : 1

        let delaySec = ChatConfigManager.postPlayTimeSecond;
        tween(this.view.textComp.lbPost)
            .to(delaySec, {x: endX})
            .call(() => {
                if (this.view?.node?.isValid) {
                    this.onPlayComplete();
                }
            })
            .start();
    }


}