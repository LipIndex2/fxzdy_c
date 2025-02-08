import G from "db://assets/scripts/core/comm/G";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import {
    CommonBattleResultViewOpenArgs
} from "db://assets/scripts/game/modules/battle/args/CommonBattleResultViewOpenArgs";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { FightType } from "../../../comm/battle/enum/FightType";
import GIns from "../../../GIns";

/**
 * 通用失败
 */
@bindScript(UICommonKey.CommonBattleResultFailView)
export class CommonBattleResultFailView extends UICommWin {
    static pkgName: string = "commBattle";
    static viewName: string = "CommonBattleResultFailView";

    private _args: CommonBattleResultViewOpenArgs;
    protected _jumpIds: number[] = []

    private get view(): ui.commBattle.battle.CommonBattleResultFailView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ")

        //读取跳转列表
        let str = G.TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_DEFEAT")?.content;
        let list = [];
        for (let id of str.split(";")) {
            if (id) {
                list.push(Number(id));
            }
        }
        this._jumpIds = list

        // 跳转
        this.view.panel.listJump.itemRenderer = this.itemRendererForJump.bind(this);
        this.view.panel.listJump.numItems = this._jumpIds.length

        // wait 4spine 动画
        G.GameTimer.once(3200, this, () => {
            if (this.view?.node?.isValid) {
                // outside
                this.view.panel.btnData.onClick(this.onClickBattleData0, this);
            }
        });
    }

    protected itemRendererForJump(index: number, item: ui.comm.btn.JumpBtn): void {
        let id = this._jumpIds[index];
        let jumpCfg = G.TableManager.getDataById(table.jump.JumpConfig, id);

        item.icon = jumpCfg.mainPage;
        item.title = jumpCfg.pageName;

        item.onClick(() => {
            // this.closeSelf();
            G.FacadeManager.emitNow(NotificationKey.MAP_SET_LAST_BY_FIGHT_TYPE, FightType.TRUNK_MAP);
            G.UIManager.open(UIMainKey.MAIN_PAGE);
            G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, id);
        })
    }

    protected onOpen(args: CommonBattleResultViewOpenArgs) {
        // 模型
        const modelNode = this.view.modelNode as ModelNode;
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
        this._args = args;

        this.view.getTransition("enter").play();

        if (this._args.fightType == FightType.LEAGUE_EXPLORE) {
            //勘探需要展示失败惩罚时间
            let timeHour = Math.floor(GIns.leagueExploreModel.constCfg.failContinueFightCdSeconds / 3600)
            this.view.lbLeagueTip.text = `对方防守成功，${timeHour}小时内无法主动发起进攻`;
        }
    }

    onClose() {
        G.Logger.debug(" onClose ")
        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);

        G.GameTimer.clearAll(this);
    }

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData0() {
        G.Logger.debug(" onClickNextLevel0 ")
        // 战斗数据
        BattleRecordManager.ins().showRecordView(this._args.fightType, false);
    }
}