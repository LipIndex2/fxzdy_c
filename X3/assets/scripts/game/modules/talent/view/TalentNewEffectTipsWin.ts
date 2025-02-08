
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
 
export class TalentNewEffectTipsWin extends UICommWin {
    static pkgName: string = "talent";
    static viewName: string = "TalentNewEffectTipsWin";
    private _talentId: number;

    private get view(): ui.talent.TalentNewEffectTipsWin {
        return this._view as any;
    }

    protected onInit(): void {
 
    }

    public onOpen(talentId:number): void {
        this._talentId = talentId;

        this.updateUI();
    }

    private updateUI() {
        const talentId = this._talentId;
        if(talentId){
            const config =  TableManager.getDataById(table.talent.TalentConfig, talentId);
            if(config){
                this.view.labelTitle.text = config.desc;
                this.view.imageLogo.icon = config.iconPathForBigTalent;
                this.view.labelTips.text = config.fetterDec;
            }
        }
    }
}