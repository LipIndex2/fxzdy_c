import G from "../../../../core/comm/G";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { BattleLogicManager } from "../../../comm/battle/BattleLogicManager";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BackpackManager } from "../../backpack/BackpackManager";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { CommonBattleResultViewOpenArgs } from "../../battle/args/CommonBattleResultViewOpenArgs";
import { IBattleResultWinData } from "../../battle/vo/IBattleResultWinData";
import { IBattleResultVo } from "../../common/battle/structs/IBattleResultVo";
import { ConditionManager } from "../../condition/ConditionManager";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";
import { FightManager } from "../../fight/FightManager";
import { FormationManager } from "../../formation/FormationManager";
import { FormationVo } from "../../formation/vo/FormationVo";
import { SoltVo } from "../../formation/vo/SoltVo";
import { HeroManager } from "../../hero/HeroManager";
import { LeagueManager } from "../../league/leagueManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { SettingsModel } from "../../settings/model/SettingsModel";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import {
  EnumCTChapterState,
  EnumCTState,
} from "../enum/EnumTeamChallengeChapterState";
import { TeamChallengeController } from "../TeamChallengeController";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import { TeamChallengeInviteType } from "../view/TeamChallengeInviteView";

/**
 * 赋能武器模块定义信息
 * @author GameCreator
 */
export class TeamChallengeModel extends BaseModel {
  /**
   * 模块标识
   */
  private MODULE = 53;

  /**上次刷新时间戳 */
  private _lastTime: number = 0;
  /**上次分享时间 */
  private _shareTime: Map<number, number>;

  /**布阵数据 */
  private _formationVo: FormationVo;

  /**槽位映射 */
  private _soltVoMap: { [positionId: number]: SoltVo };

  /**我的排名 请求排行榜列表时才刷新*/
  public myRank: number = 0;

  /**队伍列表 */
  private _teamList: Vo.teaminstance.TeamBriefVo[] = [];

  /** */
  private _channelLastShareTimeMap: Object;


  /**
   * 队伍信息
   */
  private _content: Vo.teaminstance.TeamVo = {
    id: null,
    name: "",
    leaderId: 0,
    memberVos: [],
    applyPlayerIds: [],
    teamInstanceConfigId: 0,
    autoApproval: false,
    fightLimit: 0,
    lastShareTimeMap: undefined,
    passTeamInstance: false,
    teamMemberCanStart: false,
    teamBattle: false,
  };

  constructor() {
    super();
    this.regist();
  }

  listenNotifications(): string[] {
    return [NotificationKey.SYSTEM_NEW_DAY,
    ];
  }

  notificationHandler(name: string, args?: any): void {
    switch (name) {
      case NotificationKey.SYSTEM_NEW_DAY:
        this.resetData();
        break;
    }
  }


  private _baseVo: Vo.teaminstance.TeamInstanceLoginVo;

  private resetData() {
    const t = this;
    if (t._baseVo) {
      t._baseVo.helpFriendImageCount = 0;
      t._baseVo.todayHelpRewardCount = 0;
      t._baseVo.friendImageCount = 0;
      this.emit(NotificationKey.EVENT_TEAM_BASEINFO_UPDATE);
    }
  }

  public static getModule(): number {
    return this.ins().MODULE;
  }

  /**
   * 注册所有从服务端收到的回调。
   */
  /**
   * 注册所有从服务端收到的回调。
   */
  private regist(): void {
    // TODO 注册所有的指令
    let moduleId = this.MODULE;
    this.registerMsg(moduleId, 1, this.recLoadTeamInfo);
    this.registerMsg(moduleId, 2, this.recCreateTeam);
    this.registerMsg(moduleId, 3, this.recApplyJoinTeam);
    this.registerMsg(moduleId, 4, this.recApproval);
    this.registerMsg(moduleId, 5, this.recChangeTeamName);
    this.registerMsg(moduleId, 6, this.recChangeFightLimit);
    this.registerMsg(moduleId, 7, this.recChangeApproval);
    this.registerMsg(moduleId, 8, this.recTransferLeader);
    this.registerMsg(moduleId, 9, this.recKickMember);
    this.registerMsg(moduleId, 10, this.recLeaveTeam);
    this.registerMsg(moduleId, 11, this.recTeamChallenge);
    this.registerMsg(moduleId, 12, this.recSingleChallenge);
    this.registerMsg(moduleId, 13, this.recLoadTeamApplyList);
    this.registerMsg(moduleId, 14, this.recLoadTeamList);
    this.registerMsg(moduleId, 15, this.recShareTeam);
    this.registerMsg(moduleId, 16, this.recLoadFriendList);
    this.registerMsg(moduleId, 17, this.recLoadRecentPlayerList);
    this.registerMsg(moduleId, 18, this.recDrawChapterReward);
    this.registerMsg(moduleId, 19, this.recOneKeyShareTeam);
    this.registerMsg(moduleId, 20, this.recModifyTeamPermission);
    this.registerMsg(moduleId, 21, this.recQuicklyJoinTeam);
    this.registerMsg(moduleId, 22, this.recAddRobotToTeam);
    this.registerMsg(moduleId, 23, this.recAddFriendRobotToTeam);
    this.registerMsg(moduleId, 24, this.recLoadFriendImageList);

    this.registerMsg(moduleId, -1, this.pushTeamApplyChange);
    this.registerMsg(moduleId, -2, this.pushJoinTeam);
    this.registerMsg(moduleId, -3, this.pushMemberJoin);
    this.registerMsg(moduleId, -4, this.pushTeamRejectApply);
    this.registerMsg(moduleId, -5, this.pushTeamInfoChange);
    this.registerMsg(moduleId, -6, this.pushTeamLeaderChange);
    this.registerMsg(moduleId, -7, this.pushMemberLeave);
    this.registerMsg(moduleId, -8, this.pushSelfLeave);
    this.registerMsg(moduleId, -9, this.pushTeamChallengeResult);
    this.registerMsg(moduleId, -10, this.pushSingleChallengeResult);
    this.registerMsg(moduleId, -11, this.pushTeamInviteUpdate);
    this.registerMsg(moduleId, -12, this.pushTeamInstanceInitCustomFormation);
    this.registerMsg(moduleId, -13, this.pushTeamMemberFormationUpdate);
    this.registerMsg(moduleId, -14, this.pushIntegralItemReward);
    this.registerMsg(moduleId, -15, this.pushTeamBattleStatus);

  }

