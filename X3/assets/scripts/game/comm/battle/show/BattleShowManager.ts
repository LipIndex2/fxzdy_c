import { Rect } from "cc";
import { ScreenAdaptManager } from "../../../../core/comm/ScreenAdaptManager";
import { BattleLogic } from "../BattleLogic";
import { BaseShowUnit } from "./BaseShowUnit";
import { UnitType, WorldUnitTeam } from "../enum/BattleEnum";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { TableManager } from "../../../../core/table/TableManager";
import { AnimBaseUnitNode } from "../node/AnimBaseUnitNode";
import { SpriteFrameUnitNode } from "../node/SpriteFrameUnitNode";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { WorldManager } from "../../world/WorldManager";
import GIns from "../../../GIns";
import { BattleUnit } from "../unit/battle/BattleUnit";

export class WaitAddShowUnitData {
    public battleLogic: BattleLogic
    public showUnit: BaseShowUnit
    public exData: { fadeIn?: number }
    public modelId: number

    public setData(battleLogic: BattleLogic, showUnit: BaseShowUnit, modelId: number, exData?: any): void {
        this.battleLogic = battleLogic;
        this.showUnit = showUnit;
        this.modelId = modelId;
        this.exData = exData
    }

    public create(): boolean {
        if (this.showUnit.isDisposed)
            return false

        let mcfg = TableManager.getDataById(table.model.ModelConfig, this.modelId);
        let node: AnimBaseUnitNode = mcfg.spriteFrame ? PoolManager.getItem(SpriteFrameUnitNode) : PoolManager.getItem(ActorUnitNode);
        this.showUnit.setSpineNode(node)
        node.loadByModelId(this.modelId);
        if (this.exData?.fadeIn)
            this.showUnit.fadeIn(500);
        WorldManager.ins().roleLayer.addChild(node);
        this.showUnit.onInitData()
        this.battleLogic.showMgr.addUnit(this.showUnit);
        this.battleLogic = null;
        this.showUnit = null;
        this.exData = null;

        return true;
    }

    public onRecovery(): void {
        this.battleLogic = null;
        this.showUnit = null;
        this.exData = null;
    }
}

export class BattleShowManager {
    public battleLogic: BattleLogic;
    private uidMap: { [key: number]: BaseShowUnit } = {}
    private units: BaseShowUnit[] = [];
    /***等待移除的列表 */
    private waitRemoveUnits: BaseShowUnit[] = [];
    /***等待添加的列表 */
    private waitAddUnits: WaitAddShowUnitData[] = [];
    public addUnit(unit: BaseShowUnit): void {
        this.units.push(unit)
        this.uidMap[unit.unitData.uid] = unit
    }

    public getUnit(uid: number): BaseShowUnit {
        return this.uidMap[uid]
    }

    /**隐藏范围外的目标 */
    private _tempCleanRect: Rect = new Rect();
    public update(): void {
        if (this.battleLogic.isNotShowBattleEffect())
            return

        let width = ScreenAdaptManager.viewWidth + 400;
        let height = ScreenAdaptManager.viewHeight + 800;
        let rect = this._tempCleanRect;
        let map = GIns.mapMgr.curMap.mapNode()
        if (map && map.pos) {
            rect.set(-map.pos.x - width / 2, -map.pos.y - height / 2, width, height);
        }
        else {
            let teamUnit = this.battleLogic.getTeamByTeamId(WorldUnitTeam.Self)
            if (teamUnit && teamUnit.pos) {
                rect.set(teamUnit.pos.x - width / 2, teamUnit.pos.y - height / 2, width, height);
            }
            else {
                return
            }
        }

        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].isDisposed || !this.units[i].isAcive()) {

            }
            else if (this.units[i].readyToDispose) {
                this.waitRemoveUnits.push(this.units[i])
            }
            else {
                if (this.units[i].unitData.type != UnitType.Hero && this.units[i].unitData.type != UnitType.Boss && !rect.contains(this.units[i].pos)) {
                    this.units[i].setEdgeHide(true)
                }
                else {
                    this.units[i].setEdgeHide(false)
                    this.units[i].update()
                }
            }
        }
        this.disposeWaitUnits();
        this.createShowUnit()
    }

    public setHideAll(): void {
        for (let i = 0; i < this.units.length; i++) {
            if (!this.units[i].isDisposed && this.units[i].isAcive()) {
                this.units[i].visible = false;
            }
        }
    }

    public clear(): void {
        for (let i = 0; i < this.units.length; i++) {
            this.units[i].dispose()
        }
        this.uidMap = {}
        this.units.length = 0;
        this.waitAddUnits.length = 0;
    }

    public getAllUnits(): BaseShowUnit[] {
        return this.units;
    }

    public disposeWaitUnits(): void {
        for (let i = 0; i < this.waitRemoveUnits.length; i++) {
            delete this.uidMap[this.waitRemoveUnits[i].uid];
            this.units.splice(this.units.indexOf(this.waitRemoveUnits[i]), 1)
            this.waitRemoveUnits[i].dispose();
        }
        this.waitRemoveUnits.length = 0;
    }

    public setStatue(uid: number, data: any): void {
        if (this.uidMap[uid])
            this.uidMap[uid].setStatue(data)
    }

    /***添加创建显示的队列 */
    public addCreateList(showUnit: BaseShowUnit, modelId: number, exData?: { fadeIn?: number }): void {
        let waitData = PoolManager.getItem(WaitAddShowUnitData)
        waitData.setData(this.battleLogic, showUnit, modelId, exData)
        this.waitAddUnits.push(waitData)
        if (this.isOpenCreateAll) {
            this.createShowUnit(true)
        }
    }

    protected createShowUnit(force: boolean = false): void {
        let createNum = force ? 99999 : 2;
        while (createNum > 0 && this.waitAddUnits.length) {
            let units = this.waitAddUnits.shift()
            if (units.create()) {
                createNum--;
            }
        }
    }

    public createOneShowUnit(unit: BattleUnit): BaseShowUnit {
        for (let i = 0; i < this.waitAddUnits.length; i++) {
            if (this.waitAddUnits[i].showUnit?.unitData?.uid == unit.uid) {
                this.waitAddUnits[i].create()
                this.waitAddUnits.splice(i, 1)
                return this.battleLogic.showMgr.getUnit(unit.uid)
            }
        }
    }

    public isOpenCreateAll: boolean = false;
    public setOpenCreateAllNow(v: boolean): void {
        if (v) {
            this.createShowUnit(true)
        }
        this.isOpenCreateAll = v;
        this.update()
    }
}