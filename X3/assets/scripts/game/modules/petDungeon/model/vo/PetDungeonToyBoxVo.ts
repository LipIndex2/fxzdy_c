import GIns from "../../../../GIns";
import { PET_DUNGEON_TOY_CELL_CNT, PetDungeonToyShapeVo } from "./PetDungeonToyShapeVo";
import { PetDungeonToyVo } from "./PetDungeonToyVo";

/**玩具箱子vo*/
export class PetDungeonToyBoxVo {
    protected _values: number[] = [];
    protected _value: number = 0;
    protected _toyConfigMap: Map<number, boolean> = new Map();
    public toys: PetDungeonToyVo[] = [];
    public toyMap: Map<number, PetDungeonToyVo> = new Map();

    constructor() {
        let totalCnt: number = PET_DUNGEON_TOY_CELL_CNT * PET_DUNGEON_TOY_CELL_CNT;
        this._values = new Array(totalCnt).fill(0);
    }

    /**二进制值*/
    public get boxValue(): number {
        return this._value;
    }

    /**二进制值数组*/
    public get boxValues(): number[] {
        return this._values;
    }

    /**是否在箱子中*/
    public isInBox(configId: number): boolean {
        if (this._toyConfigMap.has(configId)) {
            return this._toyConfigMap.get(configId);
        }
        return false;
    }

    /**计算玩具放入对应位置的数值数组*/
    public getShapeValuesForBox(index: number, shapeVo: PetDungeonToyShapeVo): number[] {
        let value = shapeVo.cfgValue >> index;
        return this.getValues(value);
    }

    /**计算玩具放入对应位置的后端用数组*/
    public getGridValuesForBox(index: number, shapeVo: PetDungeonToyShapeVo): number[] {
        let shapeValues: number[] = this.getShapeValuesForBox(index, shapeVo);
        let arr: number[] = [];
        shapeValues?.forEach((value: number, index: number) => {
            if (value == 1) {
                arr.push(index + 1);
            }
        })
        return arr;
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

    /**更新当前格子数组*/
    public updateValues(): void {
        this._values = this.getValues(this._value);
    }

    /**更新所有玩具*/
    public updateToys(buffList: Vo.petdungeon.PetDungeonToy[]): void {
        let toyMap = this.toyMap;
        let toys = this.toys;
        toys.length = 0;
        let newMap = new Map();
        let value: number = 0;
        this._toyConfigMap.clear();
        if (buffList && buffList.length > 0) {
            for (let i = 0; i < buffList.length; i++) {
                let data = buffList[i];
                let toyVo: PetDungeonToyVo = null;
                if (toyMap.has(data.id)) {
                    //id相同 重复利用
                    toyVo = toyMap.get(data.id);
                    toyMap.delete(data.id);
                } else {
                    toyVo = new PetDungeonToyVo();
                }
                let shapeVo = GIns.petDungeonModel.getToyShapeVoByConfigId(data.toyId);
                if (shapeVo == null) {
                    //形状配置不存在统一当做没有这玩具
                    continue;
                }
                toyVo.initConfig(data.id, data.toyId, shapeVo);
                toyVo.updatePosFromServer(data.grids);
                if (newMap.has(data.id) == false) {
                    //防止重复数据
                    toys.push(toyVo);
                    newMap.set(data.id, toyVo);
                    value = value | toyVo.value;
                    this._toyConfigMap.set(data.toyId, true);
                }
            }
        }
        toyMap.clear();
        this.toyMap = newMap;
        if (this._value != value) {
            this._value = value;
            this.updateValues();
        }
    }

}