import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 奖励模块定义信息
 * @author GameCreator
 */
export class RewardModel extends BaseModel {
	/**
	 * 模块标识
	 */
	private MODULE = 2;

	constructor() {
		super();
		this.regist();
	}

	public static getModule(): number {
		return this.ins().MODULE;
	}

	/**
   * 注册所有从服务端收到的回调。
   */
	private regist(): void {
		// TODO 注册所有的指令
		let moduleId = this.MODULE;
		this.registerMsg(moduleId, -1, this.pushAutoTriggerRewards);
		this.registerMsg(moduleId, -2, this.pushHideRewards);

	}
	/*********************************协议发送*********************************/

	/*********************************协议监听*********************************/

	/*********************************协议推送*********************************/

	/**
	 * 推送自动触发奖励事件的奖励结果
	 * 模块号：2	指令号：-1
	 */
	public pushAutoTriggerRewards(): void {
		//TODO 推送消息-在这里处理服务端返回的数据

		//后端说先不用接
	}

	/**
	 * 推送触发的隐藏奖励内容,List<RewardResult>
	 * 模块号：2	指令号：-2
	 */
	public pushHideRewards(rewards: Vo.reward.RewardResult[]): void {
		//TODO 推送消息-在这里处理服务端返回的数据
		this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, rewards);
	}

}
