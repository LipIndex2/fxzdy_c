import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { ICollectiblesDungeonLevelVo } from "../model/vo/ICollectiblesDungeonLevelVo";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonSweepWin)
export class CollectiblesDungeonSweepWin extends UICommWin {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonSweepWin";

    protected _levelId: number;
    protected _levelVo: ICollectiblesDungeonLevelVo = null;
    protected _firstCnt: number;
    protected _rewards: { k: number, v: number }[] = [];
    protected _heroModels: ModelNode[] = [];
    protected _stars: ui.collectiblesDungeon.component.CollectiblesDungeonStar[] = [];

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonSweepWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIBLES_DUNGEON_SWEEP_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIBLES_DUNGEON_SWEEP_COMPLETE:
                if (GIns.collectiblesDungeonModel.vo.sweepCount <= 0) {
                    //没有扫荡次数 关闭界面
                    this.closeSelf();
                } else {
                    this.updateUI();
                }
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);

        this.view.btnSweep.onClick(this.onClickSweep, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected onClickSweep(): void {
        GIns.collectiblesDungeonMgr.sweep();
    }

    protected updateUI(): void {
        let curLeveld: number = GIns.collectiblesDungeonModel.maxPassLevelId;
        let levelVo: ICollectiblesDungeonLevelVo = null;
        if (curLeveld > 0) {
            levelVo = GIns.collectiblesDungeonModel.getLevelVo(curLeveld);
        }
        this.view.lbChapter.text = levelVo ? levelVo.cfg.name : '';
        this.view.lbTimes.text = GIns.collectiblesDungeonModel.vo.sweepCount + '';

        this._rewards = GIns.collectiblesDungeonModel.getSweepRewards();
        this.view.listReward.numItems = this._rewards.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}