import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import { TalentMainView } from "./view/TalentMainView";
import { TalentNewEffectTipsWin } from "./view/TalentNewEffectTipsWin";


export class UITalentKeys {

    /**
     * 天赋
     */
    static readonly TalentMainView = UIBindingKey.create("TalentMainView", TalentMainView);

    static readonly TalentNewEffectTipsWin = UIBindingKey.create("TalentNewEffectTipsWin", TalentNewEffectTipsWin);

}