import { Handler } from "../../../core/utils/Handler";
import { Attribute } from "./AttrEnum";
import { AttrInfo } from "./AttrInfo";
import { AttrData } from "./AttrManager";

/** 属性节点 */
export class AttrNode {
    public id: string
    /***该节点的战力 */
    public fight: number = 0;
    /***该节点的属性列表和子级属性的和，通常在数据需要刷新时会更新 */
    public attrTotalInfo: { [key: number]: AttrData } = {};
    /***是否需要重新计算该节点下的战力 */
    public isDirtyFight: boolean = true;
    /***子节点 */
    public childNode: AttrNode[];
    /***父级节 */
    public parentNode: AttrNode;
    /***属性更新的方法,返回一个 { [key: number]: AttrData } */
    public updateHandler: Handler;

    /***更新属性 */
    public update(): void {
        //该子节点的总属性重置
        for (let key in this.attrTotalInfo) {
            this.attrTotalInfo[key].num = 0;
        }

        let attrMap: { [key: number]: AttrData } = this.updateHandler.run();
        for (let key in attrMap) {
            this.addValueToMap(key, attrMap[key].num)
        }

        if (this.childNode) {
            //找子级的属性相加
            for (let i = 0; i < this.childNode.length; i++) {
                for (let key in attrMap) {
                    let value = this.childNode[i].getAttrValueByKey(key)
                    this.addValueToMap(key, value)
                }
            }
        }

        // this.calculateBaseAttr(this.attrTotalInfo[Attribute.ATK], this.attrTotalInfo[Attribute.ATK_BONUS], this.attrTotalInfo[Attribute.ATK_BONUS])

        if (this.parentNode) {
            //子级改变，那边这条链的父级都要改变
            this.parentNode.update();
        }
        this.isDirtyFight = true;
    }

    /***根据属性类型获取属性的值 */
    public getAttrValueByKey(key: number | string): number {
        if (!this.attrTotalInfo)
            return 0;
        return this.attrTotalInfo[key] || 0;
    }

    /***计算基础的攻血防，处理它的百分比属性和加值 */
    // private calculateBaseAttr(baseNum: number, add: number = 0, extraAttr: number = 0): void {
    //     //面板属性 = 基础属性 * （ 1 + 百分比加成 ）+ 额外属性 * ( 1 + 职业模板修正)
    //     let num = baseNum * (1 + add) + extraAttr * (1 + mod);
    // }

    public addValueToMap(key: any, value: number): void {
        if (!this.attrTotalInfo[key]) {
            this.attrTotalInfo[key] = new AttrData()
            this.attrTotalInfo[key].id = key;
        }
        this.attrTotalInfo[key].num = value;
    }

    /***获取该节点战力 */
    public getFight(): number {
        if (this.isDirtyFight)
            return this.fight;

        //∑ ( 面板属性值 * 面板属性战力系数 ）
        let panelFight: number = 0;
        for (let key in this.attrTotalInfo) {
            let attrInfo = this.attrTotalInfo[key]
            if (attrInfo.num && attrInfo.worth) {
                panelFight += attrInfo.num * attrInfo.worth;
            }
        }

        this.isDirtyFight = false;
        return 0;
    }
}