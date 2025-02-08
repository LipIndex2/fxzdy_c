declare module table.common{
	class ChannelOpenConfig {
		/**
		 *编号
		 */
		public id:number;
		/**
		 *渠道
		 */
		public channel:string;
		/**
		 *开场战斗是否开启，1开启，不填或0不开
		 */
		public openBeginBattle:number;
		/**
		 *公测返利是否开启，1开启，不填或0不开
		 */
		public openTestRebate:number;
		/**
		 *呼朋唤友是否开启，1开启，不填或0不开
		 */
		public openInvite:number;
		/**
		 *官方频道否开启，1开启，不填或0不开
		 */
		public openChatOfficial:number;
		/**
		 *vip认证是否开启，1开启，不填或0不开
		 */
		public openVip:number;
		/**
		 *手机号绑定是否开启
		 */
		public openPhoneBind:number;
		/**
		 *是否可订阅
		 */
		public subscription:number;
	}
	class ConfigValue {
		/**
		 *标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class LoadingTipsConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *内容
		 */
		public content:string;
	}
}
