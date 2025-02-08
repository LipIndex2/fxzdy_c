import * as fgui from "fairygui-cc";
import { BattleNum } from "./BattleNum";
import { HurtNumType } from "../../enum/BattleEnum";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";

@bindFguiExtension("ui://battleNum/AttrUpNum")
export class AttrUpNum extends BattleNum {

    protected get view(): ui.battleNum.num.AttrUpNum {
        return this as any;
    }

    protected attrType: string
    setParam(attrType: string): void {
        this.attrType = attrType;
        this.view.scaleY = this.view.scaleX = 0.8
        // this.view.arrowImg.scaleY = this.view.arrowImg.scaleX = 0.8
    }

    setValue(str: string) {
        this.view.img.once(fgui.Event.SIZE_CHANGED, () => {
            this.updateSize()
        }, this)
        if (this.type == HurtNumType.AttrUp) {
            this.view.img.icon = "image/battleFont/" + this.attrType + "_UP";
            this.view.arrowImg.icon = "image/battleFont/luse_jiantou";
        }
        else {

            this.view.img.icon = "image/battleFont/" + this.attrType + "_DOWN";
            this.view.arrowImg.icon = "image/battleFont/hongse_jiantou";
        }
        this.updateSize()
        this.tweenHandler();
    }

    protected updateSize(): void {
        if (this.view.node.isValid) {
            this.view.arrowImg.x = this.view.img.x + this.view.img.width * this.view.img.scaleX + 5;
            this.view.numText.x = -(this.view.arrowImg.x + this.view.arrowImg.width) * 0.5;
        }
    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition(this.type == HurtNumType.AttrDown ? "d" : "t");
        this.tran.play(this.onPlayEnd.bind(this));
    }
}