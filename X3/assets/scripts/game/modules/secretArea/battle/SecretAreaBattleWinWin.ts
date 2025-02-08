import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { HangUpUtils } from "../../hangup/utils/HangUpUtils";
import { SecretAreaManager } from "../SecretAreaManager";
import { tween, Tween } from "cc";
import { FGUIMaskUtils } from "../../../ui/common/mask/FGUIMaskUtils";
import { BattleRecordManager } from "db://assets/scripts/game/comm/battle/BattleRecordManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import GIns from "../../../GIns";
import { UICommWin, UIWinEffectType } from "../../../../core/mvc/view/UICommWin";

/**
 * 秘境 - 挑战胜利界面
 */
@bindScript(UISecretAreaKey.SecretAreaBattleWinWin)
export class SecretAreaBattleWinWin extends UICommWin {
    static pkgName: string = "secretArea";
    static viewName: string = "BattleWinWin";

    /**不可以点击背景关闭 */
    protected _canCloseByBg = false;
    /**不需要弹窗动画 */
    protected _effectType: UIWinEffectType = UIWinEffectType.None;

    private _awards;

    private _data: Vo.secretinstance.SecretInstanceChallengeVo;

    private get view(): ui.secretArea.battleView.BattleWinWin {
        return this._view as any;
    }

    protected onInit(): void {
        // FGUIMaskUtils.createBackgroundMask(this.view);
        this.view.list_award.itemRenderer = this.awardItem.bind(this);

        this.view.btnData.onClick(this.onClickBtnData, this);

        this.view.group1.alpha = 0;
        this.view.group2.alpha = 0;
        setTimeout(() => {
            this.view.bg.onClick(this.onBtnClick, this);
            this.tweenAnim();
        }, 2200);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.SECRET_INSTANCE, true);
    }

    private tweenAnim() {
        tween(this.view.group1).to(0.2, { alpha: 1 }).start();
        tween(this.view.group2).to(0.2, { alpha: 1 }).start();
    }

    protected onOpen(vo: Vo.secretinstance.SecretInstanceChallengeVo) {
        this._data = vo;
        this._awards = vo.rewardResults;
        this.view.list_award.numItems = this._awards.length;
        // 模型
        const modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
        modelNode.playOrders([
            {
                name: "unlocking1",
                isLoop: false,
            },

            {
                name: "idle1",
                isLoop: true,
            },
        ]);

        this.updateUI();
        this.cancelAllTouches();
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    private updateUI() {
        this.view.T_dieCount.text = SecretAreaManager.ins().dieCount + "";
        this.view.T_jindu.text = `第${this._data.rank}名`;
        this.view.T_time.text = TimeUtils.formatTimeMsToPositiveTimeText(this._data.seconds * 1000);
        let record = SecretAreaManager.ins().getSecondsByFloor(SecretAreaManager.ins().challengeFloor);
        if (record > this._data.seconds) {
            this.view.img_xjl.visible = true;
            SecretAreaManager.ins().setSecondsByFloor(SecretAreaManager.ins().challengeFloor, this._data.seconds);
        } else {
            this.view.img_xjl.visible = false;
        }

        this.view.T_level.text = `成功通关${GIns.secretAreaMgr.challengeFloor}层`;
    }

    private awardItem(index: number, item: ItemFrameBtn) {
        let data = this._awards[index];
        item.reset(data.baseId, data.amount);
    }

    private onBtnClick() {
        SecretAreaManager.ins().quitSecret();
        this.closeSelf();
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.group1);
        Tween.stopAllByTarget(this.view.group2);
    }
}
