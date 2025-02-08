import * as fgui from "fairygui-cc";
import { TableManager } from "../../../../core/table/TableManager";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import G from "../../../../core/comm/G";
import { ModelNode } from "../node/ModelNode";
import FguiUtils from "../../../../core/utils/FguiUtils";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import { BattleUnit } from "../../../comm/battle/unit/battle/BattleUnit";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";
import GIns from "../../../GIns";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { BattleAttr } from "../../../comm/battle/attribute/BattleAttr";



/** 英雄头像item （带技能id） */
export class HeroHeadSkillItem extends fgui.GComponent implements INotification {
    static pkgName: string = "comm";
    static viewName: string = "HeroHeadSkillItem";

    private _heroAtt: BattleAttr;
    private _heroId: number;

    private _restCd: number = 0;

    // private loopEffectNode: SpineUnitNode;
    // private hitEffectNode: SpineUnitNode;


    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_PLAY_UNIT_DIE,
            NotificationKey.BATTLE_PLAY_UNIT_REVIVE,
            NotificationKey.BATTLE_RESULT_WIN,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_PLAY_UNIT_DIE:
                // 单位死亡
                this.onUnitDead(args as BattleUnit)
                break;
            case NotificationKey.BATTLE_PLAY_UNIT_REVIVE:
                // 单位复活
                this.onUnitRevive(args as BattleUnit)
                break;
            case NotificationKey.BATTLE_RESULT_WIN:
                //胜利
                this.onResultWin()
                break;
        }
    }

    private get view(): ui.comm.item.HeroHeadSkillItem {
        return this as any;
    }

    onInit(): void {
        FacadeManager.ins().registerNotification(this)
    }

    private onResultWin(): void {
        this.view.loopEffectNode.visible = false;
    }

    private onUnitDead(unit: BattleUnit) {
        if (unit?.teamId == WorldUnitTeam.Self && unit.attr.getHeroConfigId() == this._heroId) {
            this.view.heroComp.grayed = true;
        }
    }

    private onUnitRevive(unit: BattleUnit) {
        if (unit?.teamId == WorldUnitTeam.Self && unit.attr.getHeroConfigId() == this._heroId) {
            this.view.heroComp.grayed = false;
        }
    }

    private showLoopEffect(): void {
        if (GIns.battleMgr.battleLogic.isInBattle()) {
            let aniNode = this.view.loopEffectNode as ModelNode
            aniNode.loadByModelId(10010077)
        }
        this.view.loopEffectNode.visible = GIns.battleMgr.battleLogic.isInBattle() && this.view.visible
        // this.showHitEffect()
    }

    public showHitEffect(): void {
        if (!this.view.visible)
            return

        let aniNode = this.view.hitEffectNode as ModelNode
        aniNode.loadByModelId(10010078, false)
        aniNode.playOrders([{
            name: 'enter',
            isLoop: false
        }])
        // this.view.nodePoint.parent.addChild(aniNode)
        // aniNode.setPosition(this.view.nodePoint.x, this.view.nodePoint.y);
        // let p = FguiUtils.changeCoorTo(aniNode, this.view.parent.parent.parent)
        // this.view.parent.parent.addChild(aniNode)
        // aniNode.setPosition(p.x, p.y);
        // ScreenAdaptManager.screenOffsetX
    }

    public reset(): void {
        this.view.heroComp.grayed = false;
    }

    /** 
     * 设置数据
     * @ heroId -- 英雄id
     * @ cdPercent -- 总cd
     * @ restCdTimeMs -- 剩余cd
     */
    setData(heroAtt: BattleAttr, cdMaxTimeMs: number, restCdTimeMs: number, isTimer: boolean = true) {
        this._heroAtt = heroAtt;
        this._heroId = heroAtt.getConfigId();
        if (isTimer) {
            if (this._restCd <= 0) {
                this._restCd = restCdTimeMs;
                G.GameTimer.clearAll(this);
                G.GameTimer.loop(200, this, () => {
                    if (this._restCd < 0) {
                        G.GameTimer.clearAll(this);
                    } else {
                        this._restCd -= 200;
                        this.updateUI(cdMaxTimeMs, this._restCd);
                    }
                })
            }
        }
        else
            this.updateUI(cdMaxTimeMs, restCdTimeMs);
    }

    private updateUI(cdMaxTimeMs: number, restCdTimeMs: number) {
        if (this.view.heroComp.grayed) {
            this.view.title.text = "";
            this.view.bgMask.visible = false;
            this.view.loopEffectNode.visible = false
            return
        }
        this.view.bgMask.visible = true;
        this.view.loopEffectNode.visible = true
        let cfg = TableManager.getDataById(table.hero.HeroConfig, this._heroId);
        // let heroVo = GIns.heroMgr.getHeroVoByID(this._heroId)
        if (!this._heroAtt.skinId)
            this.view.heroComp.imageHero.icon = cfg.battleHeadIconPath;
        else {
            let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this._heroAtt.skinId);
            this.view.heroComp.imageHero.icon = skinCfg.battleHeadIconPath;
        }
        // 品质 
        let heroQualityCfg = HeroUtils.getQualityConfigByHeroId(this._heroId);
        if (heroQualityCfg) {
            this.view.fg.icon = heroQualityCfg.battleFgIconPath;
            this.view.bg.icon = heroQualityCfg.battleBgImagePath;
        }

        // CD 百分比
        let cdPercent = restCdTimeMs / cdMaxTimeMs * 100;
        if (restCdTimeMs <= 0) {
            cdPercent = 0;
        }

        let cdController = this.view.getController("inCdFlag");
        if (cdPercent > 0) {
            cdController.selectedIndex = 1;
            // 0~1
            this.view.bgMask.fillAmount = cdPercent / 100;
        } else {
            cdController.selectedIndex = 0;
            this.view.bgMask.fillAmount = 0;
        }
        if (restCdTimeMs > 0) {
            let restCdSecond = restCdTimeMs / 1000;
            this.view.title.text = Math.ceil(restCdSecond) + "";
        } else {
            this.view.title.text = "";
            if (this.view.visible)
                this.showLoopEffect();
        }
    }

    /** 是否是助战英雄 */
    isHelpHero(isHelp: boolean) {
        this.view.img_zz.visible = isHelp;
    }

    public onPreDispose(): void {
        G.GameTimer.clearAll(this);
        FacadeManager.ins().removeNotification(this)
    }
}