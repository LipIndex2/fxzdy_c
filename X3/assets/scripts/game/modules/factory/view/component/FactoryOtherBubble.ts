import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import GIns from "../../../../GIns";
import { IAnimOrder, ModelNode } from "../../../common/node/ModelNode";
import { PlayerInfoConfigManager } from "../../../player/config/PlayerInfoConfigManager";

/**
 * 星际工厂其他人占领时气泡提示
 */
@bindFguiExtension('ui://factory/FactoryOtherBubble')
export class FactoryOtherBubble extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryOtherBubble";

    /**生产线所属玩家id*/
    protected _playerId: number = 0;
    protected _playerBaseVo: Vo.player.PlayerBaseVo;
    protected _showIdx: number = -1;

    private get view(): ui.factory.component.FactoryOtherBubble {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onTimer(): void {
        if (this._showIdx % 2 == 0) {
            //显示文字
            let cfgs = GIns.factoryModel.getBubbleListByType(1);
            if (cfgs?.length > 0) {
                //随机文字
                let randomIdx = Math.floor(Math.random() * cfgs.length);
                let cfg = cfgs[randomIdx];
                this.view.tipComp.visible = true;
                this.view.emoComp.visible = false;
                this.view.tipComp.lbTip.text = cfg.content;
                this.view.getTransition('t1').play();
            } else {
                this.view.tipComp.visible = false;
                this.view.emoComp.visible = false;
            }
        } else {
            //显示表情
            let cfgs = GIns.factoryModel.getBubbleListByType(2);
            if (cfgs?.length > 0) {
                //随机表情
                let randomIdx = Math.floor(Math.random() * cfgs.length);
                let cfg = cfgs[randomIdx];
                this.view.tipComp.visible = false;
                this.view.emoComp.visible = true;
                let modelNode = this.view.emoComp.spine.modelNode as ModelNode;
                modelNode.loadByPath(cfg.content);
                let aniOrders: IAnimOrder[] = [];
                cfg.spineAnis?.forEach((value, index) => {
                    aniOrders.push({
                        name: value,
                        isLoop: index == cfg.spineAnis?.length - 1
                    })
                });
                if (aniOrders?.length > 0) {
                    modelNode.playOrders(aniOrders);
                }
                this.view.getTransition('t0').play();
            } else {
                this.view.tipComp.visible = false;
                this.view.emoComp.visible = false;
            }
        }
        this._showIdx++;
    }

    /**更新气泡*/
    public showUI(playerVo: Vo.player.PlayerBaseVo): void {
        if (playerVo && this._playerId != playerVo.id) {
            this.view.visible = true;
            this.view.lbName.text = playerVo.name;
            let headIconConfig = PlayerInfoConfigManager.getHeadIconConfigById(playerVo.headIcon);
            if (headIconConfig) {
                this.view.avatarLoader.icon = headIconConfig.assetPath;
            }
            this._showIdx = 0;
            G.GameTimer.clearAll(this);
            let interval: number = GIns.factoryModel.constCfg.bubbleInterval * 1000;
            G.GameTimer.loop(interval, this, this.onTimer);
            this.onTimer();
        }
    }

    public hideUI(): void {
        this.view.visible = false;
        this._playerId = 0;
        this._playerBaseVo = null;
        G.GameTimer.clearAll(this);
    }
}