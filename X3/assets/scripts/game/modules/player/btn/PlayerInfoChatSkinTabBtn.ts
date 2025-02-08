import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import {
    PlayerInfoChangeChatSkinView
} from "db://assets/scripts/game/modules/player/view/PlayerInfoChangeChatSkinView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";


@bindFguiExtension("ui://playerInfo/PlayerInfoChatSkinTabBtn")
export class PlayerInfoChatSkinTabBtn extends FGUI.GButton {
    private _parentView: PlayerInfoChangeChatSkinView;
    private _index: number = 0;

    get view(): ui.playerInfo.btn.PlayerInfoChatSkinTabBtn {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(() => {
            this._parentView?.clickTab(this._index);
        }, this);
    }

    reset(param: PlayerInfoChangeChatSkinView, index: number, name: string) {
        this._parentView = param;
        this._index = index;

        this.view.labelNoChoose.text = name;
        this.view.labelChoose.text = name;

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Null)
        switch (index) {
            case 0:
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_head)
                break
            case 1:
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_head_frame)
                break
            case 2:
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_title)
                break
            case 3:
                FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_image)
                break
        }
    }
}