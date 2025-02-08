/** 组队副本  组队副本主界面 */
import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FightType } from "../../../comm/battle/enum/FightType";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ChatComp } from "../../../ui/main/components/ChatComp";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { HeroDetailsAvatar } from "../../common/hero/HeroDetailsAvatar";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { ItemListComp2 } from "../../common/item/ItemListComp2";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import {
  FormationMainViewOpenArgs,
  UIFormationKey,
} from "../../formation/const/UIFormationConfig";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { TeamChallengeItem } from "../component/TeamChallengeItem";
import { TeamChallengeMemberInfo } from "../component/TeamChallengeMemberInfo";
import { TeamChallengePosItem } from "../component/TeamChallengePosItem";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import {
  EnumCTChapterState,
  EnumCTState,
} from "../enum/EnumTeamChallengeChapterState";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeController } from "../TeamChallengeController";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { TeamChallengeGiftBox } from "../component/TeamChallengeGiftBox";
import { UIGainKeys } from "../../gain/const/UIGainKeys";
import { GComponent } from "fairygui-cc";
import { TeamChallengePostBoss } from "../component/TeamChallengePostBoss";

export class TeamChallengeMainView extends UIPage {
  static pkgName: string = "teamChallenge";
  static viewName: string = "TeamChallengeMainView";

  private _avatar1: HeroDetailsAvatar;
  private _avatar2: HeroDetailsAvatar;

  /** 远景滚动速度（单位：像素/秒） */
  private _farGroundSpeed: number = 80;
  /** 近景滚动速度（单位：像素/秒） */
  private _foreGroundSpeed: number = 120;
  /** 怪物的目标位置X坐标 */
  private _bossPosX: number = 600;
  /** 当前场景的宽度 */
  private _mapWidth: number = 750;
  /** 远景目标位置的X坐标 */
  private _targetPosX: number = 0;
  /** 近景目标位置的X坐标 */
  private _bgTargetPosX: number = 0;
  /** Boss目标位置的X坐标 */
  private _bossTargetPosX: number = 0;
  /** 宝箱目标位置的X坐标 */
  private _boxTargetPoxX: number = 0;
  /** Boss模型 */
  private _bossModel: any;
  /** 礼盒节点 */
  private _giftBox;
  /** 刷新间隔（单位：毫秒） */
  private _refreshInterval: number = 16;
  /** 是否处于滚动状态 */
  private _isScrolling: boolean = false;
  /** 滚动持续时间（单位：秒） */
  private _scrollDuration: number = 0;
  /** 滚动累计时间（单位：秒） */
  private _scrollElapsedTime: number = 0;
  /** 是否展示Boss模型（true：展示Boss，false：展示礼盒） */
  private _showBoss: boolean = true;
  /** 当前可领取奖励的关卡ID */
  private _giftCfgId: number;
  /** 首次进入界面 */
  private _firstOpen: boolean = true

  private _cfg: table.teaminstance.TeamInstanceChapterConfig;

  private get view(): ui.teamChallenge.TeamChallengeMainView {
    return this._view as any;
  }

  private get model(): TeamChallengeModel {
    return TeamChallengeModel.ins();
  }

  /** true:刷新界面不播放滚动效果，flase:播放*/
  private _eventAniMap: Record<string, boolean> = {
    [NotificationKey.EVENT_TEAM_MEMBER_CHANGE]: true,
    [NotificationKey.EVENT_TEAM_CREATE_SUCCESS]: true,
    [NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION]: true,
    [NotificationKey.EVENT_TEAM_JOIN]: true,
    [NotificationKey.EVENT_TEAM_LEFT_UPDATE]: true,
  };

  listenNotifications(): string[] {
    return [
      NotificationKey.EVENT_TEAM_TEAM_INFO_CHANGE,
      NotificationKey.EVENT_TEAM_MEMBER_CHANGE,
      NotificationKey.EVENT_TEAM_LEFT_UPDATE,
      NotificationKey.EVENT_TEAM_BASEINFO_UPDATE,
      NotificationKey.EVENT_TEAM_CREATE_SUCCESS,
      NotificationKey.EVENT_TEAM_STAGE_UPDATE,
      NotificationKey.EVENT_TEAM_JOIN,
      NotificationKey.EVENT_TEAM_LEADER_CHANGE,
      NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION,
      NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE,
      NotificationKey.CLOSE_ViEW,
      NotificationKey.EVENT_TEAM_PERMISSION_CHANGE,
      NotificationKey.EVENT_TEAM_BATTLE_STATE,
      NotificationKey.EVENT_MEMBER_JOIN,
    ];
  }

