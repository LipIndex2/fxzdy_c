import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ActivityGirlGroupVo } from "../../activity/model/ActivityGirlGroupVo";
import { ModelNode } from "../../common/node/ModelNode";
import G from "../../../../core/comm/G";
import { HeroModItem } from "../item/heroModItem";
import { tween } from "cc";
import { Tween } from "cc";

/**
 * 女团
 * 女团展示区
 */
@bindFguiExtension("ui://girlGroup/GirlGroupPlayerPage")
export class GirlGroupPlayerPage extends fgui.GComponent {
    static pkgName: string = "girlGroup";
    static viewName: string = "GirlGroupPlayerPage";

    private get view(): ui.girlGroup.page.GirlGroupPlayerPage {
        return this as any;
    }
    //活动Vo
    private _vo: ActivityGirlGroupVo;
    private _cfgs: table.activity.GirlGroup.GirlGroupModelConfig[];

    // x 坐标
    private _xCenter: number = 0;
    private _scrollX: number = 0;

    //主角index
    private _heroIndex: number = 2;

    private _time = 0;

    onInit() {
        this.view.list_mod.itemRenderer = this.playerItemRender.bind(this);

        this.view.list_mod.on(fgui.Event.SCROLL, this.onScroll, this);
        this.view.list_mod.on(fgui.Event.SCROLL_END, this.onScrollEnd, this);

        this._xCenter = this.view.T_mainName.node.worldPosition.x;
    }

    //刷新显示
    public updateUI(vo: ActivityGirlGroupVo) {
        if (this._vo && this._vo.activityId == vo.activityId) return;
        this._vo = vo;
        this._cfgs = this._vo.showModelCfgs;

        this.view.list_mod.numItems = this._cfgs.length;

        //角色名
        this.view.T_mainName.text = `${this._cfgs[this._heroIndex].name}`;

        if (this._cfgs.length > 2) {
            this.view.list_mod.setVirtualAndLoop();
        } else {
            this.view.list_mod.setVirtual();
        }

        this._time = +TableManager.getDataById(table.activity.GirlGroup.GirlGroupConstantConfig, "GIRLGROUP:SHOW_MODEL_TIME").content;
        G.GameTimer.loop(this._time, this, () => {
            this.showPlayerMod();
        });

        // 循环列表不知道为什么第一次渲染item显示不出来，要重新加载一遍列表才出现
        G.GameTimer.once(200, this, () => {
            this.view.list_mod.numItems = this._cfgs.length;
            this._scrollX = this.view.list_mod.scrollPane.scrollingPosX;
            this.view.list_mod.refreshVirtualList();
        });
    }

    private showPlayerMod() {
        this.view.list_mod.scrollPane.scrollRight(0.5875, true);
    }

    public setChooseRankIndex(cfg: table.activity.GirlGroup.GirlGroupModelConfig) {
        this.view.T_mainName.text = cfg.name;
        //角色对话
        let rend = Math.random() * cfg.dialogs.length;
        this.view.dialogItem.T_dialog.text = cfg.dialogs[Math.floor(rend)];
        this.view.dialogItem.img_dialog.width = this.view.dialogItem.T_dialog.width + 10;
    }

    private playerItemRender(index: number, item: HeroModItem) {
        let cfg = this._cfgs[index];
        item.reset(index, cfg, this, this._xCenter, this._scrollX);
    }

    private onScroll() {
        this._scrollX = this.view.list_mod.scrollPane.scrollingPosX;
        this.view.list_mod.refreshVirtualList();
        this.view.dialogItem.visible = false;

        //scrollEnd事件，滑动之后可能会出现不触发的情况
        this.isShow = false;
        let self = this;
        G.GameTimer.clearAll(this);
        G.GameTimer.once(100, this, () => {
            if (!self.isShow) {
                self.onScrollEnd();
            }
        });
    }

    private isShow = false;
    private onScrollEnd() {
        this.isShow = true;
        let self = this;
        this.view.dialogItem.scaleX = 0;
        this.view.dialogItem.scaleY = 0;
        this.view.dialogItem.visible = true;
        tween(this.view.dialogItem).to(0.1, { scaleY: 1, scaleX: 1 }).start();
        G.GameTimer.loop(self._time, self, () => {
            self.showPlayerMod();
        });
    }

    public onPreDispose(): void {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this.view.dialogItem);
    }
}
