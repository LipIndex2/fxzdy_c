import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UIView } from "../../../../core/mvc/view/UIView";
import BattleTimer from "../../../../core/timer/BattleTimer";
import { BattleManager } from "../../../comm/battle/BattleManager";
import { WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IBattleTeamHpChangeVo } from "../../battle/vo/IBattleTeamHpChangeVo";
import { WorldBossUiKey } from "../const/WorldBossConst";
import { WorldBossModel } from "../model/WorldBossModel";
/**
 * 世界boss战斗内的ui
 */
@bindScript(WorldBossUiKey.WORLD_BOSS_BATTLE_UI)
export class worldBossBattleUi extends UIView {
    static pkgName: string = "worldBoss";

    static viewName: string = "worldBossBattleUI";
    // <队伍类型, 血量变化>
    private _teamToHpStateMap: Map<WorldUnitTeam, IBattleTeamHpChangeVo> = new Map<WorldUnitTeam, IBattleTeamHpChangeVo>();
    private get view(): ui.worldBoss.worldBossBattleUI {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.BATTLE_HP_CHANGED, NotificationKey.BATTLE_START_STATE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case NotificationKey.BATTLE_START_STATE:
                this.updateView();
                break;
            case NotificationKey.BATTLE_HP_CHANGED:
                this.onChangeTeamHp(args as IBattleTeamHpChangeVo);
                break;
            // case NotificationKey.BATTLE_START:
            //     this.onBattleStart();
            //     break;
        }
    }
    private bossId: number;
    public onOpen(bossId: number): void {
        this.bossId = bossId;
        //  WorldBossModel.ins().sendWorldBossInfo(bossId);
        this.onBattleStart()
    }

    // @LogBusiness("战场 - 血量变化")
    private onChangeTeamHp(changeVo: IBattleTeamHpChangeVo) {
        if (!changeVo) {
            return;
        }
        G.Logger.debug(changeVo, " updateBattleData ")
        this._teamToHpStateMap.set(changeVo.teamId, changeVo);

        //BattleDebugManager.ins().debugHurtAllMonster(99999999999)

    }


    private readonly __loopTimeMs = 200;
    private totalHurt: number = 0;
    /**旧的伤害记录 */
    private oldHurt: number = 0;


    private updateView(): void {
        let view = this.view;






        this.totalHurt = 0;

        let vo = WorldBossModel.ins().getMaxDamageAndRank();
        this.oldHurt = vo[0];

        // this.hpBarIndex = 0;
        //  this.boxNum = 0;
        //  let hpPercent = bossCurHp / bossMaxHp;
        // this.view.bossHpBar.value = hpPercent;
        //定时器


        //  let info: IBattleLogInfo = BattleLogManager.ins().getAllList()[0];
        this.view.hurtCom.hurt.text = "0"//`${info.totalHurt}`;

        view.container.visible = true;

        // 战斗时间
        this.updateHpView()
        //    WorldBossModel.ins().openServerSuccess({ bossConfigId: this.bossId, killTime:1715998700000 });
        //  BattleDebugManager.ins().debugHurtAllMonster(99999999999);
    }

    private onBattleStart(): void {
        BattleTimer.ins().loop(this.__loopTimeMs, this, this.updateHpView.bind(this));
    }


    // 血条更新
    private updateHpView(): void {
        this._teamToHpStateMap.forEach((hpChangeVo, teamId) => {
            const curHp = hpChangeVo.curHp;
            const maxHp = hpChangeVo.totalHP;
            let hpPercent = 100;
            if (curHp <= 0) {
                hpPercent = 0;
            } else {
                hpPercent = Math.ceil(curHp / maxHp);
            }


            if (teamId === WorldUnitTeam.Enemy) {
                //boss受伤
                this.view.bossHpBar.value = curHp;
                this.view.bossHpBar.max = maxHp;
                this.view.lbHp.text = `${curHp}/${maxHp}`

                let changeHp = GIns.battleMgr.battleLogic.easyLogManager.getTotalHurt(WorldUnitTeam.Self);

                //新的伤害记录
                if (changeHp > this.oldHurt) {
                    this.view.hurtCom.word.text = "新纪录:";
                }

                this.totalHurt = changeHp;
                this.view.hurtCom.hurt.text = this.totalHurt.toString();
                this.updateBox();



            }
        })
    }

    private updateBox() {
        let boxCfgs: table.worldboss.WorldBossProgressRewardConfig[] = [];
        let cfgs = WorldBossModel.ins().getBoxCfgByDamageRecursion(this.bossId, 1, this.totalHurt, boxCfgs);
        let boxNum = cfgs.length;
        this.view.boxNum.text = `${boxNum}`;
        let hp = 0;
        cfgs.forEach(cfg => {
            hp += cfg.lifeBarHp;
        });
        hp = this.totalHurt - hp;
        let currentCfg = WorldBossModel.ins().getWorldBossProgressRewardConfig(this.bossId, boxNum + 1);
        if (currentCfg) {

            this.view.boxBar.max = currentCfg.lifeBarHp;
            //this.view.boxBar.value = hp;
            this.view.boxBar.tweenValue(hp, 0.25);
        }
        else {
            this.view.boxBar.value = this.view.boxBar.max;
        }

    }

    protected onClose(): void {
        BattleTimer.ins().clearAll(this);
    }


}