  notificationHandler(eventName: string, args?: any): void {
    const withoutAni = this._eventAniMap[eventName] ?? false;
    switch (eventName) {
      case NotificationKey.EVENT_TEAM_TEAM_INFO_CHANGE:
        //队伍布阵信息刷新
        this.updateTeam();
        break;
      case NotificationKey.EVENT_TEAM_MEMBER_CHANGE:
      case NotificationKey.EVENT_TEAM_LEFT_UPDATE:
      case NotificationKey.EVENT_TEAM_CREATE_SUCCESS:
      case NotificationKey.EVENT_TEAM_JOIN:
      case NotificationKey.FORMATION_CUSTOM_SET_UP_FORMATION:
        //成员信息刷新
        this.updateMembers();
        this.updateBaseInfo();
        this.startScrollAnimation(withoutAni);
        this.updateStage();
        break;
      case NotificationKey.EVENT_TEAM_BASEINFO_UPDATE:
        this.updateBaseInfo();
        this.updateMembers();
        break;
      case NotificationKey.EVENT_TEAM_STAGE_UPDATE:
        this.updateBaseInfo();
        this.startScrollAnimation(withoutAni);
        this.updateStage();
        break;
      case NotificationKey.EVENT_TEAM_LEADER_CHANGE:
        //队长刷新
        this.updateMembers();
        // this.startScrollAnimation(withoutAni);
        this.updateStage();
        this.leaderUpdate();
        break;
      case NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE:
      case NotificationKey.CLOSE_ViEW:
        if (args == UIGainKeys.GainItemPopUpView) { // 领取完奖励
          this.view.giftBox.visible = false;
          this.startScrollAnimation(false);
          this.updateStage();
          this._showBoss = true;
          this.updateRewards();
        } else if (args == UICommonKey.CommonBattleResultFailView) {
          this.startScrollAnimation(true);
          this.updateStage();
        } else if (args == UICommonKey.LoadingWin) { // 战斗胜利
          this.startScrollAnimation(false);
          this.updateStage();
        }
        break;
      case NotificationKey.EVENT_TEAM_PERMISSION_CHANGE:
        if(args){
          GIns.floatingTextMgr.showTips(`队长开放了发起挑战权限`);
        }
        break;
      case NotificationKey.EVENT_TEAM_BATTLE_STATE:
        this.updateStage();
        break;
      case NotificationKey.EVENT_MEMBER_JOIN:
        if(args){
          GIns.floatingTextMgr.showTips(`${args}加入了队伍`);
        }
        break
    }
  }

  @LogBusiness("关闭界面")
  protected onClose() {
    GameTimer.ins().clearAll(this);
    super.onClose();
  }

  protected onInit() {
    const t = this;
    t.view.stageBar.list.itemRenderer = t.addStage.bind(t);
    t.view.btnC.onClick(t.onClickC.bind(t));
    t.view.btnR.onClick(t.onClickR.bind(t));
    t.view.btnGo.onClick(t.onGo.bind(t));
    t.view.BtnMgr.onClick(t.onMgr.bind(t));
    t.view.btnRule.onClick(t.onClickRule, t);
    t.view.btnFormation1.onClick(t.onFormation, t);
    t.view.btnFormation2.onClick(t.onFormation, t);
    t.view.avatar1.onClick(t.onFormation, t);
    t.view.avatar2.onClick(t.onFormation, t);
    t.view.role1.onClick(t.onFormation, t);
    t.view.role2.onClick(t.onFormation, t);
    
    t.view.btnPermission.onClick(this.onClickGou, this);

    t.view.listTeam.itemRenderer = t.addTeam.bind(t);
    t.view.listTeam.numItems = 3;

    t.view.btnBack.onClick(() => {
      t.closeSelf();
    }, t);

    t.view.listItems.setVirtual();
    t.view.listItems.itemRenderer = t.addItem2.bind(t);
    t.view.listItems.onClick(t.onGet, t);

    // chat | 联盟对决频道
    FguiScriptUtils.toMyScriptClass(
      this.view.chat,
      ChatComp
    ).setOnlyCareChannelType(ServerEnums.ChannelType.TEAM_INSTANCE);

    // bg scorll
    t._targetPosX = t._bgTargetPosX = t._bossTargetPosX = t._boxTargetPoxX = 0;
    t._mapWidth = t.view.width;
    this._giftBox = FguiScriptUtils.toMyScriptClass(t.view.giftBox, TeamChallengeGiftBox);
    this._bossModel = FguiScriptUtils.toMyScriptClass(t.view.bossNode, TeamChallengePostBoss);
    t.view.giftBox.visible = false;
    this._firstOpen = true;
  }

