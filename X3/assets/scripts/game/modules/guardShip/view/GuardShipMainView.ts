import { tween, Tween } from "cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ModelNode } from "../../common/node/ModelNode";
import { ICondition } from "../../condition/ICondition";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { GuardShipController } from "../GuardShipController";
import { GuardShipLockItem } from "./item/GuardShipLockItem";

/**
 * 守卫母舰主界面
 */
@bindScript(UIGuardShipConfig.GuardShipMainView)
export class GuardShipMainView extends UIPage {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipMainView";

    protected _starTextPosY: number = 0
    protected _curFloor: number = 0;
    protected _minFloor: number = 0;
    protected _maxFloor: number = 1;
    protected _curCfg: table.guardship.GuardShipInstanceConfig
    protected _conditions: ICondition[] = null

    private get view(): ui.guardShip.view.GuardShipMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GUARDSHIP_UPDATE_INFO,
            NotificationKey.GUARDSHIP_CHALLENGE_COMPLETE,
            NotificationKey.GUARDSHIP_SWEEP_COMPLETE,
            NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUARDSHIP_UPDATE_INFO:
                this.updateFloorRange()
                this.updateFloorUI()
                break
            case NotificationKey.GUARDSHIP_CHALLENGE_COMPLETE:
                if (args) {
                    this.setDefaultFloor()
                    this.updateBuzhen()
                }
                break
            case NotificationKey.GUARDSHIP_SWEEP_COMPLETE:
                this.updateBtns()
                break
            case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
                if (args == FightType.GUARD_SHIP) {
                    this.updateBuzhen()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        let item = GIns.guardShipModel.challengeCosts?.length > 0 ? GIns.guardShipModel.challengeCosts[0] : null
        FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem).reset(item ? item.itemId : 1, true)
        this.btnChallenge.setStyle(1)

        this.view.lbFloorCopy.visible = false;
        this.view.btnReward.onClick(this.onClickReward, this)
        this.view.btnBack.onClick(this.closeSelf, this)
        this.view.btnPrev.onClick(this.onClickPrev, this)
        this.view.btnNext.onClick(this.onClickNext, this)
        this.view.btnBuZhen.onClick(this.onClickBuzhen, this)
        this.view.btnRule.onClick(this.onClickRule, this)
        this.view.btnRank.onClick(this.onClickRank, this)
        this.view.btnChallengeFirst.onClick(this.onClickChallenge, this)
        this.view.btnChallenge.onClick(this.onClickChallenge, this)
        this.view.btnSweep.onClick(this.onClickSweep, this)

