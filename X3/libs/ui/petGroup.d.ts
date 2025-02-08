declare namespace ui.petGroup.com {
	class GroupDetailBtn extends fgui.GButton{
	}
	class PetGroupAddAttrListItem extends fgui.GComponent{
		public desc:fgui.GTextField;
	}
	class PetGroupShowNode extends fgui.GComponent{
		public petName:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public petBtn:ui.comm.btn.EmptyBtn;
	}
	class PetGroupShowNode2 extends fgui.GComponent{
		public petName:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public petBtn:ui.comm.btn.EmptyBtn;
	}
}
declare namespace ui.petGroup.view.groupAddInfo {
	class PetGroupAddDescLIstItem extends fgui.GComponent{
		public lblLVName:fgui.GTextField;
		public lblProgress:fgui.GTextField;
		public lbladdDesc:fgui.GTextField;
		public list:fgui.GList;
	}
	class PetGroupAddInfoView extends fgui.GComponent{
		public lblGroupName:fgui.GTextField;
		public list:fgui.GList;
	}
}
declare namespace ui.petGroup.view.groupUpInfo {
	class PetGroupUpAddItem extends fgui.GComponent{
		public desc:fgui.GTextField;
	}
	class PetGroupUpInfoView extends fgui.GComponent{
		public lblGroupName:fgui.GTextField;
		public petList:fgui.GList;
		public lblAddDesc:fgui.GTextField;
		public addList:fgui.GList;
		public BtnClose:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.petGroup.view.mainView {
	class PetGroupListItem extends fgui.GComponent{
		public lblActiveDesc:fgui.GRichTextField;
		public lblTitle:fgui.GTextField;
		public petList:fgui.GList;
		public attrList:fgui.GList;
		public detailBtn:ui.petGroup.com.GroupDetailBtn;
		public btnAct:ui.comm1.btn.BtnStyle1;
	}
	class PetGroupView extends fgui.GComponent{
		public GroupList:fgui.GList;
		public helpBtn:ui.comm.btn.BtnGth3;
	}
}
