/**组队副本 */
import * as fgui from "fairygui-cc";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { EnumCTChapterState } from "../enum/EnumTeamChallengeChapterState";

/**组队副本， 组队大厅item */
export class TeamChallengeItem extends fgui.GComponent {

    private get view(): ui.teamChallenge.components.TeamChallengeItem {
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
    }, state:number) {
        const t = this;
        const view = t.view;
        const item = FguiScriptUtils.toMyScriptClass(view.item, ItemFrameBtn)
        item.reset(vo.k,vo.v);
        /**
         * 0-没解锁 1-可领取 2-已领取
         */
        item.touchable = true;
        switch(state){
            case EnumCTChapterState.LOCK:
                view.mask.visible = false;
                this.refreshRedDotUI(this.view.redDot1, false);
                break;
            case EnumCTChapterState.CAN_GAIN:
                view.mask.visible = false;
                item.touchable = false;
                this.refreshRedDotUI(this.view.redDot1, true);
                break;
            case EnumCTChapterState.HAVE_GAIN:
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