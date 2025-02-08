import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { TableManager } from "../../../core/table/TableManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { BaseActivityVo } from "../../comm/activity/model/BaseActivityVo";
import LocalStorage from "../../comm/cache/LocalStorage";
import NotificationKey from "../../event/NotificationKey";
import { EnumTabItemNameForClient } from "../../ui/main/const/EnumTabItemNameForClient";
import { UIActivityKey } from "../activity/const/UIActivityConfig";
import { RedDotPath } from "../common/redDot/structs/RedDotPath";
import { ItemModel } from "../item/model/ItemModel";
import { EnumJumpByCodeKeyName } from "../jump/const/EnumJumpByCodeKeyName";
import { PlayerModel } from "../player/model/PlayerModel";
import { EventRankDataResp } from "../rank/event/EventRankData";
import { ActivityState, PassType, TaskState } from "./EnumSeason";
import { SeasonMenuItem } from "./item/SeasonMenuItem";
import { SeasonRankItem } from "./item/SeasonRankItem";
import { SeasonRewardCom } from "./item/SeasonRewardCom";
import { SeasonBossAttacker } from "./seasonBoss/com/SeasonBossAttacker";
import { SeasonBossProCom } from "./seasonBoss/com/SeasonBossProCom";
import { SeasonBossRewardItem } from "./seasonBoss/com/SeasonBossRewardItem";
import { SeasonBossSkillItem } from "./seasonBoss/com/SeasonBossSkillItem";
import { SeasonConfigManager } from "./SeasonConfigManager";
import { SeasonModel } from "./SeasonModel";
import { SeasonReachScoreItem } from "./seasonReach/com/SeasonReachScoreItem";
import { SeasonReachTab } from "./seasonReach/com/SeasonReachTab";
import { SeasonScoreSItem } from "./seasonScore/com/SeasonScoreSItem";
import { SeasonScoreTab } from "./seasonScore/com/SeasonScoreTab";
import { SeasonSecretEnd } from "./seasonSecret/com/SeasonSecretEnd";
import { SeasonSecretItem } from "./seasonSecret/com/SeasonSecretItem";
import { SeasonUIKeys } from "./SeasonUIKeys";
import { EmptyContentVo } from "./vo/EmptyContentVo";
import { SeasonBaseVo } from "./vo/SeasonBaseVo";
import { SeasonBossVo } from "./vo/SeasonBossVo";
import { SeasonReachVo } from "./vo/SeasonReachVo";
import { SeasonSecretVo } from "./vo/SeasonSecretVo";
import { SignUpVo } from "./vo/SignUpVo";

export interface SeasonPageData {
  uiName: string
  icon: string
  iconSelect: string
  name: string
  redDotKey?: RedDotPath
  subActId?:number
  type?:string
}

export class SeasonManager extends BaseController {

  /**这个固定的,菜单界面加上总榜单  */
  private _pageMenuData:SeasonPageData[] = [
    {
      uiName: SeasonUIKeys.SeasonMenuView,
      icon: "image/season/season0_2_1",
      iconSelect: "image/season/season0_2_2",
      name:'赛季手册',
    },
    {
      uiName: SeasonUIKeys.SeasonRankView,
      icon: "image/season/season0_1_1",
      iconSelect: "image/season/season0_1_2",
      name:'赛季排名',
    },
  ];

  private _pageData:SeasonPageData[] = [
    {
      uiName: SeasonUIKeys.SeasonScoreView,
      icon: "image/season/season0_2_1",
      iconSelect: "image/season/season0_2_2",
      name:'任务积分',
      type:'SCORE',
    },


    {
      uiName: SeasonUIKeys.SeasonReachView,
      icon: "image/season/season0_2_1",
      iconSelect: "image/season/season0_2_2",
      name:'竞技任务',
      type:'REACH',
    },
 

    {
      uiName: SeasonUIKeys.SeasonSecretView,
      icon: "image/season/season0_2_1",
      iconSelect: "image/season/season0_2_2",
      name:'秘境竞速',
      type:'SECRET',
    },

    {
      uiName: SeasonUIKeys.SeasonBossView,
      icon: "image/season/season0_2_1",
      iconSelect: "image/season/season0_2_2",
      name:'秘境Boss',
      type:'BOSS',
    },
 
  ]