  @LogBusiness("打开界面")
  public onOpen(args: any): void {
    const t = this;

    FguiScriptUtils.toMyScriptClass(this.view.btnC.redDot, RedDotCom).reset(
      RedDotKeys.TeamChallenge_ALLCRewards
    );
    FguiScriptUtils.toMyScriptClass(this.view.BtnMgr.redDot, RedDotCom).reset(
      RedDotKeys.TeamChallenge_join
    );

    t._avatar1 = FguiScriptUtils.toMyScriptClass(
      this.view.avatar1,
      HeroDetailsAvatar
    );
    t._avatar2 = FguiScriptUtils.toMyScriptClass(
      this.view.avatar2,
      HeroDetailsAvatar
    );

    this._scrollElapsedTime = 0;
    this._isScrolling = false;
    GameTimer.ins().loop(this._refreshInterval, this, this.updateScroll);
    this._showBoss = true;
    if (this._bossModel) {
      this._bossModel.x = this._mapWidth + 170;
    }
    this._giftBox.x = this._mapWidth + 80;
    this._giftBox.showCloseBox();
    if (t.model.inTeam()) {
      t.model.sendLoadTeamInfo();
    } else {
      t.updateMembers();
      t.updateStage();
    }
    if (this._firstOpen) {
      t.startScrollAnimation(true);
    }
    this._firstOpen = false;
    t._bossTargetPosX = t._boxTargetPoxX = 0;

    // this.reqRobot();
  }

  /**是否在请求中 */
  _isReq:boolean = false;
  /**请求加入机器人 */
  private reqRobot():void{
    const t = this;
    const model = t.model;
    const state = model.getCurState();
    const intanceCfg = TeamChallengeConfigManager.getCurInstanceConfig();
    if(state == EnumCTState.CAN && intanceCfg.haveRobot && !model.isTeamFull() && !t._isReq && model.isCaptain()){
      G.GameTimer.clear(t, t.sendAddRobotToTeam);
      G.GameTimer.once(5000, t, t.sendAddRobotToTeam)
    }else{
      if(model.isTeamFull() || !model.isCaptain() || state != EnumCTState.CAN || !intanceCfg.haveRobot){
        G.GameTimer.clear(t, t.sendAddRobotToTeam);
      }
    }
  }

  sendAddRobotToTeam(){
    this._isReq = true;
    TeamChallengeModel.ins().sendAddRobotToTeam();
  }


  /** 开始滚动动画 */
  /** @param noAni boolean 控制是否播放滚动过程 */
  public startScrollAnimation(noAni: boolean) {
    const state = this.model.getCurState();
    const lastId = this.model.getPassInstanceId();
    const ccfg = TeamChallengeConfigManager.getChapterCfg(lastId);
    const bossData = TeamChallengeConfigManager.getChapterBossInfo();

    // 初始化Boss
    this._bossModel.visible = noAni;
    this._bossModel.x = this._mapWidth + 170;
    this._giftBox.x = this._mapWidth + 80;
    this._giftBox.showCloseBox();

    let chapterState = null;
    let isLast = false;

    if (ccfg) {
      chapterState = this.model.chapterRewardState(ccfg.id);
      isLast = this.model.isLastLevel(lastId);
    }

    switch (state) {
      case EnumCTState.CAN:
        this.handleCanState(ccfg, isLast, chapterState, bossData, noAni, false);
        break;
      case EnumCTState.LOCK:
      case EnumCTState.FINISH:
        this.handleFinishState(ccfg, chapterState);
        break;
      default:
        break;
    }
  }

