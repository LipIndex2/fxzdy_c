import { Color, Label, Material } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { EnumQualityFontColorType } from "db://assets/scripts/game/modules/common/quality/enums/EnumQualityFontColorType";
import { Res } from "db://assets/scripts/core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Logger } from "db://assets/scripts/core/log/Logger";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";

export class QualityUtils {
    /**
     * 获取品质配置
     * @param quality
     */
    static getQualityConfigById(quality: number): table.quality.QualityConfig {
        const config = G.TableManager.getDataById(table.quality.QualityConfig, quality);
        if (!config) {
            G.Logger.error(`QualityConfig not found by id: ${quality}`);
            return null;
        }
        return config;
    }

    /**
     * 获取品质颜色
     * @param quality
     */
    static getQualityColor(quality: number): Color {
        const qualityConfig = this.getQualityConfigById(quality);
        const fontColor = qualityConfig?.fontColor;
        if (!fontColor) {
            return Color.WHITE;
        }
        return new Color(fontColor);
    }

    /**
     * 设置字体品质颜色
     * @param label 文本
     * @param quality
     */
    static setFontColorByQuality(label: Label, quality: number) {
        const qualityConfig = this.getQualityConfigById(quality);
        const fontColorType = qualityConfig?.fontColorType;
        const fontColor = qualityConfig.fontColor;

        if (fontColorType == EnumQualityFontColorType.SINGLE) {
            // 单一颜色
            if (label.customMaterial) {
                label.customMaterial = null;
            }
            label.color = new Color(fontColor);
            return;
        } else if (fontColorType == EnumQualityFontColorType.GRADIENT) {
            // 渐变颜色
            label.color = new Color("#FFFFFF");

            Res.getResRefByUrl("effect/color/FontColor", AssetBundleKeys.EFFECT, Material, (ref) => {
                if (!ref) {
                    Logger.error("没找到 shader. ");
                    return;
                }
                if (NodeUtils.isNotValidNode(label.node)) {
                    return;
                }

                label.outlineWidth = 2;
                const material = ref.content;
                if (!material) {
                    return;
                }
                label.customMaterial = material;

                label.cacheMode = Label.CacheMode.NONE;

                label.customMaterial.setProperty("color1", new Color(fontColor));
                label.customMaterial.setProperty("color2", new Color(qualityConfig.fontColor2));
                label.customMaterial.setProperty("color3", new Color(qualityConfig.fontColor3));
            });
            return;
        } else {
            // 都不命中, 则单一颜色处理
            label.material = null;
            label.color = new Color(fontColorType);
        }
    }

    /**
     * 设置 FGUI 字体颜色 by 品质
     * @param labelHeroName
     * @param quality
     */
    static setFGUIFontColorByQuality(labelHeroName: FGUI.GTextField, quality: number) {
        const label = labelHeroName.node.getComponent(Label);
        if (label == null) {
            return;
        }
        labelHeroName.color = new Color("#FFFFFF");
        this.setFontColorByQuality(label, quality);
    }
}
