declare module Vo.account{
	
	/**
	 * 登录返回信息VO
	 * @author GameCreator
	 */	
	class LoginInfoVo	{
		/**
		 * 各模块登录信息(模块号->模块vo信息)
		 */		
		content:Object;
		
		/**
		 * 钱包vo
		 */		
		wallet:Vo.currency.WalletVo;
		
		/**
		 * 开服时间
		 */		
		openServer:number;
		
		/**
		 * 当前的系统时间
		 */		
		systemTime:number;
		
		/**
		 * 当前时区
		 */		
		timeZone:number;
		
		/**
		 * 重连加密值，可用以 {@link com.cx.xj.module.account.facade.AccountFacade#relogin(Session,String,int,int,String)}, {@link com.cx.xj.module.account.facade.AccountFacade#restoreLogin(Session,String,int,int,String)}两个重连接口
		 */		
		reLoginSign:string;
		
		/**
		 * 服务器名称
		 */		
		serverName:string;
		
		/**
		 * 服务器Id
		 */		
		serverId:string;
		
	}


	
	/**
	 * 重连，断线重连第二阶段接口
	 * @author GameCreator
	 */	
	class ReloginC2S	{
		/**
		 * 账号名(包括服标识)
		 */		
		account:string;
		
		/**
		 * 年龄
		 */		
		age:number;
		
		/**
		 * 防沉迷标识：1 服务器需处理在线时间；2 服务器需处理充值；3 服务器全部处理；其他：服务器无需处理
		 */		
		antiAddictionFlag:number;
		
		/**
		 * 加密验证串，取自{@link AccountFacade#getLoginInfo(Long)}结果 {@link LoginInfoVo#reLoginSign}
		 */		
		key:string;
		
	}


	
	/**
	 * 重连，断线重连第二阶段接口
	 * @author GameCreator
	 */	
	class ReloginS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 账户VO
	 * @author GameCreator
	 */	
	class AccountVo	{
		/**
		 * 账户编号
		 */		
		id:number;
		
		/**
		 * 账号
		 */		
		name:string;
		
		/**
		 * 创建时间
		 */		
		createdOn:number;
		
		/**
		 * 状态
		 */		
		state:number;
		
		/**
		 * 最后登录时间
		 */		
		loginOn:number;
		
		/**
		 * 最后登出时间
		 */		
		logoutOn:number;
		
		/**
		 * 当天累计时间
		 */		
		timeByDay:number;
		
		/**
		 * 累计在线时间
		 */		
		timeByTotal:number;
		
		/**
		 * 累计在线天数(从0开始)
		 */		
		dayByTotal:number;
		
		/**
		 * 连续登录天数(从0开始)
		 */		
		dayByContinuous:number;
		
		/**
		 * 是否在线状态
		 */		
		online:boolean;
		
	}


	
	/**
	 * 重新登录信息
	 * @author GameCreator
	 */	
	class ReLoginInfoVo	{
		/**
		 * 透传参数
		 */		
		param:string;
		
		/**
		 * 时间戳
		 */		
		timestamp:string;
		
		/**
		 * 加密值
		 */		
		sign:string;
		
	}


	
	/**
	 * 通过获取缺少消息来恢复登录，断线重连第一阶段接口
	 * @author GameCreator
	 */	
	class RestoreLoginC2S	{
		account:string;
		
		/**
		 * 年龄
		 */		
		age:number;
		
		/**
		 * 防沉迷标识：1 服务器需处理在线时间；2 服务器需处理充值；3 服务器全部处理；其他：服务器无需处理
		 */		
		antiAddictionFlag:number;
		
		/**
		 * 加密验证串，取自{@link AccountFacade#getLoginInfo(Long)}结果 {@link LoginInfoVo#reLoginSign}
		 */		
		key:string;
		
	}


	
	/**
	 * 通过获取缺少消息来恢复登录，断线重连第一阶段接口
	 * @author GameCreator
	 */	
	class RestoreLoginS2C	{
		content:Vo.account.RestoreLoginVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 账号登出处理
	 * @author GameCreator
	 */	
	class LogoutS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 创建账号与角色
	 * @author GameCreator
	 */	
	class Create3C2S	{
		/**
		 * 帐号名称(包括服标识)
		 */		
		account:string;
		
		/**
		 * 时间戳
		 */		
		time:number;
		
		/**
		 * md5(account+channel+roll+time+秘钥) account为不包含运营商、服务器
		 */		
		sign:string;
		
		/**
		 * 创角参数
		 */		
		createParam:string;
		
	}


	
	/**
	 * 创建账号与角色
	 * @author GameCreator
	 */	
	class Create3S2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	/**
	 * 账号状态
	 * @author GameCreator
	 */	
	enum AccountState
	{
		/**
		 * 锁定
		 */		
		BLOCK = 0
	}


	
	/**
	 * 恢复登录
	 * @author GameCreator
	 */	
	class RestoreLoginVo	{
		/**
		 * 是否能够通过缺失消息恢复登录
		 */		
		enableRestore:boolean;
		
		/**
		 * 缺少的消息
		 */		
		messages:Array<ArrayBuffer>;
		
	}


	
	/**
	 * 获取时区
	 * @author GameCreator
	 */	
	class GetTimeZoneS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	/**
	 * 账号设备数据
	 * @author GameCreator
	 */	
	enum DeviceType
	{
		/**
		 * ios
		 */		
		ios = 0,
		/**
		 * 安卓
		 */		
		android = 1,
		/**
		 * pc
		 */		
		pc = 2
	}


	
	/**
	 * 检查账号是否存在，此接口调用在获取协议前，应只传一个字符串，返回int
	 * @author GameCreator
	 */	
	class CheckAccountC2S	{
		/**
		 * {"account":"a.1_2","loginParam":"{}","timestamp":1698810617306,"sign":"123"}
		 */		
		param:string;
		
	}


	
	/**
	 * 检查账号是否存在，此接口调用在获取协议前，应只传一个字符串，返回int
	 * @author GameCreator
	 */	
	class CheckAccountS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	/**
	 * 防沉迷收益类型
	 * @author GameCreator
	 */	
	enum IncomeRate
	{
		/**
		 * 完全收益(未被防沉迷状态)
		 */		
		FULL = 0,
		/**
		 * 收益减半(半防沉迷状态)
		 */		
		HALF = 1,
		/**
		 * 收益为空(完全防沉迷状态)
		 */		
		EMPTY = 2
	}


	
	/**
	 * 账号登录
	 * @author GameCreator
	 */	
	class LoginC2S	{
		/**
		 * 账号名(包括服标识)
		 */		
		account:string;
		
		/**
		 * 年龄
		 */		
		age:number;
		
		/**
		 * 防沉迷标识：1 服务器需处理在线时间；2 服务器需处理充值；3 服务器全部处理；其他：服务器无需处理
		 */		
		antiAddictionFlag:number;
		
		loginParam:string;
		
		/**
		 * 时间戳
		 */		
		timestamp:number;
		
		/**
		 * 加密串
		 */		
		key:string;
		
	}


	
	/**
	 * 账号登录
	 * @author GameCreator
	 */	
	class LoginS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取账号信息
	 * @author GameCreator
	 */	
	class LoginInfoS2C	{
		content:Vo.account.LoginInfoVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 登录完成
	 * @author GameCreator
	 */	
	class LoginCompleteS2C	{
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取重新登录登录服信息
	 * @author GameCreator
	 */	
	class GetReLoginInfoS2C	{
		content:Vo.account.ReLoginInfoVo;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