  /** 处理最终关 */
  private handleFinishState(ccfg: any, chapterState: number) {
    this._giftBox.visible = true;
    if (chapterState === EnumCTChapterState.CAN_GAIN) {
      // 直接调用 handleCanState
      this._giftBox.x = this._mapWidth + 80;
      this.handleCanState(ccfg, false, null, null, false, true);
    } else if(chapterState === EnumCTChapterState.HAVE_GAIN) {
      this._giftBox.x = this._bossPosX;
      this._giftBox.showOpenBox();
    }
  }

  /** 处理推关效果的显示 */
  private handleCanState(
    ccfg: any,
    isLast: boolean,
    chapterState: number,
    bossData: any,
    noAni: boolean,
    finishAll: boolean
  ) {
    // 如果是最后一关且奖励可领取，或者已经完成所有奖励
    const canGainReward = ccfg && isLast && chapterState === EnumCTChapterState.CAN_GAIN;
    if (canGainReward || finishAll) {
      this._showBoss = false;
      this._giftCfgId = ccfg.id;
      this._isScrolling = true;
    } else  {
      const cfg = TeamChallengeConfigManager.getCurInstanceConfig();
      if(cfg?.showModelId){
        this._bossModel.reset(cfg.showModelId);
      }else if(bossData){
        this._bossModel.reset(bossData.showModelId);
      }
      this._showBoss = true;

      // 如果不播放动画，直接设置位置并返回
      if (noAni) {
        this._isScrolling = false;
        this._bossModel.x = this._bossPosX + 10;
        return;
      }
    }

    // 启动滚动动画
    this._isScrolling = true;
    this._bossModel.x = this._mapWidth + 170; // 确保Boss初始位置在地图外
    
    // 玩家model
    for (let i = 0; i < 3; i++) {
      const item = this.view.getChild("posItem" + i) as TeamChallengePosItem;
      item.changeModelAct('move');
    }
    
    // 遮罩层
    G.UIManager.open(TeamChallengeUIKeys.TeamChallengeMask);
    this._scrollDuration = 1.8;
    this._scrollElapsedTime = 0;
  }

  /** 停止滚动动画 */
  public stopScrollAnimation() {
    // 玩家model
    for (let i = 0; i < 3; i++) {
      const item = this.view.getChild("posItem" + i) as TeamChallengePosItem;
      item.changeModelAct('idle');
    }
    this._isScrolling = false;
    this._scrollElapsedTime = 0;
    G.UIManager.close(TeamChallengeUIKeys.TeamChallengeMask);
  }

  /** 滚动更新 */
  private updateScroll() {
    if (!this._isScrolling) return;

    const dt = this._refreshInterval / 1000;
    this._scrollElapsedTime += dt;

    if (this._scrollElapsedTime >= this._scrollDuration) {
      this.stopScrollAnimation();
      return;
    }

    this.updatePositions(dt);
    if (this._showBoss) {
      this.updateBossPosition(dt);
    } else {
      this.updateBoxPosition(dt);
    }
  }

  /** 更新背景和前景位置 */
  private updatePositions(dt: number) {
    // 计算每帧目标位置
    this._targetPosX += this._farGroundSpeed * dt;
    this._bgTargetPosX += this._foreGroundSpeed * dt;

    this.scrollBackground(this.view.farGround.bgPart1, this.view.farGround.bgPart2, this._farGroundSpeed, '_targetPosX');
    this.scrollBackground(this.view.foreground.foreground1, this.view.foreground.foreground2, this._foreGroundSpeed, '_bgTargetPosX');
  }

  /** 背景滚动 */
  private scrollBackground(map1: any, map2: any, speed: number, targetProperty: '_targetPosX' | '_bgTargetPosX') {
    // 当图像滚动到最边缘时，重置目标位置
    if (this[targetProperty] >= this._mapWidth) {
      // map1达到最左端，就将它放到map2后面
      if (map1.x < 0 && -map1.x + speed >= this._mapWidth) {
        map1.x = map2.x + this._mapWidth;
      }
      if (map2.x < 0 && -map2.x + speed >= this._mapWidth) {
        map2.x = map1.x + this._mapWidth;
      }
      this[targetProperty] = 0;
    }
    // 更新位置，进行滚动
    if (map1.x < map2.x) {  // map1在左
      map1.x = -this[targetProperty];
      map2.x = -(this[targetProperty] - this._mapWidth);
    } else {
      map2.x = -this[targetProperty];
      map1.x = -(this[targetProperty] - this._mapWidth);
    }
  }

