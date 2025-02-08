import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { C_PetVo } from "../../pet/vo/PetContext";

/**前端布阵技能数据*/
export type FormationSkillVo = C_PetVo | CollectionsVo;

/**后端其他玩家的布阵技能信息*/
export type FormationSkillVisitVo = Vo.formation.CollectiblesVisitVo | Vo.formation.PetVisitVo;