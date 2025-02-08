declare namespace ui.hero.btn {
	class BtnCamp extends fgui.GButton{
	}
	class BtnItem1 extends fgui.GButton{
		public bg:fgui.GImage;
		public iconLoader:fgui.GLoader;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnManual extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnStage extends fgui.GButton{
		public T_stageNum:fgui.GTextField;
	}
	class DNAProgress extends fgui.GComponent{
		public progressBg:fgui.GLoader;
		public progressBar:fgui.GGraph;
	}
	class HeroTipBtn extends fgui.GButton{
	}
	class infoBtn extends fgui.GButton{
	}
	class MagicCubeBtn extends fgui.GButton{
		public T_tips:fgui.GTextField;
	}
	class potentailBtn extends fgui.GButton{
		public bgImg:fgui.GLoader;
		public progress:ui.hero.btn.DNAProgress;
		public redDot:ui.comm.com.RedDot;
	}
	class TabBtn extends fgui.GButton{
		public redDot1:ui.comm.com.RedDot;
	}
	class UpBtn1 extends fgui.GButton{
		public item_icon:fgui.GLoader;
		public T_num:fgui.GTextField;
		public item_icon2:fgui.GLoader;
		public T_num2:fgui.GTextField;
		public redDot1:ui.comm.com.RedDot;
	}
	class UpBtn2 extends fgui.GButton{
		public item_icon:fgui.GLoader;
		public T_num:fgui.GTextField;
		public redDot1:ui.comm.com.RedDot;
	}
}
declare namespace ui.hero.item {
	class HeroAttrItem extends fgui.GComponent{
		public img_icon:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
		public T_nextNum:fgui.GTextField;
	}
	class HeroAttrItem2 extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_nextNum:fgui.GTextField;
		public T_num:fgui.GTextField;
	}
	class HeroAttrTips extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public T_career:fgui.GTextField;
	}
	class HeroDNAAttr extends fgui.GComponent{
		public propBg:fgui.GImage;
		public attrLabel:fgui.GTextField;
	}
	class HeroDnaAttrList extends fgui.GComponent{
		public tipLabel1:fgui.GTextField;
		public attrList1:fgui.GList;
	}
	class HeroDnaLittleComp extends fgui.GComponent{
		public stage1:fgui.GImage;
		public stage2:fgui.GImage;
		public stage3:fgui.GImage;
		public stage4:fgui.GImage;
		public stage5:fgui.GImage;
		public stage6:fgui.GImage;
	}
	class HeroFragmentBarItem extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
		public img_icon:fgui.GLoader;
		public btn_Add:ui.comm.btn.BaseBtn;
	}
	class HeroItem2 extends fgui.GComponent{
		public img_quality:fgui.GLoader;
		public img_hero:fgui.GLoader;
		public img_camp:fgui.GLoader;
		public stars:fgui.GImage;
		public G_star:fgui.GGroup;
		public T_level:fgui.GTextField;
		public G_activate:fgui.GGroup;
		public T_name:fgui.GTextField;
		public mc:fgui.GGroup;
		public dnaShow:ui.hero.item.HeroDnaLittleComp;
		public redDot1:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
	}
	class HeroPotentialAttr extends fgui.GComponent{
		public attr_icon:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
		public T_up:fgui.GTextField;
	}
	class HeroPotentialBtnComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public DNA1:ui.hero.btn.potentailBtn;
		public DNA2:ui.hero.btn.potentailBtn;
		public DNA3:ui.hero.btn.potentailBtn;
		public DNA4:ui.hero.btn.potentailBtn;
		public DNA5:ui.hero.btn.potentailBtn;
		public DNA6:ui.hero.btn.potentailBtn;
	}
	class HeroSkinAttrItem extends fgui.GComponent{
		public img_attr:fgui.GLoader;
		public T_num:fgui.GTextField;
		public T_name:fgui.GTextField;
	}
	class HeroSkinFirstGetAttrItem extends fgui.GComponent{
		public lb_name:fgui.GTextField;
		public lb_attr:fgui.GTextField;
	}
	class HeroSkinItem extends fgui.GComponent{
		public img_quality:fgui.GLoader;
		public img_hero:fgui.GLoader;
		public grp_use:fgui.GGroup;
		public lb_name:fgui.GTextField;
		public grp_select:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class HeroStarIconItem extends fgui.GComponent{
		public starIcon:fgui.GLoader;
	}
	class HeroStarItem extends fgui.GComponent{
		public list_star1:fgui.GList;
		public list_star2:fgui.GList;
	}
	class HeroStarUpAttrOneRowItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
		public T_nextNum:fgui.GTextField;
		public jiantou:fgui.GImage;
	}
	class MagicCubeBtnItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_suo:fgui.GImage;
		public T_name:fgui.GTextField;
		public T_level:fgui.GTextField;
		public btn_openInfo:ui.hero.btn.MagicCubeBtn;
		public redDot:ui.comm.com.RedDot;
	}
	class MagicCubeInfoItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_level:fgui.GTextField;
		public list_attr:fgui.GList;
	}
	class MagicCubeOtherItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_suo:fgui.GImage;
		public T_name:fgui.GTextField;
		public T_level:fgui.GTextField;
	}
	class ProgressBar1 extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class SkillFeatureItem extends fgui.GComponent{
		public featureIcon:fgui.GLoader;
		public txt:fgui.GTextField;
	}
	class TextItem extends fgui.GComponent{
		public T_text:fgui.GRichTextField;
	}
	class TextItem2 extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_count:fgui.GTextField;
	}
	class WeaponItem extends fgui.GComponent{
	}
}
declare namespace ui.hero.page {
	class HeroPotentialPage extends fgui.GComponent{
		public bg:fgui.GImage;
		public stageLabel:fgui.GTextField;
		public attr_list:fgui.GList;
		public tipLabel:fgui.GTextField;
		public DNA0:ui.hero.btn.potentailBtn;
		public DNA1:ui.hero.btn.potentailBtn;
		public DNA2:ui.hero.btn.potentailBtn;
		public DNA3:ui.hero.btn.potentailBtn;
		public DNA4:ui.hero.btn.potentailBtn;
		public DNA5:ui.hero.btn.potentailBtn;
		public infoBtn1:ui.hero.btn.infoBtn;
		public infoBtn2:ui.hero.btn.infoBtn;
		public sendBtn:ui.comm.btn.BtnChangGui1WithItem;
	}
	class HeroSkinPage extends fgui.GComponent{
		public list_attr:fgui.GList;
		public list_skin:fgui.GList;
		public grp_use:fgui.GGroup;
		public btn_waer:ui.comm.btn.BtnChangGui1;
		public btnRule:ui.comm.btn.BtnGth3;
	}
	class HeroSwitchPage extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public img_isUp:fgui.GImage;
		public rootForSpine:fgui.GTextField;
		public btn_hero:fgui.GLoader;
		public T_power:fgui.GTextField;
		public img_camp:fgui.GLoader;
		public HeroStarItem:ui.hero.item.HeroStarItem;
		public item_Weapon:ui.hero.item.WeaponItem;
		public btn_left:ui.comm.btn.BaseBtn;
		public btn_right:ui.comm.btn.BaseBtn;
		public redDot:ui.comm.com.RedDot;
		public item:ui.comm.item.ItemFrameBtn;
		public modelNode:ui.comm.node.ModelNode;
		public aniNode:ui.comm.node.ModelNode;
	}
	class HeroUpLevelPage extends fgui.GComponent{
		public img_zy:fgui.GLoader;
		public T_zy:fgui.GTextField;
		public T_level:fgui.GTextField;
		public T_tips:fgui.GTextField;
		public list_skill:fgui.GList;
		public T_attack:fgui.GTextField;
		public T_blood:fgui.GTextField;
		public T_defense:fgui.GTextField;
		public T_preview:fgui.GTextField;
		public labelPlayerName:fgui.GTextField;
		public btn_upStage:ui.hero.btn.UpBtn1;
		public btn_upLevel:ui.hero.btn.UpBtn2;
		public btn_tips:ui.comm.btn.BaseBtn;
		public btnPlayerAvatar:ui.comm.playerInfo.PlayerAvatar;
	}
	class HeroUpStar extends fgui.GComponent{
		public list_attr:fgui.GList;
		public HeroStarItem:ui.hero.item.HeroStarItem;
		public HeroBar:ui.hero.item.HeroFragmentBarItem;
		public btn_Up:ui.hero.btn.UpBtn1;
	}
}
declare namespace ui.hero.pane {
	class HeroMainScrollPane extends fgui.GComponent{
		public T_gmLevel:fgui.GTextField;
		public heroListItem:ui.hero.pane.HeroScrollPane;
		public btn_tips2:ui.comm.btn.BaseBtn;
		public btn_camp:ui.comm.btn.BtnBlue;
	}
	class HeroScrollPane extends fgui.GComponent{
		public list_upHero:fgui.GList;
		public list_hero:fgui.GList;
	}
}
declare namespace ui.hero.view {
	class HeroAttrPreviewWin extends fgui.GComponent{
		public list_attr1:fgui.GList;
		public list_attr2:fgui.GList;
		public attrTipsItem:ui.hero.item.HeroAttrTips;
	}
	class HeroDnaTipWin extends fgui.GComponent{
		public title:fgui.GTextField;
		public tipLabel1:fgui.GTextField;
		public view1:fgui.GGroup;
		public stageLabel:fgui.GTextField;
		public AttrLabel:fgui.GTextField;
		public view2:fgui.GGroup;
		public curAttrLabel:fgui.GTextField;
		public newAttrLabel:fgui.GTextField;
		public view3:fgui.GGroup;
		public tipBtn:ui.hero.btn.HeroTipBtn;
		public btnUse:ui.comm.btn.BtnChangGui1;
		public btnClose:ui.comm.btn.BtnChangGui1;
		public btnYes:ui.comm.btn.BtnChangGui1;
		public btnNoUse:ui.comm.btn.BtnChangGui3;
		public btnNo:ui.comm.btn.BtnChangGui3;
	}
	class HeroDNAWin extends fgui.GComponent{
		public title:fgui.GTextField;
		public attr_list:fgui.GList;
	}
	class HeroInfoPreviewWin extends fgui.GComponent{
		public HeroSwitch:ui.hero.page.HeroSwitchPage;
		public HeroUpLevel:ui.hero.page.HeroUpLevelPage;
		public attrTips:ui.hero.item.HeroAttrTips;
		public magicCubeItem:ui.hero.item.MagicCubeOtherItem;
		public btn_left:ui.comm.btn.BaseBtn;
		public btn_right:ui.comm.btn.BaseBtn;
		public maskBtn:ui.comm.btn.EmptyBtn;
		public btnWearWeapon:ui.comm.btn.PlayerInfoInfoHeroWeaponItem;
	}
	class HeroInfoWin extends fgui.GComponent{
		public list_tab:fgui.GList;
		public HeroSwitch:ui.hero.page.HeroSwitchPage;
		public HeroUpStar:ui.hero.page.HeroUpStar;
		public HeroUpLevel:ui.hero.page.HeroUpLevelPage;
		public heroSkin:ui.hero.page.HeroSkinPage;
		public attrTips:ui.hero.item.HeroAttrTips;
		public magicCubeItem:ui.hero.item.MagicCubeBtnItem;
		public magicCubeInfo:ui.hero.item.MagicCubeInfoItem;
		public HeroPotential:ui.hero.page.HeroPotentialPage;
		public maskBtn:ui.comm.btn.EmptyBtn;
		public headerItem1:ui.comm.header.HeaderItem;
		public headerItem2:ui.comm.header.HeaderItem;
		public btnWearWeapon:ui.comm.btn.BtnWearWeapon;
	}
	class HeroMainView extends fgui.GComponent{
		public G_item:fgui.GGroup;
		public G_anim:fgui.GGroup;
		public T_pow:fgui.GTextField;
		public G_power:fgui.GGroup;
		public formation:fgui.GGroup;
		public top_bg:fgui.GImage;
		public bottomTab:fgui.GList;
		public btn_manual:ui.hero.btn.BtnManual;
		public btn_team:ui.hero.btn.BtnManual;
		public pane:ui.hero.pane.HeroMainScrollPane;
		public anim0:ui.comm.node.ModelNode;
		public anim1:ui.comm.node.ModelNode;
		public anim2:ui.comm.node.ModelNode;
		public anim3:ui.comm.node.ModelNode;
		public anim4:ui.comm.node.ModelNode;
		public anim5:ui.comm.node.ModelNode;
		public item0:ui.comm.item.SoltItem;
		public item1:ui.comm.item.SoltItem;
		public item2:ui.comm.item.SoltItem;
		public item3:ui.comm.item.SoltItem;
		public item4:ui.comm.item.SoltItem;
		public item5:ui.comm.item.SoltItem;
		public item_select:ui.comm.item.HeroSelectItem;
	}
	class HeroSkinFirstGetView extends fgui.GComponent{
		public bg:fgui.GLoader;
		public top_bg:fgui.GImage;
		public bottom_bg:fgui.GImage;
		public grp_top:fgui.GGroup;
		public lb_bottom:fgui.GTextField;
		public img_bg_qua:fgui.GLoader;
		public lb_name1:fgui.GTextField;
		public list_attr:fgui.GList;
		public lb_name:fgui.GTextField;
		public imageQuality:fgui.GLoader;
		public btn_wear:ui.comm.btn.BtnChangGui1;
		public spineHero:ui.comm.node.ModelNode;
	}
	class HeroUpStageSucceedWin extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public img_title:fgui.GLoader;
		public bgMask:fgui.GImage;
		public stageP:fgui.GGroup;
		public list_attr:fgui.GList;
		public T_skillUnlock:fgui.GTextField;
		public G_skill:fgui.GGroup;
		public G_all:fgui.GGroup;
		public stageOld:ui.hero.btn.BtnStage;
		public stageNew:ui.hero.btn.BtnStage;
		public skill:ui.comm.hero.components.HeroSkillItem;
		public btn_good:ui.comm.btn.BtnChangGui1;
		public modelNode:ui.comm.node.ModelNode;
		public anim:ui.comm.node.ModelNode;
	}
	class HeroUpStageWin extends fgui.GComponent{
		public T_stageNextNum:fgui.GTextField;
		public T_stageNum:fgui.GTextField;
		public list_attr:fgui.GList;
		public G_skill:fgui.GGroup;
		public btn_qd:ui.hero.btn.UpBtn1;
		public item_skill:ui.comm.hero.components.HeroSkillItem;
		public item_hero:ui.comm.item.HeroItem;
	}
	class HeroUpStarSucceedWin extends fgui.GComponent{
		public adapt_bg:fgui.GLoader;
		public bgMask:fgui.GImage;
		public img_title:fgui.GLoader;
		public list_star1:fgui.GList;
		public list_star2:fgui.GList;
		public G_star:fgui.GGroup;
		public list_attr:fgui.GList;
		public T_skillLevel1:fgui.GTextField;
		public T_skillNextLevel1:fgui.GTextField;
		public skillMc1:fgui.GGroup;
		public T_skillLevel2:fgui.GTextField;
		public T_skillNextLevel2:fgui.GTextField;
		public skillMc2:fgui.GGroup;
		public G_skill:fgui.GGroup;
		public G_all:fgui.GGroup;
		public skill1:ui.comm.hero.components.HeroSkillItem;
		public skill2:ui.comm.hero.components.HeroSkillItem;
		public btn_good:ui.comm.btn.BtnChangGui1;
		public modelNode:ui.comm.node.ModelNode;
		public anim:ui.comm.node.ModelNode;
	}
	class SkillInfoWin extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public bg:fgui.GLoader;
		public featureList:fgui.GList;
		public T_name:fgui.GTextField;
		public T_info:fgui.GRichTextField;
		public titleGrop:fgui.GGroup;
		public list:fgui.GList;
		public posNode:ui.comm.com.Node;
	}
	class SkinAttrPreviewWin extends fgui.GComponent{
		public list_attr1:fgui.GList;
		public attrTipsItem:ui.hero.item.HeroAttrTips;
	}
}
