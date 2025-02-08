declare module table.stimulation{
	class StimulationConstantConfig {
		/**
		 *唯一标识
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class StimulationDeviceConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *道具Id
		 */
		public itemId:number;
		/**
		 *对应建筑id
		 */
		public buildingId:number;
		/**
		 *效率展示时间(秒)
		 */
		public speedShowTime:number;
		/**
		 *效率单位
		 */
		public speedUnit:string;
	}
	class StimulationDeviceLevelConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *设备Id，即StimulationDeviceConfig的Id
		 */
		public deviceId:number;
		/**
		 *等级
		 */
		public level:number;
		/**
		 *每小时生产资源数量，与intervalSeconds互斥
		 */
		public itemAmountPerHour:number;
		/**
		 *固定奖励间隔秒数，即X秒生产一个奖励，与itemAmountPerHour互斥
		 */
		public intervalSeconds:number;
		/**
		 *储量
		 */
		public capacity:number;
		/**
		 *可派遣数量
		 */
		public dispatchNum:number;
		/**
		 *升到该等级所需消耗
		 */
		public costItems:Array<{k:any,v:any}>;
		/**
		 *升级等待时长，单位：秒
		 */
		public waitSeconds:number;
		/**
		 *跳过一分钟等待时长所需消耗
		 */
		public skipWaitCostItemsPerMinute:Array<{k:any,v:any}>;
		/**
		 *解锁条件列表
		 */
		public unlockConditions:Array<any>;
	}
	class StimulationRecycleConfig {
		/**
		 *唯一Id
		 */
		public id:number;
		/**
		 *一单位消耗
		 */
		public costs:Array<{k:any,v:any}>;
		/**
		 *一单位奖励
		 */
		public rewards:Array<{k:any,v:any}>;
		/**
		 *解锁条件列表
		 */
		public unlockConditions:Array<any>;
		/**
		 *兑换描述
		 */
		public desc:string;
	}
}
