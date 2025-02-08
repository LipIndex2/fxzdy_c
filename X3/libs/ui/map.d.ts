declare namespace ui.map.component {
	class MapStimulationProgress extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class MapTransferTabBtn extends fgui.GButton{
	}
}
declare namespace ui.map.item {
	class boxBar extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class Conditional_item extends fgui.GComponent{
		public T_des:fgui.GTextField;
		public goBtn:ui.comm1.btn.ItemTipsItemButton;
	}
	class MapFactory extends fgui.GComponent{
		public bgLv:fgui.GLoader;
		public lbLv:fgui.GTextField;
		public bgName:fgui.GImage;
		public lbName:fgui.GTextField;
		public gOccupy:fgui.GGroup;
	}
	class MapMine extends fgui.GComponent{
		public bgLv:fgui.GLoader;
		public lbLv:fgui.GTextField;
		public lbFull:fgui.GTextField;
		public gOccupyAni:fgui.GGroup;
		public bgName:fgui.GImage;
		public lbName:fgui.GTextField;
		public gOccupy:fgui.GGroup;
	}
	class MapOccupyHeroItem extends fgui.GComponent{
		public light2:fgui.GImage;
		public light1:fgui.GImage;
		public lbName:fgui.GTextField;
		public spineHero:ui.comm.node.ModelNode;
	}
	class MapPetDungeon extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbChapter:fgui.GTextField;
		public gChapter:fgui.GGroup;
	}
	class MapStimulation extends fgui.GComponent{
		public iconLoader:fgui.GLoader;
		public lbTime:fgui.GTextField;
		public gAll:fgui.GGroup;
		public prgressBar:ui.map.component.MapStimulationProgress;
	}
	class TransferDoor_item extends fgui.GComponent{
		public img_rk:fgui.GLoader;
	}
	class TransferList_item extends fgui.GComponent{
		public bg:fgui.GLoader;
		public img_icon:fgui.GLoader;
		public T_name:fgui.GTextField;
		public T_num:fgui.GTextField;
	}
	class Unlock_item extends fgui.GComponent{
		public img_suo:fgui.GLoader;
		public T_Lv:fgui.GTextField;
		public bg:fgui.GImage;
		public I_icon:fgui.GLoader;
		public lockIcon:fgui.GImage;
		public unlockIcon:fgui.GImage;
		public T_num:fgui.GTextField;
		public bar:ui.map.item.boxBar;
	}
}
declare namespace ui.map.view {
	class ConditionalPopup extends fgui.GComponent{
		public list:fgui.GList;
	}
	class MapBackgroundView extends fgui.GComponent{
		public sceneBg:fgui.GLoader;
		public bg:fgui.GLoader;
	}
	class MapBoosFirstKill extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public gAd:fgui.GGroup;
		public title:ui.map.view.MapBossKillTitle;
		public btnPlay:ui.comm.btn.BtnAd;
		public btnDraw:ui.comm.btn.BtnDrawClose;
	}
	class MapBossKillTitle extends fgui.GComponent{
		public img_bg:fgui.GLoader;
		public img_item:fgui.GLoader;
		public T_bossName:fgui.GTextField;
		public T_itemName:fgui.GTextField;
		public T_itemNum:fgui.GRichTextField;
		public modelNode:ui.comm.node.ModelNode;
	}
	class MapTransferListPopup extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public listTab:fgui.GList;
		public list:fgui.GList;
	}
}
