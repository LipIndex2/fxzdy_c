import { BaseUnit } from "./BaseUnit";
import { ActorState, HurtNumType, UnitType } from "../enum/BattleEnum";
import { MineralAttr } from "../attribute/MineralAttr";
import { IResourceParam } from "../interface/BattleInterface";
import { BattleManager } from "../BattleManager";
import { Vec2 } from "cc";
import { PassivitySkillUtils } from "../skill/PassivitySkillUtils";
import { PassivitySkillType } from "../skill/SkillEnum";
import { MineralShowUnit } from "../show/MineralShowUnit";

export class MineralUnit extends BaseUnit implements IResourceParam {
    protected _type: UnitType = UnitType.Mineral;

    protected _state: ActorState = ActorState.Idle;

    protected _cfg: table.map.MapMineralConfig;

    protected _attr: MineralAttr;

    /***IResourceParam */
    public resourceId: number;
    public resourceIdx: number;

    /***血条数量，对应1个资源点的多个资源 */
    public hpNum: number = 0
    public idxs: number[] = [];

    /***矿点的附近8个位置 */
    protected posMap: { [pos: number]: Vec2 }
    /***空闲位置记录字典 */
    protected emptyPosMap: { [pos: number]: boolean } = {}

    init(cfg: table.map.MapMineralConfig) {
        this._cfg = cfg;
        this._attr = new MineralAttr();
        this._attr.init(cfg);
    }

    public get cfg(): table.map.MapMineralConfig {
        return this._cfg
    }

    /***初始化矿位，在采集的时候才会触发 */
    private initEmptyPos(): void {
        this.posMap = {};
        //将矿的附近8个位置标记为采集位
        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                if (ix == 0 && iy == 0) {
                }
                else {
                    this.emptyPosMap[ix + "_" + iy] = true;
                    this.posMap[ix + "_" + iy] = new Vec2(this.pos.x + 50 * ix, this.pos.y + 50 * iy);
                }
            }
        }
    }

    clearAllEmptyPos(): void {
        if (!this.posMap)
            return

        for (let pos in this.posMap) {
            this.emptyPosMap[pos] = true;
        }
    }

    /**设置空闲位置是否可用 */
    setEmptyPos(key: string, value: boolean): void {
        this.emptyPosMap[key] = value;
    }

    /***获取可用的采矿位key */
    getEemptyPosList(): string[] {
        if (!this.posMap) {
            this.initEmptyPos();
        }

        let posKey: string[] = []
        for (let pos in this.posMap) {
            if (this.emptyPosMap[pos]) {
                posKey.push(pos)
            }
        }
        return posKey
    }

    getPosByKey(key: string): Vec2 {
        if (!this.posMap)
            return

        return this.posMap[key]
    }

    get isActive() {
        return this.hpNum > 0;
    }

    get isDeath() {
        return this.hpNum == 0;
    }

    public setHpNum(hpNum: number): void {
        this.hpNum = hpNum;
        this.showUnit?.setState(ActorState.Idle);
    }

    getCollcetAction() {
        return this._cfg.collectAction;
    }

    public showHurtEffect(): void {
        if (!this.isDeath)
            this.showUnit?.setState(ActorState.Hurt);
    }

    public showIdleEffect(): void {
        if (!this.isDeath)
            this.showUnit?.setState(ActorState.Idle);
    }

    hurt(attackerUid: number) {
        if (!this.isDeath) {
            this._attr.hurt(1);
            this.battleLogic.effectMgr.createNum(HurtNumType.Material, 1, this.pos, this._cfg.wordHigh);
            if (this._attr.isDeath()) {
                this.hpNum--;
                if (this.hpNum <= 0) {
                    this.showUnit?.setState(ActorState.Die);
                    this.clearAllEmptyPos();
                }
                else {
                    this._attr.rebirth();
                }
                this.battleLogic.effectMgr.createDrop(this._cfg.dropModelId, 1, this.pos, attackerUid);
                this.drop();
                let caster = this.battleLogic.getBatteUintByUid(attackerUid)
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_10, caster, caster);
            }
        }
    }

    /**复活 */
    resurgence() {
        super.resurgence();
        if (this.isDeath) {
            this._attr.rebirth();
        }
        this.showUnit?.setState(ActorState.Idle);
    }

    /**掉落 */
    drop() {
        BattleManager.ins().getDrop(this.resourceId, this.idxs[this.hpNum])
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public get showUnit(): MineralShowUnit {
        return this.battleLogic.showMgr.getUnit(this.uid) as MineralShowUnit;
    }
}