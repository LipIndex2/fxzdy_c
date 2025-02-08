import { Node, v2, Vec2 } from "cc";
import G from "../../../../core/comm/G";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { BattleUtils } from "../../../comm/battle/BattleUtils";
import { DirctionType } from "../../../comm/battle/enum/BattleEnum";
import BattleShowFactory from "../../../comm/battle/factory/BattleShowFactory";
import { IObject1 } from "../../../comm/interface/IObject1";
import GIns from "../../../GIns";
import { IMapObject } from "../../../tiledMap/IMapObject";
import { UnlockResAnimNode } from "../../common/anim/UnlockResAnimNode";
import { StimulationBattleUnit } from "./StimulationBattleUnit";

/**经营互动状态*/
export enum StimulationBattleState {
    /**未初始化状态*/
    None = 'None',
    /**等待状态*/
    Idle = 'Idle',
    /**移动到建筑*/
    MoveToTarget = 'MoveToTarget',
    /**扔道具*/
    ThrowProps = 'ThrowProps',
    /**返回出生地*/
    BackToBirthplace = 'BackToBirthplace',
    /**销毁阶段*/
    Destroy = 'Destroy',
}

/**
 * 经营主界面交互逻辑
*/
export class StimulationBattleLogic {
    protected _state: StimulationBattleState = StimulationBattleState.None;
    /**当前互动的角色对象*/
    protected _heroUnit: StimulationBattleUnit = null;
    /**当前英雄id列表*/
    protected _heroIds: number[] = [];
    protected _buildingId: number = 0;
    protected _mapObject: IMapObject = null;
    protected _scene: Node = null;
    protected _birthPos: Vec2 = new Vec2();
    protected _costItem: IObject1 = null;
    public isInit: boolean = false;

    public init(heroIds: number[], buildingId: number, scene: Node): void {
        this.isInit = true;
        this._heroIds = heroIds;
        this._scene = scene;
        this._mapObject = GIns.mapMgr.getObjectsByIDInBuilding(buildingId);

        let cfg = GIns.stimulationModel.getCfgByBuilding(buildingId);
        this._costItem = {
            k: cfg.cfg.itemId,
            v: 10
        }
    }

    public start(): void {
        GameTimer.ins().frameLoop(1, this, this.onUpdate);
        this.setState(StimulationBattleState.Idle);
    }

    public stop(): void {
        GameTimer.ins().clearAll(this);
        if (this._state == StimulationBattleState.ThrowProps)  {
            //需要移除图标动画
            let children =GIns.worldMgr.tipsLayer.children.concat();
            children.forEach((node) => {
                if (node.name.startsWith('StimulationIconNode_')) {
                    let gcom = node["$gobj"] as fgui.GComponent;
                    if (gcom) {
                        if (gcom instanceof UnlockResAnimNode) {
                            gcom.cancelTween();
                        } else {
                            gcom.dispose();
                        }
                    } else {
                        node.destroy();
                    }
                }
            })
        }
        this._state = StimulationBattleState.None;
        if (this._heroUnit) {
            this._heroUnit.dispose();
        }
        this._heroUnit = null;
    }

    protected onUpdate() {
        if (this._heroUnit) {
            this._heroUnit.update();

            if (this._heroUnit.isMoving == false && this.isMoveState()) {
                //代表达到了目的地
                if (this._state == StimulationBattleState.MoveToTarget) {
                    this.setState(StimulationBattleState.ThrowProps);
                } else if (this._state == StimulationBattleState.BackToBirthplace) {
                    this.setState(StimulationBattleState.Destroy);
                }
            }
        }
    }

    /**是否是移动状态*/
    protected isMoveState(): boolean {
        return this._state == StimulationBattleState.MoveToTarget || this._state == StimulationBattleState.BackToBirthplace
    }