  /** boss出现 */
  bossAppear = false;

  //这里获取菜单界面分页信息
  getMenuList(){
    this._pageMenuData.forEach(v=>{
      v.subActId = this.getTotalRankActId();
    })

    return this._pageMenuData;
  }

 



  listenNotifications(): string[] {
    return [];
  }

  notificationHandler(event: string, args?: any): void {
    switch (event) {
    }
  }

  onInit(): void {
    G.FGUIManager.bindScript("ui://season/SeasonMenuItem", SeasonMenuItem);
    G.FGUIManager.bindScript("ui://season/SeasonRankItem", SeasonRankItem);
    G.FGUIManager.bindScript("ui://season/SeasonRewardCom", SeasonRewardCom);

    G.FGUIManager.bindScript("ui://seasonScore/SeasonScoreSItem", SeasonScoreSItem);
    G.FGUIManager.bindScript("ui://seasonScore/SeasonScoreTab", SeasonScoreTab);
    /**初始化菜单信息 */

    G.FGUIManager.bindScript("ui://seasonReach/SeasonReachScoreItem", SeasonReachScoreItem);
    G.FGUIManager.bindScript("ui://seasonReach/SeasonReachTab", SeasonReachTab);

    G.FGUIManager.bindScript("ui://seasonBoss/SeasonBossRewardItem", SeasonBossRewardItem);
    G.FGUIManager.bindScript("ui://seasonBoss/SeasonBossSkillItem", SeasonBossSkillItem);
    G.FGUIManager.bindScript("ui://seasonBoss/SeasonBossProCom", SeasonBossProCom);
    G.FGUIManager.bindScript("ui://seasonBoss/SeasonBossAttacker", SeasonBossAttacker);
    

    G.FGUIManager.bindScript("ui://seasonSecret/SeasonSecretItem", SeasonSecretItem);
    G.FGUIManager.bindScript("ui://seasonSecret/SeasonSecretEnd", SeasonSecretEnd);
  }


  /**获取对应子活动，任务状态*/
  getTaskState():ServerEnums.TaskState{
    return 
  }

  /**根据活动id和类型获取对应的任务列表 */
  getTasks(aid:number , type){
    return [];
  }


  /**更新赛季活动状态 */
  updateSeasonActivityState(vo:Vo.seasonactivity.SeasonActivityNewStateVo){
    const t = this;
    const avo = t._mapStateVos.get(vo.activityId);
    if(avo){
      if(avo.state == 1 && vo.state == 2){
        SeasonModel.ins().sendGetCurrentSeasonActivities();
      }else if((vo.state == 3 || vo.state == 1) && vo.activityId == this.curSeasonActId){
        //活动关了，现在没有进行中的赛季活动
        this.curSeasonActId = null;
      }
      avo.state = vo.state;
    }else if(vo.state == 2){
      //没有就请求一次
      SeasonModel.ins().sendGetCurrentSeasonActivities();
    }
  }

  /**更新赛季子活动状态 */
  updateSeasonSubActivityState(vo:Vo.seasonactivity.SubSeasonActivityNewStateVo){
    const t = this;
    const avo = t._mapSubVos.get(vo.subActivityId);
    if(avo){
        avo.state = vo.state;
        if(avo.isShowRed){
          avo.isShowRed();
        }
       
    }
  }

