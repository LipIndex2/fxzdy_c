import { PET_DUNGEON_TOY_CELL_CNT, PetDungeonToyShapeVo } from "./PetDungeonToyShapeVo";

/**玩具vo*/
export class PetDungeonToyVo {
    protected _id: number;
    protected _configId:number;
    /**形状数据*/
    protected _shapeVo: PetDungeonToyShapeVo = null;
    /**当前数组*/
    protected _values: number[] = [];
    /**当前数据*/
    protected _value: number = 0;
    /**左上角位置下标*/
    protected _posIdx: number = -1;

    constructor() {
        let totalCnt: number = PET_DUNGEON_TOY_CELL_CNT * PET_DUNGEON_TOY_CELL_CNT;
        this._values = new Array(totalCnt).fill(0);
    }

    public get id(): number {
        return this._id;
    }

    public get configId():number {
        return this._configId;
    }

    public set configId(value:number) {
        if (this._configId != value) {
            this._configId = value;
        }
    }

    public get value(): number {
        return this._value;
    }

    public get values(): number[] {
        return this._values;
    }


    public get shapeVo(): PetDungeonToyShapeVo {
        return this._shapeVo;
    }

    public get posIdx(): number {
        return this._posIdx;
    }

    public set posIdx(value:number) {
        if (this._posIdx != value) {
            this._posIdx = value;
            this._value = this._shapeVo.cfgValue >> value;
            this._values = this.getValues(this._value);
        }
    }

    /**根据数值计算格子占位数组*/
    public getValues(value: number): number[] {
        let valueStr = value.toString(2);
        let totalCnt: number = PET_DUNGEON_TOY_CELL_CNT * PET_DUNGEON_TOY_CELL_CNT;
        let values = valueStr.split('').map(Number);
        if (values.length < totalCnt) {
            let zeroArr = new Array(totalCnt - values.length).fill(0);
            values = zeroArr.concat(values);
        }
        return values;
    }

    /**初始化配置*/
    public initConfig(id: number, configId:number, shapeVo: PetDungeonToyShapeVo): void {
        this._id = id;
        this._configId = configId;
        this._shapeVo = shapeVo;
    }

    /**通过后端数据更新位置初始化*/
    public updatePosFromServer(grids: number[]): void {
        let arr = grids.concat().sort((a, b) => {
            return a - b;
        });
        //后端数据从1开始
        let fristValidIdx: number = arr[0] - 1;
        let defaultFirstVaildIdx: number = this._shapeVo.cfg.values.findIndex(value => value == 1);
        let posIdx: number = fristValidIdx - defaultFirstVaildIdx;
        this.posIdx = posIdx;
    }
}