  /** 更新Boss位置 */
  private updateBossPosition(dt: number) {
    this._bossTargetPosX += (this._foreGroundSpeed + 60) * dt;
    // console.log("Boss位置未更新: " + this._bossModel.x);
    
    this._bossModel.visible = true;

    // 位置更新
    if (this._bossModel.x <= this._bossPosX) {
      this._bossTargetPosX = 0;
      this._bossModel.x = this._bossPosX;
    } else {
      const newPos = this._mapWidth + 170 - this._bossTargetPosX;
      if (Math.abs(this._bossModel.x - newPos) > 5) {
        this._bossModel.x = newPos;
      }
    }

    // console.log("Boss位置更新: " + this._bossModel.x);
  }
                                             
  /** 更新礼盒位置 */
  private updateBoxPosition(dt:number) {
    const t = this;
    t._boxTargetPoxX += (t._foreGroundSpeed + 10) * dt;;
    t._giftBox.visible = true;
    t._giftBox.showCloseBox();
    if (t._giftBox.x <= this._bossPosX) { // BOSS模型锚定位置
      t._giftBox.x = this._bossPosX;
      t._giftBox.cfgId = this._giftCfgId;
      if (!t._giftBox.boxStateMap[this._giftCfgId]) { // 确保未打开时才触发
        GameTimer.ins().once(200, this, ()=>{
          t._giftBox.triggerBoxOpen(this._giftCfgId);
        })
      }
    } else {
      t._giftBox.x = this._mapWidth + 80 - this._boxTargetPoxX;
    }
    // console.log("礼盒位置"+t._giftBox.x)
  }

  private onFormation() {
    TeamChallengeController.ins().openFormation();
  }


  onClickGou(){
    const t = this;
    if(!t.model.isCaptain()){
      const vo = t.model.getMyTeamInfo();
      t.view.btnPermission.selected = vo?.teamMemberCanStart;
      GIns.floatingTextMgr.showTips(`仅队长可修改权限!`);
      return;
    }
    t.model.sendModifyTeamPermission({memberCanStart:t.view.btnPermission.selected})
}

  protected onClickRule(): void {
    RuleController.ins().openRule(
      EnumRuleKeys.TEAM_CHALLENGE,
      this.view.btnRule
    );
  }

