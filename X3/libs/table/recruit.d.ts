declare module table.recruit{
	class AwakeWeaponRecruitScoreConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *消耗积分
		 */
		public score:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
	}
	class NormalRecruitProgressConfig {
		/**
		 *进度
		 */
		public id:number;
		/**
		 *奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *浮动头像
		 */
		public headAssetPath:string;
		/**
		 *光
		 */
		public lightAssetPath:string;
		/**
		 *描述获得的内容
		 */
		public desc:string;
		/**
		 *描述字体颜色
		 */
		public descFontColor:string;
	}
	class RecruitConfig {
		/**
		 *招募id
		 */
		public id:number;
		/**
		 *招募类型
		 */
		public type:string;
		/**
		 *开启卡池条件，空 = 开启
		 */
		public openCondition:Array<any>;
		/**
		 *普通池子ID,对应RecruitPoolConfig的id
		 */
		public poolIdForNormal:number;
		/**
		 *保底池子ID,对应RecruitPoolConfig的id
		 */
		public poolIdForXinYuan:number;
		/**
		 *单次招募消耗（优先度最高）
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *不足时代替扣款道具
		 */
		public costItems2:Array<{k:any,v:any}>;
		/**
		 *不足时购买商店道具id
		 */
		public costShopId:number;
	}
	class RecruitConstantConfig {
		public id:string;
		public content:string;
	}
	class RecruitMainViewAnimConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *spine动画路径
		 */
		public spinePath:string;
		/**
		 *播放动画名
		 */
		public animName:string;
	}
}
