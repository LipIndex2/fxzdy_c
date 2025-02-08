export class GainItemEffectUtils {
    /***记录下1次特效的自定义位置 */
    public static nextEffectOtherMap: { [itemId: number]: { x: number, y: number } };

    public static setNextEffectOtherMap(itemId: number, x: number, y: number): void {
        if (!this.nextEffectOtherMap)
            this.nextEffectOtherMap = {}

        this.nextEffectOtherMap[itemId] = { x: x, y: y };
    }
}