  /**更新关卡信息 */
  public updateStage() {
    const t = this;

    const state = t.model.getCurState();
    if (state == EnumCTState.CAN) {
      let info = t.model.getFloorInfo();
      let cfg = null;
      if (!this._showBoss) { // 通关本章，领取奖励
        const lastId = TeamChallengeModel.ins().getPassInstanceId();
        cfg = TeamChallengeConfigManager.getChapterCfg(lastId);
        const count = cfg.teamInstanceConfigIds.length;
        t.view.lbStage.text = `第${count}关`;
        t.view.stageBar.value = 100;
        t.view.stageBar.list.numItems = count + 1;
        t.view.stageBar.list.columnGap = (503 - 61 * count) / count;
      } else if (info) {
        const max = info.max + 1;
        t.view.stageBar.value = ((info.cur - 1) / (max - 1)) * 100;

        t.view.stageBar.list.numItems = max;
        t.view.stageBar.list.columnGap = (503 - 61 * (max - 1)) / (max - 1);
      }
      if (this._showBoss) {
        cfg = TeamChallengeConfigManager.getCurChapterCfg();
        t.view.lbStage.text = `第${info?.cur}关`;
      }
      t.view.lbC.text = cfg.chapterName;
      const w1 = t.view.lbC.width;
      const w2 = t.view.lbStage.width;
      t.view.lbC.x = (t.view.baseG.width - (w1 + w2)) / 2 - 15;
      t.view.lbStage.x = t.view.lbC.x + w1 + 15;

      t._cfg = cfg;

      if(t.model.teamBattle){
        //战斗中
        t.view.goG.visible = false;
        t.view.lbCondition2.visible = true;
        t.view.lbCondition2.text = '挑战进行中...'
      }else{
        t.view.goG.visible = true;
        t.view.lbCondition2.visible = false;
      }

    } else if (state == EnumCTState.LOCK) {
      //锁上
      let id;
      //获取解锁等级
      const tid = t.model.getChallengeInstanceConfigId();
      const ccfg = TeamChallengeConfigManager.getChapterCfg(tid);
      const lv = t.model.getChapterOpenLv(ccfg.id);
      let first = false;
      if (t.model.inTeam()) {
        //队伍中，取当前关卡上一关
        const ttid = t.model.getTeamInstanceId();
        //是第一关就在上一关等待
        if (TeamChallengeConfigManager.isFirstInstance(ttid)) {
          const icfg = TeamChallengeConfigManager.getConfigByInstancId(ttid);
          id = icfg?.preInstanceId || icfg.id;
          first = true;
        } else {
          id = ttid;
        }
     
        t.view.lbCondition2.text = `队伍成员共鸣等级\n全部达到${lv}后\n解锁下一章节`;
      } else {
        if (
          TeamChallengeConfigManager.isFirstInstance(
            t.model.getChallengeInstanceConfigId()
          )
        ) {
          id = t.model.getPassInstanceId();
          first = true;
        } else {
          id = t.model.getChallengeInstanceConfigId();
        }
        t.view.lbCondition2.text = `共鸣等级达到${lv}后\n解锁下一章节`;
      }

      let info1 = t.model.getFloorInfo(id);
      if (info1) {
        const max1 = info1.max + 1;
        if (first) {
          if(id == 0 || TeamChallengeConfigManager.isFirstStage(id)){
            t.view.stageBar.value = 0;
          }else{
            t.view.stageBar.value = 100;
          }
        } else {
          t.view.stageBar.value = ((info1.cur - 1) / (max1 - 1)) * 100;
        }

        t.view.stageBar.list.numItems = max1;
        t.view.stageBar.list.columnGap = (503 - 61 * (max1 - 1)) / (max1 - 1);
      }

      let cfg = TeamChallengeConfigManager.getChapterCfg(id || t.model.getChallengeInstanceConfigId());
      t.view.lbC.text = cfg?.chapterName;
      t.view.lbStage.text = `第${info1?.cur}关`;

      const w1 = t.view.lbC.width;
      const w2 = t.view.lbStage.width;
      t.view.lbC.x = (t.view.baseG.width - (w1 + w2)) / 2 - 15;
      t.view.lbStage.x = t.view.lbC.x + w1 + 15;

      t._cfg = cfg;

      t.view.goG.visible = false;
      t.view.lbCondition2.visible = true;
    } else {
      //全部通关
      t.view.lbC.text = `已全部通关`;
      t.view.lbStage.text = "";
      const w1 = t.view.lbC.width;
      const w2 = t.view.lbStage.width;
      t.view.lbC.x = (t.view.baseG.width - (w1 + w2)) / 2;

      let info2 = t.model.getFloorInfo(t.model.getPassInstanceId());
      const max = info2.max + 1;
      t.view.stageBar.value = 100;

      t.view.stageBar.list.numItems = max;
      t.view.stageBar.list.columnGap = (503 - 61 * (max - 1)) / (max - 1);

      let cfg = TeamChallengeConfigManager.getChapterCfg(
        t.model.getPassInstanceId()
      );
      t._cfg = cfg;

      t.view.goG.visible = false;
      t.view.lbCondition2.visible = true;
      t.view.lbCondition2.text = "已全部通关";
    }
    t.view.listItems.numItems = t._cfg.rewards.length;
  }

  public updateRewards(){
    const t = this;
    t.view.listItems.numItems = t._cfg.rewards.length;
  }

  public addItem2(index: number, item: TeamChallengeItem) {
    const t = this;
    const reward = t._cfg.rewards[index];
    let state = TeamChallengeModel.ins().chapterRewardState(t._cfg.id);
    item.reset(reward, state);
  }

  public onGet(){
    const t = this;
    const state = TeamChallengeModel.ins().chapterRewardState(t._cfg.id);
    if(state == EnumCTChapterState.CAN_GAIN){
        TeamChallengeModel.ins().sendDrawChapterReward({chapterId:t._cfg.id});
    }
  }

