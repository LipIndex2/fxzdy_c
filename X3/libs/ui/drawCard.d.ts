declare namespace ui.drawCard {
	class DrawCardFirstGetItemView extends fgui.GComponent{
		public adapt_bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public bg:fgui.GLoader;
		public imageJobLogo:fgui.GLoader;
		public imageCareerLogo:fgui.GLoader;
		public imageQuality:fgui.GLoader;
		public imageTitle:fgui.GImage;
		public G_headTitle:fgui.GGroup;
		public imageChassis:fgui.GLoader;
		public imageGuang:fgui.GLoader;
		public imageWeapon:fgui.GLoader;
		public labelWeaponName:fgui.GTextField;
		public G_weapon:fgui.GGroup;
		public imageJob:fgui.GLoader;
		public labelHeroName:fgui.GTextField;
		public G_hero:fgui.GGroup;
		public labelPetName:fgui.GTextField;
		public G_pet:fgui.GGroup;
		public collectionIcon:fgui.GLoader;
		public labelCollName:fgui.GTextField;
		public G_collections:fgui.GGroup;
		public listAttr:fgui.GList;
		public starList:fgui.GList;
		public foot:fgui.GGroup;
		public all:fgui.GGroup;
		public spineBg:ui.comm.node.ModelNode;
		public spineTitle:ui.comm.node.ModelNode;
		public btnOkGain:ui.drawCard.button.DrawCardResultConfirmButton;
		public spineStage:ui.comm.node.ModelNode;
		public spineHero:ui.comm.node.ModelNode;
		public spinePet:ui.comm.node.ModelNode;
		public spineGuang:ui.comm.node.ModelNode;
		public fragmentComp:ui.drawCard.components.DrawCardFragmentComp;
	}
	class DrawCardNormalView extends fgui.GComponent{
		public head:fgui.GGroup;
		public tab2:fgui.GImage;
		public tab1:fgui.GImage;
		public tab:fgui.GGroup;
		public list_tab:fgui.GList;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public drawComp:ui.drawCard.components.DrawStateComp;
		public headItem1:ui.drawCard.components.DrawCardHeadItemComp;
		public headItem2:ui.drawCard.components.DrawCardHeadItemComp;
		public skipAnimButton:ui.drawCard.components.DrawCardSkipWithTitleComp;
		public pageEquip:ui.drawCard.tabPage.DrawCardEquipPage;
		public advancedPage:ui.drawCard.tabPage.DrawCardAdvancedPage;
		public normalPage:ui.drawCard.tabPage.DrawCardNormalPage;
	}
	class DrawCardResultView extends fgui.GComponent{
		public bg:fgui.GImage;
		public itemList:fgui.GList;
		public labelClose:fgui.GTextField;
		public G_notContinue:fgui.GGroup;
		public G_btn:fgui.GGroup;
		public spineTitle:ui.comm.node.ModelNode;
		public fgClose:ui.comm.btn.EmptyBtn;
		public btnAgain:ui.comm.btn.BtnChangGui1;
		public btnAd:ui.comm.btn.BtnAdLb;
		public btnOk:ui.comm.btn.BtnChangGui3;
	}
}
declare namespace ui.drawCard.btn {
	class BtnAddHero1 extends fgui.GButton{
		public btn_addHero1:fgui.GImage;
	}
	class DrawCardActiveCardMoreBtn extends fgui.GButton{
	}
	class DrawCardJumpActiveCardBtn extends fgui.GButton{
	}
	class DrawCardJumpShopBtn extends fgui.GButton{
	}
	class DrawCardTabBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
		public btnRule:ui.comm.btn.BaseBtn;
	}
}
declare namespace ui.drawCard.button {
	class DrawCardEquipBoxButton extends fgui.GButton{
		public bgBar:fgui.GImage;
		public fgItem:fgui.GImage;
		public fgBar:fgui.GImage;
		public imageBox:fgui.GImage;
		public labelProgressCount:fgui.GTextField;
	}
	class DrawCardResultConfirmButton extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class DrawCardSkilAnimButton extends fgui.GButton{
		public bgGou:fgui.GLoader;
		public imageGou:fgui.GLoader;
	}
}
declare namespace ui.drawCard.components {
	class DrawCardEquipBoxBarComp extends fgui.GComponent{
		public bgDialog:fgui.GImage;
		public imageItem:fgui.GLoader;
		public labelItemCount:fgui.GTextField;
		public G_dialog:fgui.GGroup;
		public btnBox:ui.drawCard.button.DrawCardEquipBoxButton;
		public redDot:ui.comm.com.RedDot;
	}
	class DrawCardFloatHeadComp extends fgui.GComponent{
		public light:fgui.GLoader;
		public head:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class DrawCardFragmentComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public imgSmallItem:fgui.GLoader;
		public labelItemCount:fgui.GTextField;
	}
	class DrawCardGainItemComp extends fgui.GComponent{
		public bg:fgui.GLoader;
		public imageItem:fgui.GLoader;
		public labelName:fgui.GTextField;
		public imageHeroJob:fgui.GLoader;
		public hero:fgui.GGroup;
		public labelItemCount:fgui.GTextField;
		public item:fgui.GGroup;
		public modelNodePopUp:ui.comm.node.ModelNode;
		public modelNodeSweep:ui.comm.node.ModelNode;
		public starComp:ui.drawCard.components.DrawCardHeroStarList;
	}
	class DrawCardHeadItemComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelItemCount:fgui.GTextField;
		public imageItem:fgui.GLoader;
	}
	class DrawCardHeroStarComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
	}
	class DrawCardHeroStarList extends fgui.GComponent{
		public bg:fgui.GLoader;
		public starList:fgui.GList;
	}
	class DrawCardNormalHeadRewardComp extends fgui.GComponent{
		public imageHero:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelContent:fgui.GTextField;
	}
	class DrawCardOneCountButton extends fgui.GButton{
		public bg:fgui.GImage;
		public labelBig:fgui.GTextField;
		public labelAd:fgui.GTextField;
		public costCom:ui.comm.item.CommonItemSmallCostComp;
	}
	class DrawCardProgressTitleComp extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
	}
	class DrawCardSkipWithTitleComp extends fgui.GComponent{
		public labelSkip:fgui.GTextField;
		public buttonSkip:ui.drawCard.button.DrawCardSkilAnimButton;
	}
	class DrawCardTenCountButton extends fgui.GButton{
		public bg:fgui.GImage;
		public labelBig:fgui.GTextField;
		public costCom:ui.comm.item.CommonItemSmallCostComp;
	}
	class DrawStateComp extends fgui.GComponent{
		public bgTips:fgui.GImage;
		public labelDesc1:fgui.GTextField;
		public labelDesc2:fgui.GTextField;
		public labelDesc3:fgui.GTextField;
		public tips:fgui.GGroup;
		public labelTipsFree:fgui.GTextField;
		public labelTipsPay:fgui.GTextField;
		public G_weaon:fgui.GGroup;
		public buttonDraw1:ui.drawCard.components.DrawCardOneCountButton;
		public buttonDraw10:ui.drawCard.components.DrawCardTenCountButton;
		public redDot1:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
		public btnAd:ui.comm.btn.BtnAdLb;
	}
}
declare namespace ui.drawCard.item {
	class DrawCardWeaponWordItem extends fgui.GComponent{
		public labelLeft:fgui.GTextField;
		public labelRight:fgui.GTextField;
	}
}
declare namespace ui.drawCard.progressbar {
	class DrawCardCountProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.drawCard.tabPage {
	class DrawCardAdvancedPage extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public btn_addHero1:ui.drawCard.btn.BtnAddHero1;
		public btn_addHero2:ui.drawCard.btn.BtnAddHero1;
		public anim:ui.comm.node.ModelNode;
		public heroItem:ui.comm.item.HeroItem;
		public btn_selHero:ui.comm.btn.BaseBtn;
	}
	class DrawCardEquipPage extends fgui.GComponent{
		public bg:fgui.GImage;
		public top_bg:fgui.GImage;
		public G_left:fgui.GGroup;
		public G_rightTab:fgui.GGroup;
		public armL:ui.comm.node.ModelNode;
		public armR:ui.comm.node.ModelNode;
		public boxLeft:ui.drawCard.components.DrawCardEquipBoxBarComp;
		public rightTab1:ui.comm.btn.RightTabBtn;
	}
	class DrawCardNormalPage extends fgui.GComponent{
		public bg:fgui.GImage;
		public spineAnimNode:fgui.GTextField;
		public fg:fgui.GImage;
		public fgItem1:fgui.GImage;
		public top_bg:fgui.GImage;
		public reward:fgui.GGroup;
		public labelDrawCardCount:fgui.GTextField;
		public labelTitleDrawCardCount:fgui.GTextField;
		public drawCount:fgui.GGroup;
		public tips:fgui.GGroup;
		public fgTips:fgui.GGroup;
		public bgPart:fgui.GGroup;
		public anim0:ui.comm.node.ModelNode;
		public anim:ui.comm.node.ModelNode;
		public anim1:ui.comm.node.ModelNode;
		public btnJumpShop:ui.drawCard.btn.DrawCardJumpShopBtn;
		public d1:ui.drawCard.components.DrawCardFloatHeadComp;
		public d2:ui.drawCard.components.DrawCardFloatHeadComp;
		public d3:ui.drawCard.components.DrawCardFloatHeadComp;
		public d4:ui.drawCard.components.DrawCardFloatHeadComp;
		public btnDrawCountBox:ui.comm.btn.EmptyBtn;
		public barComp:ui.drawCard.progressbar.DrawCardCountProgressBar;
		public tips1:ui.drawCard.components.DrawCardProgressTitleComp;
		public tips2:ui.drawCard.components.DrawCardProgressTitleComp;
		public tips3:ui.drawCard.components.DrawCardProgressTitleComp;
		public tips4:ui.drawCard.components.DrawCardProgressTitleComp;
	}
}
declare namespace ui.drawCard.win {
	class DrawCardEquipConfirmWin extends fgui.GComponent{
		public fg:fgui.GImage;
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public bgItem:fgui.GImage;
		public labelTips:fgui.GRichTextField;
		public bgCount:fgui.GImage;
		public labelCount:fgui.GTextInput;
		public G_useBtn:fgui.GGroup;
		public G_all:fgui.GGroup;
		public btnBuy:ui.drawCard.components.DrawCardTenCountButton;
		public itemShow:ui.comm.item.ItemFrameBtn;
		public btnMinus1:ui.comm1.btn.BtnJian1;
		public btnMinus10:ui.comm1.btn.BtnJian10;
		public btnMax:ui.comm1.btn.BtnZuiDa;
		public btnAdd10:ui.comm1.btn.BtnJia10;
		public btnAdd1:ui.comm1.btn.BtnJia1;
		public btnUse:ui.comm1.btn.BtnUse;
	}
	class DrawCardProgressRewardWin extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public labelProgressTitle:fgui.GTextField;
		public labelProgressCount:fgui.GTextField;
		public labelSubTitle:fgui.GRichTextField;
		public G_active:fgui.GGroup;
		public headList:fgui.GList;
		public labelRTTips:fgui.GTextField;
		public G_RT:fgui.GGroup;
		public G_noActive:fgui.GGroup;
		public G_all:fgui.GGroup;
		public bgB:ui.comm.btn.EmptyBtn;
		public btnRule:ui.comm.btn.BtnGth3;
		public btnJump:ui.drawCard.btn.DrawCardJumpActiveCardBtn;
		public btnActiveMore:ui.drawCard.btn.DrawCardActiveCardMoreBtn;
	}
	class DrawCardWishWin extends fgui.GComponent{
		public T_counts:fgui.GTextField;
		public T_tips:fgui.GTextField;
		public list_hero:fgui.GList;
		public heroItem:ui.comm.item.HeroItem;
	}
}
