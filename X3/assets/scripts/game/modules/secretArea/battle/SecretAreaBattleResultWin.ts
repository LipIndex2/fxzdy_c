import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { FGUIMaskUtils } from "../../../ui/common/mask/FGUIMaskUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { SecretAreaManager } from "../SecretAreaManager";
import { tween, Tween } from "cc";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { FightType } from "../../../comm/battle/enum/FightType";
import G from "../../../../core/comm/G";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { TableManager } from "../../../../core/table/TableManager";


/**
 * 秘境 - 挑战失败界面
 */
@bindScript(UISecretAreaKey.SecretAreaBattleResultWin)
export class SecretAreaBattleResultWin extends UICommWin {

    static pkgName: string = "secretArea";
    static viewName: string = "BattleResultWin";

    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;

    private _data: Vo.secretinstance.SecretInstanceChallengeVo;
    private jumpList: number[] = [];

    private get view(): ui.secretArea.battleView.BattleResultWin {
        return this._view as any;
    }

    protected onInit(): void {
        // FGUIMaskUtils.createBackgroundMask(this.view);
        this.view.panel.list_jump.itemRenderer = this.jumpItem.bind(this);

        this.view.panel.alpha = 0;
        this.view.group1.alpha = 0;

        setTimeout(() => {
            if (this.view?.node?.isValid) {
                this.view.bg.onClick(this.onBtnClick, this);
                this.tweenAnim();
            }
        }, 2200);


        this.view.btnData.onClick(this.onClickBtnData, this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.SECRET_INSTANCE, true);
    }

    private tweenAnim() {
        tween(this.view.group1).to(0.2, { alpha: 1 }).start();
        tween(this.view.panel).to(0.2, { alpha: 1 }).start();
    }

    protected onOpen(vo: Vo.secretinstance.SecretInstanceChallengeVo) {
        this._data = vo;

        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getFailResultSpineAssetPath());
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

        let str = TableManager.getDataById(table.map.MapConstantConfig, "MAP:INSTANCE_DEFEAT").content;
        this.jumpList = []
        for (let id of str.split(";")) {
            if (id) {
                this.jumpList.push(Number(id));
            }
        }
        this.view.panel.list_jump.numItems = this.jumpList.length;

        this.updateUI();
        this.cancelAllTouches();
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    private updateUI() {
        this.view.T_dieCount.text = SecretAreaManager.ins().dieCount + "";
        this.view.T_jindu.text = `${this._data.progress / 100}%`;
    }

    private onBtnClick() {
        SecretAreaManager.ins().quitSecret();
        this.closeSelf()
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.group1);
        Tween.stopAllByTarget(this.view.panel);
    }

    private jumpItem(index: number, item: ui.comm.btn.JumpBtn) {
        let id = this.jumpList[index];
        let jumpCfg = TableManager.getDataById(table.jump.JumpConfig, id);

        item.icon = jumpCfg.mainPage;
        item.title = jumpCfg.pageName;

        item.onClick(() => {
            G.FacadeManager.emitNow(NotificationKey.MAP_SET_LAST_BY_FIGHT_TYPE, FightType.TRUNK_MAP);
            G.UIManager.open(UIMainKey.MAIN_PAGE);
            G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, id);
        })
    }

}