declare namespace ui.illustrations.btn {
	class IllustrationsPetBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class IllustrationsScoreBtn extends fgui.GButton{
		public bg:fgui.GImage;
		public iconScore:fgui.GImage;
		public lbScore:fgui.GTextField;
		public pScore:fgui.GGroup;
		public lbFull:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class IllustrationsWeaponBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.illustrations.component {
	class empty extends fgui.GComponent{
	}
	class IllustrationsProgress extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class IllustrationsScoreIcon extends fgui.GComponent{
		public iconScore:fgui.GImage;
	}
}
declare namespace ui.illustrations.item {
	class IllustrationsHeroItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconSihouette:fgui.GImage;
		public listStar:fgui.GList;
		public lbName:fgui.GTextField;
		public btnBg:ui.comm.btn.EmptyBtn;
		public modelNode:ui.comm.node.ModelNode;
		public aniNode:ui.comm.node.ModelNode;
		public btnScore:ui.illustrations.btn.IllustrationsScoreBtn;
	}
	class IllustrationsIconItem extends fgui.GButton{
		public bg:fgui.GLoader;
		public itemIcon:fgui.GLoader;
		public itemCount:fgui.GTextField;
	}
	class IllustrationsPetItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public lbName:fgui.GTextField;
		public btnBg:ui.comm.btn.EmptyBtn;
		public btnScore:ui.illustrations.btn.IllustrationsScoreBtn;
		public modelNode:ui.comm.node.ModelNode;
		public aniNode:ui.comm.node.ModelNode;
	}
	class IllustrationsRewardItem extends fgui.GComponent{
		public iconScore:fgui.GImage;
		public listIcon:fgui.GList;
		public lbScore:fgui.GTextField;
		public bgMask:fgui.GImage;
	}
	class IllustrationsWeaponItem extends fgui.GComponent{
		public bgLoader:fgui.GLoader;
		public iconSihouette:fgui.GImage;
		public iconLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public lbName:fgui.GTextField;
		public btnBg:ui.comm.btn.EmptyBtn;
		public aniNode:ui.comm.node.ModelNode;
		public btnScore:ui.illustrations.btn.IllustrationsScoreBtn;
	}
}
declare namespace ui.illustrations.view {
	class IllustrationsMainWin extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public listCamp:fgui.GList;
		public pBottom:fgui.GGroup;
		public iconScore:fgui.GImage;
		public box:fgui.GImage;
		public listHero:fgui.GList;
		public listWeapon:fgui.GList;
		public listPet:fgui.GList;
		public lbRewardTip:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public btnDetail:ui.comm.btn.BtnGth3;
		public btnReward:ui.comm.btn.EmptyBtn;
		public btnMask:ui.comm.btn.EmptyBtn;
		public aniNode:ui.comm.node.ModelNode;
		public progress:ui.illustrations.component.IllustrationsProgress;
		public btnWeapon:ui.illustrations.btn.IllustrationsWeaponBtn;
		public btnPet:ui.illustrations.btn.IllustrationsPetBtn;
		public jihuoBtn:ui.comm.btn.BtnConfirm;
		public footer:ui.comm.back.BackFooter;
	}
	class IllustrationsRewardWin extends fgui.GComponent{
		public bgProgress:fgui.GImage;
		public progressScore:fgui.GImage;
		public listReward:fgui.GList;
		public lbScore:fgui.GTextField;
		public pCurScore:fgui.GGroup;
		public footer:ui.comm.back.BackFooter;
	}
}
