declare namespace ui.weapon.btn {
	class WeaponLockBtn extends fgui.GButton{
		public iconLock:fgui.GImage;
		public iconUnlock:fgui.GImage;
	}
}
declare namespace ui.weapon.item {
	class WeaponAttrItem extends fgui.GComponent{
		public lbDes:fgui.GTextField;
		public lbValue:fgui.GTextField;
	}
	class WeaponConsumeAddItem extends fgui.GComponent{
		public btnAdd:fgui.GGroup;
		public base:ui.comm.item.WeaponBaseItem;
	}
	class WeaponConsumeItem extends fgui.GComponent{
		public bgNone:fgui.GImage;
		public bgSelect:fgui.GImage;
		public iconSelect:fgui.GImage;
		public base:ui.comm.item.WeaponBaseItem;
	}
	class WeaponSelectItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public lbTakeOff:fgui.GTextField;
		public takeOff:fgui.GGroup;
		public base:ui.comm.item.WeaponBagItem;
	}
	class WeaponTipsSkillItem extends fgui.GComponent{
		public lbDesForHero:fgui.GRichTextField;
		public lockImg:fgui.GImage;
		public unlockLab:fgui.GRichTextField;
	}
	class WeaponUpAttrItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbName:fgui.GTextField;
		public lbOld:fgui.GTextField;
		public lbNew:fgui.GTextField;
	}
	class WeaponUpAttrItem2 extends fgui.GComponent{
		public bgIcon:fgui.GImage;
		public lbAttrDes:fgui.GTextField;
		public lbOldAttr:fgui.GTextField;
		public lbNewAttr:fgui.GTextField;
		public iconLoader:fgui.GLoader;
	}
}
declare namespace ui.weapon.panel {
	class WeaponAttrPanel extends fgui.GComponent{
		public lbAttributeBonus:fgui.GTextField;
		public lbExclusiveBonus:fgui.GTextField;
		public panelHero:fgui.GGroup;
		public attr1:ui.weapon.item.WeaponAttrItem;
		public attr2:ui.weapon.item.WeaponAttrItem;
		public attr3:ui.weapon.item.WeaponAttrItem;
		public nodePoint:ui.comm.com.Node;
	}
}
declare namespace ui.weapon.view {
	class WeaponConsumeWin extends fgui.GComponent{
		public listConsume:fgui.GList;
		public lbTitle:fgui.GTextField;
		public btnSure:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class WeaponInfoPreviewWin extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbType:fgui.GTextField;
		public gCenter:fgui.GGroup;
		public attrPanel:ui.weapon.panel.WeaponAttrPanel;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public baseItem:ui.comm.item.WeaponBaseItem;
	}
	class WeaponInfoWin extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbType:fgui.GTextField;
		public lbWore:fgui.GTextField;
		public gCenter:fgui.GGroup;
		public attrPanel:ui.weapon.panel.WeaponAttrPanel;
		public btnLock:ui.weapon.btn.WeaponLockBtn;
		public btnChange:ui.comm.btn.BtnChangGui1;
		public btnWear:ui.comm.btn.BtnChangGui1;
		public btnGotoWear:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnUpStar:ui.comm.btn.BtnChangGui3;
		public baseItem:ui.comm.item.WeaponBaseItem;
	}
	class WeaponUpStarSuccWin extends fgui.GComponent{
		public title:fgui.GGroup;
		public iconLoader:fgui.GLoader;
		public listAttr:fgui.GList;
		public listStarOld:fgui.GList;
		public listStarNew:fgui.GList;
		public GStar:fgui.GGroup;
		public lbBackDes:fgui.GRichTextField;
		public lbSkillDes:fgui.GRichTextField;
		public skillMc:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public btnClose:ui.comm.btn.BtnChangGui1;
	}
	class WeaponUpStarTipWin extends fgui.GComponent{
		public lbTip1:fgui.GTextField;
		public lbTip2:fgui.GTextField;
		public lbTitle:fgui.GTextField;
		public listBack:fgui.GList;
		public btnSure:ui.comm.btn.BtnChangGui1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnCancel:ui.comm.btn.BtnChangGui3;
	}
	class WeaponUpStarWin extends fgui.GComponent{
		public lbTitle:fgui.GTextField;
		public lbConsumeCnt:fgui.GTextField;
		public listStar:fgui.GList;
		public iconLoader:fgui.GLoader;
		public listAdd:fgui.GList;
		public listAttr:fgui.GList;
		public listStarOld:fgui.GList;
		public listStarNew:fgui.GList;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public btnUp:ui.comm.btn.BtnChangGui1WithItem;
		public btnPrev:ui.comm.btn.BtnJianTou4;
		public btnNext:ui.comm.btn.BtnJianTou4;
	}
	class WeaponWearWin extends fgui.GComponent{
		public list:fgui.GList;
		public lbTitle:fgui.GTextField;
		public lbNone:fgui.GRichTextField;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
}
