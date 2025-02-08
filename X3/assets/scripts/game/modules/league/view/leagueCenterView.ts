import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
import {
    EnumLeagueCenterOpenType,
    LeagueCenterViewOpenArgs
} from "db://assets/scripts/game/modules/league/structs/LeagueCenterViewOpenArgs";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";

@bindScript(UILeagueKey.LeagueCenterView)
export class LeagueCenterView extends UICommWin {

    static pkgName: string = "league";
    static viewName: string = "leagueCenterView";


    private leagueId: number;
    private mLeagueVo: Vo.league.LeagueVo | Vo.league.LeagueViewVo;

    private get view(): ui.league.leagueCenterView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE,
            NotificationKey.EVENT_LEAGUE_NAME_CHANGE, NotificationKey.EVENT_LEAGUE_UPGRADE,
            NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE,
            NotificationKey.EVENT_LEAGUE_INFO_BY_ID,
            NotificationKey.EVENT_LEAGUE_NOTICE_CHANGE,
            NotificationKey.EVENT_LEAGUE_INFO_CHANGE,
            NotificationKey.EVENT_LEAGUE_MEMBER_JOB_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_NAME_CHANGE:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_UPGRADE:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE:
                let leagueId = this.leagueId;
                let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
                if (loginVo.leagueId == leagueId) {
                    this.updateMembers(LeagueManager.ins().mLeagueMemberList);
                }
                break;
            case NotificationKey.EVENT_LEAGUE_INFO_BY_ID:
                let arg = args as Vo.league.LeagueViewVo;
                this.updateOhterView(arg);
                break;
            case NotificationKey.EVENT_LEAGUE_NOTICE_CHANGE:
                this.updateView();
                break;
            case NotificationKey.EVENT_LEAGUE_MEMBER_JOB_CHANGE:

