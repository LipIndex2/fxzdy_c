declare module table.rank{
	class RankingConfig {
		/**
		 *排行榜类型
		 */
		public id:string;
		/**
		 *前端分组枚举名
common
jjc
		 */
		public groupType:string;
		/**
		 *页签特殊类型
		 */
		public tabType:string;
		/**
		 *顶部名字
		 */
		public name:string;
		/**
		 *子页签名字（限制5字）
		 */
		public tabName:string;
		/**
		 *排行榜值前缀文本
		 */
		public rankValuePrefixText:string;
		/**
		 *排行榜值后缀
		 */
		public rankSuffixText:string;
		/**
		 *排行榜数值小logo
		 */
		public rankValueSmallLogo:string;
		/**
		 *页签id
		 */
		public tapId:number;
		/**
		 *是否只显示在私有排行榜界面
		 */
		public isShowPrivate:number;
		/**
		 *排行榜显示上限,前端显示请求排行榜使用的数量
		 */
		public limit:number;
		/**
		 *查看排行榜需要
个人开放条件
		 */
		public verifyStr:Array<any>;
		/**
		 *查看排行榜需要
系统开放条件,系统条件不存在则检查个人开放条件
		 */
		public systemType:number;
		/**
		 *显示优先级
		 */
		public priority:number;
		/**
		 *排行榜图标
		 */
		public titleIcon:string;
		/**
		 *图标（暗色）
		 */
		public icon1:string;
		/**
		 *选择图标（亮色）
		 */
		public icon:string;
	}
	class RankingSubTypeTabConfig {
		/**
		 *排行榜类型
		 */
		public id:number;
		/**
		 *排行榜类型
		 */
		public rankType:string;
		/**
		 *子类型
		 */
		public subType:number;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *图片底部
		 */
		public bg:string;
		/**
		 *图片顶
		 */
		public fg:string;
	}
}
