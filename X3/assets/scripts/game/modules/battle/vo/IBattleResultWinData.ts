import { Handler } from "../../../../core/utils/Handler";
import { FightType } from "../../../comm/battle/enum/FightType";

export interface IBattleResultWinData {
    fightType?: FightType;
    exData?: any;
    isWin?: boolean;
    closeCllBack?: Handler
}