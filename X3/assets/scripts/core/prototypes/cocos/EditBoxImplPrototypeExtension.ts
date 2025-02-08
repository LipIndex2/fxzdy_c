
import { EditBox, View } from "cc";

const __onDestroy = EditBox.prototype.onDestroy;

/**cocos编辑框 */
EditBox.prototype.onDestroy = function () {
    if (this._impl) {
        View.instance.off('canvas-resize', this._impl._resize, this._impl);
    }
    __onDestroy.call(this);
}