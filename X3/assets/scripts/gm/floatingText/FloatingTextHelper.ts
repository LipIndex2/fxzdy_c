import {Label, Node, RichText, Size, Sprite, tween, Tween, UIOpacity, UITransform, v3, Widget} from "cc";
import {ComponentUtils} from "db://assets/scripts/core/utils/ComponentUtils";
import {FloatingTextParameters} from "db://assets/scripts/gm/floatingText/FloatingTextComponent";

/**
 * 漂浮文字数据
 */
export class FloatingTextData {
    node: Node;
    nowHeight: number;
    align: string;
    tY?: number;

    constructor(node: Node,
                nowHeight: number,
                align: string,
    ) {
        this.node = node;
        this.nowHeight = nowHeight;
        this.align = align;
    }
}


/**
 * 漂浮文字助手
 * 
 * @author luohaojun
 */
export class FloatingTextHelper {

    private static readonly floatingTextCacheMap: Map<string, FloatingTextData> = new Map();


    /**
     * 通用飘字
     * @param msg 文字内容
     * @param parent 飘字容器
     * @param params 可选参数
     * @ align 飘字的相对位置（r_15_t_10 表示相对右15px，顶10px，默认c_0_c_0正中心）
     * @ font 字体，不传则默认富文本
     * @ fontSize 字号，默认22
     * @ color 文字颜色，默认白色
     * @ time 消失时间，默认2秒
     * @ bg 文字背景图
     * @ textHeight 行高
     * @ xyShift 调整文字坐标
     */
    static floatingText(msg: string,
                        parent: Node,
                        params: FloatingTextParameters = {},
    ) {
        const align = params.align || "c_0_c_0";
        const group = `${align}_${parent.uuid}`;
        let data = FloatingTextHelper.floatingTextCacheMap[group];
        let groupNode: Node;
        if (data) {
            groupNode = data.node;
            Tween.stopAllByTarget(groupNode);
        } else {
            const wgt = ComponentUtils.createNodeWithComponent(Widget, parent);
            groupNode = wgt.node;
            let aList = align.split("_");
            if (aList.length != 4) {
                console.error('ltToast', 'align参数格式错误');
                aList = ['c', '0', 'c', '0'];
            }
            groupNode.getComponent(UITransform).setContentSize(0, 0);
            for (let i = 0; i < aList.length; i++) {
                if (i % 2 == 0) {
                    let ak = {
                        l: 'Left',
                        r: 'Right',
                        t: 'Top',
                        b: 'Bottom',
                        c: i == 0 ? 'Horizontal' : 'Vertical',
                    }[aList[i]];
                    let ostr = aList[i] == "c" ? "Center" : "";
                    if (!ak) {
                        console.error('ltToast', 'align参数格式错误');
                        ak = 'Left';
                    }
                    wgt["isAlign" + ak + ostr] = true;
                    let v = +aList[i + 1];
                    if (v != v) {
                        console.error('ltToast', 'align参数格式错误');
                        v = 0;
                    }
                    wgt[ak.toLowerCase() + ostr] = v;
                }
            }
            wgt.updateAlignment();
            data = {node: groupNode, nowHeight: 0, align: align};
            FloatingTextHelper.floatingTextCacheMap[group] = data;
        }

        const op = ComponentUtils.createNodeWithComponent(UIOpacity, groupNode);
        const bgNode = op.node;
        let size = Size.ZERO;
        if (params.bg) {
            bgNode.addComponent(Sprite).spriteFrame = params.bg.spf;
            size = params.bg.size;
        }
        bgNode.getComponent(UITransform).setContentSize(size);
        const lbNode = ComponentUtils.createNodeWithComponent(UITransform, bgNode).node;
        let text: Label | RichText;
        if (params.font) {
            text = lbNode.addComponent(Label);
            text.font = params.font;
            if (params.color) {
                text.color = params.color;
            }
        } else {
            text = lbNode.addComponent(RichText);
            text.horizontalAlign = RichText.HorizontalAlign.CENTER;
            if (!params.bg) {
                msg = `<outline color=#000000>${msg}</outline>`;
            }
            if (params.color) {
                msg = `<color=#${params.color.toHEX()}>${msg}</color>`;
            }
        }
        lbNode.scale = v3(1, 1);
        text.fontSize = params.fontSize || 22;
        text.lineHeight = text.fontSize + 2;
        text.string = msg;

        if (data.tY && groupNode.isValid) {
            groupNode.setPosition(groupNode.position.x, data.tY);
        }
        bgNode.setPosition(bgNode.position.x, data.nowHeight);

        let nodeHeight = text.lineHeight + 10;
        if (params.textHeight) {
            nodeHeight = params.textHeight + 10;
        }
        data.nowHeight -= nodeHeight;

        const setNodeAlign = (n: Node) => {
            const tsf = n.getComponent(UITransform);
            if (data.align.includes("l")) tsf.anchorX = 0;
            else if (data.align.includes("r")) tsf.anchorX = 1;

            if (data.align.includes("t")) tsf.anchorY = 1;
            else if (data.align.includes("b")) tsf.anchorY = 0;
        };
        setNodeAlign(bgNode);

        if (params.bg) {
            const tsf = bgNode.getComponent(UITransform);
            lbNode.setPosition(params.bg.size.width * (0.5 - tsf.anchorX), params.bg.size.height * (0.5 - tsf.anchorY));
        } else {
            setNodeAlign(lbNode);
        }


        if (params.xyShift) lbNode.setPosition(lbNode.position.x + params.xyShift.x, lbNode.position.y + params.xyShift.y);
        const dt: number = Math.max((params.time ? params.time - 0.5 : 1.5) + 0.5, 0.5);
        tween(op)
            .delay(dt - 0.5)
            .to(0.5, {opacity: 0})
            .call(() => bgNode.destroy())
            .start();
        data.tY = groupNode.position.y + nodeHeight;

        tween(groupNode)
            .to(0.2, {position: v3(groupNode.position.x, data.tY, 0)})
            .delay(dt)
            .call(() => {
                groupNode.destroy();
                delete FloatingTextHelper.floatingTextCacheMap[group];
            })
            .start();
    }

}
