import { Node, Tween, tween, v3, Vec3 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { WorldUnitTeam } from "db://assets/scripts/game/comm/battle/enum/BattleEnum";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { IBattleTeamHpChangeVo } from "db://assets/scripts/game/modules/battle/vo/IBattleTeamHpChangeVo";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { HpShowType } from "../../../../comm/battle/config/BattleSetting";
import HpStateUtils from "../../../../comm/battleEx/HpStateUtils";

/**
 * 战斗伤害
 */
export class CommonBattleTotalDamageComp extends fgui.GComponent implements INotification {

    private _newDamage: number = 0;
    // 0
    private _oldScaleForLabel: Vec3 = Vec3.ZERO;
    private _oldScaleForBg: Vec3 = Vec3.ZERO;
    private _tweenScale: Tween<Node>;
    private _tweenBg: Tween<Node>;
    private _displayedDamage: number = 0;

    private _oldPositionForDamageText: Vec3 = Vec3.ZERO;
    // 战斗类型
    private _fightType: ServerEnums.FightType;


    private get view(): ui.commBattle.battleView.components.CommonBattleTotalDamageComp {
        return this as any;
    }

    protected onConstruct(): void {
        FacadeManager.ins().registerNotification(this);
        GameTimer.ins().frameLoop(30, this, this.animateDamageChange);

        this._oldScaleForLabel = new Vec3(this.view.labelDamage.scaleX, this.view.labelDamage.scaleY, 1);
        this._oldScaleForBg = new Vec3(this.view.bg.scaleX, this.view.bg.scaleY, 1);
        this._oldPositionForDamageText = this.view.labelDamage.node.getPosition(v3());

    }


    onPreDispose() {
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_HP_CHANGED,
            NotificationKey.BATTLE_START_STATE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_HP_CHANGED:
                // 血条
                this.onChangeTeamHp(args as IBattleTeamHpChangeVo)
                break;
            case NotificationKey.BATTLE_START_STATE:
                // 战斗开始
                this.setInitHp();
                break;

        }
    }

    // 战斗类型
    reset(fightType: ServerEnums.FightType) {
        this._fightType = fightType;
        this.hasChangeVo = false
        this.view.labelDamage.text = "0"
    }

    private setInitHp(): void {
        this.initHp = HpStateUtils.getMaxHpByType(this._fightType, WorldUnitTeam.Enemy, HpShowType.BOSS);
    }

    private initHp = 0;
    private hasChangeVo: boolean = false
    // @LogBusiness("战场 - 血量变化")
    private onChangeTeamHp(changeVo: IBattleTeamHpChangeVo) {
        if (!changeVo) {
            return;
        }
        this.hasChangeVo = true
        G.Logger.debug(changeVo, " updateBattleData ")

        if (changeVo.teamId != WorldUnitTeam.Enemy) {
            return;
        }

        const maxHp = changeVo.totalHP;
        const curHp = changeVo.curHp;
        if (this.initHp == 0) {
            this.initHp = changeVo.curHp;
        }
        this._newDamage = curHp// Math.max(maxHp - curHp, this._newDamage);


        // anim
        this.playDamageAnimation();
    }


    private animateDamageChange() {
        if (!this.hasChangeVo)
            return

        const endDamage = this._newDamage;
        const displayedDamage = this._displayedDamage;

        // if (this._newDamage <= 0) {
        //     this.view.labelDamage.text = 0..toString();
        //     return;
        // }
        // 差值计算
        const diff = this.initHp - this._newDamage;

        // if (diff <= 0) {
        //     this.view.labelDamage.text = endDamage.toString();
        //     return;
        // }
        // // 根据差值大小确定每帧的变化量
        // let increment = 0;
        // if (diff < 1000) {
        //     increment += diff;
        // } else if (diff < 10000) {
        //     increment = diff * 0.6;
        // } else {
        //     increment = diff * 0.8; // 差值大于1000，每帧变化量为差值的2%
        // }

        // 更新显示的伤害值
        // this._displayedDamage = BattleEasyLogManager.ins().getTotalHurt(WorldUnitTeam.Self);;
        this._displayedDamage = diff;
        this.view.labelDamage.text = Math.floor(this._displayedDamage).toString();
    }


    private playDamageAnimation() {

        // 放大缩小动画
        this._tweenScale?.stop();
        const newScale = v3(this._oldScaleForLabel.x * 1.2, this._oldScaleForLabel.y * 1.2, 1);
        this._tweenScale = tween(this.view.labelDamage.node)
            .to(0.1, {
                scale: newScale,
                position: this._oldPositionForDamageText.clone().add3f(-10, 0, 0),
            }, { easing: 'quadIn' })
            .to(0.1, {
                scale: this._oldScaleForLabel,
                position: this._oldPositionForDamageText.clone(),
            }, { easing: 'quadOut' })
            .start();

        this._tweenBg?.stop();
        this._tweenBg = tween(this.view.bg.node)
            .to(0.1, {
                scale: newScale,
            }, { easing: 'quadIn' })
            .to(0.1, {
                scale: this._oldScaleForLabel,
            }, { easing: 'quadOut' })
            .start();
    }
}