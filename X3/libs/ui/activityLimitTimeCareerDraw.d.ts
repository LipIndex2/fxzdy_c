declare namespace ui.activityLimitTimeCareerDraw {
	class LimitTimeCareerDrawMainPage extends fgui.GComponent{
		public T_desc:fgui.GTextField;
		public img_career:fgui.GLoader;
		public img_sel:fgui.GLoader;
		public btn_jia:fgui.GLoader;
		public item0:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item1:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item2:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item3:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item4:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item5:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public item6:ui.activityLimitTimeCareerDraw.item.DrawBallItem;
		public modelNode:ui.comm.node.ModelNode;
		public btn_shuaxin:ui.comm.btn.BaseBtn0.8Scale;
	}
	class LimitTimeCareerDrawMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public T_desc:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public T_count:fgui.GTextField;
		public T_quality:fgui.GTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public page:ui.activityLimitTimeCareerDraw.LimitTimeCareerDrawMainPage;
		public btnBack:ui.comm.back.BtnBack;
		public headerItem1:ui.comm.header.HeaderItem;
		public redDot1:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
		public skipItem:ui.activityLimitTimeCareerDraw.item.DrawSkipAnimItem;
		public btn_get10:ui.comm.btn.BtnChangGui1WithItem;
		public btn_get:ui.comm.btn.BtnChangGui1WithItem;
	}
	class LimitTimeCareerDrawWishWin extends fgui.GComponent{
		public T_desc:fgui.GTextField;
		public T_title:fgui.GTextField;
		public list_career:fgui.GList;
		public btn_get:ui.comm.btn.BtnChangGui1;
		public selItem:ui.activityLimitTimeCareerDraw.item.DrawWishItem;
	}
}
declare namespace ui.activityLimitTimeCareerDraw.item {
	class DrawBallItem extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public modelNode:ui.comm.node.ModelNode;
		public headItem:ui.activityLimitTimeCareerDraw.item.DrawMaskItem;
	}
	class DrawMaskItem extends fgui.GComponent{
		public img_head:fgui.GLoader;
	}
	class DrawSkipAnimItem extends fgui.GComponent{
	}
	class DrawWishItem extends fgui.GButton{
		public img_career:fgui.GLoader;
		public T_name:fgui.GTextField;
	}
}
