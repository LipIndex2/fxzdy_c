import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { FormationModel } from "db://assets/scripts/game/modules/formation/model/FormationModel";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";

export class FormationUtils {

    /**
     * 同步主线阵容, 如果本身阵容是空的
     * @param fightType
     * @param index
     * @param subType
     */
    static copyMainFormationIfMyTypeFormationEmpty(fightType: ServerEnums.FightType,
                                                   index: number = 0,
                                                   subType: string = null
    ) {
        const manager = FormationManager.ins();
        
        let isHaveFormation = manager.isHveFormationByFightType(fightType, index, subType);
        if (isHaveFormation) {
            return;
        }
        
        // 同步主线阵容
        const newVo = manager.getDefaultFormationVo().clone();
        newVo.fightType = fightType;
        newVo.index = index;
        newVo.subType = subType;

        // save 阵容
        FormationModel.ins().setUpFormation(fightType, newVo.toSetUpReqVo());
    }

}