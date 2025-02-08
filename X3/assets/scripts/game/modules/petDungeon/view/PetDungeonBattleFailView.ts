import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIView } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonBattleHeroList } from "./component/PetDungeonBattleHeroList";

@bindScript(UIPetDungeonConfig.PetDungeonBattleFailView)
export class PetDungeonBattleFailView extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonBattleFailView";

    protected _args: CommonBattleResultViewOpenArgs;
    protected _jumpIds: number[] = [];

    private get view(): ui.petDungeon.view.PetDungeonBattleFailView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
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
        this.view.failComp.pFail.listJump.itemRenderer = this.itemRendererForJump.bind(this);
        this.view.failComp.pFail.listJump.numItems = this._jumpIds.length

        // wait 4spine 动画
        G.GameTimer.once(3200, this, () => {
            if (this.view?.node?.isValid) {
                // outside
                this.view.failComp.pFail.btnData.onClick(this.onClickBattleData, this);
            }
        });
    }

    protected onPreDispose(): void {

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

    /**
     * 点击 【数据统计】
     */
    private onClickBattleData() {
        // 战斗数据
        GIns.battleRecordMgr.showRecordView(this._args.fightType, false);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args as CommonBattleResultViewOpenArgs;
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
   
        FguiScriptUtils.toMyScriptClass(this.view.failComp.heroComp, PetDungeonBattleHeroList).updateUI();
        this.view.failComp.getTransition("enter").play();
    }

    protected onClose(dontDispose?: boolean): void {
        this.emit(NotificationKey.LOADING_VIEW_SHOW);
        this.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        G.GameTimer.clearAll(this);
    }
}