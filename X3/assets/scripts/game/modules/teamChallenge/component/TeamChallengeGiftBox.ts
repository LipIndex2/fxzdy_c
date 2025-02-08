import * as fgui from "fairygui-cc";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { tween } from "cc";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { Node, Tween, Vec3 } from "cc";

/** 宝箱item */
export class TeamChallengeGiftBox extends fgui.GComponent {
    public isBoxOpen: boolean;
    public cfgId: number;
    private _closedBoxUrl = "ui://teamChallenge/box_close";
    private _openBoxUrl = "ui://teamChallenge/box_open";
    public boxStateMap: { [cfgId: number]: boolean } = {};

    private get view(): ui.teamChallenge.components.TeamChallengeGiftBox {
        return this as any;
    }

    private get model():TeamChallengeModel{
        return TeamChallengeModel.ins();
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit();
    }

    public onInit() {

    }

    /** 触发宝箱打开效果 */
    public triggerBoxOpen(cfgId: number) {
        if (this.boxStateMap[cfgId]) return;
        this.boxStateMap[cfgId] = true;
        this.shakeAndOpenBox();
    }

    /** 摇晃并打开宝箱 */
    private shakeAndOpenBox() {
        const iconNode = this.view.getChild("giftBox").node; // 获取宝箱图标的节点
        
        // 摇晃动画
        tween(iconNode)
        .to(0.2, { angle: 18 }) // 轻微右晃
        .to(0.2, { angle: -18 }) // 轻微左晃
        .to(0.2, { angle: 10 }) // 右晃
        .to(0.1, { angle: 0 }) // 回正
        .call(() => {
            // 切换为打开宝箱图片
            this.view.giftBox.url = this._openBoxUrl;

            // 播放奖励领取逻辑
            GameTimer.ins().callLater(this, () => {
                TeamChallengeModel.ins().sendDrawChapterReward({ chapterId: this.cfgId });
            });
        })
        .start();
    }
    
    public showOpenBox() {
        this.view.giftBox.url = this._openBoxUrl;
    }

    public showCloseBox() {
        this.view.giftBox.url = this._closedBoxUrl;
    }
}