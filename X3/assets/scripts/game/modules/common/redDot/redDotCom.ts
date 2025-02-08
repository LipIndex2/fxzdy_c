import { tween, Tween } from "cc";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import * as fgui from "fairygui-cc";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import { ModelNode } from "../node/ModelNode";
import { RedDotManager } from "./RedDotManager";
import { TweenUtils } from "db://assets/scripts/core/utils/TweenUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";


export class RedDotCom extends fgui.GComponent implements INotification {

    // 路径
    private _redDotPath: RedDotPath;
    private _pathArgs: any[];
    private _showType: EnumRedDotShowType;

    private selected: boolean = false;
    private _listenPathArray: RedDotPath[] = [];

    protected _isShowEffect: boolean = false
    /***是否显示红点跳跃动效 */
    private _isShowRedYoyo: boolean = true;

    protected _initX: number
    protected _initY: number

    protected _typeCtrl: fgui.Controller

    private get view(): ui.comm.com.RedDot {
        return this as any;
    }

    protected onInit(): void {
        // 默认不显示
        this.view.redDot.visible = false;
        this._initX = this.view.redDot.x
        this._initY = this.view.redDot.y
        this._typeCtrl = this.view.getController("type");
    }

    listenNotifications(): string[] {
        const array = [
            this._redDotPath,
            ...this._listenPathArray
        ]
            .filter(it => it != null)
            .map(it => it.toEventName());
        return [
            NotificationKey.RED_DOT_CHANGE,
            ...array
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        if (this._redDotPath) {
            const redDotPath = this._redDotPath.toEventName();
            switch (eventName) {
                case redDotPath: {
                    this.updateRedDot();
                    break;
                }
            }
        }


        // 监听多路径
        const isListen = this.isListenInPathArray(eventName);
        if (isListen) {
            this.refreshHotUpdateByPathArray();
        }
    }

    /**
     * 是否在监听路径
     * @param eventName
     */
    isListenInPathArray(eventName: string): boolean {
        for (let listenPath of this._listenPathArray) {
            const listenEventName = listenPath.toEventName();
            if (listenEventName == eventName) {
                return true;
            }
        }
        return false;
    }

    refreshHotUpdateByPathArray(): void {
        if (ArrayUtils.isEmpty(this._listenPathArray)) {
            return;
        }
        const showType = RedDotManager.ins().getShowTypeByPathArray(this._listenPathArray);
        this.showByType(showType);
    }


    /**
     * 绑定红点!
     * - 历史叫 reset
     * @param path   红点key
     * @param args
     * @param showTypeYour
     */
    reset(path: RedDotPath,
        args: any[] = [],
        showTypeYour: EnumRedDotShowType = null
    ) {

        this._redDotPath = path;
        if (showTypeYour) {
            this._showType = showTypeYour;
        } else {
            this._showType = path.showType;
        }
        this._pathArgs = args || [];

        this.updateRedDot();


        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
    }


    /**
     * 监听多个红点路径
     * @param paths
     */
    listenRedDotByPathArray(paths: RedDotPath[]) {

        this._listenPathArray = paths;

        this.refreshHotUpdateByPathArray();

        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
    }

    /**
     * 这是给列表选项用的
     * 列表比较复杂，不进到红点树，单独处理
     * ------------
     * 历史的逻辑, 有问题, 他这里只是显示哪个 UI, 没有任何的红点机制!!!! 本质上要自己另外写一套红点系统
     *
     * - 新版红点已支持 List 机制 | 见 Backpack 背包部分红点
     * @deprecated 后续不要使用这个方法了, 它里面什么都没做
     *
     * @param showType
     * @param show
     */
    resetListCell(showType: EnumRedDotShowType, show: boolean) {


        this.showByType(show ? showType : EnumRedDotShowType.NULL);


    }


    private updateRedDot() {
        if (NodeUtils.isNotValidNode(this.view.node)) {
            return;
        }

        let showType = RedDotManager.ins().getShowType(this._redDotPath, this._pathArgs);
        this.showByType(showType);
    }


    public showByType(showType: EnumRedDotShowType): void {
        this._showType = showType

        this._typeCtrl.selectedIndex = this.selected ? EnumRedDotShowType.NULL : showType;
        if (showType == EnumRedDotShowType.ITEM_HEIGHT_LIGHT) {
            //扫光
            this.setSaoGuangMaterial();
        }
        if (showType == EnumRedDotShowType.MAIN_CITY) {
            //建筑红点
            this.setMainCityMaterial();
        }

        this.view.redDot.visible = showType != EnumRedDotShowType.NULL;
        if (showType == EnumRedDotShowType.REWARD || showType == EnumRedDotShowType.NORMAL || showType == EnumRedDotShowType.HIGH || showType == EnumRedDotShowType.LV_UP_RED)
            this.checkShowRedDotYoyo();

        // 停止 spine
        this.view.modelNode.node.active = showType != EnumRedDotShowType.NULL;
        this.updateEffect();
    }

    private isYoyoing: boolean = false
    /***第1次显示红点跳跃的时间戳 */
    private static firstRedYoyoTime: number = 0;
    private static yoyoY: number = 0;
    private static yoyoDir: string = "down"
    private timer: string
    protected checkShowRedDotYoyo(): void {
        if (!RedDotCom.firstRedYoyoTime) {
            RedDotCom.firstRedYoyoTime = 1;
            GameTimer.ins().frameLoop(2, RedDotCom, () => {
                if (RedDotCom.yoyoDir == "up") {
                    RedDotCom.yoyoY -= 0.2;
                    if (RedDotCom.yoyoY <= 0) {
                        RedDotCom.yoyoDir = "down"
                    }
                }
                else if (RedDotCom.yoyoDir == "down") {
                    RedDotCom.yoyoY += 0.2;
                    if (RedDotCom.yoyoY >= 3) {
                        RedDotCom.yoyoDir = "up"
                    }
                }
            })
        }

        if (this.view.redDot.visible && this._isShowRedYoyo) {
            //显示动画
            if (!this.isYoyoing) {
                this.isYoyoing = true;
                this.timer = GameTimer.ins().frameLoop(2, this, () => {
                    if (this.view.redDot?.node?.isValid) {
                        this.view.redDot.y = this._initY + RedDotCom.yoyoY;
                    }
                })
            }
        }
        else if (this.isYoyoing) {
            GameTimer.ins().clearByKey(this.timer)
            this.timer = null;
            this.isYoyoing = false;
        }
    }

    protected get isShowRedYoyo(): boolean {
        return this._isShowRedYoyo;
    }
    protected set isShowRedYoyo(value: boolean) {
        this._isShowRedYoyo = value;
    }

    protected onPreDispose() {
        this.stopEffect()
        if (this.timer)
            GameTimer.ins().clearByKey(this.timer)
        FacadeManager.ins().removeNotification(this);
    }


    /**
     * 扫光材质
     * @private
     */
    private setSaoGuangMaterial() {
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.touchable = false;
        modelNode.loadByPath("spine/ui/gongxihuode/ui_card_sweep_gold");
        modelNode.clearOrders();
        modelNode.playOrders([
            {
                name: "animation",
                isLoop: true
            },
        ])

        modelNode.setScale(this.view.width / 160, this.view.height / 160);

    }

    /**
     * 
     * @private MAIN_CITY
     */
    private setMainCityMaterial() {
        // this.view.modelNode.node.active = true;
        const modelNode = this.view.modelNode as ModelNode;

        modelNode.loadByPath("spine/materials/T_tanghao/T_tanghao");
        modelNode.play("idle", true);
    }




    protected updateEffect(): void {
        let showEffect = this.view.redDot.visible && this._showType != EnumRedDotShowType.ITEM_HEIGHT_LIGHT && this._showType != EnumRedDotShowType.MAIN_CITY
        if (this._isShowEffect != showEffect) {
            this._isShowEffect = showEffect
            if (showEffect) {
                this.playEffect()
            } else {
                this.stopEffect()
            }
        }
    }

    public playEffect(): void {
        this.stopEffect();
        this.view.redDot.setPosition(this._initX, this._initY);
        // let t1 = tween(this.view.redDot).to(0.12, { x: this._initX, y: this._initY - 5 }, { easing: 'circInOut' });
        // let t2 = tween(this.view.redDot).to(0.12, { x: this._initX, y: this._initY }, { easing: 'circInOut' });
        // let t3 = tween(this.view.redDot).sequence(t1, t2).repeat(2)
        // let t4 = tween(this.view.redDot).delay(2)
        // tween(this.view.redDot).sequence(t3, t4).repeatForever().start()
    }

    public stopEffect(): void {
        Tween.stopAllByTarget(this.view.redDot);
    }

    public playSpine(): void {
        if (this.view.modelNode.node.active) {
            const modelNode = this.view.modelNode as ModelNode;
            modelNode.play("idle", true);
        }
    }

    public stopSpine(): void {
        if (this.view.modelNode.node.active) {
            const modelNode = this.view.modelNode as ModelNode;
            modelNode.stop();
        }
    }
}