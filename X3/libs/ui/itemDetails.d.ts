declare namespace ui.itemDetails {
	class BoxTipsRewardView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public numBg:fgui.GLoader;
		public nameLab:fgui.GTextField;
		public numLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public desNameLab:fgui.GTextField;
		public rewardItemList:fgui.GList;
		public otherBox:fgui.GGroup;
		public mc:fgui.GGroup;
	}
	class EquipTipsView extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_quality:fgui.GTextField;
		public T_score:fgui.GTextField;
		public gp_main:fgui.GGroup;
		public attrPage:ui.itemDetails.item.EquipAttrPage;
		public item:ui.comm.item.EquipItem;
	}
	class HeroItemTipsFdjBtn extends fgui.GButton{
	}
	class HeroItemTipsView extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public raceIcon:fgui.GLoader;
		public raceNameLab:fgui.GTextField;
		public jobIcon:fgui.GLoader;
		public jobNameLab:fgui.GTextField;
		public list_skill:fgui.GList;
		public goBtn:ui.itemDetails.HeroItemTipsFdjBtn;
		public head:ui.comm.hero.HeroDetailsAvatar;
	}
	class ItemFrameItem extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class ItemFrameTipsView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public numBg:fgui.GLoader;
		public nameLab:fgui.GTextField;
		public numLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public itemList:fgui.GList;
		public otherBox:fgui.GGroup;
	}
	class ItemGotoShopBtn extends fgui.GButton{
	}
	class ItemNotEnoughView extends fgui.GComponent{
		public pAll:ui.itemDetails.panel.ItemNotEnoughContainer;
	}
	class ItemNotEnoughViewItem extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public itemIcon1:fgui.GLoader;
		public numLab1:fgui.GTextField;
		public item1:fgui.GGroup;
		public itemIcon2:fgui.GLoader;
		public numLab2:fgui.GTextField;
		public item2:fgui.GGroup;
		public otherBox:fgui.GGroup;
		public goBtn:ui.itemDetails.ItemTipsItemButton;
	}
	class ItemTipsItemButton extends fgui.GButton{
	}
	class ItemTipsView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public numBg:fgui.GLoader;
		public nameLab:fgui.GTextField;
		public numLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public itemList:fgui.GList;
		public otherBox:fgui.GGroup;
		public img_fdj:ui.itemDetails.HeroItemTipsFdjBtn;
	}
	class ItemTipsViewItem extends fgui.GComponent{
		public nameLab:fgui.GTextField;
		public desLab:fgui.GTextField;
		public itemIcon1:fgui.GLoader;
		public numLab1:fgui.GTextField;
		public item1:fgui.GGroup;
		public itemIcon2:fgui.GLoader;
		public numLab2:fgui.GTextField;
		public item2:fgui.GGroup;
		public otherBox:fgui.GGroup;
		public goBtn:ui.comm1.btn.ItemTipsItemButton;
	}
	class PetTipsView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_name:fgui.GTextField;
		public img_quality:fgui.GLoader;
		public skillItem:ui.comm.hero.components.CommonPetSkillItem;
		public tipsItem:ui.comm1.text.CommonScrollText;
		public modelNode:ui.comm.node.ModelNode;
	}
	class SkinTipsView extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public T_name:fgui.GTextField;
		public img_quality:fgui.GLoader;
		public list_attr:fgui.GList;
		public modelNode:ui.comm.node.ModelNode;
	}
	class WeaponTipsView extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbType:fgui.GTextField;
		public attrPanel:ui.itemDetails.panel.WeaponTipsAttrPanel;
		public baseItem:ui.comm.item.WeaponBaseItem;
	}
}
declare namespace ui.itemDetails.btn {
	class ItemNotEnoughBuyBtn extends fgui.GButton{
		public lbPrice:fgui.GTextField;
		public iconCost:fgui.GLoader;
		public lbCost:fgui.GTextField;
		public pCost:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.itemDetails.item {
	class EquipAttrItem extends fgui.GComponent{
		public T_attr0:fgui.GTextField;
		public T_num0:fgui.GTextField;
		public T_attr1:fgui.GTextField;
		public T_num2:fgui.GTextField;
	}
	class EquipAttrPage extends fgui.GComponent{
		public list:fgui.GList;
		public T_skill:fgui.GTextField;
		public gp_skill:fgui.GGroup;
		public desLab:fgui.GTextField;
		public notItem:fgui.GGroup;
		public item:ui.itemDetails.item.EquipAttrItem;
		public skillPage:ui.itemDetails.page.EquipSkillPage;
		public btn_Tips:ui.comm.btn.BaseBtn;
	}
	class EquipSuitAttrTextItem extends fgui.GComponent{
		public T_text:fgui.GTextField;
	}
	class WeaponTipsAttrItem extends fgui.GComponent{
		public lbDes:fgui.GTextField;
		public lbValue:fgui.GTextField;
	}
}
declare namespace ui.itemDetails.page {
	class EquipSkillPage extends fgui.GComponent{
		public T_suitName:fgui.GTextField;
		public list_attr:fgui.GList;
	}
}
declare namespace ui.itemDetails.panel {
	class ItemNotEnoughContainer extends fgui.GComponent{
		public pGift:ui.itemDetails.panel.ItemNotEnoughGift;
		public pCenter:ui.itemDetails.panel.ItemNotEnoughPanel;
	}
	class ItemNotEnoughGift extends fgui.GComponent{
		public lbName:fgui.GTextField;
		public lbLimit:fgui.GTextField;
		public listReward:fgui.GList;
		public lbDiscount:fgui.GTextField;
		public pDiscount:fgui.GGroup;
		public btnGoto:ui.itemDetails.ItemGotoShopBtn;
		public btnBuy:ui.itemDetails.btn.ItemNotEnoughBuyBtn;
	}
	class ItemNotEnoughPanel extends fgui.GComponent{
		public numLab:fgui.GTextField;
		public itemList:fgui.GList;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class WeaponTipsAttrPanel extends fgui.GComponent{
		public lbAttributeBonus:fgui.GTextField;
		public lbExclusiveBonus:fgui.GTextField;
		public panelHero:fgui.GGroup;
		public attr1:ui.itemDetails.item.WeaponTipsAttrItem;
		public attr2:ui.itemDetails.item.WeaponTipsAttrItem;
		public attr3:ui.itemDetails.item.WeaponTipsAttrItem;
		public nodePoint:ui.comm.com.Node;
	}
	class WeaponTipsSkillItem extends fgui.GComponent{
		public lbDesForHero:fgui.GRichTextField;
		public lockImg:fgui.GImage;
		public unlockLab:fgui.GRichTextField;
	}
}
