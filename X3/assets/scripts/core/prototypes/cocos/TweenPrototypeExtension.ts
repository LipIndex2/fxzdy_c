import { TweenAction } from "cc";
import * as fgui from "fairygui-cc";

const __update = TweenAction.prototype.update;

TweenAction.prototype.update = function (t: number) {
    const target = this.target;
    if (!target) return;

    if (target instanceof fgui.GObject && !target.node) {
        return;
    }
    __update.call(this, t)
}

