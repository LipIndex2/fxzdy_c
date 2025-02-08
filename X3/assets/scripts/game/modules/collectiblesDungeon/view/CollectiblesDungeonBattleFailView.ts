import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { CollectiblesDungeonConditionVo } from "../model/vo/CollectiblesDungeonConditionVo";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonBattleFailView)
export class CollectiblesDungeonBattleFailView extends UICommWin {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonBattleFailView";

    protected _args: CommonBattleResultViewOpenArgs;
    protected _battleResult: Vo.collectiblesdungeon.CollectiblesDungeonChallengeResult = null;
    protected _conditions: CollectiblesDungeonConditionVo[] = [];
    protected _stars: ui.collectiblesDungeon.component.CollectiblesDungeonStar[] = [];
    protected _starResults: boolean[] = [];

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonBattleFailView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this._stars = [
            this.view.failComp.star1,
            this.view.failComp.star2,
            this.view.failComp.star3
        ];

        // 跳转
        this.view.failComp.listCond.itemRenderer = this.itemRendererForCond.bind(this);

        // wait 4spine 动画
        G.GameTimer.once(3200, this, () => {
            if (this.view?.node?.isValid) {
                // outside
                this.view.failComp.btnData.onClick(this.onClickBattleData, this);
            }
        });
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForCond(index: number, item: ui.collectiblesDungeon.item.CollectiblesDungeonBattleCondItem): void {
        item.lbCond.text = this._conditions[index].desc;
        item.getController('state').selectedIndex = this._starResults.length > index && this._starResults[index] ? 0 : 1;
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData() {
        // 战斗数据
        GIns.battleRecordMgr.showRecordView(this._args.fightType, false);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as CommonBattleResultViewOpenArgs;
        this._battleResult = args.param;
        const modelNode = this.view.failComp.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath())
        modelNode.playOrders(
            [
                {
                    name: "unlocking2",
                    isLoop: false
                },
                {
                    name: "idle2",
                    isLoop: true
                },
            ]
        );

        let levelId: number = GIns.collectiblesDungeonModel.battleId;
        let levelVo = GIns.collectiblesDungeonModel.getLevelVo(levelId);

        if (this._battleResult) {
            this._starResults = [this._battleResult.star1 > 0, this._battleResult.star2 > 0, this._battleResult.star3 > 0];
            let starCnt = this._starResults.filter((value) => value == true).length;
            this._stars.forEach((star, index) => {
                if (index < starCnt) {
                    star.getController('state').selectedIndex = 0;
                } else {
                    star.getController('state').selectedIndex = 1;
                }
            })
        }
        this._conditions = levelVo ? levelVo.conditions : [];
        this.view.failComp.listCond.numItems = this._conditions.length;

        this.view.failComp.lbTip.text = `今日剩余挑战次数：${GIns.collectiblesDungeonModel.vo.challengeCount}`;

        this.view.failComp.getTransition("enter").play();
    }

    protected onClose(dontDispose?: boolean): void {
        this.emit(NotificationKey.LOADING_VIEW_SHOW);
        this.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        G.GameTimer.clearAll(this);
    }
}