declare module table.mainpage{
	class MainPageHeaderItemConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *道具id
		 */
		public itemId:number;
		/**
		 *是否有购买+按钮
		 */
		public canBuyFlag:boolean;
		/**
		 *进度条颜色|问美术
		 */
		public progressColor:string;
	}
	class MainPageKvConfig {
		/**
		 *唯一id
		 */
		public id:string;
		/**
		 *值
		 */
		public value:string;
	}
	class MainPageTabItemConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *所在的位置
bottom = 底部
left = 左上侧
right_top = 右上侧
bottom = 底部
more = 更多菜单
right_bottom = 右下
		 */
		public sideType:string;
		/**
		 *显示排序
		 */
		public sort:number;
		/**
		 *模块id，用于定位解锁条件
		 */
		public systemId:string;
		/**
		 *前端定位按钮用的名字
@找前端要名字
		 */
		public nameForClient:string;
		/**
		 *按钮的活动id组
注：id组中的活动不能同时开不然只会显示第一个开启的活动id
		 */
		public activityIds:Array<any>;
		/**
		 *显示名称
		 */
		public showName:string;
		/**
		 *显示条件
新增条件,需要改动代码的,新增需要和前端说
PLAYER_LEVEL_GE,0,1; = 玩家>1级
ps:未达到则不显示
		 */
		public conditionText:Array<any>;
		/**
		 *特效动画
		 */
		public modelId:number;
		/**
		 *是否展示动画
		 */
		public showEffect:boolean;
		/**
		 *图标特效
		 */
		public iconEffect:any;
		/**
		 *收起状态是否展示
		 */
		public isShowInFold:boolean;
		/**
		 *是否展示剩余时间
		 */
		public showEndTime:boolean;
		/**
		 *正常图标
【部分特殊的不支持】
		 */
		public iconNormalAssetPath:string;
		/**
		 *按下后图标
【目前仅支持底部】
		 */
		public iconPressAssetPath:string;
		/**
		 *活动页面
		 */
		public viewName:string;
		/**
		 *参数
		 */
		public viewArge:string;
	}
	class MainPageTabListConfig {
		/**
		 *所在的位置
bottom = 底部
left = 左上侧
right_top = 右上侧
bottom = 底部
more = 更多菜单
right_bottom = 右下
		 */
		public type:string;
		/**
		 *列表朝向(1从左到右 2从右到左)
		 */
		public layout:number;
		/**
		 *最大行数
		 */
		public maxRow:number;
		/**
		 *显示折叠数量(默认不显示)
		 */
		public showFoldCnt:number;
	}
}
