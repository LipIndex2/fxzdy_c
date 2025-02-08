import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { tween } from "cc";
import { Tween } from "cc";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { MapInstanceManager } from "../MapInstanceManager";
import { UIMapInstanceKey } from "../const/UIMapInstanceConfig";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { TableManager } from "../../../../core/table/TableManager";
import GIns from "../../../GIns";

/**
 * 副本boss - 刷新boss
 */
@bindScript(UIMapInstanceKey.BossArriveView)
export class BossArriveView extends UIWin {
    static pkgName: string = "mapInstance";
    static viewName: string = "BossArriveView";

    private _resourceIds: number[];

    private get view(): ui.mapInstance.view.BossArriveView {
        return this._view as any;
    }

    protected onInit(): void {}

    protected onOpen(args: { title: string; resourceIds: number[] }): void {
        this._resourceIds = args.resourceIds;
        this.view.text_boss.text = args.title;

        let isBoss = this._resourceIds[0] == -1;

        let tween1 = tween(this.view.text_boss).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 });
        let tween2 = tween(this.view.boss_bg1).to(0.2, { scaleX: 0.8, scaleY: 0.8 }).to(0.2, { scaleX: 1.2, scaleY: 1.2 });
        let tween3 = tween(this.view.boss_bg2).to(0.2, { scaleX: -0.8, scaleY: 0.8 }).to(0.2, { scaleX: -1.2, scaleY: 1.2 });

        tween(this.view.text_boss).repeat(5, tween1).start();
        tween(this.view.boss_bg1).repeat(5, tween2).start();
        tween(this.view.boss_bg2).repeat(5, tween3).start();

        if (isBoss) {
            //boss才有背景
            this.view.bg.alpha = 1;
            let tween4 = tween(this.view.bg).to(0.2, { alpha: 0.8 }).to(0.2, { alpha: 1.2 });
            tween(this.view.bg).repeat(5, tween4).start();
        } else {
            this.view.bg.alpha = 0;
        }

        G.GameTimer.once(1300, this, () => {
            G.UIManager.close(UIMapInstanceKey.BossArriveView);
        });
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.text_boss);
        Tween.stopAllByTarget(this.view.boss_bg1);
        Tween.stopAllByTarget(this.view.boss_bg2);
        Tween.stopAllByTarget(this.view.bg);

        G.GameTimer.clearAll(this);

        if (this._resourceIds) {
            if (this._resourceIds[0] == -1) {
                let cfg = TableManager.getDataById(table.battle.BattleConfig, GIns.battleMgr.battleConfigId);
                //默认第一个怪id就是bossId
                let id = cfg.monsterResourceIds[0];
                MapInstanceManager.ins().createMonster([id]);
            } else {
                MapInstanceManager.ins().createMonster(this._resourceIds);
            }
        }
    }
}
