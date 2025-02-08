declare namespace ui.floatingText {
	class FloatingTextView extends fgui.GComponent{
		public commonItem:ui.comm.com.Node;
		public fightItem:ui.comm.com.Node;
		public itemItem:ui.comm.com.Node;
		public areaItem:ui.comm.com.Node;
		public attrItem:ui.comm.com.Node;
	}
}
declare namespace ui.floatingText.item {
	class AreaTextItem extends fgui.GComponent{
		public area_bg1:fgui.GImage;
		public area_bg2:fgui.GImage;
		public T_area:fgui.GTextField;
	}
	class AttrTextItem extends fgui.GComponent{
		public T_attrCount:fgui.GTextField;
	}
	class FightTextItem extends fgui.GComponent{
		public fightMc:fgui.GGroup;
		public T_fight:fgui.GTextField;
		public T_change:fgui.GTextField;
		public T_change2:fgui.GTextField;
		public modelNodeBottom:ui.comm.node.ModelNode;
		public modelNodeTop:ui.comm.node.ModelNode;
	}
	class GotTextItem extends fgui.GComponent{
		public T_item:fgui.GTextField;
		public T_num:fgui.GTextField;
		public img_item:fgui.GLoader;
	}
	class TipsTextItem extends fgui.GComponent{
		public T_tips:fgui.GTextField;
	}
}
