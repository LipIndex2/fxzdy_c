declare namespace ui.comm.ViewContainer {
	class ViewContainer extends fgui.GComponent{
	}
}
declare namespace ui.comm.anim {
	class UnlockResAnimNode extends fgui.GComponent{
		public loader:fgui.GLoader;
	}
}
declare namespace ui.comm.back {
	class BackFooter extends fgui.GComponent{
		public bgFooter1:fgui.GLoader;
		public btnBack:ui.comm.back.BackIcon;
	}
	class BackFooter2 extends fgui.GComponent{
		public bgFooter1:fgui.GLoader;
		public bgFooter2:fgui.GLoader;
	}
	class BackFooter3 extends fgui.GComponent{
		public top_bg:fgui.GImage;
		public btnBack:ui.comm.back.BackIcon;
	}
	class BackIcon extends fgui.GButton{
		public btnBack:fgui.GLoader;
	}
	class BtnBack extends fgui.GButton{
	}
	class BtnBack75 extends fgui.GButton{
	}
}
declare namespace ui.comm.btn {
	class BaseBtn extends fgui.GButton{
	}
	class BaseBtnNoScale extends fgui.GButton{
	}
	class BtnAd extends fgui.GButton{
	}
	class BtnAdLb extends fgui.GButton{
		public line:fgui.GImage;
		public iconTop:fgui.GLoader;
		public lbTimesTop:fgui.GTextField;
		public gIconTop:fgui.GGroup;
		public redDotTop:ui.comm.com.RedDot;
		public redDot:ui.comm.com.RedDot;
		public redDot2:ui.comm.com.RedDot;
	}
	class BtnBattleData extends fgui.GButton{
		public imageBattleData:fgui.GLoader;
		public labelBattleData:fgui.GTextField;
	}
	class BtnBeiBao extends fgui.GButton{
	}
	class BtnBlue extends fgui.GButton{
	}
	class BtnBuZhen extends fgui.GButton{
		public bg:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnBuZhen2 extends fgui.GButton{
	}
	class BtnCancel extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class BtnChangGui extends fgui.GButton{
	}
	class BtnChangGui1 extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui1WithItem extends fgui.GButton{
		public lbFree:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public labelCount:fgui.GTextField;
		public gCost:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui1WithItemList extends fgui.GButton{
		public itemList:fgui.GList;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui1WithItemList1 extends fgui.GButton{
		public itemList:fgui.GList;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui1WithTime extends fgui.GButton{
		public labelCount:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui2 extends fgui.GButton{
	}
	class BtnChangGui3 extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnChangGui4 extends fgui.GButton{
	}
	class BtnConfirm extends fgui.GButton{
		public bg:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
	}
	class BtnCopy extends fgui.GButton{
	}
	class BtnData extends fgui.GButton{
	}
	class BtnDrawClose extends fgui.GButton{
	}
	class BtnEntrance extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnFh1 extends fgui.GButton{
	}
	class BtnFh2 extends fgui.GButton{
	}
	class BtnFh2WithLb extends fgui.GButton{
	}
	class BtnGouXuan extends fgui.GButton{
	}
	class BtnGreen2 extends fgui.GButton{
	}
	class BtnGrsz extends fgui.GButton{
	}
	class BtnGth3 extends fgui.GButton{
	}
	class BtnJianTou4 extends fgui.GButton{
	}
	class BtnKaoBei extends fgui.GButton{
	}
	class BtnMore extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class BtnRank extends fgui.GButton{
	}
	class BtnShuaXin extends fgui.GButton{
	}
	class BtnShuRu extends fgui.GButton{
	}
	class BtnWearWeapon extends fgui.GButton{
		public noneView:fgui.GGroup;
		public lbName:fgui.GTextField;
		public curView:fgui.GGroup;
		public T_tips:fgui.GTextField;
		public gTip:fgui.GGroup;
		public iconItem:ui.comm.item.WeaponBaseItem;
		public redDot:ui.comm.com.RedDot;
	}
	class ButtonUse1 extends fgui.GButton{
		public bgNotUse:fgui.GImage;
		public bgCanUse:fgui.GImage;
		public Title:fgui.GTextField;
	}
	class CloseBtn extends fgui.GButton{
	}
	class CloseHintBtn extends fgui.GButton{
	}
	class CommonBtn1 extends fgui.GButton{
		public bg:fgui.GLoader;
	}
	class ComonBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class EmptyBtn extends fgui.GComponent{
	}
	class GoToBackButton_1 extends fgui.GButton{
	}
	class HeroSelectBtn extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
	class JumpBtn extends fgui.GButton{
		public bg:fgui.GImage;
	}
	class LabelBtn extends fgui.GButton{
		public line:fgui.GImage;
	}
	class PlayerInfoInfoHeroWeaponItem extends fgui.GButton{
		public noneView:fgui.GGroup;
		public lbName:fgui.GTextField;
		public curView:fgui.GGroup;
		public iconItem:ui.comm.item.WeaponBaseItem;
	}
	class RightTabBtn extends fgui.GButton{
		public imageTab:fgui.GLoader;
	}
	class UnlockByCostItemBtn extends fgui.GButton{
		public imageBtnConfirm:fgui.GImage;
		public labelTips:fgui.GTextField;
		public labelUnlockTitle:fgui.GTextField;
		public imageCostItem:fgui.GLoader;
		public labelCostCount:fgui.GTextField;
	}
}
declare namespace ui.comm.btn.BaseBtn0 {
	class 8Scale extends fgui.GButton{
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.comm.building {
	class BuildingAreaNode extends fgui.GComponent{
	}
	class BuildingBtn extends fgui.GButton{
	}
	class BuildingNameCom extends fgui.GComponent{
		public nameTxt:fgui.GTextField;
		public T_time:fgui.GTextField;
	}
	class BuildingNode extends fgui.GComponent{
		public image:fgui.GLoader;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public redDot:ui.comm.com.RedDot;
	}
	class GateNode extends fgui.GComponent{
		public emptyBtn:ui.comm.btn.EmptyBtn;
	}
}
declare namespace ui.comm.captainSkill {
	class CaptainSkillOneComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public imageSkill:fgui.GLoader;
		public fgMask:fgui.GImage;
		public fgMaxLv:fgui.GImage;
		public labelLv:fgui.GTextField;
		public labelLock:fgui.GTextField;
		public gOccupy:fgui.GGroup;
	}
	class CaptionSkillCommonBattleComp extends fgui.GComponent{
		public useComp:ui.comm.captainSkill.components.CaptainSkillCanUseComp;
		public cdComp:ui.comm.captainSkill.components.CaptainSkillInCdComp;
	}
}
declare namespace ui.comm.captainSkill.components {
	class CaptainSkillCanUseComp extends fgui.GButton{
		public bg:fgui.GImage;
		public imageSkill:fgui.GImage;
		public labelText:fgui.GTextField;
	}
	class CaptainSkillInCdComp extends fgui.GButton{
		public bg:fgui.GImage;
		public imageSkill:fgui.GImage;
		public labelLv:fgui.GTextField;
		public bar:ui.comm.captainSkill.progressBar.CaptionSkillCommonBattleProgressBar;
	}
}
declare namespace ui.comm.captainSkill.progressBar {
	class CaptionSkillCommonBattleProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.comm.com {
	class JoystickCom extends fgui.GComponent{
		public dirGp:fgui.GGroup;
		public centerNode:fgui.GImage;
	}
	class Node extends fgui.GComponent{
	}
	class RedDot extends fgui.GComponent{
		public redDot:fgui.GLoader;
		public modelNode:ui.comm.node.ModelNode;
	}
	class TeamDirectionCom extends fgui.GComponent{
	}
}
declare namespace ui.comm.fightNum {
	class FightNumComp extends fgui.GComponent{
		public labelFightNum:fgui.GTextField;
	}
}
declare namespace ui.comm.footer {
	class CommonFooterView extends fgui.GComponent{
		public pageList:fgui.GList;
		public moreBtn:ui.comm.btn.BtnMore;
		public btnBack:ui.comm.back.BackIcon;
	}
}
declare namespace ui.comm.footer.btn {
	class HangUpEntryBtn extends fgui.GButton{
		public spineRoot:fgui.GLoader;
		public bgTitle:fgui.GImage;
		public labelLock:fgui.GTextField;
		public G_lock:fgui.GGroup;
		public charList:fgui.GList;
		public labelLevelId:fgui.GTextField;
		public labelAddLevelCount:fgui.GTextField;
		public G_inBg:fgui.GGroup;
		public labelDesc:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public G_unlock:fgui.GGroup;
		public labelInBgEnd:fgui.GTextField;
		public G_inBgEnd:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
		public btnDialog:ui.comm.hangUp.HangUpGainBoxDialogBtn;
	}
	class PageBtn extends fgui.GButton{
		public iconNormal:fgui.GLoader;
		public iconPress:fgui.GLoader;
		public lock:fgui.GImage;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.comm.footer.com {
	class ScheduleCom extends fgui.GButton{
		public labelDesc:fgui.GTextField;
		public labelTitle:fgui.GTextField;
	}
}
declare namespace ui.comm.footer.item {
	class HangUpSmallCharItemComp extends fgui.GComponent{
		public labelChar:fgui.GTextField;
	}
}
declare namespace ui.comm.formation {
	class FormationSkillIcon extends fgui.GComponent{
		public bgQuality:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public lbLv:fgui.GTextField;
	}
	class FormationSkillInfo extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbName:fgui.GTextField;
		public setP:fgui.GGroup;
		public lbNone:fgui.GTextField;
		public pInfo:ui.comm.formation.FormationSkillIcon;
	}
	class FormationSkillSelectItem extends fgui.GComponent{
		public bgSelect:fgui.GImage;
		public bgQuality:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public listStar:fgui.GList;
		public gOccupy:fgui.GGroup;
		public lbLv:fgui.GTextField;
	}
	class FormationSkillSetComp extends fgui.GButton{
		public bgMask:fgui.GImage;
		public bg:fgui.GImage;
		public gNone:fgui.GGroup;
		public imageChange:fgui.GImage;
		public pInfo:ui.comm.formation.FormationSkillIcon;
	}
}
declare namespace ui.comm.hangUp {
	class HangUpGainBoxDialogBtn extends fgui.GButton{
		public bg1:fgui.GImage;
		public bg2:fgui.GImage;
		public btnBox:ui.comm.hangUp.HangUpPreviewBoxBtn;
	}
	class HangUpPreviewBoxBtn extends fgui.GButton{
	}
}
declare namespace ui.comm.header {
	class HeaderItem extends fgui.GButton{
		public bgBuy:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public imageBuy:fgui.GImage;
	}
	class HeaderItem2 extends fgui.GLabel{
		public imageBuy:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public progressBarItem:ui.comm.header.comp.HeaderItemProgressBar;
	}
	class HeaderItem3 extends fgui.GButton{
		public bgBuy:fgui.GImage;
		public labelItemCount:fgui.GTextField;
		public imageItem:fgui.GLoader;
		public imageBuy:fgui.GImage;
	}
	class HeadItemCompV2 extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelItemCount:fgui.GTextField;
		public imageItem:fgui.GLoader;
	}
	class resoureceBtn extends fgui.GButton{
		public iconImg:fgui.GLoader;
		public labelItemCount:fgui.GTextField;
	}
}
declare namespace ui.comm.header.comp {
	class HeaderItemProgressBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class HeaderItemProgressBar2 extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
}
declare namespace ui.comm.hero {
	class HeroAvatar extends fgui.GComponent{
		public imageBg:fgui.GLoader;
		public imageHero:fgui.GLoader;
	}
	class HeroDetailsAvatar extends fgui.GComponent{
		public imageBg:fgui.GLoader;
		public imageHero:fgui.GLoader;
		public list_star:fgui.GList;
		public starMc:fgui.GGroup;
		public lvLab:fgui.GTextField;
	}
}
declare namespace ui.comm.hero.components {
	class CommonCollectionSkillItem extends fgui.GButton{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_skill:ui.comm.hero.components.skillIconMask;
	}
	class CommonHeroItemComp extends fgui.GComponent{
		public img_quality:fgui.GLoader;
		public img_hero:fgui.GLoader;
		public img_camp:fgui.GLoader;
		public T_name:fgui.GTextField;
		public list_star:fgui.GList;
		public G_star:fgui.GGroup;
		public T_level:fgui.GTextField;
		public G_Level:fgui.GGroup;
	}
	class CommonPetSkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_bs:fgui.GImage;
		public img_skill:ui.comm.hero.components.skillIconMask;
	}
	class HeroSkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public T_level:fgui.GTextField;
		public img_bs:fgui.GImage;
		public lbLockTip:fgui.GTextField;
		public img_skill:ui.comm.hero.components.skillIconMask;
	}
	class skillIconMask extends fgui.GComponent{
		public img_skill:fgui.GLoader;
	}
}
declare namespace ui.comm.hp {
	class AttackerHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class BossHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class DefenderHpBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
	}
	class RebirthItem extends fgui.GComponent{
		public img_ax:fgui.GImage;
	}
}
declare namespace ui.comm.item {
	class CommonItemSmallCostComp extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public labelCount:fgui.GTextField;
	}
	class CommonItemSmallCostComp1 extends fgui.GComponent{
		public imageItem:fgui.GLoader;
		public labelCount:fgui.GTextField;
	}
	class EquipItem extends fgui.GComponent{
		public img_sel:fgui.GLoader;
		public img_frame:fgui.GLoader;
		public img_di:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_suo:fgui.GImage;
		public T_level:fgui.GTextField;
		public maskFg:fgui.GGraph;
		public imageGou:fgui.GImage;
		public gp_gou:fgui.GGroup;
		public redDot:ui.comm.com.RedDot;
	}
	class HeroBaseItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_career:fgui.GLoader;
		public img_camp:fgui.GLoader;
		public list_star:fgui.GList;
		public T_level:fgui.GTextField;
	}
	class HeroHeadSkillItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public fg:fgui.GLoader;
		public bgMask:fgui.GImage;
		public title:fgui.GTextField;
		public img_zz:fgui.GImage;
		public loopEffectNode:ui.comm.node.ModelNode;
		public hitEffectNode:ui.comm.node.ModelNode;
		public heroComp:ui.comm.item.HeroMaskComp;
		public nodePoint:ui.comm.com.Node;
	}
	class HeroItem extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public img_career:fgui.GLoader;
		public img_camp:fgui.GLoader;
		public T_level:fgui.GTextField;
		public T_name:fgui.GTextField;
		public list_star:fgui.GList;
		public G_star:fgui.GGroup;
		public G_gou:fgui.GGroup;
		public G_smallCheck:fgui.GGroup;
		public isGet:fgui.GGroup;
		public bgLock:fgui.GImage;
		public imageLock:fgui.GImage;
		public G_lock:fgui.GGroup;
		public bgLock:fgui.GImage;
		public lbLockTip:fgui.GTextField;
		public G_lockTip:fgui.GGroup;
		public dnaShow:ui.hero.item.HeroDnaLittleComp;
	}
	class HeroItemHpProgress extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
	class HeroItemWithHp extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public G_gou:fgui.GGroup;
		public bgLock:fgui.GImage;
		public lbLockTip:fgui.GTextField;
		public G_lockTip:fgui.GGroup;
		public gHero:fgui.GGroup;
		public lbNoneTip:fgui.GTextField;
		public gNone:fgui.GGroup;
		public hpBar:ui.comm.item.HeroItemHpProgress;
		public baseItem:ui.comm.item.HeroBaseItem;
	}
	class HeroMaskComp extends fgui.GComponent{
		public imageHero:fgui.GLoader;
	}
	class HeroSelectItem extends fgui.GComponent{
		public list_camp:fgui.GList;
		public list_career:fgui.GList;
		public btn_tab:ui.comm.btn.BaseBtn;
	}
	class IconItem extends fgui.GComponent{
		public itemIcon:fgui.GLoader;
	}
	class ItemFrame extends fgui.GComponent{
		public img_frame:fgui.GLoader;
		public img_item:fgui.GLoader;
		public T_num:fgui.GTextField;
		public T_topNum2:fgui.GTextField;
		public maskFg:fgui.GGraph;
		public imageGou:fgui.GImage;
		public T_lockAndDesc:fgui.GTextField;
		public i:fgui.GImage;
		public T_name:fgui.GTextField;
	}
	class ItemFrameBtn extends fgui.GButton{
		public item:ui.comm.item.ItemFrame;
		public modelNode1:ui.comm.node.ModelNode;
		public modelNode2:ui.comm.node.ModelNode;
		public modelNode3:ui.comm.node.ModelNode;
		public redDot:ui.comm.com.RedDot;
	}
	class ItemFrameBtnWithBubble extends fgui.GButton{
		public bg:fgui.GImage;
		public lb:fgui.GTextField;
		public bubble:fgui.GGroup;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
	class ItemFrameBtnWithExtra extends fgui.GButton{
		public iconExtra:fgui.GImage;
		public lbFrist:fgui.GTextField;
		public pExtra:fgui.GGroup;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
	class ItemFrameBtnWithFirst extends fgui.GButton{
		public iconFirst:fgui.GImage;
		public iconFirst2:fgui.GImage;
		public iconFirst3:fgui.GImage;
		public iconFirst4:fgui.GImage;
		public lbFrist:fgui.GTextField;
		public pFirst:fgui.GGroup;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
	class ItemFrameBtnWithLimit extends fgui.GButton{
		public iconLimit:fgui.GImage;
		public itemFrame:ui.comm.item.ItemFrameBtn;
	}
	class ItemFrameStateBtn extends fgui.GComponent{
		public item:ui.comm.item.ItemFrameBtn;
		public redDot1:ui.comm.com.RedDot;
	}
	class ItemIconWithChooseCheck extends fgui.GComponent{
		public T_name:fgui.GTextField;
		public btn_sel:fgui.GLoader;
		public itemIcon:ui.comm.item.ItemFrameBtn;
	}
	class ItemIconWithChooseCount extends fgui.GComponent{
		public chooseView:ui.comm.progressBar.ButtonBoxChooseCountView;
		public itemIcon:ui.comm.item.ItemFrameBtn;
	}
	class ItemListComp extends fgui.GComponent{
		public itemList:fgui.GList;
	}
	class ItemListComp2 extends fgui.GComponent{
		public itemList:fgui.GList;
	}
	class ItemTextComp extends fgui.GComponent{
		public imageCostItem:fgui.GLoader;
		public labelCount:fgui.GTextField;
	}
	class JumpItem extends fgui.GComponent{
		public bg:fgui.GImage;
		public list_jump:fgui.GList;
		public labelTitle:fgui.GTextField;
		public btnData:ui.comm.btn.BaseBtn;
	}
	class SoltItem extends fgui.GComponent{
		public img_quality:fgui.GLoader;
		public imgAdd:fgui.GImage;
		public T_level:fgui.GTextField;
		public T_unlockLevel:fgui.GTextField;
		public anim:ui.comm.node.ModelNode;
	}
	class StarIconItem extends fgui.GComponent{
		public starIcon:fgui.GLoader;
	}
	class WeaponBagItem extends fgui.GComponent{
		public iconUser:fgui.GImage;
		public lbUser:fgui.GTextField;
		public baseItem:ui.comm.item.WeaponBaseItem;
	}
	class WeaponBaseItem extends fgui.GComponent{
		public bg:fgui.GLoader;
		public iconLoader:fgui.GLoader;
		public bgStar:fgui.GImage;
		public listIcon:fgui.GList;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.comm.itemText {
	class CommonSmallItemTextComp extends fgui.GComponent{
		public imageNextLevelRewardItem:fgui.GLoader;
		public labelNextLevelRewardCount:fgui.GTextField;
	}
}
declare namespace ui.comm.miniMap {
	class MaskItem extends fgui.GComponent{
		public mapBg:fgui.GLoader;
		public mapItem:ui.comm.miniMap.MiniMapShowBuildingItem;
	}
	class MiniMapAreaItem extends fgui.GComponent{
	}
	class MiniMapIconItem extends fgui.GComponent{
		public itemIcon:fgui.GLoader;
		public arrow:fgui.GLoader;
		public lbLv:fgui.GTextField;
	}
	class MiniMapItem extends fgui.GComponent{
		public map:ui.comm.miniMap.MaskItem;
		public redDot:ui.comm.com.RedDot;
	}
	class MiniMapShowBuildingItem extends fgui.GComponent{
		public map0:fgui.GLoader;
		public map:fgui.GGroup;
	}
}
declare namespace ui.comm.moduleComp {
	class ModuleJumpBtn extends fgui.GButton{
		public imageModule:fgui.GLoader;
		public redPoint:fgui.GImage;
	}
}
declare namespace ui.comm.node {
	class AnimNode extends fgui.GComponent{
		public anim:fgui.GLoader;
	}
	class ModelNode extends fgui.GComponent{
	}
	class VideoNode extends fgui.GComponent{
	}
}
declare namespace ui.comm.pet {
	class PetCellH extends fgui.GButton{
		public bg:fgui.GLoader;
		public petIcon:fgui.GLoader;
		public iconRefresh:fgui.GImage;
		public stars:fgui.GList;
	}
	class PetCellV extends fgui.GButton{
		public bg:fgui.GLoader;
		public petIcon:fgui.GLoader;
		public stars:fgui.GList;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.comm.playerInfo {
	class PlayerAvatar extends fgui.GButton{
		public bg:fgui.GLoader;
		public imagePlayerAvatar:fgui.GLoader;
		public imageFrame:fgui.GLoader;
		public lvLab:fgui.GTextField;
	}
}
declare namespace ui.comm.progressBar {
	class ButtonBoxChooseCountView extends fgui.GComponent{
		public count:fgui.GTextField;
		public buttonAdd:ui.comm.progressBar.components.ButtonProgressBarAdd;
		public buttonMinus:ui.comm.progressBar.components.ButtonProgressBarMinus;
	}
	class ButtonBoxChooseCountView2 extends fgui.GComponent{
		public count:fgui.GTextField;
		public btn_add:ui.comm.btn.BaseBtn;
		public btn_add10:ui.comm.btn.BaseBtn;
		public btn_minus:ui.comm.btn.BaseBtn;
		public btn_minus10:ui.comm.btn.BaseBtn;
		public btn_max:ui.comm.btn.BaseBtn;
	}
	class ProgressBarCommonView extends fgui.GComponent{
		public bar:ui.comm.progressBar.components.ProgressBar;
		public buttonMinus:ui.comm.progressBar.components.ButtonProgressBarMinus;
		public buttonAdd:ui.comm.progressBar.components.ButtonProgressBarAdd;
	}
}
declare namespace ui.comm.progressBar.components {
	class ButtonProgressBarAdd extends fgui.GButton{
	}
	class ButtonProgressBarMinus extends fgui.GButton{
	}
	class ProgressBar extends fgui.GSlider{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
		public grip:ui.comm.progressBar.components.ProgressBar_button;
	}
	class ProgressBar_button extends fgui.GButton{
	}
	class ProgressBar2 extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
		public fakeScoreBar:fgui.GImage;
	}
	class ProgressBar3 extends fgui.GProgressBar{
		public bg:fgui.GImage;
		public bar:fgui.GImage;
		public title:fgui.GTextField;
		public itemIcon:fgui.GLoader;
	}
}
declare namespace ui.comm.pvp {
	class CommonPVPRankSmallLogoComp extends fgui.GComponent{
		public imageRankLogo:fgui.GLoader;
		public starComp:ui.comm.pvp.CommonPVPRankStarListComp;
	}
	class CommonPVPRankStarComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
	}
	class CommonPVPRankStarListComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public starList:fgui.GList;
	}
}
declare namespace ui.comm.rank {
	class CommonRankSubTabBtn extends fgui.GButton{
		public imageColLine:fgui.GImage;
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class CommonSubTabListComp extends fgui.GComponent{
		public btnList:fgui.GList;
	}
	class RankTop3Comp extends fgui.GComponent{
		public imageRank1:fgui.GImage;
		public imageRank2:fgui.GImage;
		public imageRank3:fgui.GImage;
		public labelRankValue:fgui.GTextField;
		public labelGodLayerNum:fgui.GTextField;
		public G_god:fgui.GGroup;
		public labelPVPScore:fgui.GTextField;
		public lbGuardShip:fgui.GTextField;
		public G_guardShip:fgui.GGroup;
		public lbTeam:fgui.GTextField;
		public G_team:fgui.GGroup;
		public lblSIFloor:fgui.GTextField;
		public lblSITime:fgui.GTextField;
		public G_secretInstance:fgui.GGroup;
		public lbCDStar:fgui.GTextField;
		public G_collectiblesDungeon:fgui.GGroup;
		public rankValueP:fgui.GGroup;
		public labelNoPersonTips:fgui.GTextField;
		public noP:fgui.GGroup;
		public labelPlayerName:fgui.GTextField;
		public haveP:fgui.GGroup;
		public modelNode:ui.comm.node.ModelNode;
		public pvpScoreComp:ui.comm.pvp.CommonPVPRankSmallLogoComp;
		public rankValueWithLogoComp:ui.comm.rank.RankValueWithLogoComp;
		public leagueFlag:ui.comm1.league.LeagueFlagComp;
		public titleComp:ui.comm1.player.PlayerTitleSmallComp;
	}
	class RankValueWithLogoComp extends fgui.GComponent{
		public imageRankSmallLogo:fgui.GLoader;
		public labelRankValueWithLogo:fgui.GTextField;
	}
}
declare namespace ui.comm.reconnect {
	class ReconnectWin extends fgui.GComponent{
		public bgBtn:fgui.GGraph;
		public tipsTxt:fgui.GTextField;
	}
}
declare namespace ui.comm.scrollText {
	class scrollTextV extends fgui.GLabel{
	}
}
declare namespace ui.comm.tips {
	class TargetDownArrowComponent extends fgui.GComponent{
		public imageArrowToTarget:fgui.GLoader;
	}
}
declare namespace ui.comm.view {
	class CornerMark extends fgui.GComponent{
		public bg:fgui.GImage;
		public lbTip:fgui.GTextField;
		public gAll:fgui.GGroup;
	}
	class GetItemAnimView extends fgui.GComponent{
		public item:ui.comm.item.IconItem;
	}
	class JoystickView extends fgui.GComponent{
		public joystick:ui.comm.com.JoystickCom;
		public teamDir:ui.comm.com.TeamDirectionCom;
		public nodePoint:ui.comm.com.Node;
	}
	class LoadingCom extends fgui.GComponent{
		public modelNode:ui.comm.node.ModelNode;
	}
	class LoadingWin extends fgui.GComponent{
		public tipsTxt:fgui.GTextField;
		public loadingCom:ui.comm.view.LoadingCom;
	}
	class PlayerCom extends fgui.GComponent{
		public bgPower:fgui.GImage;
		public T_power:fgui.GTextField;
		public lvContent:fgui.GTextField;
		public lbName:fgui.GTextField;
		public avatar:ui.comm.playerInfo.PlayerAvatar;
		public redDot:ui.comm.com.RedDot;
	}
	class TouchMaskWin extends fgui.GComponent{
	}
	class TransferAnimWin extends fgui.GComponent{
		public airshipNode:ui.comm.node.ModelNode;
	}
	class UnlockBuildingAnimWin extends fgui.GComponent{
	}
}