    protected tryToCreateHeroUnit(): void {
        if (this._heroIds?.length > 0 && this._mapObject) {
            let heroId: number = 0;
            if (this._heroIds.length == 1) {
                heroId = this._heroIds[0];
            } else {
                //随机一个英雄
                let randomIdx: number = Math.floor(Math.random() * this._heroIds.length);
                heroId = this._heroIds[randomIdx];
            }
            let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
            if (heroVo) {
                this._heroUnit = PoolManager.getItem(StimulationBattleUnit);
                this._heroUnit.init(heroVo, this._scene);
                this._heroUnit.battleLogic = GIns.battleMgr.battleLogic;
                //随机出生位置
                let randomX: number = ScreenAdaptManager.viewWidth * 0.5 + 100 + Math.random() * 100;
                if (false) {
                    randomX *= -1;
                    this._heroUnit.setDirction(DirctionType.Left);
                } else {
                    this._heroUnit.setDirction(DirctionType.Rigth);
                }
                randomX += this._mapObject.x;
                let randomY: number = this._mapObject.y  + Math.floor((Math.random() * 2 - 1) * 500);
                this._birthPos = BattleUtils.setPosNotBlockPos(GIns.battleMgr.battleLogic.fightType, v2(randomX, randomY));
                this._heroUnit.setPosXY(this._birthPos.x, this._birthPos.y);
                this.setState(StimulationBattleState.MoveToTarget);
                return
            }
        }
        //没有可以创建的英雄就继续计时
        this.handleIdleState();
    }

    protected playThrowPropsAni(targetPos: { x: number, y: number }, cost: IObject1): number {
        let cfg = G.TableManager.getDataById(table.item.ItemConfig, cost.k);
        if (!cfg || !this._heroUnit) return 50;
        let stepMs = 100;
        let num = Math.min(cost.v, 10);
        let starPos = v2(this._heroUnit.pos.x, this._heroUnit.pos.y + 50);
        for (let i = 0; i < num; i++) {
            let anim = UnlockResAnimNode.create();
            anim.play(cfg.smallIconPath, starPos, targetPos, stepMs * i);
            anim.node.name = 'StimulationIconNode_' + i;
            GIns.worldMgr.tipsLayer.addChild(anim.node);
        }
        return num ? num * stepMs + UnlockResAnimNode.tweenTime : 0;
    }

    protected onThrowPropsComplete(): void {
        this.setState(StimulationBattleState.BackToBirthplace);
    }

    protected onDestroyComplete(): void {
        if (this._heroUnit) {
            this._heroUnit.dispose();
        }
        this._heroUnit = null;
        this.setState(StimulationBattleState.Idle);
    }

    protected handleIdleState(): void {
        G.GameTimer.once(1000, this, this.tryToCreateHeroUnit);
    }

    protected handleMoveToTargetState(): void {
        let objPos = v2(this._mapObject.x, this._mapObject.y);
        let out = v2(0, 0);
        Vec2.lerp(out, objPos, this._birthPos, 0.2);
        let endPos = BattleUtils.setPosNotBlockPos(GIns.battleMgr.battleLogic.fightType, out);
        this._heroUnit.setMoveTarget(endPos);
    }

    protected handleThrowPropsState(): void {
        let x = this._mapObject.x;
        let y = this._mapObject.y;
        let uesTimeMs = this.playThrowPropsAni({ x: x, y: y }, this._costItem);
        G.GameTimer.once(uesTimeMs, this, this.onThrowPropsComplete);
    }

    protected handleBackToBirthplaceState(): void {
        this._heroUnit.setMoveTarget(this._birthPos);
    }

    protected handleDestroyState(): void {
        const hero = this._heroUnit;
        let pos = hero.pos;
        this._heroUnit.stopMove();
        BattleShowFactory.showEffectModel(10010004, pos, 1, true, false); //传送背景
        BattleShowFactory.showEffectModel(10010005, pos, 1, false, false); //传送前景

        hero.showUnit()?.fadeOut(1000);
        G.GameTimer.once(1000, this, this.onDestroyComplete);
    }

    public setState(state: StimulationBattleState): void {
        if (this._state != state) {
            this._state = state;
            switch (state) {
                case StimulationBattleState.Idle:
                    this.handleIdleState();
                    break;
                case StimulationBattleState.MoveToTarget:
                    this.handleMoveToTargetState();
                    break
                case StimulationBattleState.ThrowProps:
                    this.handleThrowPropsState();
                    break
                case StimulationBattleState.BackToBirthplace:
                    this.handleBackToBirthplaceState();
                    break
                case StimulationBattleState.Destroy:
                    this.handleDestroyState();
                    break
            }
        }
    }

    public updateHeroIds(heroIds: number[]): void {
        this._heroIds = heroIds;
        if (this._heroUnit) {
            if (this._heroIds.indexOf(this._heroUnit.heroId) == -1) {
                //当前角色下场了
                G.GameTimer.clear(this, this.tryToCreateHeroUnit);
                G.GameTimer.clear(this, this.onThrowPropsComplete);
                G.GameTimer.clear(this, this.onDestroyComplete);
                this.setState(StimulationBattleState.Destroy);
            }
        }
    }

}