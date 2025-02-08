import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import FGUI from "../../../../../core/fgui/FGUI";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../../event/NotificationKey";

@bindFguiExtension("ui://petGift/PetGiftPageBtn")
export class PetGiftPageBtn extends FGUI.GComponent {
    
    private _day: number = 1;


    get view(): ui.petGift.component.PetGiftPageBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
    }

    onClickDay() {
        FacadeManager.ins().emit(NotificationKey.PET_GIFT_CHOOSE_DAY, this._day);
    }

    reset(cfg: table.activity.PetGift.PetGiftConfig,chooseDay:number) {
        this._day = cfg.openDay;
        //当前是选中
        if(this._day ==chooseDay){
            this.view.selImg.visible = true;
            this.view.unselImg.visible = false;
        }else{
            this.view.selImg.visible = false;
            this.view.unselImg.visible = true;
        }
    }

}