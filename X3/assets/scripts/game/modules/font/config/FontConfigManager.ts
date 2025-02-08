import { Label, Material } from "cc";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { EnumFontSkinType } from "db://assets/scripts/game/modules/font/enums/EnumFontSkinType";
import { Res } from "db://assets/scripts/core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Logger } from "db://assets/scripts/core/log/Logger";

/**
 * 字体配置
 */
export class FontConfigManager {

    /**
     * 字体皮肤
     * @param id
     */
    static getFontSkinConfig(id: number): table.font.FontSkinConfig | null {
        return TableManager.getDataById(table.font.FontSkinConfig, id)
    }


    /**
     * 设置字体皮肤
     * @param label
     * @param skinId
     */
    static setFontSkinById(label: Label, skinId: number) {
        let skinCfg = this.getFontSkinConfig(skinId);
        if (skinCfg) {
            const type = skinCfg.type;
            if (type == EnumFontSkinType.COLOR) {
                label.color = ColorUtils.createColor(skinCfg.colorStr);

            }

            if (type == EnumFontSkinType.SHADER) {
                Res.getResRefByUrl(
                    skinCfg.materialPath,
                    AssetBundleKeys.DEFAULT,
                    Material,
                    (ref) => {
                        if (!ref) {
                            Logger.warn(`没找到字体皮肤. fontSkinId = ${skinId}`);
                            return;
                        }

                        label.material = ref.content as Material;
                    }
                );
            }


        }
    }
}