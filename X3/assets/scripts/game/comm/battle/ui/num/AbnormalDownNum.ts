import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { AbnormalType } from "../../skill/SkillEnum";
import { BattleNum } from "./BattleNum";

@bindFguiExtension("ui://battleNum/AbnormalDownNum")
export class AbnormalDownNum extends BattleNum {
    protected abnormalType: AbnormalType

    protected get view(): ui.battleNum.num.AbnormalDownNum {
        return this as any;
    }

    setParam(abnormalType: number): void {
        this.abnormalType = abnormalType;
        this.view.scaleY = this.view.scaleX = 0.8
    }

    setValue(str: string) {
        let name: string
        if (AbnormalType.suppress == this.abnormalType) {
            name = "xuanyun"
        }
        else if (AbnormalType.dizziness == this.abnormalType) {
            name = "xuanyun"
        }
        else if (AbnormalType.petrifaction == this.abnormalType) {
            name = "shihua"
        }

        if (name) {
            this.view.img.icon = "image/battleFont/" + name;
            this.tweenHandler();
        }
    }

    protected tweenHandler(): void {
        let tranName = "t"
        if (AbnormalType.dizziness == this.abnormalType || AbnormalType.petrifaction == this.abnormalType) {
            tranName = "xuanyun"
        }
        this.tran = this.view.getTransition(tranName);
        this.tran.play(this.onPlayEnd.bind(this));
    }
}