declare namespace ui.guide.com {
	class GuideTalkerCom extends fgui.GComponent{
		public talkerLoader:fgui.GLoader;
		public talkerModel:ui.comm.node.ModelNode;
	}
	class PassBtn extends fgui.GButton{
	}
}
declare namespace ui.guide.item {
	class GuideDialogItem extends fgui.GComponent{
		public T_text:fgui.GRichTextField;
		public npcName:fgui.GTextField;
		public npcHead:ui.guide.com.GuideTalkerCom;
	}
	class GuideMaskItem extends fgui.GComponent{
		public img_mask:fgui.GLoader;
		public btn_mask:fgui.GGraph;
	}
	class GuideSmallDialogItem extends fgui.GComponent{
		public T_text:fgui.GRichTextField;
		public npcHead:ui.guide.com.GuideTalkerCom;
	}
	class GuideTouchRangeItem extends fgui.GComponent{
		public animBox:fgui.GImage;
		public boxGp:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
	}
}
declare namespace ui.guide.view {
	class GuideDialogSmallView extends fgui.GComponent{
		public nodeRange:ui.comm.com.Node;
		public dialog:ui.guide.item.GuideSmallDialogItem;
	}
	class GuideDialogView extends fgui.GComponent{
		public dialog:ui.guide.item.GuideDialogItem;
	}
	class GuideEmptyView extends fgui.GComponent{
	}
	class GuideMainView extends fgui.GComponent{
		public maskItem:ui.guide.item.GuideMaskItem;
		public touchNode:ui.guide.item.GuideTouchRangeItem;
		public passBtn:ui.guide.com.PassBtn;
	}
	class GuideTeachView extends fgui.GComponent{
		public img_Icon:fgui.GLoader;
		public T_text:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
	}
	class GuideWeakTouchView extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
	}
}
