import { game } from "cc";
import { GameTimer } from "../timer/GameTimer";


enum TablePropType {
    INT = 1,
    NUMBER,
    STRING,
    JSON,
    BOOL,
}

/**
 * 数值表解析
 */
export class TableZipParser {
    private strPath = "localdata/str.json";
    private str: Array<any>;
    private allTableMap: any = {};//Object.create(null);
    private allTableArray: any = {};//Object.create(null);
    private tempJson: any = {};//Object.create(null);
    private zipd: JSZip;

    public isLoaded = false;

    private _getZeroNum = {
        get: function () {
            return 0;
        }
    }

    private _getOneNum = {
        get: function () {
            return 1;
        }
    }

    public isComplete() {
        return this.isLoaded && !this.zipd;
    }

    /**
     * 解析Zip压缩数据
     * @param data 传进来个的是zip文件数据
     * @param onComplete
     * @param parserFileList 需要在加载之后就解析的文件，如果没有指定，则默认加载之后就立刻解析所有的文件
     */
    parser(data: ArrayBuffer, onComplete: () => void, parserFileList?: Array<string>): void {

        var zipd = new JSZip();
        zipd.load(data, null);
        this.zipd = zipd;

        let strPath = this.strPath;

        // @ts-ignore
        let zipTabData: JSZipObject = zipd.files[strPath];
        let tableJSONData = JSON.parse(zipTabData.asText());
        zipd.remove(strPath);
        this.str = tableJSONData;

        this.isLoaded = true;
        this.parserTableList(onComplete, parserFileList);
    }

    public parserTableList(onComplete: () => void, parserFileList?: Array<string>): void {
        if (!this.zipd) {
            onComplete && onComplete();
            return;
        }
        // @ts-ignore
        parserFileList = parserFileList || Object.keys(this.zipd.files);
        let count = parserFileList.length;

        if (count === 0) {
            onComplete && onComplete();
            return;
        }

        let i = 0;
        let current = 0;
        let strPath = this.strPath;
        //分帧解析
        let parser = () => {
            // let t: number = game.totalTime;
            for (i = current; i < count; ++i) {
                if (parserFileList[i] !== strPath) {
                    this.parserTable(parserFileList[i].replace("localdata/", ""));
                }
                if (i === count - 1) {
                    //所有的都解析完毕了，就立刻删除，节省内存
                    let keys = Object.keys(this.zipd.files)
                    if (keys.length === 0) {
                        this.zipd = null;
                        this.tempJson = null;
                        this.str = null;
                        this._getZeroNum = null;
                        this._getOneNum = null;
                    }
                    onComplete && onComplete();
                    break;
                }
                if (game.totalTime - game.frameStartTime > 33) {
                    current = i + 1;
                    GameTimer.ins().frameOnce(1, this, parser);
                    break;
                }
            }
        }
        GameTimer.ins().frameOnce(1, this, parser);
    }

    /**
     * 解析单张表格
     * @param path
     * @private
     */
    parserTable(path: string) {
        if (this.allTableMap[path]) {
            return;
        }

        let compressPath = "localdata/" + path;
        let zipd = this.zipd;
        // @ts-ignore
        let zipTabData: JSZipObject = zipd.files[compressPath];
        let tableJSONData: Array<any> = JSON.parse(zipTabData.asText());
        zipd.remove(compressPath);
        if (!tableJSONData || tableJSONData.length === 0) {
            this.allTableMap[path] = [];
            this.allTableArray[path] = [];
            return;
        }
        var dataIndex = -1;

        //字段个数
        let propCount = tableJSONData[++dataIndex];
        let propName = new Array(propCount);
        let propType = new Array(propCount);
        for (var i = 0; i < propCount; ++i) {
            //数据类型
            propType[i] = tableJSONData[++dataIndex];
            //字段名字
            propName[i] = this._getCommonData(tableJSONData[++dataIndex], 3);
        }

        //表的行数
        let rowCount = tableJSONData[++dataIndex];
        let tableData = [], type;

        for (var i = 0; i < propCount; ++i) {
            type = propType[i];
            switch (type) {
                case TablePropType.INT:
                case TablePropType.NUMBER:
                case TablePropType.BOOL:
                    tableData.push(tableJSONData.slice(dataIndex + 1, rowCount + dataIndex + 1));
                    dataIndex += rowCount;
                    break;
                case TablePropType.STRING:
                case TablePropType.JSON:
                    let r = new Array(rowCount);
                    for (let n = 0; n < rowCount; ++n) {
                        r[n] = this._getCommonData(tableJSONData[++dataIndex], type);
                    }
                    tableData.push(r);
                    break;
            }
        }

        let tableObj: any = {}/*Object.create(null)*/, columnName, value, rowObj;
        let tableArray: Array<any> = new Array<any>(rowCount);
        for (var r = 0; r < rowCount; ++r) {
            rowObj = {};//Object.create(null);
            for (var i = 0; i < propCount; ++i) {
                columnName = propName[i];
                value = tableData[i][r];

                //为了节省内存，对于为0或1的数值，统一使用get的方式获取，不直接保存到这个JSON对象中
                if (value === 0) {
                    Object.defineProperty(rowObj, columnName, this._getZeroNum);
                } else if (value === 1) {
                    Object.defineProperty(rowObj, columnName, this._getOneNum);
                } else {
                    rowObj[columnName] = Object.freeze(value);//锁住，防止修改
                }
            }
            rowObj = Object.freeze(rowObj);//锁住，防止修改
            //第一列的字段永远默认为ID列
            tableObj[rowObj[propName[0]]] = rowObj;
            tableArray[r] = rowObj;
        }

        this.allTableMap[path] = tableObj;
        this.allTableArray[path] = tableArray;
    }

    getData(path: string): any {
        let data = this.allTableMap[path];
        if (!data) {
            this.parserTable(path);
        }
        return this.allTableMap[path];
    }

    getDataArray(path: string): Array<any> {
        let data = this.allTableArray[path];
        if (!data) {
            this.parserTable(path);
        }
        return this.allTableArray[path];
    }

    private _getCommonData(cellData, type) {
        if (typeof cellData === "number") {
            cellData = this.str[cellData];
        }

        if (type === TablePropType.JSON && typeof cellData === "string") {
            if (this.tempJson[cellData]) {
                return this.tempJson[cellData];
            }
            let ob = JSON.parse(cellData);
            this.tempJson[cellData] = Object.freeze(ob);//锁住，防止修改
            return ob;
        }

        return cellData;
    }
}