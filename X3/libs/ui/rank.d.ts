declare namespace ui.rank {
	class RankMainView extends fgui.GComponent{
		public bgHeader:fgui.GImage;
		public top_bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public header:fgui.GGroup;
		public bgRank:fgui.GImage;
		public rankList:fgui.GList;
		public footerP:fgui.GGroup;
		public tabList:fgui.GList;
		public subTypeTabList:fgui.GList;
		public myRank:ui.rank.components.RankForMeComp;
		public bgFooter:ui.comm.back.BackFooter;
		public rank1:ui.comm.rank.RankTop3Comp;
		public rank2:ui.comm.rank.RankTop3Comp;
		public rank3:ui.comm.rank.RankTop3Comp;
		public topRewardBtn:ui.comm.btn.RightTabBtn;
		public subTypeDailyBossComp:ui.comm.rank.CommonSubTabListComp;
		public btnReward:ui.comm.btn.BtnEntrance;
	}
}
declare namespace ui.rank.components {
	class RankFooterItemComp extends fgui.GButton{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public all:fgui.GGroup;
	}
	class RankForMeComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelPlayerName:fgui.GTextField;
		public labelRankNum:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public labelGodLayerNum:fgui.GTextField;
		public G_god:fgui.GGroup;
		public labelRankValue:fgui.GTextField;
		public lbGuardShip:fgui.GTextField;
		public G_guardShip:fgui.GGroup;
		public lbTeam:fgui.GTextField;
		public G_team:fgui.GGroup;
		public lblSIFloor:fgui.GTextField;
		public lblSITime:fgui.GTextField;
		public G_secretInstance:fgui.GGroup;
		public lbCDStar:fgui.GTextField;
		public G_collectiblesDungeon:fgui.GGroup;
		public pvpScoreComp:ui.rank.components.RankPVPScoreComp;
		public leagueFlag:ui.comm1.league.LeagueFlagComp;
		public rankValueWithLogoComp:ui.comm.rank.RankValueWithLogoComp;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class RankOneRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelRankNum:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public labelRankValue:fgui.GTextField;
		public withLogoP:fgui.GGroup;
		public labelGodLayerNum:fgui.GTextField;
		public G_god:fgui.GGroup;
		public lbGuardShip:fgui.GTextField;
		public G_guardShip:fgui.GGroup;
		public lblSIFloor:fgui.GTextField;
		public lblSITime:fgui.GTextField;
		public G_secretInstance:fgui.GGroup;
		public lbTeam:fgui.GTextField;
		public G_team:fgui.GGroup;
		public lbCDStar:fgui.GTextField;
		public G_collectiblesDungeon:fgui.GGroup;
		public people:fgui.GGroup;
		public labelNoPeople:fgui.GTextField;
		public noP:fgui.GGroup;
		public pvpScoreComp:ui.rank.components.RankPVPScoreComp;
		public leagueFlag:ui.comm1.league.LeagueFlagComp;
		public rankValueWithLogoComp:ui.comm.rank.RankValueWithLogoComp;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class RankPVPScoreComp extends fgui.GComponent{
		public labelRankValue:fgui.GTextField;
		public pvpRankComp:ui.comm.pvp.CommonPVPRankSmallLogoComp;
	}
}
