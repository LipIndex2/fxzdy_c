import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TaskState } from "../../season/EnumSeason";
import { EnumRedDotShowType } from "../redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "../redDot/utils/RedDotUtils";
import { ItemFrameBtn } from "./ItemFrameBtn";
import * as fgui from "fairygui-cc";

/**赛季竞速 item*/
export class ItemFrameStateBtn extends fgui.GComponent {

    private get view(): ui.comm.item.ItemFrameStateBtn {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    public onInit() {

    } 

    
    reset(vo:{
        k: any;
        v: any;
    }, state:number, touch:boolean = true) {
        const t = this;
        const view = t.view;
        const item = FguiScriptUtils.toMyScriptClass(view.item, ItemFrameBtn)
        item.reset(vo.k,vo.v);

        item.touchable = true;
        switch(state){
            case TaskState.ING:
                view.mask.visible = false;
                this.refreshRedDotUI(this.view.redDot1, false);
                break;
            case TaskState.CAN_GET:
                view.mask.visible = false;
                item.touchable = touch;
                this.refreshRedDotUI(this.view.redDot1, true);
                break;
            case TaskState.FINISH:
                view.mask.visible = true;
                this.refreshRedDotUI(this.view.redDot1, false);
                break;
        }
    }


    private refreshRedDotUI(redDot: ui.comm.com.RedDot, isCanGain: boolean) {
        const redDotCom = RedDotUtils.castComp(redDot);
        if (isCanGain) {
            redDotCom.showByType(EnumRedDotShowType.ITEM_HEIGHT_LIGHT);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }
    }

    protected onEnable(): void {
        super.onEnable();
    }

    protected onDisable(): void {
        super.onDisable();

    }
}