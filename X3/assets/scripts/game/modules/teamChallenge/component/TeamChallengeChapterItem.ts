import * as fgui from "fairygui-cc";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeItem } from "./TeamChallengeItem";
import { EnumCTChapterState } from "../enum/EnumTeamChallengeChapterState";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import GIns from "../../../GIns";

/**组队副本， 组队大厅item */
export class TeamChallengeChapterItem extends fgui.GComponent {
    
    private _cfg:table.teaminstance.TeamInstanceChapterConfig;


    private get view(): ui.teamChallenge.components.TeamChallengeChapterItem {
        return this as any;
    }

    private get model():TeamChallengeModel{
        return TeamChallengeModel.ins();
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit();
    }

    public onInit() {
        const t = this;
        t.view.onClick(t.onClickHandle, t);
        t.view.listItems.itemRenderer  = t.additem.bind(t);
    }
    
    /**点击回调 */
    onClickHandle(){
        const t = this;
        const state = TeamChallengeModel.ins().chapterRewardState(t._cfg.id);
        if(state == EnumCTChapterState.CAN_GAIN){
            TeamChallengeModel.ins().sendDrawChapterReward({chapterId:t._cfg.id});
        }

    }

    reset(cfg:table.teaminstance.TeamInstanceChapterConfig) {
        const t = this;
        t._cfg = cfg;
        const view = t.view;

        const conditions = GIns.conditionMgr.getAllConditions(cfg.unlockVerifies);
        const condition =  conditions.find(v=>{
            return v.check() == false;
        })
        if(condition){
            view.groupLock.visible = true;
            view.lbCondition.text =  GIns.conditionMgr.getUnlockTipByCondition(condition);
        }else{
            view.groupLock.visible = false;
            view.lbCondition.text =  '';
        }
    

        view.lbName.text = cfg.chapterName;

        //设置章节形象
        view.bg.icon = cfg.iconPath;
        t.view.listItems.numItems = cfg.rewards.length;

        t.refreshRedDot();

        const state = TeamChallengeModel.ins().chapterRewardState(t._cfg.id);
        if(state == EnumCTChapterState.CAN_GAIN){
            t.view.listItems.touchable = false;
        }else{
            t.view.listItems.touchable = true;
        }

    }



    refreshRedDot() {
        const t = this;
        const cfg = t._cfg;
        const redDotCom = RedDotUtils.castComp(this.view.redDot);

        const isHaveRedDot = RedDotManager.ins().isHaveRedDot(RedDotKeys.TeamChallenge_CRewards, [cfg.id]);
        if (!isHaveRedDot) {
            redDotCom.showByType(EnumRedDotShowType.NULL);
            return;
        }
        let state = TeamChallengeModel.ins().chapterRewardState(cfg.id);
        if (state == EnumCTChapterState.CAN_GAIN) {
            redDotCom.showByType(EnumRedDotShowType.REWARD);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }
    }


    additem(index:number, item:TeamChallengeItem){
        const t = this;
        const reward = t._cfg.rewards[index];
        const state = TeamChallengeModel.ins().chapterRewardState(t._cfg.id);
        item.reset(reward, state)
    }

}