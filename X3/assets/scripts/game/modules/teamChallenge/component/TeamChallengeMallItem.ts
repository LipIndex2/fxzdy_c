import * as fgui from "fairygui-cc";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { TableManager } from "../../../../core/table/TableManager";
import { INotification } from "../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../event/NotificationKey";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import FGUINotificationComponent from "../../../../core/fgui/com/FGUINotificationComponent";

/**组队副本， 组队大厅item */
export class TeamChallengeMallItem extends FGUINotificationComponent {

    private _avatars: any[];
    private _vo: Vo.teaminstance.TeamBriefVo;

    private get view(): ui.teamChallenge.components.TeamChallengeMallItem {
        return this as any;
    }

    constructor() {
        super();
    }
    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_APPLY_SUCESS,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_APPLY_SUCESS:
                this.updateApply();
                break;
        }
    }

    public onInit() {
        const t = this;
        t.view.btnApply.onClick(t.onApply.bind(t), t);
        t.view.listAvatars.itemRenderer = t.addAvatar.bind(t);
    }


    onApply() {
        //申请
        TeamChallengeModel.ins().sendApplyJoinTeam({ teamId: this._vo.id });
    }

    /**tid队伍id s战力 stage关卡 n名字*/
    reset(args: Vo.teaminstance.TeamBriefVo) {
        const t = this;
        t._vo = args;
        let cfg = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig)
            .find(v => { return v.teamInstanceConfigIds.indexOf(args.teamInstanceConfigId) != -1 });
        const info = TeamChallengeModel.ins().getFloorInfo(args.teamInstanceConfigId);
        t.view.lbFloor.text = `${cfg.chapterName}第${info?.cur}关`;
        t.view.lbName.text = args.name;

        if (args.fightLimit && args.fightLimit > 0) {
            //有分数限制
            t.view.imgFight.visible = true;
            /**战力显示处理接口 */
            t.view.lbCondition.text = StringUtils.getFightStr(args.fightLimit);
        } else {
            t.view.imgFight.visible = false;
            t.view.lbCondition.text = '无限制'
        }

        t._avatars = args?.memberVos ? args?.memberVos : [];
        TeamChallengeModel.ins().membersSort(t._avatars, args.leaderId);
        t.view.listAvatars.numItems = 3;

        if (TeamChallengeModel.ins().isApply(args.id)) {
            //已经申请
            t.view.btnApply.visible = false;
        } else {
            t.view.btnApply.visible = true;
        }

        if (args.autoApproval) {
            t.view.btnApply.text = '加入';
        } else {
            t.view.btnApply.text = '申请';
        }

    }

    updateApply() {
        const vo = this._vo;
        if(!this.view?.btnApply){
            return;
        }
        if (vo) {
            if (TeamChallengeModel.ins().isApply(vo.id)) {
                //已经申请
                this.view.btnApply.visible = false;
            } else {
                this.view.btnApply.visible = true;
            }

            if (vo.autoApproval) {
                this.view.btnApply.text = '加入';
            } else {
                this.view.btnApply.text = '申请';
            }
        }
    }

    addAvatar(index: number, item: ui.teamChallenge.components.TeamChallengeAvatarCom){
        const t = this;
        const vo: Vo.teaminstance.TeamMemberBriefVo = t?._avatars ? t._avatars[index] : null;
        if (vo) {
            //存在队员
            const avatar = FguiScriptUtils.toMyScriptClass(item.avatar, PlayerAvatar);
            if(vo.baseVo){
                avatar.reset(
                    vo.baseVo.id,
                    vo.baseVo.headIcon,
                    vo.baseVo.headFrame,
                    0
                );
                item.touchable = true;
            }else if(vo.robotBrief){
                avatar.reset(
                    vo.robotBrief.id,
                    1000,
                    2000,
                    0
                );
                item.touchable = false;
            }

            item.bgImg.visible = false;
            item.avatar.visible = true;
            item.lbLv.text = '';
            if(vo.baseVo?.level){
                item.lbLv.text = `lv.${vo.baseVo?.level}`;
            }
            if(vo.robotBrief?.level){
                item.lbLv.text = `lv.${vo.robotBrief?.level}`;
            }
          
            if (index == 0) {
                //是队长
                item.imgCaptain.visible = true;
            } else {
                item.imgCaptain.visible = false;
            }
        } else {
            item.bgImg.visible = true;
            item.avatar.visible = false;
            item.imgCaptain.visible = false;
            item.touchable = true;
            item.lbLv.text = ``;
        }
    }
}