  public addTeam(index: number, item: TeamChallengeMemberInfo) {
    const t = this;
    const vos = t.model.getMembers();
    const vo = vos[2 - index];
    item.setData(vo);
  }

  public leaderUpdate() {
    if (this.model.isCaptain()) {
      GIns.floatingTextMgr.showTips(`您已被晋升为队长!`);
    }
  }

  /**更新队伍信息 */
  public updateMembers() {
    const t = this;
    /**更新成员模型 */
    const members = t.model.getMembers();
    for (let i = 0; i < 3; i++) {
      const item = t.view.getChild("posItem" + i) as TeamChallengePosItem;
      const mvo = members[i];
      item.reset(mvo);
    }

    /**其他 */
    if (t.model.inTeam()) {
      //在队伍中
      if (t.model.isCaptain()) {
        //是队长
        t.view.btnGo.title = "组队挑战";
        t.view.BtnMgr.imageTab.icon = "image/teamChallenge/guanliduiwu_99";
        t.view.BtnMgr.title = "管理队伍";
      } else {
        const vo = t.model.getMyTeamInfo();
        if(vo.teamMemberCanStart){
          t.view.btnGo.title = "组队挑战";
        }else{
          t.view.btnGo.title = "关卡详情";
        }
        t.view.BtnMgr.imageTab.icon = "image/teamChallenge/zuduidating";
        t.view.BtnMgr.title = "退出队伍";
      }

      t.view.listTeam.visible = true;
      t.view.singleG.visible = false;
      t.view.lbCondition.visible = false;
      t.view.permissionG.visible = true;
      t.view.btnFormation1.visible = true;
      t.view.btnFormation2.visible = false;

      t.view.imgFrame.width = 722;
      t.view.imgFrame.x = 16;
      t.view.nameGroup.x = 33;

      // FguiScriptUtils.toMyScriptClass(t.view.btnGo.redDot, RedDotCom).showByType(EnumRedDotShowType.NULL);
    } else {
      //单人挑战
      t.view.btnGo.title = "单人挑战";
      t.view.BtnMgr.imageTab.icon = "image/teamChallenge/tuichuduiwu";
      t.view.BtnMgr.title = "组队大厅";

      t.view.listTeam.visible = false;
      t.view.singleG.visible = true;
      const state = t.model.getCurState();
      t.view.permissionG.visible = false;
      if (state == EnumCTState.FINISH || state == EnumCTState.LOCK) {
        t.view.lbCondition.visible = false;
      } else {
        t.view.lbCondition.visible = true;
      }

      t.view.btnFormation1.visible = false;
      t.view.btnFormation2.visible = true;

      t.view.imgFrame.width = 640;
      t.view.imgFrame.x = 57;
      t.view.nameGroup.x = 103;

      // FguiScriptUtils.toMyScriptClass(t.view.btnGo.redDot, RedDotCom).showByType(EnumRedDotShowType.HIGH);
    }
    t.view.lbS.text = TeamChallengeModel.ins().getScores();

    t.updateBaseInfo();
    t.updateTeam();

    // t.reqRobot();
  }

  updateBaseInfo() {
    const t = this;
    t.view.lbTn.text = t.model.getTeamName();
    
    const vo = t.model.getMyTeamInfo();
    if(!vo){
      this.view.btnPermission.selected = false;
      return;
    }

    this.view.btnPermission.selected = !!vo.teamMemberCanStart;
  }

  /**更新模型 */
  public updateTeam() {
    if (TeamChallengeModel.ins().inTeam()) {
      this.view.listTeam.numItems = 3;
    } else {
      this.updateMyTeam();
    }
  }

  public updateMyTeam() {
    const t = this;
    const vos = t.model.getMembers();
    const vo = vos[0];
    if (vo) {
      const heros = vo.positionVisitVo;
      if (heros) {
        const vo_1 = heros[0];
        if (vo_1) {
          t._avatar1.visible = true;
          t._avatar1.reset(
            vo_1?.heroBaseId,
            vo_1?.star,
            vo_1?.heroLevel,
            vo_1.useSkinId
          );
        } else {
          t._avatar1.visible = false;
        }

        const vo_2 = heros[1];
        if (vo_2) {
          t._avatar2.visible = true;
          t._avatar2.reset(
            vo_2?.heroBaseId,
            vo_2?.star,
            vo_2?.heroLevel,
            vo_2.useSkinId
          );
        } else {
          t._avatar2.visible = false;
        }
      }
    } else {
      t.view.avatar1.visible = false;
      t.view.avatar2.visible = false;
    }
  }

