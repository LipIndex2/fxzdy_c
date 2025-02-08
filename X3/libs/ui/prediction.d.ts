declare namespace ui.prediction {
	class PredictionAwardItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class PredictionMainView extends fgui.GComponent{
		public list_award:fgui.GList;
	}
}
