declare namespace ui.miniMap {
	class MiniMapBossAwardWin extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public list_award:fgui.GList;
		public selItem:ui.miniMap.item.MiniMapSelItem;
	}
	class MiniMapCollectionWin extends fgui.GComponent{
		public list_section:fgui.GList;
		public topItem:ui.miniMap.item.MiniMapCollectionItem;
		public item_sel:ui.miniMap.item.MiniMapSelItem;
	}
	class MiniMapMainView extends fgui.GComponent{
		public mapBg:fgui.GLoader;
		public T_name:fgui.GTextField;
		public topItem:ui.miniMap.item.MiniMapCollectionItem;
		public sliderItem:ui.miniMap.slider.MiniSliderItem1;
		public gp_map:ui.miniMap.item.MIniMapItem;
		public btn_boss:ui.miniMap.btn.BtnBattleData;
		public tipsItem:ui.miniMap.item.ResourceTipsItem;
		public btn_add:ui.comm.btn.BaseBtn;
		public btn_subtract:ui.comm.btn.BaseBtn;
		public btn_back:ui.comm.back.BtnBack;
	}
}
declare namespace ui.miniMap.bar {
	class ItemBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class ItemBar2 extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class UpperLimitValueBar extends fgui.GComponent{
		public T_add:fgui.GTextField;
		public img_item:fgui.GLoader;
		public bar:ui.miniMap.bar.ItemBar;
	}
	class UpperLimitValueBar2 extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public img_item:fgui.GLoader;
		public bar1:ui.miniMap.bar.ItemBar2;
	}
}
declare namespace ui.miniMap.btn {
	class BtnBattleData extends fgui.GButton{
		public imageBattleData:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.miniMap.item {
	class BossAwardItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public list_award:fgui.GList;
		public img_get:fgui.GLoader;
		public img_suo:fgui.GLoader;
	}
	class CountItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public title:fgui.GTextField;
	}
	class CountItem2 extends fgui.GComponent{
		public img_red:fgui.GImage;
		public T_Count:fgui.GTextField;
		public T_num:fgui.GTextField;
		public img_icon:ui.comm.btn.BaseBtn;
	}
	class MiniMapCollectionItem extends fgui.GComponent{
		public img_lift:fgui.GLoader;
		public list_count2:fgui.GList;
		public btn_tips:ui.comm.btn.BtnData;
		public btn_tips2:ui.comm.btn.BtnData;
		public btn_tips3:ui.comm.btn.BtnData;
	}
	class MiniMapCollectionListItem extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public list_count2:fgui.GList;
		public list_count1:fgui.GList;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
	class MIniMapItem extends fgui.GComponent{
		public mapItem:ui.comm.miniMap.MiniMapShowBuildingItem;
	}
	class MiniMapSelItem extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public list_star:fgui.GList;
		public btn_open:ui.comm.btn.BaseBtn;
	}
	class NameTextItem extends fgui.GButton{
		public T_name:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class ResourceTipsItem extends fgui.GComponent{
		public T_tips:fgui.GTextField;
	}
}
declare namespace ui.miniMap.slider {
	class MiniSliderItem1 extends fgui.GSlider{
		public bar_v:fgui.GImage;
		public grip:ui.miniMap.slider.MiniSliderItem1_grip;
	}
	class MiniSliderItem1_grip extends fgui.GButton{
	}
}
