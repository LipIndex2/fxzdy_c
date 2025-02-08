declare namespace ui.commBattle.battle {
	class BattleResultWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTips:fgui.GTextField;
		public panel:ui.comm.item.JumpItem;
		public modelNode:ui.comm.node.ModelNode;
	}
	class CommonBattleResultFailView extends fgui.GComponent{
		public labelTips:fgui.GTextField;
		public lbLeagueTip:fgui.GTextField;
		public panel:ui.commBattle.battle.components.CommonFailPanel;
		public modelNode:ui.comm.node.ModelNode;
	}
	class CommonBattleResultWinView extends fgui.GComponent{
		public labelCloseTips:fgui.GTextField;
		public labelAutoNext:fgui.GTextField;
		public lbTeamTips:fgui.GTextField;
		public panel:ui.commBattle.battle.components.CommonWinPanel;
		public btnNextLevel:ui.commBattle.battle.btn.BtnContinueBattle;
		public modelNode:ui.comm.node.ModelNode;
		public btnData:ui.comm.btn.BtnData;
	}
	class CommonChallengeView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public bgTitle:fgui.GLoader;
		public labelLevelTitle:fgui.GTextField;
		public levelTitle:fgui.GGroup;
		public bgEnemySchema:fgui.GLoader;
		public spine1:fgui.GTextField;
		public spine3:fgui.GTextField;
		public spine5:fgui.GTextField;
		public spine2:fgui.GTextField;
		public spine4:fgui.GTextField;
		public spine6:fgui.GTextField;
		public bgPower:fgui.GLoader;
		public labelPower:fgui.GTextField;
		public btn:fgui.GGroup;
		public itemList:fgui.GList;
		public all:fgui.GGroup;
		public btnAutoChallenge:ui.comm.btn.BtnGreen2;
		public btnChallenge:ui.comm.btn.BtnConfirm;
		public btnSetSchema:ui.comm.btn.BtnBlue;
	}
}
declare namespace ui.commBattle.battle.btn {
	class BtnBattleJump extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class BtnContinueBattle extends fgui.GButton{
	}
}
declare namespace ui.commBattle.battle.components {
	class CommonFailPanel extends fgui.GComponent{
		public bg:fgui.GImage;
		public bgRewardItems:fgui.GImage;
		public listJump:fgui.GList;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public btnData:ui.comm.btn.BtnData;
	}
	class CommonWinPanel extends fgui.GComponent{
		public bg:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public bgRewardItems:fgui.GImage;
		public itemList:fgui.GList;
		public btnData:ui.comm.btn.BtnData;
	}
}
declare namespace ui.commBattle.battleComp {
	class BattleBlackComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleBuffAreaComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleChargeEllipseComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleChargeJianTou extends fgui.GComponent{
	}
	class BattleChargeRectComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleDebuffBuffAreaComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleDropIcon extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
	}
	class BattleDropNameComp extends fgui.GComponent{
		public nameLab:fgui.GTextField;
	}
	class BattleHeadMaskItem extends fgui.GComponent{
		public img_head:fgui.GLoader;
	}
	class BattleShadowBigComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleShadowSmallComp extends fgui.GComponent{
		public img:fgui.GImage;
	}
	class BattleStartView extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
	}
	class BattleTalkComp extends fgui.GComponent{
		public label:fgui.GTextField;
	}
}
declare namespace ui.commBattle.battleView {
	class CommonBattleBossComming extends fgui.GComponent{
		public bg:fgui.GImage;
		public boss_bg1:fgui.GImage;
		public boss_bg2:fgui.GImage;
		public text_boss:fgui.GTextField;
	}
	class CommonBattleView extends fgui.GComponent{
		public labelRestTime:fgui.GTextField;
		public labelLevelTitle:fgui.GTextField;
		public imageVs:fgui.GImage;
		public pvpHp:fgui.GGroup;
		public lbMyName:fgui.GTextField;
		public lbEnemyName:fgui.GTextField;
		public gName:fgui.GGroup;
		public bossP:fgui.GGroup;
		public headP:fgui.GGroup;
		public heroList:fgui.GList;
		public footP:fgui.GGroup;
		public all:fgui.GGroup;
		public damageComp:ui.commBattle.battleView.components.CommonBattleTotalDamageComp;
		public compLevelNameTips:ui.commBattle.battleView.components.CommonBattleLevelNameTipsComp;
		public progressBar2:ui.commBattle.battleView.progressBar.CommonBattleRightProgressBar;
		public bossHpComp:ui.commBattle.battleView.hp.BattleForDailyBossHpComp;
		public manyHpbar:ui.commBattle.battleView.hp.BattleCommonManyHpComp;
		public btnAutoFight:ui.commBattle.battleView.btn.CommonBattleAutoFightButton;
		public tipsAutoBattle:ui.commBattle.battleView.components.CommonBattleAutoTipsComp;
		public progressBar1:ui.commBattle.battleView.progressBar.CommonBattleLeftProgressBar;
		public btnSkipFight:ui.commBattle.battleView.btn.CommonBattleSkipFightButton;
		public btnBack:ui.comm.back.BtnBack75;
		public captainSkillComp:ui.comm.captainSkill.CaptionSkillCommonBattleComp;
	}
	class CommonSkipBattleView extends fgui.GComponent{
		public titleLab:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
	}
}
declare namespace ui.commBattle.battleView.bar {
	class BattleBossHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class BattleBossHpBar2 extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
	}
	class BattleBossSmallPercentBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.commBattle.battleView.btn {
	class CommonBattleAutoFightButton extends fgui.GButton{
		public imageBtnAuto:fgui.GImage;
		public fg:fgui.GImage;
		public labelBtnAuto:fgui.GTextField;
	}
	class CommonBattleSkipFightButton extends fgui.GButton{
		public imageBtnAuto:fgui.GImage;
		public bgMask:fgui.GImage;
		public labelBtnAuto:fgui.GTextField;
	}
}
declare namespace ui.commBattle.battleView.components {
	class CommonBattleAutoTipsComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageAutoBattle:fgui.GLoader;
		public labelAutoBattle:fgui.GTextField;
	}
	class CommonBattleLevelNameTipsComp extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class CommonBattleTotalDamageComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelDamage:fgui.GTextField;
		public bgTitle:fgui.GImage;
		public imageDamageTitle:fgui.GLoader;
	}
	class CommonBattleUnitComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public bgMask:fgui.GImage;
		public title:fgui.GTextField;
		public heroComp:ui.commBattle.battleView.components.CommonUpHeroMaskComp;
	}
	class CommonUpHeroMaskComp extends fgui.GComponent{
		public imageHero:fgui.GLoader;
	}
}
declare namespace ui.commBattle.battleView.hp {
	class BattleCommonManyHpComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageBossBg:fgui.GLoader;
		public labelHpRowCount:fgui.GTextField;
		public nextBar:ui.commBattle.battleView.bar.BattleBossHpBar2;
		public currentBar:ui.commBattle.battleView.bar.BattleBossHpBar2;
		public imageBossAvatar:ui.commBattle.battleComp.BattleHeadMaskItem;
	}
	class BattleForDailyBossHpComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelPercent:fgui.GTextField;
		public imageBossBg:fgui.GLoader;
		public imageBossAvatar:fgui.GLoader;
		public labelHpRowCount:fgui.GTextField;
		public percentBar:ui.commBattle.battleView.bar.BattleBossSmallPercentBar;
		public hpBar11:ui.commBattle.battleView.bar.BattleBossHpBar;
		public hpBar2:ui.commBattle.battleView.bar.BattleBossHpBar;
		public hpBar1:ui.commBattle.battleView.bar.BattleBossHpBar;
		public dialogComp:ui.commBattle.battleView.hp.BattleHpPercentDialogComp;
	}
	class BattleHpPercentDialogComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
	}
}
declare namespace ui.commBattle.battleView.progressBar {
	class CommonBattleLeftProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class CommonBattleRightProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