  /**初始化帐数据 */
  public initData(vo: Vo.teaminstance.TeamInstanceLoginVo): void {
    //每次登录都获取最新的队伍信息
    this._baseVo = vo;
    TeamChallengeController.ins().refreshRed();
    TeamChallengeController.ins().refreshJoinRed();
    if (vo?.teamId) {
      this.sendLoadTeamInfo();
      this.sendLoadTeamApplyList();
    }
  }

  /*********************************协议发送*********************************/

  /**
   * 获取队伍信息
   * 模块号：53	指令号：1
   */
  public sendLoadTeamInfo(): void {
    this.send(this.MODULE, 1);
  }

  /**
   * 创建队伍
   * 模块号：53	指令号：2
   */
  public sendCreateTeam(c2s: Vo.teaminstance.CreateTeamC2S): void {
    this.send(this.MODULE, 2, c2s);
  }

  /**
   * 申请入队,true-加入成功,false-等待审批
   * 模块号：53	指令号：3
   */
  public sendApplyJoinTeam(c2s: Vo.teaminstance.ApplyJoinTeamC2S): void {
    this.send(this.MODULE, 3, c2s, c2s);
  }

  /**
   * 审批入队申请,true-审批成功移除申请列表,false-
   * 模块号：53	指令号：4
   */
  public sendApproval(c2s: Vo.teaminstance.ApprovalC2S): void {
    this.send(this.MODULE, 4, c2s, c2s);
  }

  /**
   * 修改队伍名称
   * 模块号：53	指令号：5
   */
  public sendChangeTeamName(c2s: Vo.teaminstance.ChangeTeamNameC2S): void {
    this.send(this.MODULE, 5, c2s);
  }

  /**
   * 修改战力限制
   * 模块号：53	指令号：6
   */
  public sendChangeFightLimit(c2s: Vo.teaminstance.ChangeFightLimitC2S): void {
    this.send(this.MODULE, 6, c2s);
  }

  /**
   * 修改队伍审批
   * 模块号：53	指令号：7
   */
  public sendChangeApproval(c2s: Vo.teaminstance.ChangeApprovalC2S): void {
    this.send(this.MODULE, 7, c2s, c2s);
  }

  /**
   * 转让队长
   * 模块号：53	指令号：8
   */
  public sendTransferLeader(c2s: Vo.teaminstance.TransferLeaderC2S): void {
    this.send(this.MODULE, 8, c2s);
  }

  /**
   * 踢出队员
   * 模块号：53	指令号：9
   */
  public sendKickMember(c2s: Vo.teaminstance.KickMemberC2S): void {
    this.send(this.MODULE, 9, c2s, c2s);
  }

  /**
   * 离开队伍
   * 模块号：53	指令号：10
   */
  public sendLeaveTeam(): void {
    this.send(this.MODULE, 10);
  }

  /**
   * 队伍挑战
   * 模块号：53	指令号：11
   */
  public isChallenge: boolean = false;
  public sendTeamChallenge(): void {
    this.send(this.MODULE, 11);
    this.isChallenge = true;
  }

  /**
   * 单人挑战
   * 模块号：53	指令号：12
   */
  public sendSingleChallenge(c2s: Vo.teaminstance.SingleChallengeC2S): void {
    this.send(this.MODULE, 12, c2s);
  }

  /**
   * 获取队伍申请列表
   * 模块号：53	指令号：13
   */
  public sendLoadTeamApplyList(): void {
    this.send(this.MODULE, 13);
  }

  /**
   * 获取队伍列表,TeamBriefVo
   * 模块号：53	指令号：14
   */
  public sendLoadTeamList(c2s: Vo.teaminstance.LoadTeamListC2S): void {
    if (c2s.page == 1) {
      //第一页初始化数据
      this._teamList.length = 0;
    }
    this.send(this.MODULE, 14, c2s);
  }

  /**
   * 聊天分享队伍,返回最后一次分享的时间
   * 模块号：53	指令号：15
   */

  public sendShareTeam(c2s: Vo.teaminstance.ShareTeamC2S): void {
    this.send(this.MODULE, 15, c2s, c2s);
  }

  /**
   * 获取好友列表
   * 模块号：53	指令号：16
   */
  public sendLoadFriendList(): void {
    this.send(this.MODULE, 16);
  }

  /**
   * 获取最近组队玩家列表
   * 模块号：53	指令号：17
   */
  public sendLoadRecentPlayerList(): void {
    this.send(this.MODULE, 17);
  }

  /**
   * 领取章节奖励
   * 模块号：53	指令号：18
   */
  public sendDrawChapterReward(
    c2s: Vo.teaminstance.DrawChapterRewardC2S
  ): void {
    this.send(this.MODULE, 18, c2s);
  }

  /**
   * 聊天分享队伍,返回私聊最后一次分享时间
   * 模块号：53	指令号：19
   */
  public sendOneKeyShareTeam(): void {
    this.send(this.MODULE, 19);
  }

  /**
   * 修改队伍名称
   * 模块号：53	指令号：20
   */
  public sendModifyTeamPermission(c2s: Vo.teaminstance.ModifyTeamPermissionC2S): void {
    this.send(this.MODULE, 20, c2s);
  }

  /**
   * 快速加入队伍
   * 模块号：53	指令号：21
   */
  public sendQuicklyJoinTeam(): void {
    this.send(this.MODULE, 21);
  }

  /**
 * 添加机器人玩家到组队副本队伍中
 * 模块号：53	指令号：22
 */
  public sendAddRobotToTeam(): void {
    this.send(this.MODULE, 22);
  }

  /**
   * 添加好友机器人玩家到组队副本队伍中
   * 模块号：53	指令号：23
   */
  public sendAddFriendRobotToTeam(c2s: Vo.teaminstance.AddFriendRobotToTeamC2S): void {
    this.send(this.MODULE, 23, c2s, c2s);
  }

  /**
   * 获取好友镜像列表
   * 模块号：53	指令号：24
   */
  public sendLoadFriendImageList(): void {
    this.send(this.MODULE, 24);
  }

  /*********************************协议监听*********************************/

