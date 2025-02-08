import { tween, Tween, UITransform } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView } from "../../../../core/mvc/view/UIView";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import type { HeaderItem } from "../../common/header/HeaderItem";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EventClickItem } from "../../item/event/EventClickItem";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { SecretAreaManager } from "../SecretAreaManager";
import { SecretAreaModule } from "../SecretAreaModule";
import { SecretAreaConfigManager } from "../config/SecretAreaConfigManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import { SecretAreaMainPage } from "../page/SecretAreaMainPage";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";


/**
 * 奇点秘境
 * 主界面
 */
@bindScript(UISecretAreaKey.SecretAreaMainView)
export class SecretAreaMainView extends UIView {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaMainView";

    //当前显示层数
    private _level: number;
    private _cfg: table.secretinstance.SecretInstanceConfig;

    /** 当前显示的门票 */
    private _costItem: Readonly<NoOwnerItem>;

    private _sweepOpenMaxSeconds: number

    private get view(): ui.secretArea.view.SecretAreaMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SECRET_AREA_UPDATE_INFO,
            NotificationKey.SECRET_AREA_CHALLENGE_UPDATE,
            NotificationKey.SECRET_AREA_SWEEP,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SECRET_AREA_UPDATE_INFO:
            case NotificationKey.SECRET_AREA_SWEEP:
                this.updateUI();
                break;
            case NotificationKey.SECRET_AREA_CHALLENGE_UPDATE:
                this._level = SecretAreaManager.ins().level + 1;
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        let view = this.view;
        view.btn_close.on(fgui.Event.CLICK, this.closeSelf, this);
        view.infoPanel.btn_challenge.on(fgui.Event.CLICK, () => {
            this.onChallenge(true);
        });
        view.infoPanel.btn_firstChallenge.on(fgui.Event.CLICK, () => {
            this.onChallenge(false);
        });
        view.infoPanel.btn_sweep.on(fgui.Event.CLICK, this.onSweep, this);
        view.btn_rank.on(fgui.Event.CLICK, this.onRank, this);


        view.infoPanel.btn_cantSweep.onClick(this.onSweep, this);
        this._sweepOpenMaxSeconds = SecretAreaConfigManager.sweepOpenMaxSeconds;
        let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond3(this._sweepOpenMaxSeconds * 1000);
        view.infoPanel.btn_cantSweep.lbTip.text = `${timeStr}内通关开启`;

