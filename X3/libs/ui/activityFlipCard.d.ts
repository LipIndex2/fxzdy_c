declare namespace ui.activityFlipCard {
	class ActivityFlipCardScoreRewardSubView extends fgui.GComponent{
		public bg:fgui.GImage;
		public T_restTimeTitle:fgui.GTextField;
		public T_restTime:fgui.GTextField;
		public T_title1:fgui.GTextField;
		public T_title2:fgui.GTextField;
		public G_header:fgui.GGroup;
		public lebalTurnCount:fgui.GTextField;
		public T_preview:fgui.GTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
		public itemList2:ui.comm.item.ItemListComp;
		public itemList:ui.comm.item.ItemListComp;
		public btnGain:ui.comm.btn.BtnChangGui1;
		public scoreComp:ui.activityFlipCard.component.ActivityFlipCardScoreComp;
	}
	class ActivityFlipCardSubView extends fgui.GComponent{
		public bg:fgui.GImage;
		public img_model:fgui.GLoader;
		public T_restTimeTitle:fgui.GTextField;
		public T_restTime:fgui.GTextField;
		public T_title1:fgui.GTextField;
		public T_title2:fgui.GTextField;
		public G_header:fgui.GGroup;
		public T_turnText:fgui.GTextField;
		public T_bigRewardTitle:fgui.GTextField;
		public G_body:fgui.GGroup;
		public itemList2:fgui.GList;
		public itemList3:fgui.GList;
		public itemList4:fgui.GList;
		public itemList5:fgui.GList;
		public itemList6:fgui.GList;
		public G_body2:fgui.GGroup;
		public T_awardDesc:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
		public btnBack:ui.comm.back.BtnBack;
		public banClick:ui.comm.btn.EmptyBtn;
		public btnChooseAdd:ui.activityFlipCard.btn.ActivityFlipCardNoChooseBigBtn;
		public bigReward:ui.comm.item.ItemFrameBtn;
		public btnChooseBigReward:ui.comm.btn.EmptyBtn;
		public btnOneKeyFlip:ui.comm.btn.BtnChangGui1;
		public skipItem:ui.activityFlipCard.item.DrawSkipAnimItem;
	}
}
declare namespace ui.activityFlipCard.bar {
	class ActivityFlipCardScoreBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
declare namespace ui.activityFlipCard.btn {
	class ActivityFlipCardItemBtn extends fgui.GButton{
		public imgCardShadow:fgui.GImage;
		public imgCardBack:fgui.GImage;
		public G_hide:fgui.GGroup;
		public imageItem:fgui.GLoader;
		public T_count:fgui.GTextField;
		public G_r1:fgui.GGroup;
		public imageBigReward:fgui.GLoader;
		public G_r2:fgui.GGroup;
		public modelNodeSweep:ui.comm.node.ModelNode;
		public redDot:ui.comm.com.RedDot;
	}
	class ActivityFlipCardNoChooseBigBtn extends fgui.GButton{
		public btn_addHero1:fgui.GImage;
	}
}
declare namespace ui.activityFlipCard.component {
	class ActivityFlipCardScoreComp extends fgui.GComponent{
		public bgScore:fgui.GImage;
		public T_score:fgui.GTextField;
		public T_scoreTitle:fgui.GTextField;
		public bar:ui.activityFlipCard.bar.ActivityFlipCardScoreBar;
	}
}
declare namespace ui.activityFlipCard.item {
	class ChooseAwardItem extends fgui.GComponent{
		public T_count:fgui.GTextField;
		public T_Tips:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class DrawSkipAnimItem extends fgui.GComponent{
	}
}
declare namespace ui.activityFlipCard.win {
	class ActivityFlipCardChooseBigRewardWin extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public T_chooseTips:fgui.GTextField;
		public itemList:fgui.GList;
		public T_round:fgui.GRichTextField;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public bigReward:ui.comm.item.ItemFrameBtn;
		public btnChooseBig:ui.comm.btn.EmptyBtn;
		public btnClose:ui.comm.btn.GoToBackButton_1;
	}
}
