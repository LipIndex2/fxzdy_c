import * as fgui from "fairygui-cc";
import { TeamChallengePage2Btn } from "./TeamChallengePage2Btn";
 
export class TeamChallengePage3Btn extends TeamChallengePage2Btn {


    get view(): ui.teamChallenge.components.TeamChallengePage3Btn {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();
    }

}