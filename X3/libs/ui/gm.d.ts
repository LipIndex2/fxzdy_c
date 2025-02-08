declare namespace ui.gm {
	class BattleAttrOneItem extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class BattleLogOneItem extends fgui.GComponent{
		public img_jdt:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class BattleLogView extends fgui.GComponent{
		public list:fgui.GList;
		public title:fgui.GTextField;
		public timeLab:fgui.GTextField;
		public list2:fgui.GList;
		public leftBtn:ui.comm.btn.BtnJianTou4;
		public rightBtn:ui.comm.btn.BtnJianTou4;
		public closeBtn:ui.comm.btn.CloseBtn;
		public stopBtn:ui.comm.btn.BtnGreen2;
		public logBtn:ui.comm.btn.BtnGreen2;
		public attrBtn:ui.comm.btn.BtnGreen2;
	}
	class BattleTestView extends fgui.GComponent{
		public closeBtn:ui.comm.btn.BtnConfirm;
		public stopEnemyBtn:ui.comm.btn.BtnConfirm;
		public stopSelfBtn:ui.comm.btn.BtnConfirm;
		public onlyNormalBtn:ui.comm.btn.BtnConfirm;
		public skill2Btn:ui.comm.btn.BtnConfirm;
		public skill3Btn:ui.comm.btn.BtnConfirm;
		public skillSwitchBtn:ui.comm.btn.BtnConfirm;
		public notHurtBtn:ui.comm.btn.BtnConfirm;
		public skill4Btn:ui.comm.btn.BtnConfirm;
		public testBtn2:ui.comm.btn.BtnConfirm;
		public testBtn1:ui.comm.btn.BtnConfirm;
		public testBtn3:ui.comm.btn.BtnConfirm;
		public skill5btn:ui.comm.btn.BtnConfirm;
	}
	class buttonAddItem extends fgui.GButton{
	}
	class ButtonGmTypeView extends fgui.GButton{
		public imageNoChoose:fgui.GImage;
		public imageChoose:fgui.GImage;
		public laelTitle:fgui.GTextField;
	}
	class GMFightItem extends fgui.GComponent{
		public idInput:fgui.GTextInput;
		public skillInput:fgui.GTextInput;
		public monsterInput:fgui.GTextInput;
		public title:fgui.GTextField;
		public idListBtn:ui.comm.btn.BtnFh1;
		public monsterListBtn:ui.comm.btn.BtnFh1;
	}
	class GMFightView extends fgui.GComponent{
		public jsonInput:fgui.GTextInput;
		public heroAttr:fgui.GGroup;
		public btnOk:ui.gm.common.BtnGm;
		public copyBtn:ui.gm.common.BtnGm;
		public item1_1:ui.gm.GMFightItem;
		public item1_2:ui.gm.GMFightItem;
		public item1_3:ui.gm.GMFightItem;
		public item1_4:ui.gm.GMFightItem;
		public item1_5:ui.gm.GMFightItem;
		public item1_6:ui.gm.GMFightItem;
		public item2_1:ui.gm.GMFightItem;
		public item2_2:ui.gm.GMFightItem;
		public item2_3:ui.gm.GMFightItem;
		public item2_4:ui.gm.GMFightItem;
		public item2_5:ui.gm.GMFightItem;
		public item2_6:ui.gm.GMFightItem;
	}
	class GMGuideView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public heroAttr:fgui.GGroup;
		public heroAttrInputBox:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
	}
	class GMHeroAttrView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public heroAttr:fgui.GGroup;
		public heroAttrInputBox:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
	}
	class GMItemView extends fgui.GComponent{
		public itemList:fgui.GList;
		public titleItemId:fgui.GTextField;
		public inputItemId:fgui.GTextInput;
		public titleItemCount:fgui.GTextField;
		public inputItemCount:fgui.GTextInput;
		public inputItemName:fgui.GTextInput;
		public buttonAddItem:ui.gm.buttonAddItem;
		public btnSwitchItemIconSize:ui.gm.buttonAddItem;
		public gotoFight:ui.gm.buttonAddItem;
		public gotoBianQiang:ui.gm.buttonAddItem;
	}
	class GMTransferMapView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public heroAttr:fgui.GGroup;
		public heroAttrInputBox:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
	}
	class GMUnlockBuildingView extends fgui.GComponent{
		public labelTitle:fgui.GTextField;
		public heroAttr:fgui.GGroup;
		public heroAttrInputBox:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
	}
	class GMView extends fgui.GComponent{
		public background:fgui.GLoader;
		public foreground:fgui.GImage;
		public gmTypeList:fgui.GList;
		public title:fgui.GTextField;
		public labelServerOpenTime:fgui.GTextField;
		public labelServerTime:fgui.GTextField;
		public labelPlayerId:fgui.GTextField;
		public labelServerId:fgui.GTextField;
		public all:fgui.GGroup;
		public gmOneKeyButtonChildView:ui.gm.oneKey.GMOneKeyButtonChildView;
		public gmItenView:ui.gm.GMItemView;
		public gmAssetCheckerChildView:ui.gm.assetChecker.GMAssetCheckerChildView;
		public gmSpineChecker:ui.gm.spineChecker.GMSpineCheckerView;
		public gmEmailView:ui.gm.email.GMEmailView;
		public gmServerTimeView:ui.gm.serverTime.GMAddServerTimeView;
		public gmTask:ui.gm.task.GMTaskView;
		public labelTitle:ui.gm.GMHeroAttrView;
		public dradCardGainNewHero:ui.gm.drawCard.DrawCardTestNewHeroComp;
		public level:ui.gm.level.GMLevelView;
		public jjc:ui.gm.pvp.GMPVPScoreView;
	}
	class iconItem extends fgui.GButton{
		public bg:fgui.GLoader;
		public itemIcon:fgui.GLoader;
		public labelItemId:fgui.GTextField;
		public itemName:fgui.GTextField;
	}
}
declare namespace ui.gm.assetChecker {
	class GMAssetCheckerChildView extends fgui.GComponent{
		public titleBundleName:fgui.GTextField;
		public inputBundleName:fgui.GTextInput;
		public titleAssetName:fgui.GTextField;
		public inputAssetName:fgui.GTextInput;
		public imageCheck:fgui.GLoader;
		public btnCheck:ui.gm.common.BtnGm;
	}
}
declare namespace ui.gm.buildingEditor {
	class BuildingEditorView extends fgui.GComponent{
		public idTxt:fgui.GTextField;
		public pathTxt:fgui.GTextField;
		public inputTxt:fgui.GTextInput;
		public posTxt:fgui.GTextField;
		public gp:fgui.GGroup;
		public upBtn:ui.comm.btn.BaseBtn;
		public downBtn:ui.comm.btn.BaseBtn;
		public leftBtn:ui.comm.btn.BaseBtn;
		public rightBtn:ui.comm.btn.BaseBtn;
		public closeBtn:ui.comm.btn.BaseBtn;
	}
	class MapBlockExportView extends fgui.GComponent{
		public inputSizeTxt:fgui.GTextInput;
		public inputNameTxt:fgui.GTextInput;
		public gp:fgui.GGroup;
		public closeBtn:ui.comm.btn.BaseBtn;
		public saveBtn:ui.gm.common.yellowBtn;
	}
	class MapInfoView extends fgui.GComponent{
		public inputX:fgui.GTextInput;
		public inputY:fgui.GTextInput;
		public idTxt:fgui.GTextField;
		public posTxt:fgui.GTextField;
		public sizeTxt:fgui.GTextField;
		public gp:fgui.GGroup;
		public closeBtn:ui.comm.btn.BaseBtn;
		public copyBtn:ui.gm.buttonAddItem;
		public ghostBtn:ui.gm.buttonAddItem;
	}
}
declare namespace ui.gm.common {
	class BtnCheckBox extends fgui.GButton{
		public bgUp:fgui.GImage;
		public bgDown:fgui.GImage;
		public titleUp:fgui.GTextField;
		public titleDown:fgui.GTextField;
	}
	class BtnGm extends fgui.GButton{
		public bg:fgui.GImage;
		public fg:fgui.GImage;
		public labelTitle:fgui.GTextField;
	}
	class GMInputBoxComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public inputName:fgui.GTextInput;
	}
	class InputBox1 extends fgui.GComponent{
		public bg:fgui.GImage;
		public inputName:fgui.GTextInput;
	}
	class inputBoxComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public inputName:fgui.GTextInput;
	}
	class inputEditBoxComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelTitle:fgui.GTextField;
		public inputName:fgui.GTextInput;
	}
	class inputEditBoxContentComp extends fgui.GComponent{
		public bg:fgui.GImage;
		public inputName:fgui.GTextInput;
	}
	class Text2PartComp extends fgui.GComponent{
		public label1:fgui.GTextField;
		public label2:fgui.GTextField;
	}
	class yellowBtn extends fgui.GButton{
	}
}
declare namespace ui.gm.drawCard {
	class DrawCardTestNewHeroComp extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public heroList:fgui.GList;
		public input1:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
		public btnCheck:ui.gm.common.BtnGm;
	}
}
declare namespace ui.gm.email {
	class GMEmailView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public btnOk:ui.gm.common.BtnGm;
		public inputBoxTitle:ui.gm.common.inputBoxComp;
		public inputBoxSendTimeMs:ui.gm.common.inputBoxComp;
		public inputBoxExpireTimeMs:ui.gm.common.inputBoxComp;
		public inputBoxRewardText:ui.gm.common.inputBoxComp;
		public inputBoxContent:ui.gm.common.inputEditBoxComp;
	}
}
declare namespace ui.gm.fight {
	class GMFightSelectItem extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class GMFightSelectList extends fgui.GComponent{
		public list:fgui.GList;
	}
}
declare namespace ui.gm.hotUpdate {
	class SetHotUpdateView extends fgui.GComponent{
		public inputNameTxt:fgui.GTextInput;
		public gp:fgui.GGroup;
		public closeBtn:ui.comm.btn.BaseBtn;
		public saveBtn:ui.gm.common.yellowBtn;
		public reloadBtn:ui.gm.common.yellowBtn;
	}
}
declare namespace ui.gm.item {
	class GMAddItemTextView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public inputItem:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
	}
}
declare namespace ui.gm.level {
	class GMLevelView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public btnOk:ui.gm.common.BtnGm;
		public inputLevel:ui.gm.common.inputBoxComp;
	}
}
declare namespace ui.gm.oneClickStronger {
	class GMOneClickStrongerView extends fgui.GComponent{
		public idInput:fgui.GTextInput;
		public input_id1:fgui.GTextInput;
		public input_id2:fgui.GTextInput;
		public input_id3:fgui.GTextInput;
		public input_id4:fgui.GTextInput;
		public input_id5:fgui.GTextInput;
		public input_id6:fgui.GTextInput;
		public input_star1:fgui.GTextInput;
		public input_star2:fgui.GTextInput;
		public input_star3:fgui.GTextInput;
		public input_star4:fgui.GTextInput;
		public input_star5:fgui.GTextInput;
		public input_star6:fgui.GTextInput;
		public input_level1:fgui.GTextInput;
		public input_level2:fgui.GTextInput;
		public input_level3:fgui.GTextInput;
		public input_level4:fgui.GTextInput;
		public input_level5:fgui.GTextInput;
		public input_level6:fgui.GTextInput;
		public input_equip1:fgui.GTextInput;
		public input_equip4:fgui.GTextInput;
		public input_equip2:fgui.GTextInput;
		public input_equip5:fgui.GTextInput;
		public input_equip3:fgui.GTextInput;
		public input_equip6:fgui.GTextInput;
		public input_equip7:fgui.GTextInput;
		public input_equip8:fgui.GTextInput;
		public input_equip9:fgui.GTextInput;
		public input_talentLevel1:fgui.GTextInput;
		public input_talentLevel2:fgui.GTextInput;
		public input_useCaptain:fgui.GTextInput;
		public list_Captain:fgui.GList;
		public input_trunkInstanceId:fgui.GTextInput;
		public input_trunkTaskId:fgui.GTextInput;
		public input_sortId:fgui.GTextInput;
		public input_dayBoss:fgui.GTextInput;
		public input_Secret:fgui.GTextInput;
		public input_LadderFloor:fgui.GTextInput;
		public input_usePetId:fgui.GTextInput;
		public input_activePetIds:fgui.GTextInput;
		public input_petLevel:fgui.GTextInput;
		public input_petStage:fgui.GTextInput;
		public list_magicCube:fgui.GList;
		public list_magicCubeLevel:fgui.GList;
		public input_activePetStars:fgui.GTextInput;
		public input_useCollectiblesId:fgui.GTextInput;
		public input_activeCollectiblesIds:fgui.GTextInput;
		public input_activeCollectiblesLevels:fgui.GTextInput;
		public input_activeCollectiblesStars:fgui.GTextInput;
		public btnOk:ui.gm.common.yellowBtn;
		public item_select:ui.gm.oneClickStronger.GMSelectList;
		public btnOk2:ui.gm.common.yellowBtn;
		public idListBtn:ui.comm.btn.BtnFh1;
	}
	class GMSelectItem extends fgui.GComponent{
		public title:fgui.GTextField;
	}
	class GMSelectList extends fgui.GComponent{
		public list:fgui.GList;
	}
	class InputItem1 extends fgui.GComponent{
		public input_useCaptain:fgui.GTextInput;
		public title:fgui.GTextField;
	}
}
declare namespace ui.gm.oneKey {
	class GMOneKeyButtonChildView extends fgui.GComponent{
		public btnList:fgui.GList;
		public inputName:fgui.GTextInput;
	}
}
declare namespace ui.gm.performance {
	class PerformanceView extends fgui.GComponent{
		public gp:fgui.GGroup;
		public closeBtn:ui.comm.btn.BaseBtn;
		public frameRate30Btn:ui.gm.common.yellowBtn;
		public frameRate60Btn:ui.gm.common.yellowBtn;
		public showframeRateBtn:ui.gm.common.yellowBtn;
		public logBtn:ui.gm.common.yellowBtn;
		public hideRoleBtn:ui.gm.common.yellowBtn;
		public hideEffectBtn:ui.gm.common.yellowBtn;
		public hideMapBtn:ui.gm.common.yellowBtn;
		public removeOrnamentBtn:ui.gm.common.yellowBtn;
		public areaTreeBtn:ui.gm.common.yellowBtn;
		public hideMainBtn:ui.gm.common.yellowBtn;
		public gcBtn:ui.gm.common.yellowBtn;
		public resourceBtn:ui.gm.common.yellowBtn;
		public aiBtn:ui.gm.common.yellowBtn;
		public pointTreeBtn:ui.gm.common.yellowBtn;
	}
}
declare namespace ui.gm.pvp {
	class GMPVPScoreView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public labelTips:fgui.GRichTextField;
		public btnOk:ui.gm.common.BtnGm;
		public inputScore:ui.gm.common.inputBoxComp;
	}
}
declare namespace ui.gm.serverTime {
	class GMAddServerTimeView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public title1:fgui.GRichTextField;
		public title2:fgui.GRichTextField;
		public btnOk:ui.gm.common.BtnGm;
		public labelCurDate:ui.gm.common.GMInputBoxComp;
		public labelCurTime:ui.gm.common.GMInputBoxComp;
		public labelSetDate:ui.gm.common.GMInputBoxComp;
		public labelSetTime:ui.gm.common.GMInputBoxComp;
	}
}
declare namespace ui.gm.spineChecker {
	class GMSpineCheckerView extends fgui.GComponent{
		public labelTitleSpineName:fgui.GTextField;
		public labelTitleSpineState:fgui.GTextField;
		public btnSwitch:ui.gm.common.BtnGm;
		public rootForSpine:ui.comm.btn.EmptyBtn;
		public btnPlay:ui.gm.common.BtnGm;
		public inputBoxForSpineName:ui.gm.common.InputBox1;
		public inputBoxForSpineAnimName:ui.gm.common.InputBox1;
		public checkBoxLoop:ui.gm.common.BtnCheckBox;
	}
}
declare namespace ui.gm.task {
	class GMTaskView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public btnOk:ui.gm.common.BtnGm;
		public inputBoxTaskType:ui.gm.common.inputBoxComp;
		public inputBoxTaskId:ui.gm.common.inputBoxComp;
		public inputBoxNewProgress:ui.gm.common.inputBoxComp;
	}
	class GMTrunkTaskView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public input1:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
		public btnChangeTaskId:ui.gm.common.BtnGm;
	}
	class GMTrunkTaskView extends fgui.GComponent{
		public labelTitle:fgui.GRichTextField;
		public input1:ui.gm.common.inputBoxComp;
		public btnOk:ui.gm.common.BtnGm;
		public btnChangeTaskId:ui.gm.common.BtnGm;
	}
}
declare namespace ui.gm.video {
	class GMVideoView extends fgui.GComponent{
		public editBoxScale:fgui.GTextInput;
		public btnClose:ui.comm.btn.BaseBtn;
		public btnChange:ui.gm.common.yellowBtn;
	}
}
