declare namespace ui.worldBoss {
	class worldBossBattleServerSuccess extends fgui.GComponent{
		public spineNode:fgui.GLoader;
		public world:fgui.GTextField;
		public getReward:ui.worldBoss.btn.killGetReward;
	}
	class worldBossBattleSuccess extends fgui.GComponent{
		public totalDamage:fgui.GTextField;
		public rank:fgui.GTextField;
		public newRank:fgui.GImage;
		public newDamage:fgui.GImage;
		public boxNum:fgui.GTextField;
		public rewards:fgui.GList;
		public btnData:ui.comm.btn.BtnData;
		public modelNode:ui.comm.node.ModelNode;
	}
	class worldBossBattleUI extends fgui.GComponent{
		public bossHead:fgui.GImage;
		public boxNum:fgui.GTextField;
		public lbHp:fgui.GTextField;
		public container:fgui.GGroup;
		public boxBar:ui.worldBoss.component.worldBossBoxBar;
		public bossHpBar:ui.worldBoss.component.worldBossHpBar;
		public hurtCom:ui.worldBoss.component.totalDamageComp;
	}
	class worldBossBeat extends fgui.GComponent{
		public bossSpine:fgui.GLoader;
		public bossName:fgui.GTextField;
		public playerList:fgui.GList;
		public killTimeStr:fgui.GTextField;
		public killTime:fgui.GGroup;
		public no2Com:ui.worldBoss.btn.No2Com;
		public no3Com:ui.worldBoss.btn.No3Com;
		public no1Com:ui.worldBoss.btn.No1Com_1;
	}
	class worldBossMain extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bossSpine:fgui.GImage;
		public bottom:fgui.GGroup;
		public actTime:fgui.GRichTextField;
		public bossHead:fgui.GImage;
		public bossName:fgui.GTextField;
		public bfmp:fgui.GTextField;
		public serverRank:fgui.GTextField;
		public zgsh:fgui.GTextField;
		public highestDamage:fgui.GTextField;
		public highestDamage_gr:fgui.GGroup;
		public qxchbs:fgui.GTextField;
		public skillList:fgui.GGroup;
		public rewardBtn:ui.worldBoss.btn.rewardEnter;
		public rankBtn:ui.worldBoss.btn.rankEnter;
		public danmuBtn:ui.worldBoss.btn.danmuEnter;
		public challengeBtn:ui.worldBoss.btn.challageBtn;
		public buzhenBtn:ui.worldBoss.btn.buzhenBtn;
		public bossHp:ui.worldBoss.component.bossHpBar;
		public godPick:ui.worldBoss.component.godPick;
		public skill0:ui.worldBoss.component.skillIcon;
		public skill1:ui.worldBoss.component.skillIcon;
		public skill2:ui.worldBoss.component.skillIcon;
		public damageReward:ui.worldBoss.btn.mainRewardBtn;
		public hotHero:ui.worldBoss.btn.hotHero;
		public btn_Tips:ui.comm.btn.BaseBtn;
		public backBtn:ui.comm.back.BtnBack;
	}
	class worldBossPersonReward1 extends fgui.GComponent{
		public rankNum:fgui.GTextField;
		public rewardList:fgui.GList;
		public rewardList2:fgui.GList;
		public rankList:fgui.GList;
	}
	class worldBossRank extends fgui.GComponent{
		public rankList:fgui.GList;
		public rewardBtn:ui.worldBoss.btn.rewardEnter;
		public myRank:ui.worldBoss.component.rankCell;
		public no2Com:ui.worldBoss.btn.No2Com1;
		public no1Com:ui.worldBoss.btn.No1Com1;
		public no3Com:ui.worldBoss.btn.No3Com1;
		public bottom:ui.comm.back.BackFooter;
	}
	class worldBossRewardView extends fgui.GComponent{
		public rewardList:fgui.GList;
	}
	class worldBossServerReward extends fgui.GComponent{
		public rewardList:fgui.GList;
		public rankList:fgui.GList;
		public killTime:fgui.GRichTextField;
	}
	class worldBossSettlementReward extends fgui.GComponent{
		public tabList:fgui.GList;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
	}
}
declare namespace ui.worldBoss.btn {
	class backBtn extends fgui.GComponent{
	}
	class buzhenBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class challageBtn extends fgui.GButton{
		public time:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
		public redDot1:ui.comm.com.RedDot;
	}
	class danmuEnter extends fgui.GButton{
	}
	class hotHero extends fgui.GComponent{
		public hotHeros:fgui.GList;
	}
	class killGetReward extends fgui.GButton{
	}
	class mainRewardBtn extends fgui.GButton{
		public damageReward:fgui.GTextField;
	}
	class No1Com_1 extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager3;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class No1Com1 extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class No2Com extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager3;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class No2Com1 extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class No3Com extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager3;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class No3Com1 extends fgui.GButton{
		public nameLabel:fgui.GTextField;
		public noRank:fgui.GTextField;
		public damageCom:ui.worldBoss.component.worldBossDamager;
		public modelNode:ui.comm.node.ModelNode;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class rankBtn extends fgui.GButton{
	}
	class rankEnter extends fgui.GButton{
	}
	class rewardEnter extends fgui.GButton{
	}
	class rewardTabButton extends fgui.GButton{
	}
}
declare namespace ui.worldBoss.component {
	class bossHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class godPick extends fgui.GButton{
	}
	class headMask extends fgui.GComponent{
		public head:ui.comm.playerInfo.PlayerAvatar;
	}
	class heroHead extends fgui.GComponent{
		public quality:fgui.GLoader;
		public head:fgui.GLoader;
	}
	class playerHeadWithFight extends fgui.GButton{
		public noRank:fgui.GTextField;
		public nameLab:fgui.GTextField;
		public rankGr:fgui.GGroup;
		public powerLab:ui.worldBoss.component.worldBossDamager4;
		public headCom:ui.worldBoss.component.headMask;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class rankCell extends fgui.GButton{
		public playerName:fgui.GTextField;
		public rankGr:fgui.GGroup;
		public rank:fgui.GTextField;
		public playerFight:ui.worldBoss.component.worldBossDamager2;
		public playerAvatar:ui.comm.playerInfo.PlayerAvatar;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class skillIcon extends fgui.GButton{
		public skillCom:ui.worldBoss.component.skillMask;
	}
	class skillMask extends fgui.GComponent{
		public img_skill:fgui.GLoader;
	}
	class totalDamageComp extends fgui.GComponent{
		public word:fgui.GTextField;
		public hurt:fgui.GTextField;
	}
	class worldBossBoxBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class worldBossDamager extends fgui.GComponent{
		public damage:fgui.GTextField;
		public layout:fgui.GGroup;
	}
	class worldBossDamager2 extends fgui.GComponent{
		public damage:fgui.GTextField;
	}
	class worldBossDamager3 extends fgui.GComponent{
		public damage:fgui.GTextField;
	}
	class worldBossDamager4 extends fgui.GComponent{
		public damage:fgui.GTextField;
	}
	class worldBossHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class worldBossPersonRewardCell extends fgui.GComponent{
		public rank:fgui.GTextField;
		public rank1:fgui.GImage;
		public rank2:fgui.GImage;
		public rank3:fgui.GImage;
		public rewardList:fgui.GList;
	}
	class worldBossServerRewardCell extends fgui.GComponent{
		public title:fgui.GTextField;
		public rewardList:fgui.GList;
	}
}