  /**所有 子活动集合*/
  private _mapSubVos:Map<number, SeasonBaseVo> = new Map();
  /**所有 子活动状态集合*/
  // private _mapSubStateVos:Map<number, Vo.seasonactivity.SubSeasonActivityStateVo[]> = new Map();
  /**所有 活动状态集合 */
  private _mapStateVos:Map<number, {state:number,startTime:number, endTime:number }> = new Map();
  /**当前赛季活动id, 和策划确认 暂时只有一个 */
  public curSeasonActId:number;
  createSeasonVo(vos:Vo.seasonactivity.CurrentSeasonActivitiesVo){
    //主赛季活动改变需要重新设置子活动信息；
    this._mapSubVos.clear();
    this.curSeasonActId = null;
    if(vos){
      if(vos.activityStateVos){
        for(let l = 0; l < vos.activityStateVos.length; l++){
          const stateVo = vos.activityStateVos[l];
          if(stateVo.state == 2){
              //开启中,同时只会存在一个
              this.curSeasonActId = stateVo.activityId;

              const sVos = stateVo.subActivityStateVos;
              for(const svo of sVos){
                svo['seasonId'] = stateVo.activityId;
                const temp = this.createOneVo(svo.subActivityId, svo);
                this._mapSubVos.set(svo.subActivityId, temp);
              }
          }
          this._mapStateVos.set(stateVo.activityId, {state:stateVo.state, startTime:stateVo.startTime, endTime:stateVo.endTime});
        }

      }

      for(let i = 0; i< vos.activityVos.length; i++){
        const vo = vos.activityVos[i];
        if(vo.subActivityVos){
          for(let j = 0; j<vo.subActivityVos.length; j++){
            const svosub = vo.subActivityVos[j];
            let temp = this._mapSubVos.get(svosub.subActivityId);
            if(temp){
              temp.update(svosub)
            }else{
              svosub['seasonId'] = vo.activityId;
              temp = this.createOneVo(svosub.subActivityId, svosub);
              this._mapSubVos.set(svosub.subActivityId, temp);
            }
          } 
        }
      }
    }
  }

  public updateSeasonVos(vos:Vo.seasonactivity.SeasonActivityVo){

  }


  public createOneVo(sid:number, svo):SeasonBaseVo{
    const cfg = TableManager.getDataById(table.seasonactivity.Constant.SubSeasonActivityConfig, sid);
    const type = cfg.type;
    const code = ServerEnums.SubSeasonActivityType[type];
    let temp: SeasonBaseVo | null = null;
    if(code == ServerEnums.SubSeasonActivityType.SIGN_UP){
      temp = new SignUpVo(svo);
    }else if(code == ServerEnums.SubSeasonActivityType.SEASON_BOSS){
      temp = new SeasonBossVo(svo);
    }else if(code == ServerEnums.SubSeasonActivityType.SEASON_REACH){
      temp = new SeasonReachVo(svo);
    }else if(code == ServerEnums.SubSeasonActivityType.SEASON_SCORE_RUSH_RANK){
      temp = new EmptyContentVo(svo);
    }else if(code == ServerEnums.SubSeasonActivityType.SEASON_SECRET){
      temp = new SeasonSecretVo(svo);
    }
    return temp;
  }

  /**获取对应子活动信息 */
  getSubActityVo(sid:number):SeasonBaseVo{
    return this._mapSubVos.get(sid);
  }

  /**获取对应SeasonId的子活动列表 */
  getSubListBySeasonID(id:number):SeasonBaseVo[]{
    const list = [];
    this._mapSubVos.forEach(v=>{
      if(v.seasonId == id){
        list.push(v);
      }
    })
    //入口按照开启时间开放
    list.sort((a:SeasonBaseVo, b:SeasonBaseVo)=>{
      return a.startTime - b.startTime;
    })
    return list;
  }

