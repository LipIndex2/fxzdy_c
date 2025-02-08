declare namespace ui.dailyBoss {
	class DailyBossBalanceView extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelRankTitle:fgui.GTextField;
		public labelMyRank:fgui.GTextField;
		public bgReward:fgui.GImage;
		public bgRewardTitle:fgui.GImage;
		public labelRewardTitle:fgui.GTextField;
		public rowList:fgui.GList;
		public myRewardComp:ui.comm.item.ItemListComp;
	}
	class DailyBossBattleResultView extends fgui.GComponent{
		public labelExitTips:fgui.GTextField;
		public footer:fgui.GGroup;
		public flyPos1:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public labelDamage:fgui.GTextField;
		public imageNewDamage:fgui.GImage;
		public labelDamageTips:fgui.GTextField;
		public labelRewardTitle:fgui.GTextField;
		public bgReward:fgui.GImage;
		public gridList:fgui.GList;
		public body:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
		public btnBackpack:ui.comm.btn.BtnBeiBao;
	}
	class DailyBossMainView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public footerP:fgui.GGroup;
		public skillList:fgui.GList;
		public bgReward:fgui.GImage;
		public rewardList:fgui.GList;
		public bodyP:fgui.GGroup;
		public tabList:fgui.GList;
		public labelHeaderTitle:fgui.GTextField;
		public labelResetTime:fgui.GTextField;
		public list_hero:fgui.GList;
		public headerP:fgui.GGroup;
		public difficultyComp:ui.dailyBoss.components.DailyBossDifficultyComp;
		public myRankComp:ui.dailyBoss.components.DailyBossMyRankComp;
		public damageComp:ui.dailyBoss.components.DailyBossDamageComp;
		public btnChallenge:ui.dailyBoss.btn.DailyBossChallengeBtn;
		public recommendBtn:ui.dailyBoss.btn.DailyBossFdjBtn;
		public bossModelNode:ui.comm.node.ModelNode;
		public btnBack:ui.comm.back.BtnBack;
		public btnPlayAd:ui.comm.btn.BtnAdLb;
		public btnSetUp:ui.comm.btn.BtnBuZhen;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class DailyBossRecommendView extends fgui.GComponent{
		public list_rec:fgui.GList;
	}
	class DailyBossTemp extends fgui.GComponent{
	}
	class DailyBossUnlockNewHardView extends fgui.GComponent{
		public fg:fgui.GImage;
		public imageNewUnlock:fgui.GImage;
		public labelHard:fgui.GRichTextField;
	}
}
declare namespace ui.dailyBoss.bar {
	class DailyBossDamageProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.dailyBoss.btn {
	class DailyBossAdTipBtn extends fgui.GButton{
		public lbAd:fgui.GTextField;
	}
	class DailyBossChallengeBtn extends fgui.GButton{
		public labelTitle:fgui.GTextField;
		public labelCount:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class DailyBossFdjBtn extends fgui.GButton{
	}
	class DailyBossHurtRankBtn extends fgui.GButton{
	}
	class DailyBossSeeRewardBtn extends fgui.GButton{
	}
	class DailyBossUseBtn extends fgui.GButton{
	}
}
declare namespace ui.dailyBoss.components {
	class DailyBossBalanceGridComp extends fgui.GComponent{
		public bgPercent:fgui.GImage;
		public labelPercent:fgui.GTextField;
		public itemBtn:ui.comm.item.ItemFrameBtn;
	}
	class DailyBossDamageComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelValue:fgui.GTextField;
		public haveP:fgui.GGroup;
		public labelNoDataTips:fgui.GTextField;
	}
	class DailyBossDifficultyComp extends fgui.GComponent{
		public imageBg:fgui.GLoader;
		public imageLogo:fgui.GLoader;
		public labelTitle:fgui.GTextField;
	}
	class DailyBossHotHeroComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public labelHeroTagDesc:fgui.GTextField;
		public heroList:fgui.GList;
	}
	class DailyBossMonsterInfoComp extends fgui.GComponent{
		public skillList:fgui.GList;
		public modelNode:ui.comm.node.ModelNode;
	}
	class DailyBossMyRankComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelRankNum:fgui.GTextField;
		public haveP:fgui.GGroup;
		public labelNoTips:fgui.GTextField;
		public noP:fgui.GGroup;
		public btnSeeReward:ui.dailyBoss.btn.DailyBossSeeRewardBtn;
	}
	class DailyBossOneRowComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelRankNumRange:fgui.GTextField;
		public top1:fgui.GImage;
		public itemList:ui.comm.item.ItemListComp;
	}
	class DailyBossProgressRewardComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public bar:ui.dailyBoss.bar.DailyBossDamageProgressBar;
		public itemComp:ui.comm.item.ItemFrameBtn;
	}
	class DailyBossSkillComp extends fgui.GButton{
		public bg:fgui.GImage;
		public imageSkill:fgui.GLoader;
	}
}
declare namespace ui.dailyBoss.item {
	class FormationRecHeroItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_type:fgui.GLoader;
		public img_gray:fgui.GImage;
		public img_bg_star:fgui.GImage;
		public list_star:fgui.GList;
		public starMc:fgui.GGroup;
		public lvLab:fgui.GTextField;
	}
	class FromationRecItem extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public valueLab:fgui.GTextField;
		public typeIcon:fgui.GLoader;
		public hurtMc:fgui.GGroup;
		public list_hero:fgui.GList;
		public btn_use:ui.dailyBoss.btn.DailyBossUseBtn;
		public rankBtn:ui.dailyBoss.btn.DailyBossHurtRankBtn;
		public G_avatar2:ui.comm.playerInfo.PlayerAvatar;
	}
}
declare namespace ui.dailyBoss.skill {
	class DailyBossSkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_bs:fgui.GImage;
		public img_skill:ui.dailyBoss.skill.DailyBossSkillItemSkillIconMask;
	}
	class DailyBossSkillItemSkillIconMask extends fgui.GComponent{
		public img_skill:fgui.GLoader;
	}
}