  public recLoadTeamInfo(data: Vo.teaminstance.LoadTeamInfoS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      if (data.content) {
        const t = this;
        t._content = data.content;
      }
    }
    this.emit(NotificationKey.EVENT_TEAM_MEMBER_CHANGE);
  }

  /**
   * 创建队伍
   * 模块号：53	指令号：2
   */
  public recCreateTeam(data: Vo.teaminstance.CreateTeamS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      if (data.content) {
        const t = this;
        t._content = data.content;
      }

      FacadeManager.ins().emit(NotificationKey.EVENT_TEAM_CREATE_SUCCESS);
    }
  }

  /**
   * 申请入队,true-加入成功,false-等待审批
   * 模块号：53	指令号：3
   */
  public recApplyJoinTeam(
    data: Vo.teaminstance.ApplyJoinTeamS2C,
    vo: Vo.teaminstance.ApplyJoinTeamC2S
  ): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      if (!data.content) {
        GIns.floatingTextMgr.showTips("入队申请已发送");
      }
      const teamId = vo.teamId;
      const applyTeamIds = this?._baseVo?.applyTeamIds;
      if (applyTeamIds.indexOf(teamId) == -1) {
        applyTeamIds.push(teamId);
      }
      this.emit(NotificationKey.EVENT_TEAM_APPLY_SUCESS);
    }
  }

  /**
   * 审批入队申请,true-审批成功移除申请列表,false-
   * 模块号：53	指令号：4
   */
  public recApproval(
    data: Vo.teaminstance.ApprovalS2C,
    c2s: Vo.teaminstance.ApprovalC2S
  ): void {
    if (data.code >= 0) {
      //把操作过的从列表中删除
      const index = this._applyList.findIndex((v) => {
        return c2s.targetId == v.baseVo.id;
      });
      this._applyList.splice(index, 1);
      this.emit(NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE);

      if (c2s.isAgree) {
        //成功加入
        // GIns.floatingTextMgr.showTips("该玩家已入队");
      } else {
        GIns.floatingTextMgr.showTips("已拒绝该入队申请");
      }
    }
  }

  /**
   * 修改队伍名称
   * 模块号：53	指令号：5
   */
  public recChangeTeamName(data: Vo.teaminstance.ChangeTeamNameS2C): void {
    if (data.code >= 0) {
    }
  }

  /**
   * 修改战力限制
   * 模块号：53	指令号：6
   */
  public recChangeFightLimit(data: Vo.teaminstance.ChangeFightLimitS2C): void {
    if (data.code >= 0) {
    }
  }

  /**
   * 修改队伍审批
   * 模块号：53	指令号：7
   */
  public recChangeApproval(data: Vo.teaminstance.ChangeApprovalS2C): void {
    if (data.code >= 0) {
    }
  }

  /**
   * 转让队长
   * 模块号：53	指令号：8
   */
  public recTransferLeader(data: Vo.teaminstance.TransferLeaderS2C): void {
    if (data.code >= 0) {
      //推送处理？
    }
  }

  /**
   * 踢出队员
   * 模块号：53	指令号：9
   */
  public recKickMember(data: Vo.teaminstance.KickMemberS2C): void {
    if (data.code >= 0) {
      //推送处理？
    }
  }

  /**
   * 离开队伍
   * 模块号：53	指令号：10
   */
  public recLeaveTeam(data: Vo.teaminstance.LeaveTeamS2C): void {
    if (data.code >= 0) {
    }
  }

  /**
   * 队伍挑战
   * 模块号：53	指令号：11
   */
  public recTeamChallenge(data: Vo.teaminstance.TeamChallengeS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据

    }
  }

  /**
   * 单人挑战
   * 模块号：53	指令号：12
   */
  public recSingleChallenge(data: Vo.teaminstance.SingleChallengeS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
    }
  }

  /**
   * 获取队伍申请列表
   * 模块号：53	指令号：13
   */
  /**申请列表 */
  _applyList: Array<Vo.teaminstance.TeamApplyVo> = [];
  public recLoadTeamApplyList(
    data: Vo.teaminstance.LoadTeamApplyListS2C
  ): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      this._applyList = data.content;
      this.emit(NotificationKey.EVENT_TEAM_APPLYLIST_CHANGE);
    }
  }

  /**
   * 获取队伍列表,TeamBriefVo
   * 模块号：53	指令号：14
   */
  public recLoadTeamList(data: any): void {
    if (data.code >= 0) {
      if (data.content) {
        if (this._teamList.length != data.content.total) {
          this._teamList.length = data.content.total;
        }
        let startIndex = (data.content.curPage - 1) * data.content.pageSize;
        for (let i = 0; i < data.content.data.length; i++) {
          this._teamList[startIndex + i] = data.content.data[i];
        }
      }
      this.emit(NotificationKey.EVENT_MALL_TEAM_CHANGE, data?.content);
    }
  }

  /**
   * 聊天分享队伍,返回最后一次分享的时间
   * 模块号：53	指令号：15
   */
  public recShareTeam(
    data: Vo.teaminstance.ShareTeamS2C,
    c2s: Vo.teaminstance.ShareTeamC2S
  ): void {
    if (data.code >= 0) {
      if (c2s.targetId) {
        //分享私人
        const id = c2s.targetId;
        let vo: Vo.teaminstance.TeamInstancePlayerVo;
        if (this.friends) {
          vo = this.friends.find((v) => {
            return c2s.targetId == v.baseVo.id;
          });
        }

        if (!vo && this.recents) {
          vo = this.recents.find((v) => {
            return c2s.targetId == v.baseVo.id;
          });
        }

        if (vo) {
          vo.shared = true;
        }
      }
      this.emit(NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE);
    }
  }

  /**
   * 获取好友列表
   * 模块号：53	指令号：16
   */
  friends: Array<Vo.teaminstance.TeamInstancePlayerVo> = [];
  public recLoadFriendList(data: Vo.teaminstance.LoadFriendListS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      this.friends = data?.content ? data?.content : [];
      this.emit(NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE);
    }
  }

  /**
   * 获取最近组队玩家列表
   * 模块号：53	指令号：17
   */
  recents: Array<Vo.teaminstance.TeamInstancePlayerVo> = [];
  public recLoadRecentPlayerList(
    data: Vo.teaminstance.LoadRecentPlayerListS2C
  ): void {
    if (data.code >= 0) {
      this.recents = data?.content ? data?.content : [];
      this.emit(NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE);
    }
  }


  /**
   * 领取章节奖励
   * 模块号：53	指令号：18
   */
  public recDrawChapterReward(
    data: Vo.teaminstance.DrawChapterRewardS2C
  ): void {
    if (data.code >= 0) {
      if (data.content) {
        const rewardResults = data.content.rewardResults;
        if (rewardResults) {
          this.emit(
            NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW,
            rewardResults
          );
        }

        const id = data.content.chapterId;
        if (
          this?._baseVo?.drawChapterIds &&
          this?._baseVo?.drawChapterIds.indexOf(id) == -1
        ) {
          this?._baseVo?.drawChapterIds.push(id);
        }
        this.emit(NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE);
      }
    }
  }

  /**
   * 聊天分享队伍,返回私聊最后一次分享时间
   * 模块号：53	指令号：19
   */
  public recOneKeyShareTeam(data: Vo.teaminstance.OneKeyShareTeamS2C): void {
    if (data.code >= 0) {
      if (this.friends) {
        this.friends.forEach((v) => (v.shared = true));
      }
      if (this.recents) {
        this.recents.forEach((v) => (v.shared = true));
      }
      //TODO 在这里处理服务端返回的数据
      this.emit(NotificationKey.EVENT_TEAM_SHARE_ALL_SUCESS);
    }
  }


  /**
   * 修改成员权限
   * 模块号：53	指令号：20
   */
  public recModifyTeamPermission(data: Vo.teaminstance.ModifyTeamPermissionS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
    }
  }

  /**
   * 快速加入队伍
   * 模块号：53	指令号：21
   */
  public recQuicklyJoinTeam(data: Vo.teaminstance.QuicklyJoinTeamS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
    }
  }

  /**
   * 添加机器人玩家到组队副本队伍中
   * 模块号：53	指令号：22
   */
  public recAddRobotToTeam(data: Vo.teaminstance.AddRobotToTeamS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
    }
  }

  /**
   * 添加好友机器人玩家到组队副本队伍中
   * 模块号：53	指令号：23
   */
  public recAddFriendRobotToTeam(data: Vo.teaminstance.AddFriendRobotToTeamS2C, clientData: Vo.teaminstance.AddFriendRobotToTeamC2S): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      const id = clientData.friendId;
      if (this.friendImgs) {
        const v = this.friendImgs.find(v => {
          return v.baseVo.id == id
        });
        v.helpFriendImageCount++;
      }
      this._baseVo.friendImageCount++;
      this.emit(NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE);
    }
  }

  /**
   * 获取好友镜像列表
   * 模块号：53	指令号：24
   */
  friendImgs: Array<Vo.teaminstance.TeamInstancePlayerVo> = [];
  public recLoadFriendImageList(data: Vo.teaminstance.LoadFriendImageListS2C): void {
    if (data.code >= 0) {
      //TODO 在这里处理服务端返回的数据
      if (data.code >= 0) {
        this.friendImgs = data?.content ? data?.content : [];
        this.emit(NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE);
      }
    }
  }



  /*********************************协议推送*********************************/

  /**
   * 推送入队申请列表变更,队伍申请玩家ID列表
   * 模块号：53	指令号：-1
   */
  public pushTeamApplyChange(vo: any): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    if (vo) {
      this.sendLoadTeamApplyList();
    }
  }

  /**
   * 推送入队,TeamVo
   * 模块号：53	指令号：-2
   */
  public pushJoinTeam(vo: Vo.teaminstance.TeamVo): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    this._content = vo;
    this.emit(NotificationKey.EVENT_TEAM_JOIN);
  }

  /**
   * 推送成员入队,TeamMemberVo
   * 模块号：53	指令号：-3
   */
  public pushMemberJoin(vo: Vo.teaminstance.TeamMemberVo): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    const memberVos = this?._content?.memberVos;
    if (memberVos) {
      const findIndex = memberVos.findIndex((v) => {
        if (vo.baseVo) {
          return v.baseVo?.id == vo.baseVo?.id;
        }
        if (vo.teamRobot) {
          return v.teamRobot?.id == vo.teamRobot?.id;
        }
      });
      if (findIndex != -1) {
        //本来有的话先删除掉
        memberVos.splice(findIndex, 1);
      } else {
        this.emit(NotificationKey.EVENT_MEMBER_JOIN, vo?.baseVo?.name || vo?.teamRobot?.name);
      }
      memberVos.push(vo);
    }
    this.emit(NotificationKey.EVENT_TEAM_MEMBER_CHANGE);
  }

  /**
   * 推送队伍拒绝入队申请,队伍ID
   * 模块号：53	指令号：-4
   */
  public pushTeamRejectApply(tid: number): void {
    //有队伍id，但是根据需求暂时不需要做什么处理
  }

  /**
   * 推送队伍信息变更,TeamInfoUpdateVo
   * 模块号：53	指令号：-5
   */
  public pushTeamInfoChange(vo: Vo.teaminstance.TeamInfoUpdateVo): void {
    if (this._content) {
      this._content.name = vo.name;
      this._content.autoApproval = vo.autoApproval;
      this._content.fightLimit = vo.fightLimit;
      const oldPer = this._content.teamMemberCanStart;
      this._content.teamMemberCanStart = vo.teamMemberCanStart == undefined ?
        this._content.teamMemberCanStart : vo.teamMemberCanStart;
      if (oldPer != this._content.teamMemberCanStart) {
        this.emit(NotificationKey.EVENT_TEAM_PERMISSION_CHANGE, this._content.teamMemberCanStart);
      }

      this.emit(NotificationKey.EVENT_TEAM_BASEINFO_UPDATE);
    }
  }

  /**
   * 推送队长变更,队长ID
   * 模块号：53	指令号：-6
   */
  public pushTeamLeaderChange(leaderId: number): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    this._content.leaderId = leaderId;
    this.emit(NotificationKey.EVENT_TEAM_LEADER_CHANGE);
  }

  /**
   * 推送队员离队,离开的成员ID
   * 模块号：53	指令号：-7
   */
  public pushMemberLeave(data: number): void {
    const pid = data;
    const memberVos = this?._content?.memberVos;
    const index = memberVos.findIndex((v) => {
      if (v.baseVo) {
        return pid == v.baseVo?.id;
      }

      if (v.teamRobot) {
        return pid == v.teamRobot?.id;
      }

      return false
    });
    if (index != -1) {
      memberVos.splice(index, 1);
    }
    this.emit(NotificationKey.EVENT_TEAM_MEMBER_CHANGE);
  }

  /**
   * 推送自己离开队伍,是否被踢
   * 模块号：53	指令号：-8
   */
  public pushSelfLeave(data: boolean): void {
    if (data) {
      //被踢
      if (G.UIManager.isOpened(TeamChallengeUIKeys.TeamChallengeMainView)) {
        GIns.floatingTextMgr.showTips(`您被移出队伍!`);
      }
    } else {
      //自己离开
      GIns.floatingTextMgr.showTips(`离开队伍！`);
    }
    this.initContent();
    this.emit(NotificationKey.EVENT_TEAM_LEFT_UPDATE);
  }

  /**
   * 推送送队伍挑战结果,TeamInstanceChallengeResult
   * 模块号：53	指令号：-9
   */
  public pushTeamChallengeResult(
    vo: Vo.teaminstance.TeamInstanceChallengeResult
  ): void {
    //TODO 推送消息-在这里处理服务端返回的数据

    this.baseInfoDeal(vo);
  }

  /**
   * 推送单人挑战结果,TeamInstanceChallengeResult
   * 模块号：53	指令号：-10
   */
  public pushSingleChallengeResult(
    vo: Vo.teaminstance.TeamInstanceChallengeResult
  ): void {
    //TODO 推送消息-在这里处理服务端返回的数据

    this.baseInfoDeal(vo);
  }

  public pushTeamInviteUpdate(
    data: Vo.teaminstance.TeamInstanceShareUpdateVo
  ): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    this._channelLastShareTimeMap = data.channelLastShareTimeMap;
    this.emit(NotificationKey.EVENT_TEAM_SHARE_SUCESS);
  }

  /**
   * 推送组队副本初始化自定义布阵,List<CustomFormationVo>
   * 模块号：53	指令号：-12
   */
  public pushTeamInstanceInitCustomFormation(
    vo: Vo.formation.CustomFormationVo[]
  ): void {
    //TODO
    const formationVos = vo;
    if (formationVos) {
      for (let i = 0, len = formationVos.length; i < len; i++) {
        let vo: Vo.formation.CustomFormationVo = formationVos[i];
        FormationManager.ins().updatePosDatas(vo);
      }
    }
  }

  /**
   * 推送组队副本成员布阵变更,TeamMemberVo
   * 模块号：53	指令号：-13
   */
  public pushTeamMemberFormationUpdate(vo: Vo.teaminstance.TeamMemberVo): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    const memberVos = this?._content?.memberVos;
    if (memberVos) {
      const findIndex = memberVos.findIndex((v) => {
        if (v?.baseVo?.id) {
          return v.baseVo?.id == vo.baseVo?.id;
        }

        if (vo?.teamRobot?.id) {
          return v.teamRobot?.id == vo.teamRobot?.id;
        }

        return false;
      });
      if (findIndex != -1) {
        //本来有的话先删除掉
        memberVos.splice(findIndex, 1);
      }
      memberVos.push(vo);
    }
    this.emit(NotificationKey.EVENT_TEAM_MEMBER_CHANGE);
  }


  /**
   * 推送积分物品奖励, 
   * 模块号：53	指令号：-14
   */
  public pushIntegralItemReward(content: Vo.reward.RewardResult[]): void {
    //TODO 推送消息-在这里处理服务端返回的数据
    if (content) {
      G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_FLOATING_TEXT_UP, content as Array<Vo.reward.RewardResult>);
    }
  }

  /**
   * 推送组队战斗状态
   * 模块号：53	指令号：-15
   */
  public pushTeamBattleStatus(content: boolean): void {
    //TODO 推送消息-在这里处理服务端返回的数据
  }

  /*********************************自定义方法*******************************/

  public baseInfoDeal(vo: Vo.teaminstance.TeamInstanceChallengeResult) {
    let tips = '';
    if (vo) {
      this.teamBattle = vo.teamBattle;
      //个人挑战不更新战斗信息
      if (this.inTeam()) {
        if ((!vo.rewardResults || vo.rewardResults.length <= 0)) {
          if (this.helpTimes() > 0 || this._baseVo.passInstanceConfigId < vo.passInstanceConfigId) {
            tips = '奖励邮件发放';
          } else {
            tips = '今日助战奖励次数耗尽';
          }
        }

        this._content.teamInstanceConfigId = vo.teamInstanceConfigId;
        if (typeof vo.passTeamInstance === "boolean") {
          this._content.passTeamInstance = vo.passTeamInstance;
        }
      }
      this._baseVo.passInstanceConfigId = vo.passInstanceConfigId;
      this._baseVo.todayHelpRewardCount = vo.todayHelpRewardCount;
    }
    this.emit(NotificationKey.EVENT_TEAM_STAGE_UPDATE);

    let logic = BattleLogicManager.ins().getNotCreate(FightType.TEAM_INSTANCE);
    if (logic) {
      let resultVo: IBattleResultVo = { isWin: vo.win, fightType: FightType.TEAM_INSTANCE };
      this.emit(NotificationKey.BATTLE_RESULT, resultVo);
      this.emit(NotificationKey.BATTLE_RESULT_WIN, {
        fightType: FightType.TEAM_INSTANCE,
        exData: CommonBattleResultViewOpenArgs.create(
          vo.win,
          false,
          NoOwnerItem.createByServerReward(vo.rewardResults),
          null,
          FightType.TEAM_INSTANCE,
          0,
          tips,

        ),
        isWin: vo.win,
      } as IBattleResultWinData);
    }

    const rewardResults = vo.rewardResults;
    if (rewardResults) {
      this.emit(
        NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP,
        rewardResults
      );
    }
  }

  /**获取当前挑战状态,1-可以挑战，2-锁关， 3-全部通关 */
  public getCurState() {
    const t = this;
    const id = t.getChallengeInstanceConfigId();
    if (t.inTeam()) {
      if (t._content.passTeamInstance) {
        return EnumCTState.FINISH;
      }
    } else {
      //没有当前关卡
      if (!id) {
        return EnumCTState.FINISH;
      }
    }
    const cfg = TeamChallengeConfigManager.getChapterCfg(id);
    if (t.isChapterOpen(cfg.id)) {
      //该章节还没开启，锁住了
      return EnumCTState.CAN;
    }
    return EnumCTState.LOCK;
  }

  /**获取关卡信息（章节最大关卡，当前关卡） */
  public getFloorInfo(id?: number): { max: number; cur: number } {
    const intanceId = id
      ? id
      : TeamChallengeConfigManager.getCurInstanceConfig()?.id;
    let intanceCfg = TableManager.getAllData(
      table.teaminstance.TeamInstanceChapterConfig
    ).find((v) => {
      return v.teamInstanceConfigIds.indexOf(intanceId) != -1;
    });
    if (!intanceCfg) {
      return null;
    }
    const ids = intanceCfg.teamInstanceConfigIds;
    return { max: ids.length, cur: ids.indexOf(intanceId) + 1 };
  }

  /**获取当前章节奖励 */
  public getCRewards() {
    const intanceCfg = TeamChallengeConfigManager.getCurChapterCfg();
    return intanceCfg.rewards;
  }

  /**是否是组队状态 */
  public inTeam(): boolean {
    if (this?._content?.id) {
      return true;
    }
    return false;
  }

  /**是不是自己的队伍 */
  public isMyTeam(tid: string): boolean {
    if (this?._content?.id == tid) {
      return true;
    }
    return false;
  }

  /**是否是队长 判断自己队伍 */
  public isCaptain(pid?: number): boolean {
    const leaderId = this?._content?.leaderId;
    const id = pid ? pid : PlayerModel.ins().Vo.id;
    if (leaderId == id) {
      return true;
    }
    return false;
  }

  /**是否在我的队伍里面 */
  public inMyTeam(pid: number): boolean {
    const t = this;
    const memberVos = t._content?.memberVos;
    if (memberVos) {
      for (const vo of memberVos) {
        if (vo.baseVo?.id == pid) {
          return true;
        }

        if (vo.teamRobot?.id == pid) {
          return true;
        }
      }
    }
    return false;
  }

  /**名字判断是否在我的队伍里面 （判断机器人？）*/
  public inMyTeamByName(name: string): boolean {
    const t = this;
    const memberVos = t._content?.memberVos;
    if (memberVos) {
      for (const vo of memberVos) {
        if (vo.baseVo?.name == name) {
          return true;
        }

        if (vo.teamRobot?.name == name) {
          return true;
        }
      }
    }
    return false;
  }


  /**获取队伍名称 */
  public getTeamName() {
    const n = this?._content?.name ? this?._content?.name : PlayerModel.ins().Vo.name;
    return n;
  }

  /**获取队伍战力限制 */
  public getFightScore() {
    const score = this?._content?.fightLimit ? this?._content?.fightLimit : 0;
    return score;
  }
  /**是否是自己 */
  public isMe(id: number) {
    return id == PlayerModel.ins().playerId;
  }

  /**是否已经申请某队伍 */
  public isApply(tid: string): boolean {
    const teamIds = this?._baseVo?.applyTeamIds
      ? this?._baseVo?.applyTeamIds
      : [];
    if (teamIds.indexOf(tid) == -1) {
      return false;
    }
    return true;
  }

  /**获取组队大厅列表 */
  public getMallTeams() {
    return [];
  }

  /**获取我的队伍信息 */
  public getMyTeamInfo(): Vo.teaminstance.TeamVo {
    return this._content;
  }

  /**获取分享时间 */
  public getShareTime(type: number): number {
    const t = this;
    if (!t._channelLastShareTimeMap) {
      return 0;
    }

    const time = t._channelLastShareTimeMap[type];
    return time ? time : 0;
  }

  /**获取申请列表 */
  public getApplyList(): Vo.teaminstance.TeamApplyVo[] {
    return this._applyList;
  }

  /**获取申请列表 */
  public getMallTeamList(): Vo.teaminstance.TeamBriefVo[] {
    this._teamList.sort(
      (a: Vo.teaminstance.TeamBriefVo, b: Vo.teaminstance.TeamBriefVo) => {
        return b.teamInstanceConfigId - a.teamInstanceConfigId;
      }
    );
    return this._teamList;
  }

  /**
   * 获取好友,最近组队, 好友镜像 数据
   * need 是需要好友镜像 类型
   */
  public getInviteList(need: boolean = false): any[] {
    const friendList = [];
    friendList.push({ type: TeamChallengeInviteType.FriendTitle });
    const friends = this.friends;
    friends.sort((a, b) => {
      return b.baseVo?.fight - a.baseVo?.fight;
    })
    if (friends?.length) {
      friends.forEach((v) => {
        //存在的就先放进去
        if (v.offlineTime <= 0 && !this.inMyTeam(v.baseVo.id)) {
          friendList.push({ type: TeamChallengeInviteType.Friend, vo: v });
        }
      });
    }
    if (friendList.length == 1) {
      friendList.push({ type: TeamChallengeInviteType.Friend });
    }
    const count = friendList.length;

    const groupList = [];
    groupList.push({ type: TeamChallengeInviteType.GroupTitle });
    const groups = this.recents;
    groups.sort((a, b) => {
      return b.baseVo?.fight - a.baseVo?.fight;
    })
    if (groups?.length) {
      groups.forEach((v: Vo.teaminstance.TeamInstancePlayerVo) => {
        //存在的就先放进去
        if (v.offlineTime <= 0 && !this.inMyTeam(v.baseVo.id)) {
          const index = friends.findIndex(
            (fvo: Vo.teaminstance.TeamInstancePlayerVo) => {
              return fvo?.baseVo?.id == v?.baseVo?.id;
            }
          );
          if (index == -1) {
            groupList.push({ type: TeamChallengeInviteType.Group, vo: v });
          }
        }
      });
    }
    if (groupList.length == 1) {
      groupList.push({ type: TeamChallengeInviteType.Group });
    }
    const count1 = friendList.length + groupList.length;

    const friendMirrors = [];
    if (need) {
      friendMirrors.push({ type: TeamChallengeInviteType.FriendMirrorTitle });
      friendMirrors.push({ type: TeamChallengeInviteType.FriendMirrorTitleInfo });
      const mirrors = this.friendImgs;
      mirrors.sort((a, b) => {
        const limit = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:HELP_FRIEND_IMAGE_COUNT');
        const al = limit - a.helpFriendImageCount;
        const bl = limit - b.helpFriendImageCount
        const as = al > 0 ? 0 : 1000;
        const bs = bl > 0 ? 0 : 1000;

        if (as == bs) {
          return b.baseVo?.fight - a.baseVo?.fight;
        }
        return as - bs;

      })

      const cfg = TeamChallengeConfigManager.getCurInstanceConfig();
      if(cfg.haveRobot){
        friendMirrors.push({ type: TeamChallengeInviteType.NormalRobot});
      }


      if (mirrors?.length) {
        mirrors.forEach((v) => {
          //存在的就先放进去
          if (!this.inMyTeamByName(v.baseVo.name)) {
            friendMirrors.push({ type: TeamChallengeInviteType.FriendMirror, vo: v });
          }
        });
      }
      if (friendMirrors.length == 2) {
        friendMirrors.push({ type: TeamChallengeInviteType.FriendMirror });
      }
    }


    return [friendList.concat(groupList).concat(friendMirrors), count, count1];
  }

  /**
   * 该章节奖励领取状态
   * 0-没解锁
   * 1-可领取
   * 2-已领取
   */
  public chapterRewardState(cid: number): EnumCTChapterState {
    const t = this;
    const ids = t._baseVo.drawChapterIds;
    const cfgs = TeamChallengeConfigManager.getCurChapterCfg(true);
    if (!cfgs || cfgs.id > cid) {
      //cfgs不存在就是全部通过
      //该关卡已经通关
      if (ids.indexOf(cid) != -1) {
        return EnumCTChapterState.HAVE_GAIN;
      }
      return EnumCTChapterState.CAN_GAIN;
    }
    return EnumCTChapterState.LOCK;
  }

  /**获取布阵信息 （初始化）*/
  public getFormationVo(fvo: FormationVo): FormationVo {
    //先全部重置，后续优化
    const t = this;
    if (!t._formationVo) {
      t._formationVo = new FormationVo(ServerEnums.FightType.TEAM_INSTANCE);
    } else {
      for (let i = 1; i <= 6; i++) {
        let posVoDate = {
          position: i,
          heroBaseId: null,
        };
        t._formationVo.updatePosData(posVoDate);
      }
    }
    if (!t._soltVoMap) {
      t._soltVoMap = {};
      let posCfg = TableManager.getAllData(
        table.formation.FormationPositionConfig
      );
      for (let cfg of posCfg) {
        t._soltVoMap[cfg.id] = new SoltVo();
      }
    }
    for (const k in t._soltVoMap) {
      t._soltVoMap[k].setSoltVoData({ slotBaseId: +k, stage: 1, level: 1 });
    }

    if (!this.inTeam()) {
      //不在队伍，拿自己的数据
      const poses = FormationManager.ins().getPoses();
      const allPosData = fvo.allPosData;
      let count = 0;
      for (let data of allPosData) {
        if (data.heroId) {
          let posVoDate = {
            position: poses[count],
            heroBaseId: data.heroId,
          };
          t._formationVo.updatePosData(posVoDate);
          count++;
          if (poses.length == count) {
            break;
          }
        }
      }
      const list = FormationManager.ins().getSoltTop();
      const vo1: SoltVo = FormationManager.ins().getSlotVo(list[0]);
      const vo2: SoltVo = FormationManager.ins().getSlotVo(list[1]);
      t._soltVoMap[poses[0]].setSoltVoData({
        slotBaseId: poses[0],
        stage: vo1.stage,
        level: vo1.level,
      });
      t._soltVoMap[poses[1]].setSoltVoData({
        slotBaseId: poses[1],
        stage: vo2.stage,
        level: vo2.level,
      });
      t._formationVo.initSoltDatas(t._soltVoMap);
      return t._formationVo;
    } else {
      //队伍中，拿队伍中的数据
      const poses = [3, 6];
      let skinMap = new Map();
      this._content.memberVos.forEach((v, k) => {
        const cPoses = [poses[0] - +k, poses[1] - +k];
        if (v.positionVisitVo) {
          for (let key = 0; key < v.positionVisitVo.length; key++) {
            const pos = cPoses[key];
            const vo = v.positionVisitVo[key];
            let posVoDate = {
              position: pos,
              heroBaseId: vo.heroBaseId,
            };
            skinMap.set(pos, vo.useSkinId);
            t._formationVo.updatePosData(posVoDate);
            t._soltVoMap[pos].setSoltVoData({
              slotBaseId: pos,
              stage: vo.heroStage,
              level: vo.heroLevel,
            });
          }
        }
      });
      FormationManager.ins().setSkinMap(FightType.TEAM_INSTANCE, skinMap);
      t._formationVo.initSoltDatas(t._soltVoMap);
      return t._formationVo;
    }
  }

  public getMembers(): Vo.teaminstance.TeamMemberVo[] {
    const t = this;
    if (t.inTeam()) {
      //有队伍
      t.membersSort();
      return this._content.memberVos;
    } else {
      //个人
      const formationVo = FormationManager.ins().getFormationVoByType(
        ServerEnums.FightType.TEAM_INSTANCE
      );
      const positionVisitVo = [];
      const allPosData = formationVo?.allPosData || [];

      const list = FormationManager.ins().getSoltTop();
      let count = 0;
      allPosData.forEach((v) => {
        if (v.heroId) {
          const vo1: SoltVo = FormationManager.ins().getSlotVo(list[count]);
          const heroVo = HeroManager.ins().getHeroVoByID(v.heroId);
          positionVisitVo.push({
            positionId: v.BaseId,
            heroBaseId: heroVo.baseId,
            heroLevel: vo1.level,
            heroStage: vo1.stage,
            star: heroVo.star,
            fight: heroVo.getHeroFight,
            useSkinId: heroVo.skinId,
          });
        }
        count++;
      });

      return [
        {
          baseVo: {
            id: PlayerModel.ins().Vo.id,
            name: PlayerModel.ins().Vo.name,
            headIcon: SettingsModel.ins().context.getHeadIconId(),
            headFrame: SettingsModel.ins().context.getHeadFrameId(),
            imageId: SettingsModel.ins().context.getImageId(),
            leagueId: LeagueManager.ins()?.mLeagueVo?.leagueId,
            leagueName: LeagueManager.ins()?.mLeagueVo?.name,
            title: SettingsModel.ins().context.getTitleId(),
            level: PlayerModel.ins().Vo.level,
            fight: PlayerModel.ins().Vo.fight,
          },
          positionVisitVo: positionVisitVo,
          joinTime: 0,
          teamRobot: null,
        },
      ];
    }
  }

  /**角色列表排序 */
  public membersSort(
    memberVos: Vo.teaminstance.TeamMemberVo[] | Vo.teaminstance.TeamMemberBriefVo[] = null,
    leaderId: number = null
  ) {
    const t = this;
    if (!t._content) {
      return;
    }
    memberVos = memberVos ? memberVos : t._content.memberVos;
    leaderId = leaderId ? leaderId : t._content.leaderId;
    memberVos.sort(
      (a: Vo.teaminstance.TeamMemberVo | Vo.teaminstance.TeamMemberBriefVo,
        b: Vo.teaminstance.TeamMemberVo | Vo.teaminstance.TeamMemberBriefVo) => {
        const aCount = a?.baseVo?.id == leaderId ? -100000 : 0;
        const bCount = b?.baseVo?.id == leaderId ? -100000 : 0;
        if (aCount == bCount) {
          return a.joinTime - b.joinTime;
        }
        return aCount - bCount;
      }
    );
  }

  /**获取本人可以操作的阵位 */
  public getPositions() {
    if (!this.inTeam()) {
      return [3, 6];
    } else {
      const members = this.getMembers();
      const index = members.findIndex((v) => {
        return v?.baseVo?.id == PlayerModel.ins().Vo.id;
      });
      return [3 - index, 6 - index];
    }
  }

  private initContent() {
    this.removeApplyId(this._content?.id);
    this._content = {
      id: null,
      name: "",
      leaderId: 0,
      memberVos: [],
      applyPlayerIds: [],
      teamInstanceConfigId: 0,
      autoApproval: false,
      fightLimit: 0,
      lastShareTimeMap: undefined,
      passTeamInstance: false,
      teamMemberCanStart: false,
      teamBattle: false,
    };

    if (this?._baseVo?.applyTeamIds) {
      this._baseVo.applyTeamIds = [];
    }

    this._applyList = [];
  }

  /**清除指定申請列表列表 */
  public removeApplyId(id) {
    if (this?._baseVo?.applyTeamIds) {
      const index = this?._baseVo?.applyTeamIds.indexOf(id);
      if (index != -1) {
        this?._baseVo?.applyTeamIds.splice(index, 1);
      }
    }
  }

  /**是否是首通 */
  public isFirstTime(sid: number) {
    const t = this;
    if (!t.inTeam()) {
      return true;
    } else {
      //组队中
      return t._content.teamInstanceConfigId > t._baseVo.passInstanceConfigId;
    }
  }

  /**获取已通关关卡 */
  public getPassInstanceId(): number {
    const t = this;
    return t._baseVo?.passInstanceConfigId;
  }

  /** 判断关卡是否为最后一关 */
  public isLastLevel(id: number): boolean {
    if (!id) return false;

    const cfg = TeamChallengeConfigManager.getChapterCfg(id);
    if (!cfg || !cfg.teamInstanceConfigIds || cfg.teamInstanceConfigIds.length === 0) {
      return false;
    }

    const lastLevelId = cfg.teamInstanceConfigIds[cfg.teamInstanceConfigIds.length - 1];
    return lastLevelId === id;
  }

  /**获取当前队伍关卡 */
  public getTeamInstanceId(): number {
    const t = this;
    return t._content?.teamInstanceConfigId;
  }

  /**剩余助战此时 */
  public helpTimes(): number {
    const count = +TeamChallengeConfigManager.getConstValue(
      "TEAM_INSTANCE:DAILY_HELP_REWARD_COUNT"
    );
    return count - this._baseVo.todayHelpRewardCount;
  }

  public getTodayHelpRewardCount(): number {
    return this._baseVo?.todayHelpRewardCount || 0;
  }

  /**获取战力 */
  public getScores() {
    const t = this;
    if (!t.inTeam()) {
      const formation = FormationManager.ins().getFormationVoByType(
        ServerEnums.FightType.TEAM_INSTANCE
      );
      return StringUtils.getFightStr(
        FightManager.ins().getAllFight(
          formation.allPosData,
          ServerEnums.FightType.TEAM_INSTANCE
        )
      );
    } else {
      let score = 0;
      if (t._content.memberVos) {
        for (let vo of t._content.memberVos) {
          if (vo.positionVisitVo) {
            vo.positionVisitVo.forEach((v) => {
              score += v.fight;
            });
          }
        }
      }
      return StringUtils.getFightStr(score);
    }
  }

  /**获取当前挑战关卡id； forceMe为true时候，不考虑组队情况*/
  public getChallengeInstanceConfigId(forceMe: boolean = false): number {
    let id;
    const t = this;
    if (t._content?.teamInstanceConfigId && !forceMe) {
      id = t._content?.teamInstanceConfigId;
    } else {
      if (!t._baseVo.passInstanceConfigId) {
        //获取第一关
        id = TableManager.getAllData(
          table.teaminstance.TeamInstanceConfig
        ).find((v) => {
          return !v.preInstanceId;
        })?.id;
      } else {
        id = TableManager.getAllData(
          table.teaminstance.TeamInstanceConfig
        ).find((v) => {
          return v.preInstanceId == t._baseVo.passInstanceConfigId;
        })?.id;
      }
    }
    return id;
  }

  /**是否有加入信息 */
  public haveJoin(): boolean {
    if (this.inTeam() && this.isCaptain()) {
      if (this._applyList && this._applyList.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**获取助战值数量 */
  public getValue(): string {
    //后续优化
    return BackpackManager.ins().getItemCountByItemId(110).toString();
  }

  /**获取队伍的共鸣等级 */
  public getLv() {
    const members = this._content?.memberVos;
    let lv = 0;
    members.forEach((v) => {
      if (v.baseVo) {
        if (!lv) {
          lv = v.baseVo.level;
        } else {
          if (lv > v.baseVo.level) {
            lv = v.baseVo.level;
          }
        }
      }
    });
    return lv;
  }

  /**共鸣等级判断章节是否开启 */
  public isChapterOpen(cid: number) {
    const cfg = TeamChallengeConfigManager.getChapterCfgById(cid);
    const unlockVerifies = cfg.unlockVerifies;
    const value = ConditionManager.ins().getConditionValue(
      unlockVerifies,
      EnumConditionType.PLAYER_LEVEL_GE
    );
    if (this.inTeam()) {
      const lv = this.getLv();
      return lv >= value;
    } else {
      return FormationManager.ins().getCommonLevel() >= value;
    }
  }

  /**获取开启等级 */
  public getChapterOpenLv(cid: number) {
    const cfg = TeamChallengeConfigManager.getChapterCfgById(cid);
    const unlockVerifies = cfg.unlockVerifies;
    return ConditionManager.ins().getConditionValue(
      unlockVerifies,
      EnumConditionType.PLAYER_LEVEL_GE
    );
  }

  public clearTeamList() {
    this._teamList.length = 0;
    this.emit(NotificationKey.EVENT_MALL_TEAM_CHANGE);
  }

  public set teamBattle(battle: boolean) {
    if (this._content?.teamBattle) {
      this._content.teamBattle = battle;
      this.emit(NotificationKey.EVENT_TEAM_BATTLE_STATE);
    }
  }

  /**隊伍战斗状态 */
  public get teamBattle() {
    return this._content?.teamBattle;
  }

  /**队伍是否已经满员 */
  public isTeamFull() {
    return this._content?.memberVos && this._content?.memberVos.length >= 3;
  }

  /**今日镜像邀请剩余次数 */
  public mirrorInviteTimes() {
    const times = this._baseVo.friendImageCount || 0;
    const limit = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:FRIEND_IMAGE_COUNT');
    return limit - times;
  }
}