  /**获取当前活动的报名类子活动id */
  getSignUpActId(){
    if(this.curSeasonActId){
      const subVos = this.getSubListBySeasonID(this.curSeasonActId);
      for(const vo of subVos){
        const aid = vo.activityId;
        const cfg = SeasonConfigManager.getSubConfigById(aid);
        if(ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SIGN_UP] == cfg.type){
            return cfg.id;
        }
      }
    }
    return null;
  }

  /**获取签到状态 结合本地 */
  getSigned(){
    const t = this;
    const id = t.getSignUpActId();
    const svo = t.getSubActityVo(id) as SignUpVo;
    const signed = svo?.signed;
    if(!signed){
      //还要判断活动后报名，活动后报名后端没保存
      if(svo?.state == ActivityState.ING){
        return signed;
      }
      return this.isLocalSigned();
    }
    return signed;
  }

  /**签到活动状态 */
  getSingUpState(){
    const t = this;
    const id = t.getSignUpActId();
    const svo = t.getSubActityVo(id) as SignUpVo;
    if(svo){
      return svo.state;
    }
    return ActivityState.CLOSE;
  }


  /**获取当前总榜活动Id */
  getTotalRankActId(){
    if(this.curSeasonActId){
      const subVos = this.getSubListBySeasonID(this.curSeasonActId);
      for(const vo of subVos){
        const aid = vo.activityId;
        const cfg = SeasonConfigManager.getSubConfigById(aid);
        if('OVERALL_RANK' == cfg.enterType){
            return cfg.id;
        }
      }
    }
    return null;
  }

  /**获取菜单数据 */
  getMenus():{eType:string, mainActId:number, pages:SeasonPageData[]}[]{
    let menus:{eType:string, mainActId:number, pages:SeasonPageData[]}[] = [];
    const t = this;
    if(t.curSeasonActId){
      const subVos = this.getSubListBySeasonID(this.curSeasonActId);
      subVos.forEach(svo=>{
        const sid = svo.activityId;
        const cfg = SeasonConfigManager.getSubConfigById(sid);
        const eType = cfg.enterType;
        if(eType){
           const index = menus.findIndex(v=>{v.eType == eType})
           if(index == -1){
              const page1 = t.getMenuTemp(eType);
              if(page1){
                const rankActId = cfg.rankId;
                page1.subActId = sid;
                page1.icon = cfg.pageIcon || page1.icon;
                page1.iconSelect = cfg.pageIconSel || page1.iconSelect;
                page1.name = cfg.name;
                let pagespages:SeasonPageData[] = [];
                //配套一個排行榜，有些排行榜有自己独立的活动id，有些没有
                //非排行榜的活动关闭就不展示了
                if(svo.state == ServerEnums.SeasonActivityState.START){
                  pagespages.push(page1);
                }
                pagespages.push({
                  uiName: SeasonUIKeys.SeasonSubRankView,
                  icon: cfg.pageRankIcon || 'image/season/season0_2_1',
                  iconSelect: cfg.pageRankIconSel || 'image/season/season0_2_2',
                  name:SeasonConfigManager.getRankTitle(sid),
                  subActId:rankActId?rankActId:sid,
                })
              
                menus.push({eType:eType, mainActId:sid, pages:pagespages})
              }
           }
        }
      })
    }
    return menus;
  }
  
  
  public getMenuTemp(type):SeasonPageData{
    const data = this._pageData.find(v=>{return v.type == type});
    return data;
  }

  /**获取对应赛季倒计时 */
  public getLeftTimeBySeasonId(){
    const vo = this._mapStateVos.get(this.curSeasonActId);
    if(!vo){
      return 0;
    }
    const leftTime = vo.endTime - G.TimeManager.serverNow;
    return leftTime;
  }

  public getEndTime(){
    const vo = this._mapStateVos.get(this.curSeasonActId);
    if(!vo){
      return 0;
    }
    return vo.endTime;
  }


  /**是否有开启的赛季活动 */
  public isSeason():boolean{
    return !!this.curSeasonActId;
  }

  public getSeasonCfg():table.seasonactivity.Constant.SeasonActivityConfig{
    if(this.curSeasonActId){
      return TableManager.getDataById(table.seasonactivity.Constant.SeasonActivityConfig, this.curSeasonActId);
    }
    return null;
  }

  public getSeasonClientName(){
      const cfg = this.getSeasonCfg();
      if(cfg){
        const isShow = this.isShowSubIcon()
        if(isShow){
          const svo = SeasonManager.ins().getSubOpen();
          return cfg.name +"\n"+ svo.cfg.name;
        }else{
          return cfg.name;
        }
      }
      return '';
  }

  /**获取当前开启的子活动 */
  public getSubOpen():SeasonBaseVo{
    const menus = this.getMenus();
    for(let i = 0; i<menus.length; i++){
      const mainId = menus[i].mainActId;
      const svo = this.getSubActityVo(mainId);
      if(svo?.state == ServerEnums.SeasonActivityState.START){
        return svo;
      }
    }
    return null;
  }

  /**主界面是否显示子活动 */
  public isShowSubIcon(){
      const signed = this.getSigned();
      if(!signed){
        return false;
      }
      const svo = this.getSubOpen();
      return !!svo;
  }


  /**判断是否报名 */
  public isLocalSigned() {
      //本地数据
      const time = this.getEndTime();
      if(!time){
        return 0;
      }
      return LocalStorage.player?.season?.signed == time;
  }

  /**活动结束后报名(保存本地) */
  public localSigned(){
    const time = this.getEndTime()
    LocalStorage.player.season = { signed: time };
    this.emit(NotificationKey.SEASON_SIGNUP_UPDATE);
  }

  /**获取当前开启的子活动界面数据 */
  public getSubOpenPageData():SeasonPageData[]{
    const menus = this.getMenus();
    for(let i = 0; i<menus.length; i++){
      const mainId = menus[i].mainActId;
      const svo = this.getSubActityVo(mainId);
      if(svo.state == ServerEnums.SeasonActivityState.START){
        return menus[i].pages;
      }
    }
    return null;
  }

  private _mapItemId:Map<number,number>;
  public getItemIdByActId(id:number){
    if(!this._mapItemId){
      this._mapItemId = new Map();
      const cfgs = TableManager.getAllData(table.seasonactivity.SeasonRushRank.SeasonRushRankConfig);
      cfgs.forEach(v=>{
        this._mapItemId.set(v.subActivityId, v.scoreItemId);
      })
    }
    return this._mapItemId.get(id);
  }

  public getScore(id:number){
    const cfg = SeasonConfigManager.getSubConfigById(id);
    const tid = cfg.rankId?cfg.rankId:id;
    const itemId = this.getItemIdByActId(tid);
    return ItemModel.ins().getItemCountById(itemId);
  }

  /**是否是赛季跳转 */
  public isSeasonJump(jid:number){
    const cfg = TableManager.getDataById(table.jump.JumpConfig, jid);
    if(cfg?.keyName == EnumJumpByCodeKeyName.SeasonMainView){
      return true;
    }
    return false;
  }

  /**获取当前赛季boss活动的id */
  public getBossActId(){
    let id;
    this._mapSubVos.forEach(vo=>{
      const type = vo?.cfg?.type;
      if(type == ServerEnums.SubSeasonActivityType[ServerEnums.SubSeasonActivityType.SEASON_BOSS]){
        id = vo.activityId;
      }
    })
    return id;
  }

  /************界面打开************* */
  openView(view:EnumTabItemNameForClient){
    if(view == EnumTabItemNameForClient.SEASON){
      const aid = SeasonManager.ins().getSignUpActId();
      const vo = SeasonManager.ins().getSubActityVo(aid);
      if(vo && vo.state == ServerEnums.SeasonActivityState.START){
          G.UIManager.open(SeasonUIKeys.SeasonMainView)
      }else{
          const signed = SeasonManager.ins().getSigned();
          if(signed && SeasonManager.ins().getSingUpState() == ActivityState.CLOSE){
              //已签到
              G.UIManager.open(SeasonUIKeys.SeasonContainerView, SeasonManager.ins().getMenuList())
          }else{
              G.UIManager.open(SeasonUIKeys.SeasonMainView)
          }
      }
    }
    else if(view == EnumTabItemNameForClient.SEASON_SUB){
      const pages = SeasonManager.ins().getSubOpenPageData();
      if(pages){
          G.UIManager.open(SeasonUIKeys.SeasonSubContainerView, pages);
      }
    }
  }

  /**根据活动id获取赛程序号 */
  getMenuInfo(actId:number){
    const menus = this.getMenus();
    for(let i=0; i<menus.length; i++){
      const menu = menus[i];
      if(menu.mainActId == actId){
        return i+1;
      }
      const pages = menu.pages;
      for(let j=0; j<pages.length; j++){
        const page = pages[j];
        if(page.subActId == actId){
          return i+1;
        }
      }
    }
    return null
  }
}
SeasonManager.ins().doInit();
