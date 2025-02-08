import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";

export class AttrEffectUtils {

    /**
     * 获取生效类型
     * @param effectTypeName
     */
    static getEffectTypeByName(
        effectTypeName: string
    ): ServerEnums.Career | ServerEnums.TalentEffectType | ServerEnums.CollectiblesEffectType | null {
        if (StringUtils.isBlank(effectTypeName)) {
            return null;
        }
        if (effectTypeName in ServerEnums.Career) {
            return ServerEnums.Career[effectTypeName];
        }
        if (effectTypeName in ServerEnums.TalentEffectType) {
            return ServerEnums.TalentEffectType[effectTypeName];
        }
        if (effectTypeName in ServerEnums.CollectiblesEffectType) {
            return ServerEnums.CollectiblesEffectType[effectTypeName];
        }
        return null;
    }
}