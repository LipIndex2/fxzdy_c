declare namespace ui.seasonBoss {
	class SeasonBossResultView extends fgui.GComponent{
		public lbRank:fgui.GTextField;
		public imgRank:fgui.GImage;
		public lbValue:fgui.GTextField;
		public imgValue:fgui.GImage;
		public title1:fgui.GTextField;
		public G1:fgui.GGroup;
		public flyPos1:fgui.GTextField;
		public itemListRecord:fgui.GList;
		public title1:fgui.GTextField;
		public G2:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnBackpack:ui.comm.btn.BtnBeiBao;
		public btnData:ui.comm.btn.BtnData;
		public itemList1:ui.comm.item.ItemListComp2;
	}
	class SeasonBossRewardView extends fgui.GComponent{
		public listItems:fgui.GList;
	}
	class SeasonBossView extends fgui.GComponent{
		public lbBossN:fgui.GTextField;
		public listSkills:fgui.GList;
		public lbTitle:fgui.GTextField;
		public lbCd:fgui.GRichTextField;
		public lbRank:fgui.GTextField;
		public lbHurt:fgui.GTextField;
		public myG:fgui.GGroup;
		public lbInfoRank:fgui.GTextField;
		public lbInfoHurt:fgui.GTextField;
		public lbTipsHurt:fgui.GRichTextField;
		public listItems:fgui.GList;
		public infoG:fgui.GGroup;
		public btnGo:ui.seasonBoss.btn.SeasonBossChallengeBtn;
		public item7:ui.seasonBoss.com.SeasonBossAttacker;
		public item5:ui.seasonBoss.com.SeasonBossAttacker;
		public item3:ui.seasonBoss.com.SeasonBossAttacker;
		public item6:ui.seasonBoss.com.SeasonBossAttacker;
		public item8:ui.seasonBoss.com.SeasonBossAttacker;
		public item1:ui.seasonBoss.com.SeasonBossAttacker;
		public item2:ui.seasonBoss.com.SeasonBossAttacker;
		public item4:ui.seasonBoss.com.SeasonBossAttacker;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnRule2:ui.comm.btn.BtnGth3;
		public bossModelNode:ui.comm.node.ModelNode;
		public btnFormation:ui.comm.btn.BtnBuZhen;
		public btnSimulate:ui.comm.btn.BtnBuZhen;
	}
}
declare namespace ui.seasonBoss.btn {
	class SeasonBossChallengeBtn extends fgui.GButton{
		public lbTimes:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.seasonBoss.com {
	class SeasonBossAttacker extends fgui.GComponent{
		public imgTop:fgui.GLoader;
		public lbName:fgui.GTextField;
		public lbRank:fgui.GTextField;
		public rankG:fgui.GGroup;
		public spineNode:ui.comm.node.ModelNode;
	}
	class SeasonBossProCom extends fgui.GComponent{
		public lb:fgui.GTextField;
		public listItems:fgui.GList;
	}
	class SeasonBossRewardItem extends fgui.GComponent{
		public richTitle:fgui.GRichTextField;
		public listItems:fgui.GList;
	}
	class SeasonBossSkillItem extends fgui.GComponent{
		public img:ui.comm.hero.components.skillIconMask;
	}
}
