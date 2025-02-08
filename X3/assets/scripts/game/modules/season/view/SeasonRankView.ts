import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { ListPageController } from "../../common/list/ListPageController";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { RankUtils } from "../../rank/utils/RankUtils";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonModel } from "../SeasonModel";
import { SeasonUIKeys } from "../SeasonUIKeys";
import { SeasonBossVo } from "../vo/SeasonBossVo";

export class SeasonRankView extends UIPage {

    static pkgName: string = "season";
    static viewName: string = "SeasonRankView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;

    protected _listCtrl: ListPageController = new ListPageController();
    private _page: number = 1;
    private _activityId:number;

    //排行榜数据长度
    private rankLimit: number;

    //客户端请求数据
    private mGetRankListC2S: Vo.activity.GetRankListC2S;

    private get view(): ui.season.SeasonRankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SEASON_RANK_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SEASON_RANK_UPDATE:
            {   
                let clientData: Vo.seasonactivity.GetRankListC2S = args.clientData;
                if (clientData && clientData.subActivityId == this._activityId) {
                    this.mRankingVo = args.rankVo;
                    this.mGetRankListC2S = args.clientData;
                    this._listCtrl.recRequstData(this.mGetRankListC2S.page, this.mRankingVo.list, this.mRankingVo.maxPage);
                    if (this.mGetRankListC2S.page == 1) {
                        this.updateView();
                    }
                }
                break;
            }
        }

    }

    protected onInit() {
        const t = this;

        //预览界面
        t.view.btnPre.onClick(t.onPre, t);
        t.view.imgClick.onClick(t.onClickPlayer, t);

        t.view.rankList.setVirtual();
        t.view.rankList.itemRenderer = t.itemRenderer.bind(t);

        t._listCtrl.requestCallback = t.getRankDataByPage.bind(t);
    }

    private updateView(){
        const t = this;
        t.showMyRank();
        t.setTop();

    }


     /**根据页数获取排行榜数据 */
     private getRankDataByPage(page: number) {
        const t = this;
        t._page = page;
        SeasonModel.ins().sendGetRankList({subActivityId:t._activityId,extraParam:null, page:page});
    }

    //第二名后
    itemRenderer(index: number, item: ui.season.com.SeasonRankItem) {
        const idx = index + 1;
        const rank = idx + 1;
       
        if(rank == 2){
            item.imageRank.visible = true;
            item.imageRank.icon = "ui://comm/no2_icon";
            item.rankTxt.text =  '';
        }else if(rank == 3){
            item.imageRank.visible = true;
            item.imageRank.icon = "ui://comm/no3_icon";
            item.rankTxt.text =  '';
        }else {
            item.imageRank.visible = false;
            item.rankTxt.text = rank + '';
        }

        let rankItem:Vo.ranking.RankItemVo = this._listCtrl.datas[idx];
        if (rankItem) {
            if(rankItem.baseVo.id == PlayerModel.ins().Vo.id){
                item.tag.visible = true;
            }else{
                item.tag.visible = false;
            }

            const playerBaseVo = rankItem.baseVo;
            FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp)
            .resetByTitleId(playerBaseVo.title);

            const avatar = FguiScriptUtils.toMyScriptClass(item.avatar, PlayerAvatar);
            avatar.resetByPlayerInfo(rankItem.baseVo);

            item.lbN.text = rankItem.baseVo.name;
            item.lbValue.text = rankItem.value+'';
            item.rankG.visible = true;
            item.noRank.visible = false;

        }else{

            item.rankG.visible = false;
            item.noRank.visible = true;
        }
    }
 

    @LogBusiness("打开界面")
    public onOpen(args: SeasonPageData): void {
        const t = this;
        t._activityId = args.subActId;


        const config = RankUtils.getRankTypeConfigByRankType(ServerEnums.RankingType['SEASON_SCORE']);
        t.rankLimit = config.limit;

        t._listCtrl.init(
            t.view.rankList,
            {
                maxLimitCount: t.rankLimit,
                countOffset: 1,
            },
            t._activityId + ""
        );
        G.GameTimer.loop(500, t, t.onTimer)
        t.onTimer();
        this.updateUI();
    }

    private onTimer(){
        const t = this;
        const vo = SeasonManager.ins().getSubActityVo(t._activityId) as SeasonBossVo;
        if(!vo){
          t.view.lbCd.text = '已结束';
        }
        const selTime = vo.getSettleTime();
        if(selTime > 0){
          //优化
          t.view.lbCd.text = `<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后结算`;
        }else{
          const leftTimeMs = vo.getLeftTime();
          if(leftTimeMs > 0){
            t.view.lbCd.text = '已结算'//`<color=#3CFE37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(selTime)}</color>后关闭`;
            G.GameTimer.clearAll(this)
          }else{
            t.view.lbCd.text = '已结束';
            G.GameTimer.clearAll(this)
          }
        }
    }


    updateUI(){
        const rewards = SeasonConfigManager.getTopRewards(this._activityId);
        const item = FguiScriptUtils.toMyScriptClass(this.view.itemBtn, ItemFrameBtn);
        if(rewards && rewards[0]){
            item.reset(rewards[0].k, rewards[0].v);

            const itemConfig = TableManager.getDataById(table.item.ItemConfig, rewards[0].k);
            this.view.lbReward.text = itemConfig.name;
            QualityUtils.setFGUIFontColorByQuality(this.view.lbReward, itemConfig.quality);
        }   
    
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        G.GameTimer.clearAll(this);
        this._listCtrl.dispose();
        super.onClose();
    }

    onPre(){
        G.UIManager.open(SeasonUIKeys.SeasonBalanceView, {rankInfo:this.mRankingVo, actId: this._activityId} );
    }


    setTop(){
        const t = this;
        const vo:Vo.ranking.RankItemVo = this._listCtrl.datas[0];
        if(!vo){
            t.view.imgTop.visible = false;
            t.view.titleComp.visible = false;
            t.view.titleComp.visible = false;
            t.view.lbN.text = '';
            t.view.lbS.text = '';
        }else{
            const playerBaseVo = vo.baseVo;
            if (playerBaseVo) {
                const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo)
    
                const modelNode = FguiScriptUtils.toMyScriptClass(this.view.modelNode, ModelNode);
                modelNode.setScale(2.3, 2.3);
                modelNode.loadByModelId(modelId);
    
                //text
                t.view.lbN.text = playerBaseVo.name;
                t.view.lbS.text = '赛季总积分:'+vo.value

                FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp)
                    .resetByTitleId(playerBaseVo.title);

            }
        }
    }


    onClickPlayer() {
        const vo:Vo.ranking.RankItemVo = this._listCtrl.datas[0];
        if(vo?.baseVo){
            UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(
                vo?.baseVo?.id
            ));
        }
    }


    private mRankingVo: Vo.ranking.RankingVo
    /**我的排行榜信息 */
    private showMyRank(): void {
        let vo = this.mRankingVo;
        let rank = vo ? vo.rank : 0;
        if(rank < 0){
            this.view.lbMyR.text = '未上榜';
        }else{
            this.view.lbMyR.text = vo.rank+'';
        }

        this.view.lbMyS.text = '我的总积分：'+ vo.value;
    }

}

UIScriptManager.bindScript(SeasonUIKeys.SeasonRankView, SeasonRankView);