import * as fgui from "fairygui-cc";
import { Res } from "db://assets/scripts/core/res/Res";
import { Layers, Node, sp } from "cc";
import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { TableManager } from "../../../core/table/TableManager";
import { math } from "cc";
import { NodeEventType } from "cc";
import { ResRef } from "../../../core/res/ResRef";
import GIns from "../../../game/GIns";
import { AssetBundleKeys } from "../../../core/res/AssetBundleKeys";


/**
 * GM Spine
 */
export class GMSpineCheckerView extends fgui.GComponent {

    private _spine: sp.Skeleton;
    private _spineNode: Node;

    // 所有动画名字
    private _spineAnimationNameArray: string[] = [];

    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMSpineCheckerView";

    // endregion
    private _loop: boolean = false;



    private get view(): ui.gm.spineChecker.GMSpineCheckerView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {

        // init
        this.view.inputBoxForSpineName.inputName.text = "spine/materials/kuang/kuang"
        this.view.btnSwitch.labelTitle.text = "切换spine"
        this.view.btnPlay.labelTitle.text = "播放"

        this.view.checkBoxLoop.titleUp.text = "不循环"
        this.view.checkBoxLoop.titleDown.text = "循环播放"

        this.view.checkBoxLoop.titleDown.visible = false

        this.view.inputBoxForSpineAnimName.inputName.text = "idle"

        this.view.checkBoxLoop.on(fgui.Event.CLICK, this.toggleLoop, this)

        this.view.btnSwitch.on(fgui.Event.CLICK, this.onClickSwitch, this)
        this.view.btnPlay.on(fgui.Event.CLICK, this.onClickPlay, this)

    }


    private toggleLoop() {
        this._spine?.clearTracks()

        this._loop = !this._loop;
        if (this._loop) {
            this.view.checkBoxLoop.bgUp.visible = false
            this.view.checkBoxLoop.titleUp.visible = false
            this.view.checkBoxLoop.titleDown.visible = true
            this.view.checkBoxLoop.bgDown.visible = true
        } else {
            this.view.checkBoxLoop.bgUp.visible = true
            this.view.checkBoxLoop.titleUp.visible = true
            this.view.checkBoxLoop.titleDown.visible = false
            this.view.checkBoxLoop.bgDown.visible = false
        }
    }

    private onClickSwitch() {
        let scale = 1;
        let spinePath = this.view.inputBoxForSpineName.inputName.text;
        if (!spinePath) {
            G.Logger.error("spine 路径不对", spinePath)
            return
        }
        if (Number(spinePath)) {
            let cfg = TableManager.getDataById(table.model.ModelConfig, Number(spinePath));
            if (!cfg) {
                G.Logger.error("modelId 找不到", spinePath)
                return
            }

            spinePath = cfg.modelPath;
            scale = cfg.scale?.scaleX || 1;
        }

        const nodeForSpine = this.view.rootForSpine.node;
        const myName = nodeForSpine.name;

        // 不需要后缀
        const lastIndexOf = spinePath.lastIndexOf(".");
        if (lastIndexOf !== -1) {
            spinePath = spinePath.substring(0, lastIndexOf);
        } else {
            spinePath = spinePath.trim()
        }

        Res.getResRef({ bundle: AssetBundleKeys.SPINE, url: spinePath, type: sp.SkeletonData }, null, (res: ResRef) => {
            if (!res) {
                GIns.floatingTextMgr.showTips(`路径不存在 spine 骨骼数据. path = ${AssetBundleKeys.SPINE}/${spinePath}`)
                G.Logger.error("加载 spine 失败")
                return
            }

            // 清空其他
            if (this._spineNode) {
                this._spineNode.destroy()
            }

            // 加载 spine
            this._spineNode = new Node();
            this._spineNode.setScale(scale, scale);
            //node.position = nodeForSpine.position;
            this._spineNode.layer = Layers.Enum.ALL;
            const skeleton1 = this._spineNode.addComponent(sp.Skeleton);
            nodeForSpine.addChild(this._spineNode);
            skeleton1.skeletonData = res.content;

            // skeleton.addRef();
            // node.once(NodeEventType.NODE_DESTROYED, () => {
            //     skeleton.decRef();
            // })

            G.Logger.debug("加载 spine 完成")
            this._spine = skeleton1

            // 初始化所有动画名字
            const animNames = [];
            let anis = this._spine._skeleton.data.animations;
            for (let i in anis) {
                animNames.push(anis[i].name);
            }
            this._spineAnimationNameArray = animNames
            this.view.inputBoxForSpineAnimName.inputName.text = animNames.join("/")
        })
    }

    private onClickPlay() {
        let animationName = this.view.inputBoxForSpineAnimName.inputName.text;

        if (!this._spine) {
            G.Logger.error("spine 还没加载")
            GIns.floatingTextMgr.showTips("spine 还没加载")
            return
        }

        const firstIndex = animationName.indexOf("/");
        if (firstIndex > -1) {
            animationName = this._spineAnimationNameArray[0]
            this._spine.setAnimation(0, animationName, this._loop)

            GIns.floatingTextMgr.showTips("播放 Spine 动画：" + animationName)
        } else {
            this._spine.setAnimation(0, animationName, this._loop)

            GIns.floatingTextMgr.showTips("播放 Spine 动画：" + animationName)
        }

    }

    protected onPreDispose() {
        if (this._spineNode) {
            this._spineNode.destroy()
        }

    }
}