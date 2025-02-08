/**勘探UI配置*/
export enum UILeagueExploreConfig {
    /**主界面*/
    LeagueExploreMainView = 'LeagueExploreMainView',
    /**地图界面*/
    LeagueExploreMapView = 'LeagueExploreMapView',
    /**工厂界面*/
    LeagueExploreFactoryWin = 'LeagueExploreFactoryWin',
    /**收益界面*/
    LeagueExploreIncomeWin = 'LeagueExploreIncomeWin',
    /**矿界面*/
    LeagueExploreMineWin = 'LeagueExploreMineWin',
    /**小地图界面*/
    LeagueExploreMiniWin = 'LeagueExploreMiniWin',
    /**快速收益界面*/
    LeagueExploreQuickWin = 'LeagueExploreQuickWin',
    /**奖励界面*/
    LeagueExploreRewardWin = 'LeagueExploreRewardWin',
    /**分享界面*/
    LeagueExploreShareWin = 'LeagueExploreShareWin',
    /**交换建筑确认框*/
    LeagueExploreExchangeConfirmWin = 'LeagueExploreExchangeConfirmWin',
    /**购买次数界面*/
    LeagueExploreBuyAtkTimesWin = 'LeagueExploreBuyAtkTimesWin',

    //其他子页面
    /**奖励子页面*/
    LeagueExploreRewardSubView = 'LeagueExploreRewardSubView',
    /**收益子页面*/
    LeagueExploreIncomeSubView = 'LeagueExploreIncomeSubView',
    /**个人日志子页面*/
    LeagueExploreRecordSubView1 = 'LeagueExploreRecordSubView1',
    /**联盟日志子页面*/
    LeagueExploreRecordSubView2 = 'LeagueExploreRecordSubView2',
}

/**奖励界面打开参数*/
export interface ILeagueExploreRewardOpenArgs {
    /**我的排名*/
    myRank: number;
    /**联盟排名*/
    leagueRank: number;
    /**默认打开页签*/
    defaultIndex:number;
}

export interface ILeagueExploreBuildingOpenArgs {
    /**建筑id*/
    buildingId:number;
    /**是否是前往*/
    isGoto?:boolean;
}

/**二次确认框类型*/
export enum LeagueExploreConfirmType {
    Exchange = 1,
    CancelOccupy = 2,
}

export interface ILeagueExploreExchangeConfirmOpenArgs {
   /**建筑id*/
   buildingId:number;
   /**提示类型*/
   type:LeagueExploreConfirmType;
   /**是否是前往*/
   okFunc:() => void;
}

export interface ILeagueExploreBuyAtkTimesOpenArgs {
    /**本地记录的key值*/
    localKey: string;
    /**点击确认回调*/
    onClickConfirm: () => void;
    /**点击取消回调*/
    onClickCancel?: () => void;
    
}
