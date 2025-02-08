import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";


export interface IModuleAttrApi {

    /**
     * 获取所有提供的合并后的属性
     */
    getMergedAllAddAttrDataArray(): Array<AttrData>;
    
}