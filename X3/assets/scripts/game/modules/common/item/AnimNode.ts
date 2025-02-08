import * as fgui from "fairygui-cc";
import { Layers, Node, sp } from "cc";
import { TableManager } from "../../../../core/table/TableManager";
import { Res } from "../../../../core/res/Res";
import NotificationKey from "../../../event/NotificationKey";
import G from "../../../../core/comm/G";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { NodeEventType } from "cc";
import { ResRef } from "../../../../core/res/ResRef";
import GIns from "../../../GIns";


/** 通用spine组件 */
export class AnimNode extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "AnimNode";

    private _animNode: Node;

    private _spine: sp.Skeleton;

    private get view(): ui.comm.node.AnimNode {
        return this as any;
    }

    constructor() {
        super();
    }

    /**
     * 设置动画
     * @param animPath 动画路径
     * @param isloop 是否循环
     * @param playeName 动画名
     */
    setAnim(animPath: string, isloop: boolean = true, playeName: string = "idle") {
        //spine 动画
        const nodeForSpine = this.view.anim.node;

        const dir = "resources";
        Res.getResRef({bundle:dir, url:animPath, type:sp.SkeletonData}, null, (res:ResRef) => {
            if (!res) {
                GIns.floatingTextMgr.showTips(`路径不存在 spine 骨骼数据. path = ${dir}/${animPath}`)
                G.Logger.error("加载 spine 失败")
                return
            }

            // 清空spine
            if (this._spine) {
                this._spine.destroy()
            }
            // 加载 spine
            const node = new Node();
            this._animNode = node;
            node.position = nodeForSpine.position;
            node.layer = Layers.Enum.ALL;
            const skeleton1 = node.addComponent(sp.Skeleton);
            nodeForSpine.parent.addChild(node)
            skeleton1.skeletonData = res.content;
            skeleton1.setAnimation(0, playeName, isloop)

            // skeleton.addRef();
            // node.once(NodeEventType.NODE_DESTROYED, () => {
            //     skeleton.decRef();
            // })

            this._spine = skeleton1;
            G.Logger.debug("加载 spine 完成")
        })
    }


}