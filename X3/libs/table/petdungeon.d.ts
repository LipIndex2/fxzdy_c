declare module table.petdungeon{
	class PetDungeonBuildingConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *关卡起始传送点id(未填写代表是地图出生点)
		 */
		public startTransId:number;
		/**
		 *关卡结束传送点id
		 */
		public endTransId:number;
		/**
		 *地图返回传送点ids(多个传送点代表需要传送动画)
		 */
		public backTransIds:Array<any>;
		/**
		 *建筑朝向(默认朝左 1朝右)
		 */
		public direction:number;
		/**
		 *建筑缩放(默认1)
		 */
		public scale:number;
	}
	class PetDungeonConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *战斗配置ID
		 */
		public battleConfigId:number;
		/**
		 *历史首次奖励
		 */
		public historyFirstRewards:Array<{k:any,v:any}>;
		/**
		 *赛季首次奖励
		 */
		public seasonFirstRewards:Array<{k:any,v:any}>;
		/**
		 *关卡重复奖励
		 */
		public floorRewards:Array<{k:any,v:any}>;
		/**
		 *关卡名称
		 */
		public name:string;
		/**
		 *关卡对应建筑id
		 */
		public buildingConfigId:number;
	}
	class PetDungeonConstantConfig {
		/**
		 *唯一ID
		 */
		public id:string;
		/**
		 *内容
		 */
		public content:string;
	}
	class PetDungeonHeaderItemConfig {
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
	}
	class PetDungeonPositionConfig {
		/**
		 *关卡id
		 */
		public floorId:number;
		/**
		 *解锁位置数量
		 */
		public positionCount:number;
	}
	class PetDungeonToyConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *升级后的id
		 */
		public nextId:number;
		/**
		 *技能id;技能id（加成属性）
		 */
		public skillIds:string;
		/**
		 *名称
		 */
		public name:string;
		/**
		 *等级
		 */
		public lv:number;
		/**
		 *属性加成
		 */
		public addAttrArray:Array<{k:any,v:any}>;
		/**
		 *图标
		 */
		public icon:string;
		/**
		 *形状id
		 */
		public shapeId:number;
		/**
		 *玩具类型(同类型只生效最高级的)
		 */
		public toyType:number;
	}
	class PetDungeonToyShapeConfig {
		/**
		 *唯一ID
		 */
		public id:number;
		/**
		 *占位数组(25位5x5格子横向流动 0代表空 1代表有占位 不可以填其他数字)
		 */
		public values:Array<any>;
	}
}
