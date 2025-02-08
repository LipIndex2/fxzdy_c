declare namespace ui.formation.btn {
	class BtnItem1 extends fgui.GButton{
		public img_icon:fgui.GLoader;
		public T_num:fgui.GRichTextField;
	}
	class btnRec extends fgui.GComponent{
		public btn_rec:fgui.GGroup;
	}
	class btnRecMore extends fgui.GComponent{
		public btn_more:fgui.GImage;
	}
	class FormationBtn extends fgui.GButton{
	}
	class FormationRecTab extends fgui.GButton{
		public lb_tab:fgui.GTextField;
		public grp_down:fgui.GGroup;
		public lb_tab1:fgui.GTextField;
		public grp_up:fgui.GGroup;
	}
	class SelectBtn extends fgui.GButton{
		public gLock:fgui.GGroup;
	}
}
declare namespace ui.formation.item {
	class Attritem1 extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
	}
	class CampAmountItem extends fgui.GComponent{
		public img_camp:fgui.GLoader;
		public img1:fgui.GLoader;
		public img2:fgui.GLoader;
		public img3:fgui.GLoader;
		public img4:fgui.GLoader;
		public img5:fgui.GLoader;
		public img6:fgui.GLoader;
	}
	class CampAttrItem extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public list_attr:fgui.GList;
	}
	class CareerItem extends fgui.GComponent{
		public T_num:fgui.GTextField;
		public T_tips:fgui.GRichTextField;
	}
	class FormationRecHeroItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_best:fgui.GImage;
		public img_type:fgui.GLoader;
		public img_bg_star:fgui.GImage;
		public list_star:fgui.GList;
		public img_gray:fgui.GImage;
		public lb_type:fgui.GTextField;
	}
	class FormationRecUseBtn extends fgui.GComponent{
	}
	class FromationRecItem extends fgui.GComponent{
		public lb_name:fgui.GTextField;
		public list_hero:fgui.GList;
		public lbBond:fgui.GTextField;
		public lb_tips:fgui.GTextField;
		public list_type:fgui.GList;
		public grp_more:fgui.GGroup;
		public btn_use:ui.formation.item.FormationRecUseBtn;
		public btn_more:ui.formation.btn.btnRecMore;
	}
	class FromationRecTypeItem extends fgui.GComponent{
		public img_type:fgui.GLoader;
		public lb_num:fgui.GTextField;
	}
}
declare namespace ui.formation.page {
	class FormationHeroListPage extends fgui.GComponent{
		public list_hero:fgui.GList;
		public listHeroWithHp:fgui.GList;
		public item_select:ui.comm.item.HeroSelectItem;
	}
	class FormationItemPage extends fgui.GComponent{
		public lbN_1:fgui.GTextField;
		public group1:fgui.GGroup;
		public lbN_2:fgui.GTextField;
		public group2:fgui.GGroup;
		public lbN_3:fgui.GTextField;
		public group3:fgui.GGroup;
		public G_item:fgui.GGroup;
		public G_anim:fgui.GGroup;
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
	}
}
declare namespace ui.formation.skill {
	class FormationSkillChooseComp extends fgui.GComponent{
		public bg:fgui.GGraph;
		public bgInfo:fgui.GImage;
		public imageTitleSplit:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public descList:fgui.GList;
		public skillList:fgui.GList;
		public all:fgui.GGroup;
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
	class FormationSkillDescItemComp extends fgui.GComponent{
		public labelContent:fgui.GRichTextField;
		public logo:fgui.GImage;
	}
}
declare namespace ui.formation.view {
	class CampHaloWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public list_camp:fgui.GList;
		public list_addAttr:fgui.GList;
	}
	class CareerFetterWin extends fgui.GComponent{
		public bg:fgui.GLoader;
		public img_icon:fgui.GLoader;
		public T_allNum:fgui.GTextField;
		public list_tab:fgui.GList;
		public list_tips:fgui.GList;
		public list_hero:fgui.GList;
		public btnGoto:ui.formation.view.FormationGotoBtn;
	}
	class FormationGotoBtn extends fgui.GButton{
	}
	class FormationMainView extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public lbTitle:fgui.GTextField;
		public T_power:fgui.GTextField;
		public list_career:fgui.GList;
		public bgLockTips:fgui.GImage;
		public T_lockTips:fgui.GRichTextField;
		public iconCareer:fgui.GLoader;
		public T_lockTips2:fgui.GRichTextField;
		public G_lockTips:fgui.GGroup;
		public btn_confirm:ui.comm.btn.BtnChangGui1;
		public btn_formation:ui.comm.btn.BtnBlue;
		public btn_close:ui.comm.back.BtnBack;
		public heroListPage:ui.formation.page.FormationHeroListPage;
		public formationPage:ui.formation.page.FormationItemPage;
		public campItem:ui.formation.item.CampAmountItem;
		public btn_rec:ui.formation.btn.btnRec;
		public skillChooseComp:ui.formation.skill.FormationSkillChooseComp;
		public starComp:ui.formation.view.FormationStarComp;
		public btnCollections:ui.comm.formation.FormationSkillSetComp;
		public btnPet:ui.comm.formation.FormationSkillSetComp;
	}
	class FormationRecView extends fgui.GComponent{
		public list_tab:fgui.GList;
		public list_rec:fgui.GList;
	}
	class FormationStarComp extends fgui.GComponent{
		public listCond:fgui.GList;
	}
	class FormationStarItem extends fgui.GComponent{
		public lbCond:fgui.GTextField;
	}
}
