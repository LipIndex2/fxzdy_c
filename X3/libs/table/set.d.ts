declare module table.set{
	class SetConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class SetShowConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *对外形象的道具类型
见枚举 ShowInfoType
HEAD_ICON = 头像
		 */
		public type:string;
		/**
		 *名字
		 */
		public name:string;
		/**
		 *简要描述
		 */
		public desc:string;
		/**
		 *美术资产路径（头像）
		 */
		public assetPath:string;
		/**
		 *关联物品ID,>0表示通过物品奖励发放,和解锁条件互斥
		 */
		public itemId:number;
		/**
		 *所属英雄id
		 */
		public heroId:number;
		/**
		 *形象展示用的模型id
- 必须关联英雄id
- 因为皮肤会有特殊的模型
		 */
		public heroModelId:number;
		/**
		 *字体颜色文本
		 */
		public fontColor:string;
		/**
		 *解锁条件
IMAGE 是英雄形象
		 */
		public unlockCondition:Array<any>;
		/**
		 *加成属性列表
		 */
		public addAttrs:Array<{k:any,v:any}>;
	}
	class SetShowTypeDescConfig {
		/**
		 *对外形象的道具类型
见枚举 ShowInfoType
HEAD_ICON = 头像
		 */
		public type:string;
		/**
		 *名字
		 */
		public name:string;
	}
}
