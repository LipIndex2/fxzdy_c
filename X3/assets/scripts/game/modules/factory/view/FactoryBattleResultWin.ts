import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { WorldController } from "../../../comm/world/WorldController";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { FactoryBattleResultViewOpenArgs, UIFactoryConfig } from "../const/UIFactoryConfig";

/**
 * 星际工厂战斗胜利界面
 */
@bindScript(UIFactoryConfig.FactoryBattleResultWin)
export class FactoryBattleResultWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryBattleResultWin";

    protected _args: FactoryBattleResultViewOpenArgs = null
    private get view(): ui.factory.view.FactoryBattleResultWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnData.onClick(this.onClickBattleData, this)
    }

    protected onPreDispose(): void {

    }

    protected onOpen(args: FactoryBattleResultViewOpenArgs, isReopen?: boolean): void {
        this._args = args
        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath())
        modelNode.playOrders(
            [
                {
                    name: "unlocking1",
                    isLoop: false
                },

                {
                    name: "idle1",
                    isLoop: true
                },
            ]
        );
        this.reset();
        this.view.getTransition("enter").play();
    }

    protected onClose() {
        GIns.factoryMgr.occupyTip = this._args?.isWin ?  '占领成功' : ''

        // loading
        this.emit(NotificationKey.LOADING_VIEW_SHOW);

        // 关闭战斗
        if (!WorldController.ins().isClickNextLevel)
            this.emit(NotificationKey.CLOSE_BATTLE_VIEW);
    }

    /**
    * 点击 【数据统计】
    */
    private onClickBattleData() {
        // 战斗数据
        GIns.battleRecordMgr.showRecordView(this._args.fightType, true);
    }

    protected reset() {
        this.view.lbName.text = this._args.tip;
    }

}