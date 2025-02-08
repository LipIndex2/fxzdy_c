declare namespace ui.leagueTech {
	class leagueTechView extends fgui.GComponent{
		public tips:fgui.GTextField;
		public skillName:fgui.GTextField;
		public jobName:fgui.GTextField;
		public totalLv:fgui.GTextField;
		public tabList:fgui.GList;
		public attrIcon:fgui.GLoader;
		public attrName:fgui.GTextField;
		public currAttrValue:fgui.GTextField;
		public curAttrCom:fgui.GGroup;
		public nextAttr:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
		public hole0:ui.leagueTech.btn.holeCell;
		public hole1:ui.leagueTech.btn.holeCell;
		public hole2:ui.leagueTech.btn.holeCell;
		public hole3:ui.leagueTech.btn.holeCell;
		public hole4:ui.leagueTech.btn.holeCell;
		public hole5:ui.leagueTech.btn.holeCell;
		public hole6:ui.leagueTech.btn.holeCell;
		public hole7:ui.leagueTech.btn.holeCell;
		public jobIcon:ui.leagueTech.com.jobCom;
		public resourceBtn:ui.comm.header.resoureceBtn;
		public upBtn:ui.comm.btn.BtnChangGui1WithItem;
	}
}
declare namespace ui.leagueTech.btn {
	class holeCell extends fgui.GButton{
		public holeIcon:fgui.GLoader;
		public selectImg:fgui.GImage;
		public holeLv:fgui.GTextField;
		public lock:fgui.GImage;
	}
	class pageTab extends fgui.GButton{
	}
}
declare namespace ui.leagueTech.com {
	class jobCom extends fgui.GComponent{
	}
}
