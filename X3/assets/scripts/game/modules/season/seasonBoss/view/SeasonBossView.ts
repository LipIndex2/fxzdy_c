import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../../core/log/LogBusiness";
import { UIPage } from "../../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { FightType } from "../../../../comm/battle/enum/FightType";
import { SkillConfigManager } from "../../../../comm/battle/skill/config/SkillConfigManager";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { BattleUIUtils } from "../../../battle/utils/BattleUIUtils";
import { ItemFrameStateBtn } from "../../../common/item/ItemFrameStateBtn";
import { ModelNode } from "../../../common/node/ModelNode";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { FormationMainViewOpenArgs, UIFormationKey } from "../../../formation/const/UIFormationConfig";
import { FormationManager } from "../../../formation/FormationManager";
import { EventRankDataResp } from "../../../rank/event/EventRankData";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { TaskState } from "../../EnumSeason";
import { SeasonConfigManager } from "../../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../../SeasonManager";
import { SeasonModel } from "../../SeasonModel";
import { SeasonUIKeys } from "../../SeasonUIKeys";
import { SeasonBossVo } from "../../vo/SeasonBossVo";
import { SeasonBossAttacker } from "../com/SeasonBossAttacker";
import { SeasonBossSkillItem } from "../com/SeasonBossSkillItem";

export class SeasonBossView extends UIPage {
  static pkgName: string = "seasonBoss";
  static viewName: string = "SeasonBossView";
  protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

  private _subActivityId: number;
  private _rewards: {
    k: any;
    v: any;
  }[];
  /**礼物状态 */
  private _rState: TaskState;

  private _attackers: { baseVo: Vo.player.PlayerBaseVo, rank?: number }[] = [];

  private _skillIdArray: string[];

  private get view(): ui.seasonBoss.SeasonBossView {
    return this._view as any;
  }

  listenNotifications(): string[] {
    return [
      NotificationKey.SEASON_BOSS_UPDATE,
      NotificationKey.SEASON_RANK_UPDATE,
      NotificationKey.RANK_ON_DATA_RESP,
    ];
  }

  notificationHandler(eventName: string, args?: any): void {
    switch (eventName) {
      case NotificationKey.SEASON_BOSS_UPDATE:
        this.updateUI();
        break;
      case NotificationKey.SEASON_RANK_UPDATE:
        this.dealRoles(args);
        this.setRank(args);
        break;
      case NotificationKey.RANK_ON_DATA_RESP:
        let data = args as EventRankDataResp;
        if (data?.rankType == ServerEnums.RankingType.PLAYER_FIGHT) {
          this.onRankDataResp(args as EventRankDataResp);
        }
        break;


    }
  }

  private dealRoles(args) {
    const list = args?.rankVo?.list || [];
    this._attackers.length = 0;
    list.forEach((v: Vo.ranking.RankItemVo) => {
      const data = {
        baseVo: v.baseVo,
        rank: v.rank
      }
      this._attackers.push(data);
    })
    if (this._attackers.length <= 8) {
      GIns.rankModel.sendRankList({ type: ServerEnums.RankingType.PLAYER_FIGHT, page: 1, subRankParam: null });
    } else {
      this.attackerUpdate();
    }
  }

  private onRankDataResp(args: EventRankDataResp) {
    if (args.dataList) {
      const list = args.dataList;
      for (const data of list) {
        const index = this._attackers.findIndex(v => {
          return v.baseVo?.id == data.baseVo?.id
        })
        if (index == -1) {
          this._attackers.push({
            baseVo: data.baseVo,
            rank: null,
          })
        }
        if (this._attackers.length >= 8) {
          break;
        }
      }
    }
    this.attackerUpdate();
  }

  private attackerUpdate() {
    const t = this;
    for (let i = 0; i < 8; i++) {
      const index = i + 1;
      const attacker = t._attackers[i];
      const item = t.view.getChild('item' + index) as SeasonBossAttacker;
      if (attacker) {
        item.reset(attacker, index);
        item.visible = true;
      } else {
        item.visible = false;
      }
    }
  }

  protected onInit() {
    const t = this;

    t.view.btnRule.onClick(t.onRule, t);
    t.view.btnRule2.onClick(t.onRule2, t);

    t.view.btnFormation.onClick(t.onFormation, t);
    t.view.btnSimulate.onClick(t.onSimulate, t);
    t.view.btnGo.onClick(t.onGo, t);

    t.view.listSkills.itemRenderer = t.addSkills.bind(t);

    t.view.listItems.setVirtual();
    t.view.listItems.itemRenderer = t.addItem.bind(t);
  }

  onGo() {

    const t = this;
    const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonBossVo;
    if(vo && vo.getChallengeLeft() > 0){
      SeasonModel.ins().sendChallengeSeasonBoss({ subActivityId: t._subActivityId, simulated: false });
      return;
    }
    GIns.floatingTextMgr.showTips(`今日挑战次数已用尽`);
  }

  /**布阵 */
  onFormation() {
    const t = this;
    FormationManager.ins().addAutoFightParam(FightType.SEASON_BOSS, t._subActivityId);
    G.UIManager.open(UIFormationKey.FORMATION_MAIN_VIEW, FormationMainViewOpenArgs.create(
      FightType.SEASON_BOSS,
      t._subActivityId + '',
    ));
  }

  /**模拟 */
  onSimulate() {
    const t = this;
    SeasonModel.ins().sendChallengeSeasonBoss({ subActivityId: t._subActivityId, simulated: true });
  }

