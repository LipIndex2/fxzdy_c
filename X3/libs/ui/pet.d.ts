declare namespace ui.pet {
	class ruleContentCom extends fgui.GComponent{
		public content:fgui.GRichTextField;
	}
}
declare namespace ui.pet.com {
	class CharacterComp extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public itemBox:ui.comm.item.ItemFrame;
	}
	class CharactorsComp extends fgui.GComponent{
	}
	class detailBtn extends fgui.GButton{
	}
	class drawCardBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class infoBtn extends fgui.GButton{
	}
	class LVUpBtn extends fgui.GButton{
		public red:ui.comm.com.RedDot;
	}
	class PetAttCell extends fgui.GComponent{
		public attIcon:fgui.GLoader;
		public attName:fgui.GTextField;
		public curValue:fgui.GTextField;
		public nextValue:fgui.GTextField;
	}
	class PetAttMaxLVCell extends fgui.GComponent{
		public attIcon:fgui.GLoader;
		public curValue:fgui.GTextField;
		public nextValue:fgui.GTextField;
	}
	class petGroupBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class PetHubComp extends fgui.GComponent{
	}
	class PetHubInfoComp extends fgui.GComponent{
		public nameLabel:fgui.GTextField;
		public nameLabel2:fgui.GTextField;
		public nameLabel3:fgui.GTextField;
		public itemIcon:ui.comm.item.ItemFrame;
	}
	class PetMainAttrItem extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbValue:fgui.GTextField;
		public lbName:fgui.GTextField;
	}
	class PetSkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_bs:fgui.GImage;
		public img_skill:ui.comm.hero.components.skillIconMask;
	}
	class PetUpLvInfoCom extends fgui.GComponent{
		public attList:fgui.GList;
		public nextLV:fgui.GTextField;
		public curLV:fgui.GTextField;
	}
	class PetUpStageListCell extends fgui.GComponent{
		public txName:fgui.GTextField;
		public txNestNum:fgui.GTextField;
		public txCurNum:fgui.GTextField;
	}
	class PetUpSuccessCell extends fgui.GComponent{
		public bg:fgui.GImage;
		public txName:fgui.GTextField;
		public txCurNum:fgui.GTextField;
		public txLastNum:fgui.GTextField;
	}
	class PetUpSuccessList extends fgui.GComponent{
		public nextNum:fgui.GTextField;
		public curNum:fgui.GTextField;
	}
}
declare namespace ui.pet.page {
	class PetHubInfoPage extends fgui.GComponent{
		public title:fgui.GTextField;
		public infoList:fgui.GList;
		public nameLabel:fgui.GTextField;
		public nameLabel2:fgui.GTextField;
		public nameLabel3:fgui.GTextField;
	}
	class PetSwitchPage extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public list_star1:fgui.GList;
		public T_power:fgui.GTextField;
		public modelNode:ui.comm.node.ModelNode;
	}
	class PetUpLevelPage extends fgui.GComponent{
		public T_level:fgui.GTextField;
		public T_attack:fgui.GTextField;
		public T_blood:fgui.GTextField;
		public T_defense:fgui.GTextField;
		public T_preview:fgui.GTextField;
		public skill:ui.pet.com.PetSkillItem;
	}
}
declare namespace ui.pet.view {
	class CollectionsHubSubPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public titleLabel:fgui.GTextField;
		public tipCountLabel:fgui.GTextField;
		public tipFree:fgui.GGroup;
		public tipNormal:fgui.GGroup;
		public freeTipLabel:fgui.GTextField;
		public freePopup:fgui.GGroup;
		public itemList:fgui.GList;
		public baseComp:ui.pet.com.PetHubComp;
		public infoBtn:ui.pet.com.infoBtn;
		public btnBack:ui.comm.back.BtnBack;
		public costBtn:ui.comm.btn.BtnChangGui1WithItem;
		public costBtn2:ui.comm.btn.BtnChangGui1WithItem;
		public costShowBtn:ui.comm.header.HeaderItem;
	}
	class PetInfoPreviewWin extends fgui.GComponent{
		public PetSwitch:ui.pet.page.PetSwitchPage;
		public PetUpLevel:ui.pet.page.PetUpLevelPage;
		public maskBtn:ui.comm.btn.EmptyBtn;
	}
	class PetMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public star:fgui.GList;
		public txPetName:fgui.GTextField;
		public top:fgui.GGroup;
		public petList:fgui.GList;
		public btnName:fgui.GTextField;
		public bottom:fgui.GGroup;
		public listAttr:fgui.GList;
		public maxStar:fgui.GTextField;
		public activeTip:fgui.GTextField;
		public activeTipSkill:fgui.GTextField;
		public petSkillName:fgui.GTextField;
		public midAttrs:fgui.GGroup;
		public LVUpBtn:ui.pet.com.LVUpBtn;
		public skill:ui.pet.com.PetSkillItem;
		public petGroupBtn:ui.pet.com.petGroupBtn;
		public previewStarAddBtn:ui.pet.com.detailBtn;
		public previewSkillBtn:ui.pet.com.detailBtn;
		public drawCardBtn:ui.pet.com.drawCardBtn;
		public btnBack:ui.comm.back.BtnBack;
		public helpBtn:ui.comm.btn.BtnGth3;
		public petSkillDesc:ui.comm.scrollText.scrollTextV;
		public modelNode:ui.comm.node.ModelNode;
		public upStarBtn:ui.comm.btn.BtnChangGui1WithItemList1;
	}
	class PetUpLVView extends fgui.GComponent{
		public costList:fgui.GList;
		public txPower:fgui.GTextField;
		public title:fgui.GTextField;
		public infoCom:ui.pet.com.PetUpLvInfoCom;
		public helpBtn:ui.comm.btn.BtnGth3;
		public btnRule:ui.comm.btn.BtnGth3;
		public modelNode:ui.comm.node.ModelNode;
		public upLVBtn:ui.comm.btn.BtnChangGui1WithItemList1;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class PetUpStageSuccessView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public curLV:fgui.GTextField;
		public nextLV:fgui.GTextField;
		public attUpList:fgui.GList;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public close:ui.comm.btn.BtnChangGui1;
	}
	class PetUpStageView extends fgui.GComponent{
		public curLV:fgui.GTextField;
		public nextLV:fgui.GTextField;
		public attUpList:fgui.GList;
		public upBtn:ui.comm.btn.BtnChangGui1WithItemList1;
	}
	class PetUpStarSuccessView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public listStarLast:fgui.GList;
		public listStarCur:fgui.GList;
		public dont_delete_transition_use:fgui.GGraph;
		public list_attr:fgui.GList;
		public skill:ui.pet.com.PetSkillItem;
		public modelNode:ui.comm.node.ModelNode;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public closeBtn:ui.comm.btn.BtnChangGui1;
	}
}
declare namespace ui.pet.view.PetAddInfo {
	class PetStarAddAttrListItem extends fgui.GComponent{
		public desc:fgui.GTextField;
	}
	class PetStarAddDescLIstItem extends fgui.GComponent{
		public lblLVName:fgui.GTextField;
		public lblProgress:fgui.GTextField;
		public list:fgui.GList;
	}
	class PetStarAddInfoView extends fgui.GComponent{
		public lblGroupName:fgui.GTextField;
		public list:fgui.GList;
	}
}
