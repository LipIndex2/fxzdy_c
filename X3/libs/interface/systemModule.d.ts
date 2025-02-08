declare module Vo.system{
	
	/**
	 * 获取传输对象定义, 只能管理后台调用
	 * @author GameCreator
	 */	
	class RequestDescriptionS2C	{
		content:ArrayBuffer;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取传输对象定义MD5串, 用于验证客户端本地存储的传输对象定义是否有效
	 * @author GameCreator
	 */	
	class Md5DescriptionS2C	{
		content:string;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


	
	/**
	 * 获取当前的系统时间
	 * @author GameCreator
	 */	
	class SystemTimeS2C	{
		content:number;
		
		/**
		 * 服务端返回的成功与否的标志。
		 */		
		code:number;
		
	}


}