                this.updateView();
                break;

        }
    }

    protected onInit(): void {
        this.updateJob(-1);

        let view = this.view;
        view.editFlag.onClick(this.onOpenFlag, this);
        view.nameEditBtn.onClick(this.onNewNameView, this);
        view.mailBtn.onClick(this.openMailEidtView, this);
        view.editNoticeBtn.onClick(() => {
            view.noticeEdit.editable = true;
            view.noticeEdit.requestFocus();
            //监听输入结束
            view.on(fgui.Event.TOUCH_BEGIN, this.onNoticeSubmit, this);
        }, this);


        view.exitBtn.onClick(() => {
            LeagueModel.ins().quitLeague();
        }, this);

        view.inviteBtn.onClick(() => {
            LeagueModel.ins().openInviteView();
        }, this);

        view.memberList.itemRenderer = this.memberRender.bind(this);

        view.applyBtn.onClick(() => {
            LeagueModel.ins().openApplyListView();
        }, this);

        FguiScriptUtils.toMyScriptClass(view.applyBtn.redDot, RedDotCom).reset(RedDotKeys.League_apply);

        view.mamberMgrBtn.onClick(() => {
            LeagueModel.ins().openMemberManageView();
        }, this);


        view.activeBtn.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_ACTIVE, view.activeBtn)
        })


    }

    public onOpen(args: LeagueCenterViewOpenArgs): void {
        args = args || LeagueCenterViewOpenArgs.createForReq(0);

        // 请求
        if (args.type == EnumLeagueCenterOpenType.REQUEST) {
            let leagueId: number = args.leagueId || 0;
            if (!leagueId) {
                leagueId = LeagueManager.ins().mPlayerLeagueLoginVo.leagueId;
            }
            this.leagueId = leagueId;
            let vo = LeagueManager.ins().mPlayerLeagueLoginVo;
            if (vo.leagueId != leagueId) {
                //查看别人的联盟信息
                LeagueModel.ins().viewLeagueInfoById(leagueId);
                this.view.title.text = "联盟详情";
            } else {
                //查看自己的联盟信息
                LeagueModel.ins().loadLeagueMemberList();
                LeagueModel.ins().loadLeagueInfo();
            }
        }

        // data
        if (args.type == EnumLeagueCenterOpenType.DATA) {
            this.view.title.text = "联盟详情";
            this.updateOhterView(args.data);
        }
    }

    private updateView(): void {
        let leagueId = this.leagueId;
        let myLeague = LeagueManager.ins().mPlayerLeagueLoginVo;
        const isMe = myLeague.leagueId == leagueId;
        if (isMe) {
            let vo = LeagueManager.ins().mLeagueVo;
            let icon = vo.icon;
            let banner = vo.banner;

            this.onUpdateFlag(icon, banner);
            this.updateName(vo.name);
            this.updateBaseView();
            this.updateJob(myLeague.jobType);
            this.updateNotice(vo.notice);
        }

    }

    /**显示其他人的联盟信息 */
    private updateOhterView(vo: Vo.league.LeagueViewVo) {
        let view = this.view;
        view.idLab.text = `ID:${vo.leagueId}`;
        view.lvLab.text = `Lv.${vo.level}`;


        let cfg = LeagueModel.ins().getLeagueLevelConfig(vo.level);

        view.mamberNumer.text = `联盟成员(${vo.memberBriefVos.length}/${cfg.memberCount})`;

        let icon = vo.icon;
        let banner = vo.banner;

        this.onUpdateFlag(icon, banner);
        this.updateName(vo.name);

        this.updateJob(-1);
        this.updateNotice(vo.notice);
        this.updateMembers(vo.memberBriefVos);


    }

    private updateBaseView(): void {
        let myLeague = LeagueManager.ins().mLeagueVo;
        let view = this.view;
        view.idLab.text = `ID:${myLeague.leagueId}`;
        view.lvLab.text = `Lv.${myLeague.level}`;
        let cfg = LeagueModel.ins().getLeagueLevelConfig(myLeague.level + 1);
        if (cfg) {
            view.expBar.max = cfg.exp;
            view.expBar.value = myLeague.exp;
        } else {
            cfg = LeagueModel.ins().getLeagueLevelConfig(myLeague.level);
            view.expBar.max = cfg.exp;
            view.expBar.value = myLeague.exp;
        }
        cfg = LeagueModel.ins().getLeagueLevelConfig(myLeague.level);
        view.mamberNumer.text = `联盟成员(${myLeague.memberCount}/${cfg.memberCount})`;

    }

    /**提交公告 */
    private onNoticeSubmit(): void {
        let view = this.view;
        if (view.noticeEdit.editable) {
            view.off(fgui.Event.TOUCH_BEGIN, this.onNoticeSubmit, this);
            view.noticeEdit.editable = false;
            let notice = view.noticeEdit.text;


            ForbiddenManager.isForbidden(notice, (content: string) => {
                if (!content) {
                    FloatingTextManager.ins().showTips("内容含有敏感词")
                    return;
                }

                LeagueModel.ins().changeLeagueNotice(notice);
            });
        }

    }

    /**显示公告 */
    private updateNotice(notice: string): void {
        //是否我的公会
        notice = notice ? notice : "这个人很懒，什么都没有留下"
        this.view.noticeEdit.text = notice;
        this.view.noticeLab.notice.text = notice;

    }

    /**更新职称以及职称显示 */
    private updateJob(job: number): void {


        let view = this.view;
        let allUI = [
            view.editFlag,
            view.editNoticeBtn,
            view.nameEditBtn,
            view.mailBtn,
            view.inviteBtn,
            view.applyBtn,
            view.mamberMgrBtn,
            view.exitBtn,
            view.ruleBtn,
            view.expGr
        ];
        //显示的ui
        let showUi = [];


        if (job == -1) {
            //非成员权限
            showUi = [];
            //  view.expGr.visible = false;
        } else {
            showUi = [view.exitBtn, view.ruleBtn, view.expGr];
            let permission = LeagueModel.ins().getPermission(job);
            permission.forEach((item) => {
                let perType = ServerEnums.LeaguePermissionType[item.id]
                switch (perType) {
                    case ServerEnums.LeaguePermissionType.APPLY_APPROVAL:
                        showUi.push(view.applyBtn);
                        break;
                    case ServerEnums.LeaguePermissionType.LEAGUE_NOTICE:

                        showUi.push(view.editNoticeBtn);
                        break;
                    case ServerEnums.LeaguePermissionType.LEAGUE_SETTING:
                        showUi.push(view.nameEditBtn);
                        showUi.push(view.editFlag);
                        break;
                    case ServerEnums.LeaguePermissionType.LEAGUE_EMAIL:
                        showUi.push(view.mailBtn);
                        break;
                    case ServerEnums.LeaguePermissionType.MEMBER_INVITE:
                        showUi.push(view.inviteBtn);
                        break;
                    case ServerEnums.LeaguePermissionType.MEMBER_APPOINT:
                    case ServerEnums.LeaguePermissionType.REMOVE_MEMBER:
                    case ServerEnums.LeaguePermissionType.TRANSFER_LEADER:
                        showUi.push(view.mamberMgrBtn);
                        break;


                }
            });

        }


        for (let i = 0; i < allUI.length; i++) {
            let ui = allUI[i];
            ui.visible = showUi.indexOf(ui) != -1;


        }

        if (view.editNoticeBtn.visible) {
            view.noticeEdit.clearClick();
            //公告最大字数
            let maxLength = LeagueModel.ins().getLeagueNoticeMaxLen();
            view.noticeEdit.maxLength = maxLength;
            view.noticeEdit.onClick(() => {
                view.noticeEdit.editable = true;
                view.noticeEdit.requestFocus();
                view.on(fgui.Event.TOUCH_BEGIN, this.onNoticeSubmit, this);
            }, this);

            view.noticeEdit.visible = true;
            view.noticeLab.visible = false;
        } else {
            view.noticeEdit.visible = false;
            view.noticeLab.visible = true;
        }
    }

    private onOpenFlag(): void {
        LeagueModel.ins().openFlagSelectView();
    }

    private onNewNameView(): void {
        LeagueModel.ins().openNameEditView();
    }

    private openMailEidtView(): void {
        LeagueModel.ins().openMailView();
    }


    public onUpdateFlag(icon: number, banner: number): void {

        let iconUrl = LeagueModel.ins().getLeagueIconUrl(icon);
        let flagUrl = LeagueModel.ins().getLeagueBannerUrl(banner);

        let com = this.view.flagCom;
        com.iconLoader.url = iconUrl;
        com.flagLoader.url = flagUrl;
    }


    public updateName(name: string): void {

        this.view.nameLab.text = name;
    }

    private members: Vo.league.LeagueMemberVo[] | Vo.league.LeagueMemberBriefVo[];

    /**更新成员列表 */
    public updateMembers(members: Vo.league.LeagueMemberVo[] | Vo.league.LeagueMemberBriefVo[]): void {

        members = LeagueModel.ins().sortLeagueMemberList(members) as Vo.league.LeagueMemberVo[] | Vo.league.LeagueMemberBriefVo[];
        this.members = members
        let view = this.view;
        view.memberList.numItems = this.members.length;
    }

    private memberRender(index: number, obj: ui.league.com.memberCell): void {

        let data = this.members;
        if (data) {
            let vo = data[index];
            obj.nameLab.text = vo.name;
            obj.fightLab.text = `战力：${vo.fight}`;

            //换一种方式判断类型
            if (vo.hasOwnProperty("active")) { //Vo.league.LeagueMemberVo  
                let vo2 = vo as Vo.league.LeagueMemberVo;
                obj.activeLab.text = `${vo2.active}`;

                let stateCtr = obj.getController("state");
                let stateData = LeagueModel.ins().getMemberOnlineState(vo2);
                stateCtr.selectedIndex = stateData.state;
                obj.onLineLab.text = stateData.timeStr;
                obj.dayOutLab.text = stateData.timeStr;
                obj.onLineLab.visible = true;
                obj.dayOutLab.visible = true;
                obj.activeLab.visible = true;
            } else {
                obj.onLineLab.visible = false;
                obj.dayOutLab.visible = false;
                obj.activeLab.visible = false;
            }
            let officia = obj.getController("officia");
            const avatar = FguiScriptUtils.toMyScriptClass(obj.avatar, PlayerAvatar);
            avatar.reset(vo.id, vo.headIcon, vo.headFrame, vo.imageId);
            //avatar.setCanShowMe(true);
            officia.selectedIndex = vo.jobType - 1;
        }
    }


}