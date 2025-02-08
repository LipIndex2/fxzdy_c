declare namespace ui.collectibles.ui.cmp {
	class CharactorComp extends fgui.GComponent{
	}
}
declare namespace ui.collectibles.ui.cmp.btn {
	class CollectionsSetEffActiveBtn extends fgui.GButton{
		public t1:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class CollectionsUpTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.collectibles.ui.cmp.item {
	class CharacterComp extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
		public itemBox:ui.comm.item.ItemFrame;
	}
	class CollectionItem extends fgui.GComponent{
		public itemIcon:fgui.GLoader;
		public di:fgui.GLoader;
		public heCheng:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lv:fgui.GTextField;
		public list_star1:fgui.GList;
		public showItem:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
		public bar:ui.comm.progressBar.components.ProgressBar3;
	}
	class CollectionItem2 extends fgui.GComponent{
		public itemIcon:fgui.GLoader;
		public lv:fgui.GTextField;
		public list_star1:fgui.GList;
		public showItem:fgui.GGroup;
	}
	class CollectionSetItem extends fgui.GComponent{
		public itemIcon:fgui.GLoader;
		public heCheng:fgui.GGroup;
		public lbName:fgui.GTextField;
		public lbLV:fgui.GTextField;
		public list_star1:fgui.GList;
		public redDot:ui.comm.com.RedDot;
		public bar:ui.comm.progressBar.components.ProgressBar3;
	}
	class CollectionsListItem extends fgui.GComponent{
		public list:fgui.GList;
	}
	class CollectionsSetAttrDesc extends fgui.GComponent{
		public desc:fgui.GTextField;
	}
	class CollectionsSetListItem extends fgui.GComponent{
		public setName:fgui.GTextField;
		public descList:fgui.GList;
		public list:fgui.GList;
		public activeBtn:ui.collectibles.ui.cmp.btn.CollectionsSetEffActiveBtn;
	}
	class FooterItem extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.collectibles.ui.view {
	class CollectionsMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public footerList:fgui.GList;
		public top:fgui.GGroup;
		public btnRule:ui.comm.btn.BtnGth3;
		public viewContainer:ui.comm.ViewContainer.ViewContainer;
		public footer:ui.comm.back.BackFooter;
	}
}
declare namespace ui.collectibles.ui.view.page {
	class CollectionsHubSubPage extends fgui.GComponent{
		public tipCountLabel:fgui.GTextField;
		public tipFree:fgui.GGroup;
		public tipNormal:fgui.GGroup;
		public freeTipLabel:fgui.GTextField;
		public freePopup:fgui.GGroup;
		public itemList:fgui.GList;
		public titleLabel:fgui.GTextField;
		public costBtn:ui.comm.btn.BtnChangGui1WithItem;
		public btnBack:ui.comm.back.BtnBack;
		public baseLoader:ui.collectibles.ui.cmp.CharactorComp;
		public btnMore:ui.hero.btn.infoBtn;
	}
	class CollectionsItemsSubPage extends fgui.GComponent{
		public list:fgui.GList;
	}
	class CollectionsSetSubPage extends fgui.GComponent{
		public list:fgui.GList;
	}
}
declare namespace ui.collectibles.ui.win {
	class CollectionInfoContent extends fgui.GComponent{
		public lbExtraEff:fgui.GRichTextField;
		public gExtraTitle:fgui.GGroup;
		public lbBaseAttr:fgui.GTextField;
		public desc:fgui.GTextField;
		public gInfo:fgui.GGroup;
	}
	class CollectionInfoWin extends fgui.GComponent{
		public spTip:fgui.GTextField;
		public collectionName:fgui.GTextField;
		public rarityIcon:fgui.GLoader;
		public lbNoActive:fgui.GTextField;
		public lbMaxTip:fgui.GTextField;
		public lbTime:fgui.GTextField;
		public gTime:fgui.GGroup;
		public RTList:fgui.GList;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public ActBtn:ui.comm.btn.BtnChangGui1WithItem;
		public upStarBtn:ui.collectibles.ui.cmp.btn.CollectionsUpTabBtn;
		public upLvBtn:ui.collectibles.ui.cmp.btn.CollectionsUpTabBtn;
		public collectionItem:ui.collectibles.ui.cmp.item.CollectionItem2;
		public pContent:ui.collectibles.ui.win.CollectionInfoContent;
		public battleSkill:ui.comm.hero.components.CommonCollectionSkillItem;
	}
	class CollectionsSetActiveWin extends fgui.GComponent{
		public list:fgui.GList;
		public lbActiveTip:fgui.GRichTextField;
		public lbAddAtrr:fgui.GTextField;
		public newTip:fgui.GGroup;
		public lbSetName_di:fgui.GTextField;
		public lbSetName:fgui.GTextField;
	}
	class CollectionsUpTipsWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public collectionIcon:fgui.GLoader;
		public closeBtn:ui.comm.btn.BtnChangGui1;
		public transitionUse:ui.comm.btn.EmptyBtn;
		public star:ui.collectibles.ui.win.UpTipsWin.CollectionsUpTipsStarPanel;
	}
}
declare namespace ui.collectibles.ui.win.UpTipsWin {
	class CollectionBaseEffUpTipListItem extends fgui.GComponent{
		public lbAttrR:fgui.GTextField;
		public lbAttrL:fgui.GTextField;
		public lbBaseAtt:fgui.GTextField;
	}
	class CollectionsUpTipsStarPanel extends fgui.GComponent{
		public listStarL:fgui.GList;
		public listStarR:fgui.GList;
		public lbExtraAttrR:fgui.GTextField;
		public lbExtraAttrL:fgui.GTextField;
		public lbExtraAttrDesc:fgui.GTextField;
		public taskEff:fgui.GGroup;
		public attrList:fgui.GList;
		public extraAttr:fgui.GGroup;
		public unlockNewSkillTip:fgui.GGroup;
		public skill:ui.comm.hero.components.CommonCollectionSkillItem;
	}
	class CollectionUpTipsLVPanel extends fgui.GComponent{
		public lbLVL:fgui.GTextField;
		public lbLVR:fgui.GTextField;
		public attrList:fgui.GList;
		public lbAttrR:ui.collectibles.ui.win.UpTipsWin.CollectionBaseEffUpTipListItem;
	}
}
declare namespace ui.collectibles.ui.win.skill {
	class CommonCollectionSkillInfoWin extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public bg:fgui.GLoader;
		public featureList:fgui.GList;
		public T_name:fgui.GTextField;
		public T_info:fgui.GRichTextField;
		public titleGrop:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public closeBtn:ui.comm.btn.BaseBtn;
	}
	class SkillFeatureItem extends fgui.GComponent{
		public featureIcon:fgui.GLoader;
		public txt:fgui.GTextField;
	}
	class TextItem extends fgui.GComponent{
		public T_text:fgui.GRichTextField;
	}
}
