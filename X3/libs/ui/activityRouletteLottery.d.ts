declare namespace ui.activityRouletteLottery {
	class ChooseAwardItem extends fgui.GComponent{
		public T_count:fgui.GTextField;
		public T_Tips:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
	class RouletteLotteryChooseBigRewardWin extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public T_chooseTips:fgui.GTextField;
		public itemList:fgui.GList;
		public T_round:fgui.GRichTextField;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public bigReward:ui.comm.item.ItemFrameBtn;
		public btnChooseBig:ui.comm.btn.EmptyBtn;
		public btnClose:ui.comm.btn.GoToBackButton_1;
	}
	class RouletteLotteryMainView extends fgui.GComponent{
		public T_bigAward:fgui.GRichTextField;
		public T_name1:fgui.GTextField;
		public T_name4:fgui.GTextField;
		public T_name2:fgui.GTextField;
		public T_name5:fgui.GTextField;
		public T_name3:fgui.GTextField;
		public T_name6:fgui.GTextField;
		public T_time:fgui.GRichTextField;
		public T_awardName:fgui.GTextField;
		public T_round:fgui.GRichTextField;
		public btnRule:ui.comm.btn.BtnGth3;
		public headerItem:ui.comm.header.HeaderItem;
		public btn_one:ui.comm.btn.BtnChangGui1WithItem;
		public btn_ten:ui.comm.btn.BtnChangGui1WithItem;
		public page:ui.activityRouletteLottery.RoulettePage;
		public skipItem:ui.activityRouletteLottery.item.DrawSkipAnimItem;
	}
	class RoulettePage extends fgui.GComponent{
		public img_sel0:fgui.GLoader;
		public img_sel1:fgui.GLoader;
		public img_sel2:fgui.GLoader;
		public img_sel3:fgui.GLoader;
		public img_sel4:fgui.GLoader;
		public img_sel5:fgui.GLoader;
		public img_sel6:fgui.GLoader;
		public img_sel7:fgui.GLoader;
		public img_sel8:fgui.GLoader;
		public T_count1:fgui.GTextField;
		public T_count2:fgui.GTextField;
		public T_count4:fgui.GTextField;
		public T_count5:fgui.GTextField;
		public T_count7:fgui.GTextField;
		public T_count8:fgui.GTextField;
		public item0:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item1:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item2:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item3:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item4:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item5:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item6:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item7:ui.activityRouletteLottery.item.RouletteAwardItem;
		public item8:ui.activityRouletteLottery.item.RouletteAwardItem;
	}
}
declare namespace ui.activityRouletteLottery.item {
	class DrawSkipAnimItem extends fgui.GComponent{
	}
	class RouletteAwardItem extends fgui.GComponent{
		public img_item:fgui.GLoader;
		public T_count:fgui.GTextField;
		public item:ui.comm.item.ItemFrameBtn;
	}
}
