import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { Handler } from "../../../../core/utils/Handler";
import { BattleExpandManager } from "../../../comm/battleEx/BattleExpandManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { IPetDungeonTransOpenArgs, UIPetDungeonConfig } from "../const/UIPetDungeonConfig";

/** 宠物副本的传送动画 只处理同地图传送 */
@bindScript(UIPetDungeonConfig.PetDungeonTransferAnimWin)
export class PetDungeonTransferAnimWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TransferAnimWin";

    public _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;

    private _args: IPetDungeonTransOpenArgs = null;

    protected _isStartTrans: boolean = false;

    private get view(): ui.comm.view.TransferAnimWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MAP_AREA_TRANSFER_END,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAP_AREA_TRANSFER_END:
                //同地图没有进入世界完成事件 所以要主动关闭loading
                G.UIManager.close(UICommonKey.LoadingWin);
                if (this._isStartTrans) {
                    GIns.mapMgr.curMap.showBuildings();
                    this.playEndAnim();
                }
                break;
        }
    }

    protected onInit(): void {

    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args;

        this.emit(NotificationKey.MAP_CANCEL_ACTIVE_BUILDING);
        if (this._args.transTargetPos) {
            GIns.mapMgr.curMap.hideBuildings();
            GameTimer.ins().once(800, this, this.startMoveToTransPoint);
        } else {
            GameTimer.ins().once(800, this, this.startMoveToTarget);
        }
    }

    protected onClose(dontDispose?: boolean): void {
        GameTimer.ins().clearAll(this);
    }

    private doAnim() {
        GIns.cameraAnimUtils.zoomOutByTransfer()
        GameTimer.ins().once(800, this, this.playStartAnim1);
    }

    /******************************** 传送开始 **********************************/
    private playStartAnim1() {
        BattleExpandManager.ins().transferStartAnimFadeOut();
        GameTimer.ins().once(1100, this, this.playStartAnim2);
    }

    private playStartAnim2() {
        // let transferPos = new Vec3();
        // transferPos.set(this._args.transTargetPos.x, this._args.transTargetPos.y);
        // GIns.cameraAnimUtils.moveMapByTargetPos(transferPos, 100); //移动地图
        // GameTimer.ins().once(300, this, this.transfear);
        //显示loading界面
        this.emit(NotificationKey.LOADING_VIEW_SHOW);
        GameTimer.ins().once(1000, this, this.transfear);
    }

    private transfear() {
        let transfarData: ITransfer = {
            mapId: GIns.mapMgr.curMap.getMapID(),
            pos: this._args.transTargetPos
        }
        this.emit(NotificationKey.MAP_AREA_TRANSFER_START, transfarData);
    }

    /******************************** 传送结束 **********************************/
    private playEndAnim() {
        BattleExpandManager.ins().transferEndAnimFadeIn();
        GameTimer.ins().once(1000, this, this.playEndAnim2);
    }

    private playEndAnim2() {
        GIns.cameraAnimUtils.zoomInMapByTransfer();
        GameTimer.ins().once(800, this, this.onEndAnimComplete);
    }

    private onEndAnimComplete() {
        this.emit(NotificationKey.MAP_TRANSFER_END);
        GameTimer.ins().once(1000, this, this.startMoveToTarget);
    }

    /******************************** 开始移动 **********************************/

    protected startMoveToTransPoint(): void {
        this._isStartTrans = true;
        if (this._args.transPointPos) {
            GIns.battleMgr.mainScene.getHeroTeam().setMoveTarget(
                this._args.transPointPos,
                Handler.create(this, () => {
                    GIns.battleMgr.endFight();
                    this.doAnim();
                }));
            return;
        }
        GIns.battleMgr.endFight();
        this.doAnim();
    }


    protected startMoveToTarget(): void {
        // if (this._args.moveToPos) {
        //     GIns.battleMgr.mainScene.getHeroTeam().setMoveTarget(
        //         this._args.moveToPos,
        //         Handler.create(this, () => {
        //             this.closeSelf();
        //         }));
        //     return;
        // }
        if (this._args.endPos) {
            GIns.battleMgr.mainScene.getHeroTeam().setMoveTarget(this._args.endPos);
        }
        this.closeSelf();
    }
}