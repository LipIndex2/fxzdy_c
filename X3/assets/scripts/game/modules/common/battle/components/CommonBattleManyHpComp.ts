import { Color } from "cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { WorldUnitTeam } from "db://assets/scripts/game/comm/battle/enum/BattleEnum";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { IBattleTeamHpChangeVo } from "db://assets/scripts/game/modules/battle/vo/IBattleTeamHpChangeVo";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import BattleTimer from "../../../../../core/timer/BattleTimer";



/**
 * 简单的总血量才成n条血条
 */
export class CommonBattleManyHpComp extends fgui.GComponent implements INotification {

    static pkgName: string = "commBattle";
    static viewName: string = "BattleCommonManyHpComp";

    // 默认颜色, 兜底
    static readonly colorMap: Map<number, Color> = new Map([
        [0, new Color('#FFFF00')], // 黄色
        [1, new Color('#800080')], // 紫色
        [2, new Color('#FFA500')], // 橙色
        [3, new Color('#FF0000')], // 红色
        [4, new Color('#2f9736')], // 绿色
    ]);


    private get view(): ui.commBattle.battleView.hp.BattleCommonManyHpComp {
        return this as any;
    }

    protected onInit(): void {
        FacadeManager.ins().registerNotification(this);
        this.view.getController("c1").selectedIndex = 0;

    }

    listenNotifications(): string[] {
        return [
            NotificationKey.BATTLE_HP_CHANGED,
            NotificationKey.BATTLE_RESULT,
            NotificationKey.BATTLE_START_STATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.BATTLE_START_STATE:
                this.updateView();
                break;
            case NotificationKey.BATTLE_HP_CHANGED:
                // 血条
                this.onChangeTeamHp(args as IBattleTeamHpChangeVo)
                break;
            case NotificationKey.BATTLE_RESULT:
                // 战斗结果
                this.onBattleEnd(args as boolean)
                break;
        }

    }
    // <队伍类型, 血量变化>
    private _teamToHpStateMap: Map<WorldUnitTeam, IBattleTeamHpChangeVo> = new Map<WorldUnitTeam, IBattleTeamHpChangeVo>();
    // @LogBusiness("战场 - 血量变化")
    private onChangeTeamHp(changeVo: IBattleTeamHpChangeVo) {
        if (!changeVo) {
            return;
        }
        this._teamToHpStateMap.set(changeVo.teamId, changeVo);
        this.updateHpView();
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }
    private _fightType: number;
    /**存在这个，视为每条血条量都是一样 */
    private _hpCount: number;
    private _hpBars:number[]=[];
    private _hpDur:number[]=[];
    /**如果存在hps。代表每條血條的血量不一定相同 */
    reset(fightType: ServerEnums.FightType, battleConfigId: number, hpCount: number, bossHeadPath: string = "",bars:number[]=null) {
        this._fightType = fightType;
        this._hpCount = hpCount;

        this._hpBars = bars;
        if(this._hpBars){
            this.initHpDis(bars);
        }
      
        //let cfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, battleConfigId);
        //headPath
        this.view.imageBossAvatar.img_head.icon = bossHeadPath;
    }

    initHpDis(data:number[]){
        this._hpDur = [];
        data.forEach((hp, index)=>{
            const last = index == 0?0:this._hpDur[index-1];
            this._hpDur.push(hp+last);
        })
    }


    private onBattleEnd(isWin: boolean) {

    }
    // private readonly __loopTimeMs = 200;
    private updateView() {
        // 战斗时间
        // BattleTimer.ins().loop(this.__loopTimeMs, this, this.updateHpView.bind(this));
    }
    private currentBarIndex: number;
    /**根据 总血量 、当前血量、 _hpCount 算出当前血条颜色和下一条颜色 */
    private updateHpView() {
        let hpCount = this._hpCount;
        // 敌人血条 hp
        const hpChangeVo = this._teamToHpStateMap.get(WorldUnitTeam.Enemy);
        if (!hpChangeVo)
            return;
        let curHp = hpChangeVo.curHp;
        let maxHp = hpChangeVo.totalHP;
        let colorSize = CommonBattleManyHpComp.colorMap.size;
        // 1. 计算当前血条颜色
        let curHpIndex
        if(this._hpCount){
            curHpIndex = Math.ceil(curHp / maxHp * hpCount);

             //计算血条百分比
            //每条血条的最大值
            let barMax = maxHp / hpCount;
            let curBarValue = 0;

            curBarValue = maxHp - curHp - barMax * (hpCount - curHpIndex);
            this.view.currentBar.value = curBarValue;
            this.view.currentBar.max = barMax;
           
        }else{
            const hurt = maxHp - curHp;
            /**获取到第几根血条 */
            const hpIndex = this._hpDur.findIndex(hp=>{
                return hurt <  hp
            })
            //该条血条的剩余血量
            const curLeft = this._hpDur[hpIndex] - hurt;
            //该条血条的总血量
            const curTotal = this._hpBars[hpIndex];
            curHpIndex = this._hpDur.length - hpIndex;
            this.view.currentBar.value = curTotal - curLeft;
            this.view.currentBar.max = curTotal;
        }
       
        if (this.currentBarIndex != curHpIndex) {
            this.view.getController("c1").selectedIndex = 1;
            let colorIndex = Math.floor(curHpIndex % colorSize) || 0;

            if (curHpIndex <= 1) {
                //没有下一条了
                if(this._hpCount){
                    this.view.nextBar.visible = false;
                }else{
                    this.view.nextBar.visible = true;
                }
                
            }
            else {
                this.view.nextBar.visible = true;

                let nextColorIndex = colorIndex + 1;
                if (nextColorIndex >= colorSize)
                    nextColorIndex = 0;
                this.view.nextBar.bar.color = CommonBattleManyHpComp.colorMap.get(nextColorIndex);

                //  console.log("colorIndex:", colorIndex, "nextColorIndex:", nextColorIndex);

            }

            this.view.currentBar.bar.color = CommonBattleManyHpComp.colorMap.get(colorIndex);
            if(this._fightType == ServerEnums.FightType.SEASON_BOSS){
                this.view.labelHpRowCount.text = `X${this._hpBars.length - curHpIndex}`;
            }else{
                this.view.labelHpRowCount.text = `X${curHpIndex}`;
            }
           
            this.currentBarIndex = curHpIndex;
        }
    }

    protected onClose(): void {
        BattleTimer.ins().clearAll(this);
    }





}