  private addStage(
    index: number,
    item: ui.teamChallenge.components.TeamChallengeFloorItem
  ): void {
    const t = this;
    const state = t.model.getCurState();
    const cur = index + 1;
    if (state == EnumCTState.CAN) {
      const info = t.model.getFloorInfo();
      if (!info || cur < info.cur) {
        //已完成的
        item.bg.icon = "image/teamChallenge/dacheng";
      } else if (cur == info.cur) {
        //当前
        item.bg.icon = "image/teamChallenge/dangqian";
      } else {
        //未解锁
        item.bg.icon = "image/teamChallenge/duobianxing2kaobei5";
      }
    } else if (state == EnumCTState.FINISH) {
      item.bg.icon = "image/teamChallenge/dacheng";
    } else if (state == EnumCTState.LOCK) {
      let id;
      let isFirst;
      if (t.model.inTeam()) {
        //队伍中，取当前关卡上一关
        const tid = t.model.getTeamInstanceId();
        //是第一关就在上一关等待
        if (TeamChallengeConfigManager.isFirstInstance(tid)) {
          const icfg = TeamChallengeConfigManager.getConfigByInstancId(tid);
          id = icfg.preInstanceId;
          isFirst = true;
        } else {
          id = tid;
        }
      } else {
        if (
          TeamChallengeConfigManager.isFirstInstance(
            t.model.getChallengeInstanceConfigId()
          )
        ) {
          id = t.model.getPassInstanceId();
          isFirst = true;
        } else {
          id = t.model.getChallengeInstanceConfigId();
        }
      }
      if (isFirst) {
        item.bg.icon = "image/teamChallenge/dacheng";
      } else {
        const info1 = t.model.getFloorInfo(id);
        if (!info1 || cur < info1.cur) {
          //已完成的
          item.bg.icon = "image/teamChallenge/dacheng";
        } else if (cur == info1.cur) {
          //当前
          item.bg.icon = "image/teamChallenge/dangqian";
        } else {
          //未解锁
          item.bg.icon = "image/teamChallenge/duobianxing2kaobei5";
        }
      }
    }
    if (!this._showBoss) {
      //已完成的
      item.bg.icon = "image/teamChallenge/dacheng";
    }
  }

  onClickC() {
    //打开章节
    G.UIManager.open(TeamChallengeUIKeys.TeamChallengeChapterView);
  }

  onClickR() {
    //打开排行榜
    G.UIManager.open(
      RankUIKeys.RankMainView,
      RankMainViewOpenArgs.create(ServerEnums.RankingType.TEAM_INSTANCE)
    );
  }

  onGo() {
    const intanceCfg = TeamChallengeConfigManager.getCurInstanceConfig();
    if (!intanceCfg) {
      GIns.floatingTextMgr.showTips(`已全部通关`);
      return;
    }
    //打开关卡详情
    G.UIManager.open(TeamChallengeUIKeys.TeamChallengeFloorView, intanceCfg.id);
  }

  onMgr() {
    const t = this;
    /**其他 */
    if (t.model.inTeam()) {
      //在队伍中
      if (t.model.isCaptain()) {
        //是队长
        G.UIManager.open(TeamChallengeUIKeys.TeamChallengeTMgrView);
      } else {
        //退出队伍
        G.UIManager.open(UICommonKey.BtnConfirmView, {
          title: CommonI18nKeys.tipsForConfirm,
          content: "是否要退出队伍",
          titleConfirm: CommonI18nKeys.confirm,
          titleCancel: CommonI18nKeys.cancel,
          onBtnYes: () => {
            //退出队伍 协议发送
            t.model.sendLeaveTeam();
          },
        } as BtnConfirmViewOpenArgs);
      }
    } else {
      //单人挑战
      G.UIManager.open(TeamChallengeUIKeys.TeamChallengeMallView);
    }
  }
}
UIScriptManager.bindScript(
  TeamChallengeUIKeys.TeamChallengeMainView,
  TeamChallengeMainView
);
