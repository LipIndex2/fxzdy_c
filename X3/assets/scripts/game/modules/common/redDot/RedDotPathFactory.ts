import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";

export class RedDotPathFactory {

    /**
     * 
     * @param template
     * @param showType 默认是没有红点 | 
     */
    static create(template: string,
                  showType: EnumRedDotShowType = EnumRedDotShowType.NULL
    ): RedDotPath {
        const path = RedDotPath.create(template, showType);

        // register
        RedDotManager.ins().registerRedDotShowType(path, showType);

        return path;
    }
}