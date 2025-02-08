import { GameTimer } from "../../../../core/timer/GameTimer";
import GIns from "../../../GIns";
import { WorldManager } from "../../world/WorldManager";
import { UnitType, WorldUnitTeam } from "../enum/BattleEnum";
import { BattleShowUnit } from "../show/BattleShowUnit";
import * as fgui from "fairygui-cc";

/** Hp item */
export class HpBar {
    static pkgName: string = "comm";
    static getViewNameByType(teamId: WorldUnitTeam, isBoss: boolean): string {
        if (teamId == WorldUnitTeam.Self) {
            return 'AttackerHpBar';
        } else if (isBoss) {
            return 'BossHpBar';
        } else {
            return 'DefenderHpBar';
        }
    }

    static hpBarItemPools: { [key: string]: fgui.GProgressBar[] } = {};
    static getHpBarItem(key: string): fgui.GProgressBar {
        let item = this.hpBarItemPools[key]?.shift()
        if (!item)
            item = fgui.UIPackage.createObject(HpBar.pkgName, key) as fgui.GProgressBar;
        else if (!item.node?.isValid) {
            item = this.getHpBarItem(key);
        }

        return item;
    }

    static addPool(item: fgui.GProgressBar): void {
        if (!this.hpBarItemPools[item.packageItem.name])
            this.hpBarItemPools[item.packageItem.name] = [];
        this.hpBarItemPools[item.packageItem.name].push(item)
    }

    private _owner: BattleShowUnit;
    private _bar: fgui.GProgressBar;

    private _x: number = 0;
    private _y: number = 0;

    constructor (owner: BattleShowUnit) {
        this._owner = owner;
    }

    private createItem() {
        let key = HpBar.getViewNameByType(this._owner.unitData.teamId, this._owner.unitData.type == UnitType.Boss);
        this._bar = HpBar.getHpBarItem(key) //fgui.UIPackage.createObject(HpBar.pkgName, key) as fgui.GProgressBar;
        this._bar.max = 1000;
        let pos = this._owner.pos;
        this.setPosition(pos.x, pos.y);
        WorldManager.ins().effectLayer.addChild(this._bar.node);
    }

    set hpPercentage(value: number) {
        if (GIns.battleDebugMgr.isPerformanceTest) {
            return
        }

        if (value <= 0) {
            GameTimer.ins().clearAll(this);
            this.onHide();
            return;
        }

        if (!this._owner.visible)
            return;

        if (!this._bar) this.createItem();

        this._bar.value = Math.floor(value * 10); //100 -> 1000
        this._bar.visible = true;
        this._bar.node.setPosition(this._x, this._y);
    }

    delayHide() {
        GameTimer.ins().once(2000, this, this.onHide);
    }

    onHide() {
        if (this._bar) {
            this._bar.visible = false;
        }
    }

    setPosition(x: number, y: number) {
        this._x = x;
        this._y = y + this._owner.modelHeight + 10;
        if (this._bar?.visible) {
            this._bar.node.setPosition(this._x, this._y);
        }
    }

    update() {
        let pos = this._owner.pos;
        this.setPosition(pos.x, pos.y);
    }

    dispose() {
        if (this._bar) {
            this.onHide()
            this._bar.removeFromParent()
            HpBar.addPool(this._bar)
            // this._bar.dispose();
            this._bar = null;
            GameTimer.ins().clearAll(this);
        }
    }
}