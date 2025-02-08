declare module table.quality{
	class QualityConfig {
		/**
		 *品质
		 */
		public id:number;
		/**
		 *道具的品质图
		 */
		public itemQualityBgPath:string;
		/**
		 *英雄战斗的品质框
		 */
		public battleFgIconPath:string;
		/**
		 *战斗的品质底图
		 */
		public battleBgImagePath:string;
		/**
		 *字体颜色类型
single = 单一颜色
gradient = 渐变颜色
		 */
		public fontColorType:string;
		/**
		 *字体颜色，16码
		 */
		public fontColor:string;
		/**
		 *字体颜色2
		 */
		public fontColor2:string;
		/**
		 *字体颜色3
		 */
		public fontColor3:string;
		/**
		 *品质标题文字图片
例如：神话/稀有
		 */
		public qualityTitleIconPath:string;
		/**
		 *【抽卡】底座
		 */
		public drawCardDiZuo:string;
		/**
		 *【抽卡】英雄脚底光
		 */
		public drawCardGuang:string;
		/**
		 *【抽卡】限时职业招募--英雄头像背景
		 */
		public drawHeadBg:string;
		/**
		 *【抽卡】获得道具弹出的粒子spine
		 */
		public drawCardItemPopUpSpinePath:string;
		/**
		 *【抽卡】道具扫描光
		 */
		public drawCardItemSweepSpinePath:string;
		/**
		 *【抽卡】英雄脚下的spine光圈
2024-06-27
		 */
		public newHeroFootLightSpinePath:string;
		/**
		 *【抽卡】英雄脚下的spine光圈
2024-06-27
		 */
		public newHeroFootLightLoopSpinePath:string;
		/**
		 *【抽卡】新英雄的背景板spine
2024-06-27
		 */
		public newHeroBgSpinePath:string;
		/**
		 *首杀道具背景图
		 */
		public firstKillItemBG:string;
		/**
		 *掉落特效模型ID
		 */
		public dropModelId:number;
		/**
		 *宠物头像的品质图
2024-10-29
		 */
		public petHeadQualityBgPath:string;
		/**
		 *宠物卡片的品质图
2024-10-29
		 */
		public petCardQualityBgPath:string;
		/**
		 *宠物和皮肤道具详情品质名图片
		 */
		public petPropDetailsQualityIconPath:string;
		/**
		 *宠物和皮肤道具详情底座品质图
		 */
		public petPropDetailsQualityBgIconPath:string;
		/**
		 *星灵主界面名字底
		 */
		public petNameBottom:number;
	}
}
