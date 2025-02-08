import { TableManager } from "../../../../core/table/TableManager";
import { ConditionManager } from "../../condition/ConditionManager";
import { SoltVo } from "./SoltVo";


/** 阵位(槽位)Vo */
export class PositionVo {
    /**阵位Id */
    private _positionId: number;

    /**英雄表Id */
    private _heroBaseId: number;

    /**是否是多队阵位 */
    public isTeams: boolean;

    /** 槽位Vo */
    private _soltVo: SoltVo | SoltVoData;

    constructor (positionId: number) {
        this._positionId = positionId;
    }

    /** 设置阵位数据 */
    public setPosVoData(vo: PositionVoData) {
        if (!vo) return;
        this._heroBaseId = vo.heroBaseId;
    }

    /** 设置槽位数据 */
    public setSoltVoData(vo: SoltVo | SoltVoData) {
        if (!vo) return;
        this._soltVo = vo;
    }

    public setHeroId(heroId: number): void {
        this._heroBaseId = heroId;
    }

    /**获取阵位数据对象 */
    getPositionVoData(): PositionVoData {
        return { positionId: this._positionId, heroBaseId: this._heroBaseId };
    }

    get soltVo() {
        return this._soltVo;
    }

    /** 阵位配置ID */
    get BaseId() {
        return this._positionId;
    }


    // 位置 id
    get positionId(): number {
        return this._positionId;
    }

    /** 上阵的英雄配置Id（null则无上阵） */
    get heroId() {
        return this._heroBaseId || null;
    }

    /** 槽位等级 */
    get level() {
        return this._soltVo.level;
    }

    /** 槽位等阶 */
    get stage() {
        return this._soltVo.stage;
    }

    /** 是否解锁 */
    get isUnlock() {
        return this._soltVo.isUnlock;
    }

    /** 阵位解锁配置表 */
    get farmationPositionCfg(): table.formation.FormationPositionConfig {
        return TableManager.getDataById(table.formation.FormationPositionConfig, this._positionId);
    }

    /** 获取解锁等级 */
    get unlockLevel() {
        let level = 0;
        let str = this.farmationPositionCfg.openVerify.split(";")
        const oneConditionArray = str[0].split(",");
        level = Number.parseInt(oneConditionArray[2].trim());
        return level;
    }

    toReqPosVo(): Vo.formation.PositionVo {
        return {
            position: this._positionId,
            heroBaseId: this._heroBaseId,
        } as Vo.formation.PositionVo;
    }
}

/** 布阵VoData */
export class PositionVoData {
    /**
     * 阵位ID
     */
    positionId: number;

    /**
     * 上阵英雄配置ID
     */
    heroBaseId: number;
}

/** 槽位VoData */
export class SoltVoData {
    /**
     * 阵位ID
     */
    positionId: number;

    /**
     * 阵位等阶
     */
    stage: number;

    /**
     * 阵位等级
     */
    level: number;

    /**
     * 槽位是否解锁
     */
    isUnlock: boolean;
}