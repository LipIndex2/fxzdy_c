/**玩具格子数 5x5*/
export const PET_DUNGEON_TOY_CELL_CNT = 5;

/**玩具形状vo*/
export class PetDungeonToyShapeVo {
    public static maxRowValue: number = 0;
    public static maxColValue: number = 0;

    protected _cfg: table.petdungeon.PetDungeonToyShapeConfig;
    protected _maxRow: number;
    protected _maxCol: number;
    protected _cfgValue: number;

    /**创建vo静态函数*/
    public static create(cfg: table.petdungeon.PetDungeonToyShapeConfig): PetDungeonToyShapeVo {
        let vo = new PetDungeonToyShapeVo();
        vo.initByCfg(cfg);
        return vo;
    }

    /**初始化最大值 在创建vo之前需要调用一次*/
    public static initMaxValue(): void {
        let value1: number = 1;
        let value2: number = 1;
        let rowValue: number = value1;
        let colValue: number = value2;
        //计算出比较的最大行和列的二进制数据
        for (let i = 1; i < PET_DUNGEON_TOY_CELL_CNT; i++) {
            value1 = value1 << 1;
            rowValue += value1;
            value2 = value2 << PET_DUNGEON_TOY_CELL_CNT;
            colValue += value2;
        }
        this.maxRowValue = rowValue;
        this.maxColValue = colValue;
    }

    /**配置数据*/
    public get cfg(): table.petdungeon.PetDungeonToyShapeConfig {
        return this._cfg;
    }

    /**最大行 1-4*/
    public get maxRow(): number {
        return this._maxRow;
    }

    /**最大列 1-4*/
    public get maxCol(): number {
        return this._maxCol;
    }

    /**形状配置的二进制值*/
    public get cfgValue(): number {
        return this._cfgValue;
    }

    public initByCfg(cfg: table.petdungeon.PetDungeonToyShapeConfig): void {
        this._cfg = cfg;

        let len: number = PET_DUNGEON_TOY_CELL_CNT * PET_DUNGEON_TOY_CELL_CNT;
        if (cfg.values.length != len) {
            console.warn(`玩具形状id:${cfg.id}配置不合法`);
            return;
        }
        //配置的二进制值
        this._cfgValue = parseInt(cfg.values.join(''), 2);
        this._maxCol = this._maxRow = PET_DUNGEON_TOY_CELL_CNT;

        let rowValue: number = PetDungeonToyShapeVo.maxRowValue;
        let colValue: number = PetDungeonToyShapeVo.maxColValue;;
        //比较行数
        // console.log('cfgValue', cfgValue.toString(2));
        for (let i = 1; i < PET_DUNGEON_TOY_CELL_CNT; i++) {
            // console.log('rowValue', i, rowValue.toString(2));
            if ((rowValue & this._cfgValue) > 0) {
                //满足条件
                break;
            } else {
                rowValue = rowValue << PET_DUNGEON_TOY_CELL_CNT;
                this._maxRow--;
            }
        }
        //比较列数
        for (let i = 1; i < PET_DUNGEON_TOY_CELL_CNT; i++) {
            // console.log('colValue', i, colValue.toString(2));
            if ((colValue & this._cfgValue) > 0) {
                //满足条件
                break;
            } else {
                colValue = colValue << 1;
                this._maxCol--;
            }
        }
    }
}