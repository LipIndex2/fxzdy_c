import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import GIns from "../../../GIns";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 小地图boss奖励界面
 * 列表Item
 */
@bindFguiExtension("ui://miniMap/BossAwardItem")
export class BossAwardItem extends fgui.GComponent {
    static pkgName: string = "miniMap";
    static viewName: string = "BossAwardItem";

    private get view(): ui.miniMap.item.BossAwardItem {
        return this as any;
    }

    private _awards: any[];

    private _cfg: table.map.TrunkMapTaskConfig;

    public onInit() {
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.img_get.on(fgui.Event.CLICK, this.onClickGet, this);
        this.view.img_suo.on(fgui.Event.CLICK, this.onClickSuo, this);
    }

    public setData(cfg: table.map.TrunkMapTaskConfig) {
        if (!cfg) {
            return;
        }
        this._cfg = cfg;
        this._awards = cfg.reward;
        this.view.list_award.numItems = this._awards.length;
        this.view.img_icon.icon = cfg.icon;

        let state = GIns.miniMapMgr.getTaskState(cfg.id);
        if (state == 2) {
            this.view.getController("c1").selectedIndex = 0;
        } else {
            this.view.getController("c1").selectedIndex = 1;
        }

        let isCanGet = GIns.miniMapMgr.isTaskCanGet(this._cfg.id);
        this.view.img_get.visible = isCanGet;
    }

    private awardItemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._awards[index];
        item.reset(data.k, data.v);

        //是否已领取
        let isTrue = GIns.miniMapMgr.isTaskComplete(this._cfg.id);
        item.setHaveGain(isTrue);

        //是否可以领取
        let isCanGet = GIns.miniMapMgr.isTaskCanGet(this._cfg.id);
        if (isCanGet) {
            item.playAnim();
        } else {
            item.clearAnim();
        }
        // item.isCanClick(!isCanGet);
        // item.onClick(() => {
        //     if (isCanGet) {
        //         //领取奖励
        //         GIns.miniMapModel.sendDrawTrunkMapTaskReward(this._cfg.id);
        //     }
        // }, this);

        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Map_task, [this._cfg.id]);
    }

    private onClickGet() {
        let isCanGet = GIns.miniMapMgr.isTaskCanGet(this._cfg.id);
        if (isCanGet) {
            //领取奖励
            GIns.miniMapModel.sendDrawTrunkMapTaskReward(this._cfg.id);
        } else {
            GIns.floatingTextMgr.showTips("奖励已领取");
        }
    }

    private onClickSuo() {
        GIns.floatingTextMgr.showTips(this._cfg.tips);
    }
}
