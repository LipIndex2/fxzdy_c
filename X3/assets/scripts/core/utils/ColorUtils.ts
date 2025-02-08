import { math } from "cc";
import { UIRenderer } from "cc";
import { Color } from "cc";
import { MathUtils } from "./MathUtils";

/**
 * 颜色工具
 */
export class ColorUtils {


    /**
     * 白色
     */
    public static readonly COLOR_WHITE: Color = new Color("#FFFFFF");
    /**
     * 灰色
     */
    public static readonly COLOR_GRAY: Color = new Color("#636363");
    /**
     * 绿色
     */
    public static readonly COLOR_GREEN: Color = new Color("#00FF00");
    public static readonly COLOR_GREEN2: Color = new Color("#4AF392");
    /**
     * 紫色
     */
    public static readonly COLOR_PURPLE: Color = new Color("#800080");
    /**
     * 棕色
     */
    public static readonly COLOR_BROWN: Color = new Color("#74480e");
    /**
     * 红色
     */
    public static readonly COLOR_RED: Color = new Color("#FF0000");
    public static readonly COLOR_RED2: Color = new Color("#ff5151");

    /**
     * 橙色
     */
    public static readonly COLOR_ORANGE: Color = new Color("#FFA500");

    /**
     * 蓝色
     */
    public static readonly COLOR_BLUE: Color = new Color("#0000FF");

    /**
     * 创建颜色
     * @param hexStr
     */
    public static createColor(hexStr: string): Color {
        return new Color(hexStr)
    }

    /***字符串颜色转[r,g,b] */
    public static colorStringToRGB(colorString: string): [number, number, number] {
        const r = parseInt(colorString.substring(1, 3), 16);
        const g = parseInt(colorString.substring(3, 5), 16);
        const b = parseInt(colorString.substring(5, 7), 16);
        return [r, g, b];
    }

    /**设置透明度 
     * @param node 渲染节点
     * @param alpha 0-1 透明度
    */
    public static setAlpha(node: UIRenderer, alpha: number) {
        let color = math.color(node.color);
        color.a = MathUtils.clamp(alpha * 255, 0, 255);
        return color;
    }
}