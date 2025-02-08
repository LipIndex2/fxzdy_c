import G from "../../core/comm/G";
import UIScriptManager from "../../core/comm/UIScriptManager";
import { UIPage } from "../../core/mvc/view/UIPage";
import { UIView } from "../../core/mvc/view/UIView";
import { GameTimer } from "../../core/timer/GameTimer";
import { BattleDebugManager } from "../../game/comm/battle/BattleDebugManager";
import LocalStorage from "../../game/comm/cache/LocalStorage";
import NotificationKey from "../../game/event/NotificationKey";
import { UIGmKeys } from "../const/UIGmKeys";

export class BattleTestView extends UIPage {
    // region 静态属性 for FGUI
    static pkgName: string = "gm";
    static viewName: string = "BattleTestView";

    private nowSelectHeroSkillUid: number = 0
    private nowSelectHeroSkillIndex: number = -1;

    private get view(): ui.gm.BattleTestView {
        return this._view as any;
    }

    public onInit() {
        this.view.closeBtn.onClick(this.onClickClose, this);
        this.view.testBtn1.onClick(this.onClickTest1, this);
        this.view.testBtn2.onClick(this.onClickTest2, this);
        this.view.testBtn3.onClick(this.onClickTest3, this);
        // this.view.leftBtn.onClick(this.onClickLeftBtn, this);
        // this.view.rightBtn.onClick(this.onClickRightBtn, this)
        this.view.skillSwitchBtn.onClick(this.onClickSkillSwitchBtn, this);
        this.view.skill2Btn.onClick(this.onClickSkill1, this);
        this.view.skill3Btn.onClick(this.onClickSkill2, this);
        this.view.skill4Btn.onClick(this.onClickSkill3, this);
        this.view.skill5btn.onClick(this.onClickSkill4, this);
        this.view.stopEnemyBtn.onClick(this.onClickStopEnemyBtn, this);
        this.view.stopSelfBtn.onClick(this.onClickStopSelfBtn, this);
        this.view.onlyNormalBtn.onClick(this.onClickOnlyNormalBtn, this);
        this.view.notHurtBtn.onClick(this.onClickNotHurtBtn, this);
    }

    protected onOpen(args: any): void {

        BattleDebugManager.ins().isTestStopEnemy = LocalStorage.player.battleTest.isTestStopEnemy
        BattleDebugManager.ins().isTestStopHero = LocalStorage.player.battleTest.isTestStopHero
        BattleDebugManager.ins().isTestOnlyNormal = LocalStorage.player.battleTest.isTestOnlyNormal
        BattleDebugManager.ins().isTestNotHurt = LocalStorage.player.battleTest.isTestNotHurt
        this.updateBtn()
    }

    private onClickStopEnemyBtn(): void {
        BattleDebugManager.ins().isTestStopEnemy = !BattleDebugManager.ins().isTestStopEnemy;
        this.updateBtn()
        LocalStorage.player.battleTest.isTestStopEnemy = BattleDebugManager.ins().isTestStopEnemy;
    }

    private onClickStopSelfBtn(): void {
        BattleDebugManager.ins().isTestStopHero = !BattleDebugManager.ins().isTestStopHero;
        this.updateBtn()
        LocalStorage.player.battleTest.isTestStopHero = BattleDebugManager.ins().isTestStopHero;
    }

    private onClickOnlyNormalBtn(): void {
        BattleDebugManager.ins().isTestOnlyNormal = !BattleDebugManager.ins().isTestOnlyNormal;
        this.updateBtn()
        LocalStorage.player.battleTest.isTestOnlyNormal = BattleDebugManager.ins().isTestOnlyNormal;
    }

    private onClickNotHurtBtn(): void {
        BattleDebugManager.ins().isTestNotHurt = !BattleDebugManager.ins().isTestNotHurt;
        this.updateBtn()
        LocalStorage.player.battleTest.isTestNotHurt = BattleDebugManager.ins().isTestNotHurt;
    }