        this.view.pInfo.listFirst.setVirtual()
        this.view.pInfo.listReward.setVirtual()
        this.view.pInfo.listCondition.setVirtual()
        this.view.pInfo.listFirst.itemRenderer = this.itemRendererForFirst.bind(this)
        this.view.pInfo.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        this.view.pInfo.listCondition.itemRenderer = this.itemRendererForCondition.bind(this)
    }

    public get btnChallenge(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnChallenge, BtnChangGui1WithItem)
    }

    public get btnSweep(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnSweep, BtnChangGui1WithItem)
    }

    protected itemRendererForFirst(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._curCfg.firstRewards[index])
        item.setHaveGain(this._curCfg.id <= GIns.guardShipModel.curFloor)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._curCfg.sweepRewards[index])
    }

    protected itemRendererForCondition(index: number, item: GuardShipLockItem): void {
        item.setData(this._conditions[index])
    }

    protected onClickReward(): void {
        G.UIManager.open(UIGuardShipConfig.GuardShipRewardWin)
    }

    protected onClickPrev(): void {
        this.setFloor(this._curFloor - 1, true)
    }

    protected onClickNext(): void {
        this.setFloor(this._curFloor + 1, true)
    }

    protected onClickBuzhen(): void {
        GuardShipController.ins().setUpFormation()
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.GUARD_SHIP, this.view.btnRule)
    }

    protected onClickRank(): void {
        G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.GUARD_SHIP));
    }

    protected onClickChallenge(): void {
        GuardShipController.ins().challenge(this._curFloor)
    }

    protected onClickSweep(): void {
        GuardShipController.ins().sweep(this._curFloor)
    }

    /**层级展示范围*/
    protected updateFloorRange(): void {
        this._minFloor = GIns.guardShipModel.minFloor
        let curFloor = GIns.guardShipModel.curFloor
        this._maxFloor = Math.min(GIns.guardShipModel.maxFloor, Math.max(this._minFloor + 1, curFloor + 1))
    }

    /**层级信息刷新*/
    protected updateFloorUI(): void {
        this.view.lbFloorCopy.visible = false
        this.view.lbFloor.text = this._curCfg ? this._curCfg.name : this._curFloor + "";

        this.view.btnPrev.visible = this._curFloor > this._minFloor
        this.view.btnNext.visible = this._curFloor < this._maxFloor

        this._conditions = null
        /**通关层级限制需要手动添加上去*/
        let condtionText = []
        if (this._curCfg?.preInstanceId) {
            condtionText.push(['PASS_GUARD_SHIP_INSTANCE_FLOOR_GE',this._curCfg.preInstanceId, 0])
        }
        if (this._curCfg?.openConditions) {
            condtionText = condtionText.concat(this._curCfg?.openConditions)
        }
        this._conditions = GIns.conditionMgr.getAllConditions(condtionText)

        let isOpen = this._conditions == null || this._conditions?.find((value) => value.check() == false) == null
        if (isOpen) {
            //已解锁
            this.view.pInfo.getController('c1').selectedIndex = 0
            this.view.pInfo.listFirst.numItems = this._curCfg.firstRewards.length
            this.view.pInfo.listReward.numItems = this._curCfg.sweepRewards.length
        } else {
            this.view.pInfo.getController('c1').selectedIndex = 1
            this.view.pInfo.listCondition.numItems = this._conditions.length
        }
        this.updateBtns()
    }

    protected updateBtns(): void {
        if (this.view.pInfo.getController('c1').selectedIndex == 0) {
            //已解锁
            if (this._curFloor <= GIns.guardShipModel.curFloor) {
                //已通关
                this.view.getController('c1').selectedIndex = 2
                if (GIns.guardShipModel.freeTimes > 0) {
                    this.btnChallenge.setLbStyle(1)
                    this.btnSweep.setLbStyle(1)
                    this.btnChallenge.resetForNoItem('挑战', GIns.guardShipModel.freeIcon, 1, GIns.guardShipModel.freeTimes)
                    this.btnSweep.resetForNoItem('扫荡', GIns.guardShipModel.freeIcon, 1, GIns.guardShipModel.freeTimes)
                } else {
                    let item = GIns.guardShipModel.challengeCosts?.length > 0 ? GIns.guardShipModel.challengeCosts[0] : null
                    this.btnChallenge.setLbStyle(0)
                    this.btnSweep.setLbStyle(0)
                    this.btnChallenge.reset('挑战', item)
                    this.btnSweep.reset('扫荡', item)
                }
            } else {
                this.view.getController('c1').selectedIndex = 1
            }
        } else {
            this.view.getController('c1').selectedIndex = 0
        }
        FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem).resetByNoItem(GIns.guardShipModel.freeIcon, GIns.guardShipModel.freeTimes, false)
    }

    protected updateBuzhen(): void {
        let formation = GIns.formationMgr.getFormationVoByType(FightType.GUARD_SHIP)
        for (let i = 1; i <= 6; i++) {
            let modelNode = this.view.heros.getChild('pos' + i) as ModelNode
            let shadow = this.view.heros.getChild('shadow' + i)
            if (modelNode) {
                let posVo = formation.getPosDataById(i)
                if (posVo && posVo.heroId) {
                    let heroVo = GIns.heroMgr.getHeroVoByID(posVo.heroId)
                    if (heroVo) {
                        modelNode.visible = true
                        shadow.visible = true
                        modelNode.loadByModelId(heroVo.showModelId)
                        continue
                    }
                }
                modelNode.visible = false
                shadow.visible = false
            }
        }
    }

    protected setDefaultFloor(): void {
        this._curFloor = 0
        this.updateFloorRange()
        let floor = GIns.guardShipModel.curFloor > 0 ? GIns.guardShipModel.curFloor + 1 : this._minFloor
        if (floor > this._maxFloor) {
            floor = this._maxFloor
        }
        this.setFloor(floor)
    }

    protected setFloor(floor: number, withAni: boolean = false): void {
        if (this._curFloor != floor && floor >= this._minFloor && floor <= this._maxFloor) {
            let isNext = this._curFloor < floor
            this._curFloor = floor
            this._curCfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, this._curFloor)
            if (withAni) {
                if (!this._starTextPosY) this._starTextPosY = this.view.lbFloor.y;
                this.view.lbFloorCopy.visible = true;
                if (isNext) {
                    //下一关, 往上翻
                    let preCfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, this._curFloor - 1)
                    this.view.lbFloorCopy.y = this._starTextPosY + 50;
                    this.view.lbFloor.alpha = 0;
                    this.view.lbFloorCopy.text = this._curCfg ? this._curCfg.name : this._curFloor + "";
                    this.view.lbFloor.text = preCfg ? preCfg.name : this._curFloor - 1 + "";
                    tween(this.view.lbFloor).to(0.1, { y: this._starTextPosY - 50, alpha: 0 }).call(() => {
                        this.view.lbFloorCopy.alpha = 0;
                        this.view.lbFloor.y = this._starTextPosY;
                        this.view.lbFloor.alpha = 1;
                        this.updateFloorUI();
                    }).start();
                    tween(this.view.lbFloorCopy).to(0.1, { y: this._starTextPosY, alpha: 1 }).start();

                } else {
                    //上一关， 往下翻
                    let nextCfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, this._curFloor + 1)
                    this.view.lbFloorCopy.y = this._starTextPosY - 50;
                    this.view.lbFloorCopy.alpha = 0;
                    this.view.lbFloorCopy.text = this._curCfg ? this._curCfg.name : this._curFloor + "";
                    this.view.lbFloor.text = nextCfg ? nextCfg.name : this._curFloor + 1 + "";
                    tween(this.view.lbFloor).to(0.1, { y: this._starTextPosY + 50, alpha: 0 }).call(() => {
                        this.view.lbFloorCopy.alpha = 0;
                        this.view.lbFloor.y = this._starTextPosY;
                        this.view.lbFloor.alpha = 1;
                        this.updateFloorUI();
                    }).start();
                    tween(this.view.lbFloorCopy).to(0.1, { y: this._starTextPosY, alpha: 1 }).start();
                }
            } else {
                this.updateFloorUI()
            }
        }
    }

    protected onTimer(): void {
        let endTime = GIns.guardShipModel.endTime - G.TimeManager.serverNow
        const timeText = TimeUtils.formatTimeMsToDayHourMinuteSecondText(endTime)
        this.view.lbTime.text = `${timeText}后结算`
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._curFloor == 0) {
            this.setDefaultFloor()
            this.updateBuzhen()
        }

        G.GameTimer.loop(500, this, this.onTimer)
        this.onTimer()
        GIns.guardShipModel.sendLoadGuardShipInfo()
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this)
        Tween.stopAllByTarget(this.view.lbFloor)
        Tween.stopAllByTarget(this.view.lbFloorCopy)
    }
}