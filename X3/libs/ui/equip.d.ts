declare namespace ui.equip.btn {
	class selBtn extends fgui.GButton{
		public img_gou:fgui.GImage;
	}
	class wearBtn extends fgui.GButton{
	}
}
declare namespace ui.equip.item {
	class EquipAttrItem extends fgui.GComponent{
		public T_attr0:fgui.GTextField;
		public T_num0:fgui.GTextField;
		public T_attr1:fgui.GTextField;
		public T_num2:fgui.GTextField;
	}
	class EquipAttrItem1 extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbValue:fgui.GTextField;
	}
	class EquipAttrItem2 extends fgui.GComponent{
		public lbName1:fgui.GTextField;
		public lbName2:fgui.GTextField;
		public lbValue1:fgui.GTextField;
		public lbValue2:fgui.GTextField;
	}
	class EquipAttrPage extends fgui.GComponent{
		public list:fgui.GList;
		public T_skill:fgui.GTextField;
		public gp_skill:fgui.GGroup;
		public btn_Tips:ui.comm.btn.BaseBtn;
		public item:ui.equip.item.EquipAttrItem;
		public skillPage:ui.equip.page.EquipSkillPage;
	}
	class EquipRecycleSelItem extends fgui.GComponent{
		public T_quality:fgui.GTextField;
		public btn_sel:ui.equip.btn.selBtn;
	}
	class EquipSuitAttrTextItem extends fgui.GComponent{
		public T_text:fgui.GTextField;
	}
	class EquipWearItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public item:ui.comm.item.EquipItem;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.equip.page {
	class EquipBagDetailPage extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_quality:fgui.GTextField;
		public T_score:fgui.GTextField;
		public T_get:fgui.GTextField;
		public item:ui.comm.item.EquipItem;
		public attrPage:ui.equip.item.EquipAttrPage;
	}
	class EquipDetailPage extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_quality:fgui.GTextField;
		public T_score:fgui.GTextField;
		public list_equip:fgui.GList;
		public T_getTips:fgui.GTextField;
		public gp_main:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public item:ui.comm.item.EquipItem;
		public attrPage:ui.equip.item.EquipAttrPage;
		public btn_get:ui.equip.btn.wearBtn;
	}
	class EquipSkillPage extends fgui.GComponent{
		public T_suitName:fgui.GTextField;
		public list_attr:fgui.GList;
	}
}
declare namespace ui.equip.view {
	class EquipAttrWin extends fgui.GComponent{
		public listAttrMain:fgui.GList;
		public listAttrOther:fgui.GList;
		public gAll:fgui.GGroup;
	}
	class EquipMainView extends fgui.GComponent{
		public top_bg1:fgui.GImage;
		public T_fight:fgui.GTextField;
		public leftEquipList:fgui.GGroup;
		public rightEquipList:fgui.GGroup;
		public bottomEquipList:fgui.GGroup;
		public gItem:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnRule:ui.comm.btn.BtnGth3;
		public footer:ui.comm.back.BackFooter;
		public btn_wear:ui.equip.btn.wearBtn;
		public item1:ui.equip.item.EquipWearItem;
		public item2:ui.equip.item.EquipWearItem;
		public item4:ui.equip.item.EquipWearItem;
		public item3:ui.equip.item.EquipWearItem;
		public item5:ui.equip.item.EquipWearItem;
		public item6:ui.equip.item.EquipWearItem;
		public item7:ui.equip.item.EquipWearItem;
		public item8:ui.equip.item.EquipWearItem;
		public item9:ui.equip.item.EquipWearItem;
		public btn_recycle:ui.comm.btn.BtnChangGui3;
	}
	class EquipRecycleWin extends fgui.GComponent{
		public list_equip:fgui.GList;
		public list_item:fgui.GList;
		public list_sel:fgui.GList;
		public btn_recycle:ui.comm.btn.BtnChangGui1;
	}
}
