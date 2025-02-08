declare namespace ui.magicCube {
	class MagicCubeBtnItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_tips:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class MagicCubeMainWin extends fgui.GComponent{
		public list_tab:fgui.GList;
		public list_attr1:fgui.GList;
		public list_attr2:fgui.GList;
		public T_lock1:fgui.GTextField;
		public T_lock2:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public redDot1:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
		public redDot3:ui.comm.com.RedDot;
		public modelNodeLeft:ui.comm.node.ModelNode;
		public modelNodeRight:ui.comm.node.ModelNode;
		public btn_up:ui.magicCube.btn.MagicCubeUpBtn;
		public btn_sev:ui.magicCube.btn.storageBtn;
		public btn_isLock:ui.magicCube.item.lockAttrItem;
		public MagicCubeItem1:ui.magicCube.item.MagicCubeItem;
		public MagicCubeItem2:ui.magicCube.item.MagicCubeItem;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public headerItem3:ui.comm.header.HeaderItem;
		public btn_unlock:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.magicCube.btn {
	class MagicCubeUpBtn extends fgui.GButton{
		public list_cost:fgui.GList;
		public img_jiantou1:fgui.GLoader;
		public img_jiantou2:fgui.GLoader;
		public img_zuanshi1:fgui.GLoader;
		public img_zuanshi2:fgui.GLoader;
	}
	class selTabBtn extends fgui.GButton{
	}
	class storageBtn extends fgui.GButton{
	}
}
declare namespace ui.magicCube.item {
	class CountItem extends fgui.GComponent{
		public icon_item:fgui.GLoader;
		public T_count:fgui.GTextField;
	}
	class lockAttrItem extends fgui.GButton{
		public Img_gou:fgui.GImage;
	}
	class MagicCubeAttrItem extends fgui.GComponent{
		public T_attr:fgui.GTextField;
		public T_num:fgui.GTextField;
	}
	class MagicCubeItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_suo:fgui.GImage;
		public T_level:fgui.GTextField;
	}
}
