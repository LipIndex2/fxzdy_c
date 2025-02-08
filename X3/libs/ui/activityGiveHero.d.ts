declare namespace ui.activityGiveHero {
	class GiveHeroAwardWin extends fgui.GComponent{
		public list_hero:fgui.GList;
	}
	class GiveHeroBottomPanel extends fgui.GComponent{
		public list_award:fgui.GList;
		public T_day:fgui.GTextField;
		public list_hero:fgui.GList;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public redDot:ui.comm.com.RedDot;
	}
	class GiveHeroView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public panelBottom:ui.activityGiveHero.GiveHeroBottomPanel;
		public panelTop:ui.activityGiveHero.comp.GiveHeroTopPanel;
	}
}
declare namespace ui.activityGiveHero.btn {
	class btn1 extends fgui.GButton{
	}
}
declare namespace ui.activityGiveHero.comp {
	class GiveHeroTopPanel extends fgui.GComponent{
		public T_time:fgui.GTextField;
		public head:fgui.GGroup;
		public btn_award:ui.activityGiveHero.btn.btn1;
		public btnRule:ui.comm.btn.BaseBtn;
		public headItem1:ui.comm.header.HeadItemCompV2;
		public headItem2:ui.comm.header.HeadItemCompV2;
	}
}
declare namespace ui.activityGiveHero.item {
	class AwardItem extends fgui.GComponent{
		public T_hero:fgui.GTextField;
		public list_hero:fgui.GList;
	}
	class GiveHeroItem1 extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public T_day:fgui.GTextField;
		public img_award:fgui.GLoader;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class GiveHeroItem2 extends fgui.GComponent{
		public T_day:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
		public modelNode:ui.comm.node.ModelNode;
		public heroItem:ui.comm.item.HeroItem;
	}
}
