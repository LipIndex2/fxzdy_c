
import { Sprite } from "cc";
import { Label } from "cc";
import { RichText } from "cc";


/**cocos 富文本颜色更新 */
//@ts-ignore
RichText.prototype._updateTextDefaultColor = function () {
    for (let i = 0; i < this._segments.length; ++i) {
        const segment = this._segments[i];
        const label = segment.node.getComponent(Label);
        if (!label) {
            const sprite = segment.node.getComponent(Sprite) as Sprite;
            if (sprite) {
                sprite.color = this._fontColor;
            }
            continue;
        }
        if (this._textArray[segment.styleIndex]?.style?.color) {
            continue;
        }

        label.color = this._fontColor;
    }
}