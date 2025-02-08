declare namespace ui.rule {
	class ruleContentCom extends fgui.GComponent{
		public content:fgui.GRichTextField;
	}
	class ruleContentCom2 extends fgui.GComponent{
		public content:fgui.GRichTextField;
	}
	class ruleView1 extends fgui.GComponent{
		public bgContent:fgui.GImage;
		public bg:ui.comm.btn.EmptyBtn;
		public emptyBtn:ui.comm.btn.EmptyBtn;
		public content:ui.rule.ruleContentCom2;
	}
	class ruleView2 extends fgui.GComponent{
		public title:fgui.GTextField;
		public content:ui.rule.ruleContentCom;
	}
}
