import UIScriptManager, { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../../core/mvc/view/UIWin";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { BattleRecordManager } from "../../../../comm/battle/BattleRecordManager";
import { FGUIMaskUtils } from "../../../../ui/common/mask/FGUIMaskUtils";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { ModelNode } from "../../../common/node/ModelNode";
import { HangUpUtils } from "../../../hangup/utils/HangUpUtils";
import { SecretAreaManager } from "../../../secretArea/SecretAreaManager";
import { SecretSeasonManager } from "../../seasonSecret/SecretSeasonManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { SeasonManager } from "../../SeasonManager";
import { ItemListComp2 } from "../../../common/item/ItemListComp2";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { SeasonBossProCom } from "../com/SeasonBossProCom";
import { SeasonConfigManager } from "../../SeasonConfigManager";
import { SeasonBossBattleResultViewOpenArgs } from "../interface/ISeasonBossArgs";
import { SeasonBossVo } from "../../vo/SeasonBossVo";
import { TaskState } from "../../EnumSeason";
import G from "../../../../../core/comm/G";
import NotificationKey from "../../../../event/NotificationKey";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import { GameTimer } from "../../../../../core/timer/GameTimer";
import { IconItem } from "../../../common/item/IconItem";
import RandomUtils from "../../../../../core/utils/RandomUtils";
import { NodeUtils } from "../../../../../core/utils/NodeUtils";
import { math, Node, Tween, tween, v3, Vec2 } from "cc";


/**
 * 赛季boss - 挑战结算界面
 */
export class SeasonBossResultView extends UICommWin {

    static pkgName: string = "seasonBoss";
    static viewName: string = "SeasonBossResultView";

    private _data:SeasonBossBattleResultViewOpenArgs;
    private _isWin: boolean = false;

    private _animTimeKey: string
    //已领
    private _indexForConfig: number = -1;
    private _initIndex:number = -1;

    private _bossRewards: {
                hp: number;
                rewards: Array<{
                    k: any;
                    v: any;
                }>;
                id: number;
            }[];

    private _tweenForBackpack: Tween<Node>

    private get view(): ui.seasonBoss.SeasonBossResultView {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.btnData.onClick(this.onClickBtnData, this);
        this.view.btnBackpack.visible = false;

        this.view.itemListRecord.setVirtual();
        this.view.itemListRecord.itemRenderer = this.itemRendererForProgressGrid.bind(this);
    }

    onClickBtnData() {
        BattleRecordManager.ins().showRecordView(ServerEnums.FightType.SEASON_BOSS, this._isWin);
    }
    

    protected onOpen(vo: SeasonBossBattleResultViewOpenArgs) {
        this._data = vo;
        const isWin = vo.winFlag;
        this._isWin = isWin;
        // 模型
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
                this._animTimeKey = null
                this.tryNextGainRewardFlyAni();
            });

        this.updateUI();
    }

    itemRendererForProgressGrid(index: number, comp: SeasonBossProCom) {
        const bossCfg = this._bossRewards[index];
        if (index <= this._initIndex) {
            comp.reset(bossCfg, TaskState.FINISH);
        }else{
            comp.reset(bossCfg, TaskState.ING);
        }
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }


    private updateUI() {
        const t = this;
        const data = t._data;
        if(data){
            t.view.lbRank.text = data.rank && data.rank > 0 ? data.rank+'' : '未上榜';
            t.view.lbValue.text = StringUtils.numShortToKM(data.hurt) + '';
            t.view.imgRank.visible = data.isNewR && !data.simulated;
            t.view.imgValue.visible = data.isNewH && !data.simulated;
        }

        const bossCfgId = data.bossConfigId;
        const challengeRewards = SeasonConfigManager.getBossCfgById(bossCfgId)?.challengeRewards;

        if(data.simulated){
            t.view.G1.visible = t.view.G2.visible = false;
        }else{
            t.view.G1.visible = t.view.G2.visible = true;
          const items1 = ItemUtils.parseKvArrayToItemArray(challengeRewards || []);
          FguiScriptUtils.toMyScriptClass(t.view.itemList1, ItemListComp2).reset(items1);
          t._bossRewards = SeasonConfigManager.getBossRewards();
          t._indexForConfig = t._bossRewards.findIndex(v=>{
            return v.id == this._data.oldProgressRewardId;
          })
          this._initIndex = t._indexForConfig;

          t.view.itemListRecord.numItems = t._bossRewards.length;
          if(this._indexForConfig > 0){
            this.view.itemListRecord.scrollToView(this._indexForConfig, false, true);
          }
          
        }
    }


    private tryGainRewardFlyAnimGridByGrid() {
        const progressRewardId = this._data.progressRewardId;
        if(progressRewardId < 0){
            this.endGainRewardFlyAni()
            return;
        }
        if (!this._bossRewards) {
            this.endGainRewardFlyAni()
            return;
        }

        const config = this._bossRewards[this._indexForConfig]
        if (!config) {
            this.endGainRewardFlyAni()
            return;
        }
        // reach ? 

        const showProgress = config.id;
        let isReach = progressRewardId >= showProgress;
        //已经到达了，退出
      
        if (!isReach) {
            this.view.itemListRecord.scrollToView(this._indexForConfig, true, true);
            this.endGainRewardFlyAni()
            return;
        }

        const item = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards);
        if (!item) {
            this.tryNextGainRewardFlyAni()
            return;
        }
        this.view.btnBackpack.visible = true;
        this.view.itemListRecord.scrollToView(this._indexForConfig, true, true);
        this._initIndex = this._indexForConfig;
        // 飞奖励动画
        const flyCount = math.clamp(item.count, 1, 1);
        for (let i = 0; i < flyCount; i++) {
            const childIndex = this.view.itemListRecord.itemIndexToChildIndex(this._indexForConfig);
            const gridComp = this.view.itemListRecord.getChildAt(childIndex) as SeasonBossProCom;
            if (!gridComp) {
                // 没找到子节点
                console.warn(`can not find gridComp at index ${this._indexForConfig}`);
                continue;
            }

            const flyItemComp = fgui.UIPackage.createObject("comm", "IconItem") as IconItem;
            // 大图标, 缩小先
            flyItemComp.setIcon(item.getIconPath());

            this.view.addChild(flyItemComp);


            const v2 = gridComp.getRewardWorldPos();
            const durationS = 1;
            flyItemComp.x = v2.x
            flyItemComp.y = v2.y
            const randomLen = RandomUtils.random(-20, 20);
            flyItemComp.flyByBezierCurvePath(
                this.view.flyPos1.node.position.clone().add3f(randomLen, randomLen, 0),
                this.view.btnBackpack.node.position.clone(),
                durationS
            );
            GameTimer.ins().once(durationS, this, () => {
                this.onBackpackGainItem();
            });
        }
        this._initIndex = this._indexForConfig;
        this.view.itemListRecord.refreshVirtualList();
        // TODO 播放飞奖励动画
        this._animTimeKey = G.GameTimer.once(200, this, this.tryNextGainRewardFlyAni);
    }

    protected tryNextGainRewardFlyAni(): void {
        this._indexForConfig++;
        this.tryGainRewardFlyAnimGridByGrid()
    }

    private onBackpackGainItem() {
        if (NodeUtils.isNotValidNode(this.view.node)) {
            return;
        }

        this._tweenForBackpack?.stop();
        const oldScale = v3(1, 1, 1);
        this.view.btnBackpack.node.scale = oldScale;
        this._tweenForBackpack = tween(this.view.btnBackpack.node)
            .to(0.2, { scale: v3(1.2, 1.2, 1) })
            .to(0.2, { scale: oldScale })
            .start();

    }

    protected endGainRewardFlyAni(): void {
        if (this._animTimeKey) {
            GameTimer.ins().clearByKey(this._animTimeKey);
        }
        // this.view.itemListRecord.refreshVirtualList();
    }

    protected onClose(): void {
        const t = this;
        t._tweenForBackpack?.stop();
        G.GameTimer.clearAll(t);
        // 关闭战斗
        G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
        super.onClose();
    }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonBossResultView, SeasonBossResultView);