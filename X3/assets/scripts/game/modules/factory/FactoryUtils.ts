import { Color } from "cc";
import { ItemUtils } from "../item/utils/ItemUtils";

export class FactoryUtils {
    /**刷新颜色*/
    static refreshColor: Color = Color.WHITE
    /**我占领的颜色*/
    static myTimeColor: Color = new Color('#50ff50')
    /**其他人占领的颜色*/
    static otherTimeColor: Color = new Color('#FF5050')
    
    /** 获取字体品质色 */
    static getTextColor(quality: number) {
        return ItemUtils.getTextColor(quality + 2)
    }
}