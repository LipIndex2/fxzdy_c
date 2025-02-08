import { tween } from "cc";
import UIScriptManager, { bindScript } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { BattleRecordManager } from "../../../../comm/battle/BattleRecordManager";
import { FGUIMaskUtils } from "../../../../ui/common/mask/FGUIMaskUtils";
import { UISecretAreaKey } from "../../../secretArea/const/UISecretAreaConfig";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { ModelNode } from "../../../common/node/ModelNode";
import { HangUpUtils } from "../../../hangup/utils/HangUpUtils";
import { SecretAreaManager } from "../../../secretArea/SecretAreaManager";
import { Tween } from "cc";
import { SecretSeasonManager } from "../SecretSeasonManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { SeasonManager } from "../../SeasonManager";
import { SeasonReachVo } from "../../vo/SeasonReachVo";
import { SeasonSecretVo } from "../../vo/SeasonSecretVo";
import { ItemListComp2 } from "../../../common/item/ItemListComp2";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import G from "../../../../../core/comm/G";
import NotificationKey from "../../../../event/NotificationKey";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { SeasonConfigManager } from "../../SeasonConfigManager";

/**
 * 秘境 - 挑战失败界面
 */
export class SeasonSecretResultView extends UICommWin {

    static pkgName: string = "seasonSecret";
    static viewName: string = "SeasonSecretResultView";

    private _data:Vo.seasonactivity.SeasonSecretChallengeResultVo;

    private get view(): ui.seasonSecret.SeasonSecretResultView {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.btnData.onClick(this.onClickBtnData, this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.SEASON_SECRET, true);
    }
    

    protected onOpen(vo: Vo.seasonactivity.SeasonSecretChallengeResultVo) {
        this._data = vo;
        // 模型
        const isWin = vo.win;
        const modelNode = this.view.modelNode as ModelNode;
        if (isWin) {
            modelNode.loadByPath(HangUpUtils.getWinResultSpineAssetPath());
            modelNode.playOrders(
                [
                    {
                        name: "unlocking1",
                        isLoop: false
                    },
                    {
                        name: "idle1",
                        isLoop: true
                    },
                ]
            );
        } else {
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
        }

        this.view.getTransition("enter")
            .play(() => {
                
            });
        this.updateUI();
    }

 

    private updateUI() {
        const t = this;
        const svo = SeasonManager.ins().getSubActityVo(t._data.subActivityId) as SeasonSecretVo;
        if(svo){
            const mgr = svo.Mgr;
            if(this._data.rank <= 0){
                this.view.lbRank.text = '未上榜'
                this.view.imgRank.visible = false;
            }else{
                this.view.lbRank.text = this._data.rank+'';
                if(this._data['rank'] < mgr.rank){
                    mgr.rank = this._data.rank;
                    this.view.imgValue.visible = true;
                }else{
                    this.view.imgValue.visible = false;
                }
            }

            if(this._data.battleSeconds <= 0 || !this._data.win){
                this.view.lbValue.text = '未通关'
                this.view.imgValue.visible = false;
            }else{
                const str = this._data?.scoreNum?this._data?.scoreNum:TimeUtils.formatTimeMsToLevelTimeText(this._data.battleSeconds * 1000);
                this.view.lbValue.text = str +''; //
            }

            const cfg = SeasonConfigManager.getSecretConfig(this._data.secretConfigId);
            let record = mgr.getSecondsByFloor(mgr.challengeFloor);
            if ((!record || record > this._data.battleSeconds || (record < 0 && this._data.battleSeconds > 0))&&this._data.win) {
                this.view.imgValue.visible = true;
                mgr.setSecondsByFloor(cfg?.floor, this._data.battleSeconds);
            } else {
                this.view.imgValue.visible = false;
            }


            this.view.title.text = `${cfg?.name}`;
        }

        if(t._data?.firstRewardResults && t._data?.firstRewardResults?.length > 0){
            //如果是首通
            t.view.firstG.visible = true;
            // t.view.normalG.y = 953;
        }else{
            t.view.firstG.visible = false; 
            t.view.normalG.y = this.view.firstG.y;
            // t.view.normalG.y = 712;
        }

        const items1 = ItemUtils.parseServerRewardToItems(t._data?.firstRewardResults || []);
        FguiScriptUtils.toMyScriptClass(t.view.itemList1, ItemListComp2).reset(items1);

        const items2 = ItemUtils.parseServerRewardToItems(t._data?.challengeRewardResults || []);
        FguiScriptUtils.toMyScriptClass(t.view.itemList2, ItemListComp2).reset(items2);

        const dailyChallengeRewardTimes = t._data.dailyChallengeRewardTimes;
        const limit = svo.Mgr.dailyChallengeRewardsLimit;
        if(!t._data?.challengeRewardResults || t._data?.challengeRewardResults.length == 0){
            t.view.normalG.visible = false;
        }else{
            t.view.title3.text = `今日已领取挑战奖励次数${dailyChallengeRewardTimes}/${limit}`
        }
        

    }
    protected onClose(): void {
        G.GameTimer.clearAll(this);
        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.SEASON_SECRET_UPDATE);
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        super.onClose();
    }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonSecretResultView, SeasonSecretResultView);