        view.dailyTicket.onClick((event: fgui.Event) => {
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                GIns.secretAreaMgr.dailyCostItem.getItemConfig(),
                view.dailyTicket.node.getComponent(UITransform)
            ));

        });
        view.extraticket.onClick((event: fgui.Event) => {
            GIns.secretAreaMgr.extraCostItem
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                GIns.secretAreaMgr.extraCostItem.getItemConfig(),
                view.extraticket.node.getComponent(UITransform)
            ));
        });

        this.view.infoPanel.unlockPage.list.itemRenderer = this.renderDropCond.bind(this);

        view.btn_jtL.on(fgui.Event.CLICK, this.onSelClick, this);
        view.btn_jtR.on(fgui.Event.CLICK, this.onSelClick, this);
        view.btn_gth.onClick(this.onClickRule, this)
        view.getTransition("t0").play();
        view.infoPanel.getTransition("t0").play();

        (this.view.infoPanel.btn_challenge as any as BtnChangGui1WithItem).setLbStyle(1);
        (this.view.infoPanel.btn_sweep as any as BtnChangGui1WithItem).setLbStyle(1);

        this.view.infoPanel.btnAd.onClick(this.onClickAd, this);
    }

    protected onClickAd(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.SECRET_INSTANCE,
            extra: this._level
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    protected onOpen(args: any): void {
        // this.updateUI();
        SecretAreaModule.ins().sendLoadSecretInstanceInfo();

        if (GIns.secretAreaMgr.showUnlockAni) {
            GIns.secretAreaMgr.showUnlockAni = false
            G.UIManager.open(UISecretAreaKey.SecretAreaUnlockWin);
        }
    }

    private updateUI() {
        let view = this.view;
        let { secretAreaMgr } = GIns;
        let curPassLvevl = secretAreaMgr.level;
        if (!this._level) this._level = curPassLvevl + 1;
        view.T_level2.alpha = 0;
        this._cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, this._level);
        if (!this._cfg) {
            this._cfg = TableManager.getDataById(table.secretinstance.SecretInstanceConfig, this._level - 1);
            this._level = curPassLvevl;
        }


        //通关状态
        let chgTypeCtr = view.getController("chgType");
        //时间内通关状态
        let timeLimitCtr = view.infoPanel.getController("timeLimit");
        let isPassFloor = secretAreaMgr.isPassFloor(this._level);
        if (isPassFloor) {
            //已通关
            chgTypeCtr.selectedIndex = 2;
            (view.infoPanel.dropPage as any as SecretAreaMainPage).updateData(this._cfg.id);

            let passTime = GIns.secretAreaMgr.getSecondsByFloor(this._level);
            if (passTime <= this._sweepOpenMaxSeconds) {
                timeLimitCtr.selectedIndex = 1;
            } else {
                timeLimitCtr.selectedIndex = 0;
            }
        } else {
            let isLock = GIns.secretAreaMgr.getFloorIsLock(this._level);
            if (isLock) {
                //锁定
                chgTypeCtr.selectedIndex = 0;
                this.updateUnlockList();
            } else {
                //挑战中
                chgTypeCtr.selectedIndex = 1;
                (view.infoPanel.dropPage as any as SecretAreaMainPage).updateData(this._cfg.id);
            }
        }

        this.selLevel();

        let nextLevel = curPassLvevl + 1
        if (GIns.redDotMgr.isHaveRedDot(RedDotKeys.Secret_new_floor, [nextLevel])) {
            GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Secret_new_floor, [nextLevel])
        }
        FguiScriptUtils.toMyScriptClass(view.redDot, RedDotCom).reset(RedDotKeys.Secret_new_floor, [nextLevel])


        //门票消耗优先级为[每日门票]>[额外门票]
        let { dailyCostItem, extraCostItem } = GIns.secretAreaMgr;
        if (dailyCostItem.isCanPay()) {
            this._costItem = dailyCostItem;
        } else {
            this._costItem = extraCostItem;
        }
        (view.dailyTicket.ticket as unknown as HeaderItem).reset(dailyCostItem.itemId, true);
        (view.extraticket.ticket as unknown as HeaderItem).reset(extraCostItem.itemId, true);

        //挑战秘境按钮
        let btnChallengeComp = view.infoPanel.btn_challenge as any as BtnChangGui1WithItem;
        btnChallengeComp.reset(btnChallengeComp.title, NoOwnerItem.create(this._costItem.itemId, this._costItem.count));

        //扫荡秘境按钮
        let btnSweep = view.infoPanel.btn_sweep as any as BtnChangGui1WithItem;
        btnSweep.reset(btnSweep.title, NoOwnerItem.create(this._costItem.itemId, this._costItem.count));


        let remainTimes: number = GIns.adModel.getRemainAdTimes(secretAreaMgr.todaySweepAdvertTimes, ServerEnums.AdvertType.SECRET_INSTANCE);
        let leftRedDot = FguiScriptUtils.toMyScriptClass(this.view.btn_jtL.redDot, RedDotCom);
        let rightRedDot = FguiScriptUtils.toMyScriptClass(this.view.btn_jtR.redDot, RedDotCom);
        if (remainTimes > 0) {
            //有广告次数是判断红点展示

            let isCanSweep: boolean = secretAreaMgr.isLevelCanSweep(this._level);
            if (isCanSweep) {
                //当前可扫荡
                this.view.infoPanel.btnAd.visible = true;
                this.view.infoPanel.btnAd.iconTop.icon = this._costItem?.getItemSmallIconPath();
                this.view.infoPanel.btnAd.title = `免费扫荡${remainTimes}/${GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.SECRET_INSTANCE)}`;
                leftRedDot.showByType(EnumRedDotShowType.NULL);
                rightRedDot.showByType(EnumRedDotShowType.NULL);
                FguiScriptUtils.toMyScriptClass(this.view.infoPanel.btnAd.redDot, RedDotCom).showByType(EnumRedDotShowType.REWARD);
                GIns.redDotMgr.markRead(EnumRedDotReadType.TODAY_ONCE, RedDotKeys.Secret_sweepAd);
            } else {
                //当前不可扫荡 就需要判断前面和后面的层级是否可扫荡
                this.view.infoPanel.btnAd.visible = false;
                if (this.view.btn_jtL.visible) {
                    //有上一页
                    if (secretAreaMgr.hasCanSweepForRange(1, this._level - 1)) {
                        leftRedDot.showByType(EnumRedDotShowType.REWARD);
                    } else {
                        leftRedDot.showByType(EnumRedDotShowType.NULL);
                    }
                }
                if (this.view.btn_jtR.visible) {
                    //有下一页
                    if (secretAreaMgr.hasCanSweepForRange(this._level + 1, secretAreaMgr.level)) {
                        rightRedDot.showByType(EnumRedDotShowType.REWARD);
                    } else {
                        rightRedDot.showByType(EnumRedDotShowType.NULL);
                    }
                }
            }
        } else {
            this.view.infoPanel.btnAd.visible = false;
            leftRedDot.showByType(EnumRedDotShowType.NULL);
            rightRedDot.showByType(EnumRedDotShowType.NULL);
        }
    }

    /**层数是否可扫荡*/
    protected isLevelCanSweep(level: number): boolean {
        let isPassFloor = GIns.secretAreaMgr.isPassFloor(this._level);
        if (isPassFloor) {
            let passTime = GIns.secretAreaMgr.getSecondsByFloor(this._level);
            if (passTime <= this._sweepOpenMaxSeconds) {
                return true;
            }
        }
        return false;
    }

    private updateUnlockList() {
        this.view.infoPanel.unlockPage.list.numItems = 2;
    }

    private renderDropCond(index: number, item: ui.secretArea.item.unlockCondition) {
        let idx = 0;
        if (index == 0) {
            item.T_cond.text = "通关上一难度";
            if (this._level === 1) {
                idx = 1;
            } else {
                let isPassFloor = GIns.secretAreaMgr.isPassFloor(this._level - 1);
                idx = isPassFloor ? 1 : 0;
            }
        } else if (index == 1) {
            item.T_cond.text = `共鸣等级达到${this._cfg.level}`;
            let lv = GIns.formationMgr.getCommonLevel();
            if (lv >= this._cfg.level) {
                idx = 1;
            }
        }
        item.getController("lockState").selectedIndex = idx;

    }

    //关卡选择item
    private selLevel() {
        this.view.T_level.text = this._cfg.id + "";
        this.view.T_factor.text = ServerEnums.SecretInstanceType[this._cfg.type] == ServerEnums.SecretInstanceType.NORMAL ? "普通难度" : "地狱难度";
        this.view.T_add.visible = ServerEnums.SecretInstanceType[this._cfg.type] == ServerEnums.SecretInstanceType.DIFFICULT;
        this.view.btn_jtL.visible = SecretAreaManager.ins().isCanSel(this._cfg.id, -1) ? true : false;

        if (SecretAreaManager.ins().isCanSel(this._cfg.id, 1)) {
            if (this.rbuttonCanNext()) {
                this.view.btn_jtR.visible = true;
                this.view.btn_jtR.grayed = false;
            } else {
                this.view.btn_jtR.visible = false;
                // this.view.btn_jtR.grayed = true;
            }
        } else {
            this.view.btn_jtR.visible = false;
        }
    }

    private onSelClick(evt: any) {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_jtL":
                this._level -= 1;
                this.selAnim(false)
                break;
            case "btn_jtR":
                if (this.rbuttonCanNext() == false) {
                    GIns.floatingTextMgr.showTips("需要通关本层后可查看！");
                } else {
                    this._level += 1;
                    this.selAnim(true)
                }
                break;
        }


    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.SECRET_AREA, this.view.btn_gth)
    }


    private _starTextPosY: number;

    private selAnim(isNext: boolean) {
        if (!this._starTextPosY) this._starTextPosY = this.view.T_level.y;
        this.view.T_level2.visible = true;
        if (isNext) {
            //下一关, 往上翻
            this.view.T_level2.y = this._starTextPosY + 50;
            this.view.T_level2.alpha = 0;
            this.view.T_level2.text = this._level + "";
            this.view.T_level.text = (this._level - 1) + "";
            tween(this.view.T_level).to(0.1, { y: this._starTextPosY - 50, alpha: 0 }).call(() => {
                this.view.T_level2.alpha = 0;
                this.view.T_level.y = this._starTextPosY;
                this.view.T_level.alpha = 1;
                this.updateUI();
            }).start();
            tween(this.view.T_level2).to(0.1, { y: this._starTextPosY, alpha: 1 }).start();

        } else {
            //上一关， 往下翻
            this.view.T_level2.y = this._starTextPosY - 50;
            this.view.T_level2.alpha = 0;
            this.view.T_level2.text = this._level + "";
            this.view.T_level.text = (this._level + 1) + "";
            tween(this.view.T_level).to(0.1, { y: this._starTextPosY + 50, alpha: 0 }).call(() => {
                this.view.T_level2.alpha = 0;
                this.view.T_level.y = this._starTextPosY;
                this.view.T_level.alpha = 1;
                this.updateUI();
            }).start();
            tween(this.view.T_level2).to(0.1, { y: this._starTextPosY, alpha: 1 }).start();
        }


    }


    private onChallenge(checkTicket: boolean) {
        if (checkTicket) {
            let btnInitComp = FguiScriptUtils.toMyScriptClass(this.view.infoPanel.btn_challenge, BtnChangGui1WithItem)
            if (!btnInitComp.isCanPay(false)) {
                GIns.floatingTextMgr.showTips("门票不足");
                return;
            }
        }

        if (this._cfg.level > GIns.formationMgr.getCommonLevel()) {
            GIns.floatingTextMgr.showTips(`共鸣等级达到${this._cfg.level}级后可进入此难度`)
            return;
        }

        SecretAreaModule.ins().sendChallenge(this._level);
    }

    private onSweep() {
        if (this._costItem.isCanPay()) {
            let data: ISecretArea.ISecretAreaSweepWin_viewArgs = {
                floor: this._level
            }
            G.UIManager.open(UISecretAreaKey.SecretAreaSweepWin, data);
        } else {
            GIns.floatingTextMgr.showTips("门票不足");
        }
    }

    private onRank() {
        let param = RankMainViewOpenArgs.create(ServerEnums.RankingType.SECRET_INSTANCE, null);
        G.UIManager.open(RankUIKeys.RankMainView, param);
    }

    protected onClose(): void {
        Tween.stopAllByTarget(this.view.T_level);
        Tween.stopAllByTarget(this.view.T_level2);
    }

    //能否查看下一层信息，玩家始终可以浏览第一个锁定的层级，再后面的锁定层级不能查看
    private rbuttonCanNext() {
        let secretAreaMgr = GIns.secretAreaMgr;
        if (!secretAreaMgr.isCanSel(this._cfg.id, 1)) {
            //已达最高难度
            return false
        }

        let level = secretAreaMgr.level;
        if (this._level <= level) {
            return true;
        }

        if (this._level < level + 2) {
            if (secretAreaMgr.getFloorIsLock(this._level) == false) {
                //玩家始终可以浏览第一个锁定的层级
                return true
            }
        }

        return false
    }

}