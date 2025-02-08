declare module table.model{
	class ModelConfig {
		/**
		 *唯一id
		 */
		public id:number;
		/**
		 *资源路径
		 */
		public modelPath:string;
		/**
		 *序列帧资源路径
		 */
		public framePath:string;
		/**
		 *是否为序列帧
		 */
		public spriteFrame:number;
		/**
		 *序列帧锚点  默认{"x":0.5,"y":0.2}
		 */
		public frameAnchor:any;
		/**
		 *默认偏移{"x":1,"y":1}
		 */
		public pos:any;
		/**
		 *默认缩放{"scaleX":1,"scaleY":1}
		 */
		public scale:any;
		/**
		 *移动动作频率
		 */
		public runTimeScale:number;
		/**
		 *默认动作
		 */
		public action:string;
		/**
		 *界面动作，不填用隔壁action的
		 */
		public uiAction:string;
		/**
		 *关闭预乘
		 */
		public noPremultipliedAlpha:boolean;
		/**
		 *缓存模式
		 */
		public cache:number;
		/**
		 *模型宽度
		 */
		public width:number;
		/**
		 *模型高度
		 */
		public height:number;
		/**
		 *展示时相对偏移量{"x":1,"y":1}
		 */
		public showOffsetPos:any;
		/**
		 *默认缩放{"scaleX":1,"scaleY":1}
		 */
		public showScale:any;
		/**
		 *间歇播放的间隔
		 */
		public uiIntervalMs:number;
	}
}