  @LogBusiness("打开界面")
  public onOpen(args: SeasonPageData): void {
    this._subActivityId = args.subActId;
    G.GameTimer.loop(500, this, this.onTimer);
    SeasonModel.ins().sendGetRankList({subActivityId:this._subActivityId,extraParam:null, page:1})
    this.initItems();
    this.updateUI();
  }

  initItems() {
    const t = this
    for (let i = 0; i < 8; i++) {
      const index = i + 1;
      const item = t.view.getChild('item' + index) as SeasonBossAttacker;
      item.visible = false;
    }
  }

  addItem(index: number, item: ItemFrameStateBtn) {
    const t = this;
    if (t._rewards) {
      const reward = t._rewards[index];
      item.reset(reward, t._rState || TaskState.ING);
    }
  }

  addSkills(index: number, item: SeasonBossSkillItem) {
    const t = this;
    if (t._skillIdArray) {
      const skill = t._skillIdArray[index];
      item.reset(skill);
    }
  }

  setRank(arg:any){
    const rank = arg?.rankVo?.rank ? arg?.rankVo?.rank : 0;
    const hurt = arg?.rankVo?.value ? arg?.rankVo?.value : 0;
    const rankStr = rank > 0 ? rank + '' : '未上榜';
    const hurtStr = hurt > 0 ? hurt + '' : '尚未挑战';

    const t = this;
    t.view.lbRank.text = `本服排名：${rankStr}`;
    t.view.lbHurt.text = `最高伤害：${hurtStr}`;

    
    t.view.lbInfoRank.text = `本服排名：${rankStr}`;
    t.view.lbInfoHurt.text = `最高伤害：${hurtStr}`;
  }

  updateUI() {
    const t = this;
    const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonBossVo;
    const selTime = vo.getSettleTime();
    if (!vo || vo.state == ServerEnums.SeasonActivityState.STOP || selTime < 0) {
      //结束了
      t.view.myG.visible = true;
      t.view.infoG.visible = false;

    } else {
      t.view.myG.visible = false;
      t.view.infoG.visible = true;

      const info = vo.getRewardInfo();
      t._rewards = SeasonConfigManager.getReward(info.sid)?.rewards;
      t._rState = info.state;
      t.view.listItems.numItems = t._rewards?.length || 0;

      t.view.lbTipsHurt.text = `伤害到<color=#3CFE37>${Math.floor(info.hp/10000)}万</color>可领取`;
      t.updateBossInfo();
    }

    if (vo) {
      t.view.btnGo.lbTimes.text = `次数 ${vo.getChallengeLeft()}/${vo.dailyChallengeTotalTimes}`;
    }

    FguiScriptUtils.toMyScriptClass(this.view.btnGo.redDot, RedDotCom).reset(RedDotKeys.Season_sub_entrance, [vo.activityId]);
  }

  updateBossInfo() {
    const t = this;
    const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonBossVo;
    if (vo) {
      const battleConfigId = vo.battleConfigId;
      try {

        // 怪物配置
        let cfgs = BattleUIUtils.getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId);
        // BOSS 一定只有一个
        const monsterConfig = cfgs[0];
        if (!monsterConfig) {
          console.error(`boss配置错误. battleConfigId=${battleConfigId} | 关联的怪物配置不存在`);
          return;
        }
        const bossSpineModel = FguiScriptUtils.toMyScriptClass(this.view.bossModelNode, ModelNode);
        bossSpineModel.loadByModelId(vo.spineModelId);
        this.view.lbBossN.text = monsterConfig.name;
        // 技能
        const skillIdArray = monsterConfig.skillIds
          .map(it => {
            return SkillConfigManager.getSkillConfigById(it);
          })
          .filter(it => {
            if (!it) {
              return false;
            }
            return StringUtils.isNotBlank(it.icon);
          })
          .map(it => it.id);
        this._skillIdArray = skillIdArray;
        this.view.listSkills.numItems = skillIdArray.length;

      } catch (error) {
        console.error(`boss形象报错. battleConfigId=${battleConfigId} `, error);
      }
    }
  }


  @LogBusiness("关闭界面")
  protected onClose() {
    super.onClose();
    G.GameTimer.clearAll(this)
  }

  private onTimer() {
    const t = this;
    const vo = SeasonManager.ins().getSubActityVo(t._subActivityId) as SeasonBossVo;
    if (!vo) {
      t.view.lbCd.text = '已结束';
    }

    const selTime = vo.getSettleTime();
    if(selTime > 0){
      t.view.lbCd.text = `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结算`;
    }else{
      const leftTimeMs = vo.getLeftTime();
      if (leftTimeMs > 0) {
        //优化
        t.view.lbCd.text = '已结算'//`<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs)}</color>后结束`;
        t.updateUI();
        G.GameTimer.clearAll(this);
      } else {
        t.view.lbCd.text = '已结束';
        G.GameTimer.clearAll(this);
      }
    }
  }


  //规则
  private onRule() {
    RuleController.ins().openRule(
      EnumRuleKeys.SEASON_BOSS,
      this.view.btnRule
    );
  }

  private onRule2() {
    G.UIManager.open(SeasonUIKeys.SeasonBossRewardView, this._subActivityId);
  }

}

UIScriptManager.bindScript(
  SeasonUIKeys.SeasonBossView, SeasonBossView
);