    private updateBtn(): void {
        this.view.stopEnemyBtn.title = BattleDebugManager.ins().isTestStopEnemy ? "敌方暂停" : "敌方开启"
        this.view.stopSelfBtn.title = BattleDebugManager.ins().isTestStopHero ? "我方暂停" : "我方开启"
        this.view.onlyNormalBtn.title = BattleDebugManager.ins().isTestOnlyNormal ? "只用普攻" : "使用技能"
        this.view.notHurtBtn.title = BattleDebugManager.ins().isTestNotHurt ? "不受伤害" : "正常伤害"

        let heros = BattleDebugManager.ins().mainScene.getHeros();
        if (this.nowSelectHeroSkillIndex == -1) {
            this.view.skillSwitchBtn.title = "全体技能"
        }
        else
            this.view.skillSwitchBtn.title = heros[this.nowSelectHeroSkillIndex].attr.name;
    }

    private onClickClose() {
        G.FacadeManager.emit(NotificationKey.EXIT_BATTLE);
        BattleDebugManager.ins().exitBattleTest()
        this.closeSelf();
    }

    private onClickTest1(): void {
        BattleDebugManager.ins().isPerformanceTest = true
        // BattleDebugManager.ins().debugMonster(200, 998)
        BattleDebugManager.ins().debugMonster(1000, 995)
    }

    private onClickTest2(): void {
        BattleDebugManager.ins().isPerformanceTest = true
        BattleDebugManager.ins().debugMonster(1, 995)
        // BattleDebugManager.ins().debugMonster(2000, 997)
    }

    private onClickTest3(): void {
        BattleDebugManager.ins().isNotEnvActive = !BattleDebugManager.ins().isNotEnvActive
    }

    private onClickSkillSwitchBtn(): void {
        let heros = BattleDebugManager.ins().mainScene.getHeros();
        if (this.nowSelectHeroSkillIndex < heros.length - 1) {
            this.nowSelectHeroSkillIndex++;
            this.nowSelectHeroSkillUid = heros[this.nowSelectHeroSkillIndex].uid
        }
        else {
            this.nowSelectHeroSkillIndex = -1;
            this.nowSelectHeroSkillUid = -1;
        }
        this.updateBtn()
    }

    private onClickSkill1(): void {
        let heros = BattleDebugManager.ins().mainScene.getHeros();
        for (let i = 0; i < heros.length; i++) {
            if (this.nowSelectHeroSkillIndex == -1 || this.nowSelectHeroSkillUid == heros[i].uid) {
                heros[i].attr.updatePreCD(1, 9999999);
                heros[i].attr.updateCD(1, 9999999);
                heros[i].useSkillByIndex(1)
            }
        }

        let monsters = BattleDebugManager.ins().mainScene.getEmenys();
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].attr.updatePreCD(1, 9999999);
            monsters[i].attr.updateCD(1, 9999999);
            monsters[i].useSkillByIndex(1)
        }
    }

    private onClickSkill2(): void {
        let heros = BattleDebugManager.ins().mainScene.getHeros();
        for (let i = 0; i < heros.length; i++) {
            if (this.nowSelectHeroSkillIndex == -1 || this.nowSelectHeroSkillUid == heros[i].uid) {
                heros[i].attr.updatePreCD(2, 9999999);
                heros[i].attr.updateCD(2, 9999999);
                heros[i].useSkillByIndex(2)
            }
        }

        let monsters = BattleDebugManager.ins().mainScene.getEmenys();
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].attr.updateCD(2, 9999999);
            monsters[i].attr.updatePreCD(2, 9999999);
            monsters[i].useSkillByIndex(2)
        }
    }

    private onClickSkill3(): void {
        let monsters = BattleDebugManager.ins().mainScene.getEmenys();
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].attr.updateCD(3, 9999999);
            monsters[i].attr.updatePreCD(3, 9999999);
            monsters[i].useSkillByIndex(3)
        }
    }

    private onClickSkill4(): void {
        let monsters = BattleDebugManager.ins().mainScene.getEmenys();
        for (let i = 0; i < monsters.length; i++) {
            monsters[i].attr.updateCD(4, 9999999);
            monsters[i].attr.updatePreCD(4, 9999999);
            monsters[i].useSkillByIndex(4)
        }
    }
}

UIScriptManager.bindScript(UIGmKeys.BattleTestView, BattleTestView);