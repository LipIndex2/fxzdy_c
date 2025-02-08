import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";

/**
 * Gift 模块号及指令定义
 * @author GameCreator
 */
export class GiftModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 3;

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
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recDraw);

    }

    /*********************************协议发送*********************************/

    /**
     * 领取福利码
     * 模块号：3	指令号：1
     */
    public sendDraw(c2s: Vo.gift.DrawC2S): void {
        this.send(this.MODULE, 1, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 领取福利码
     * 模块号：3	指令号：1
     */
    public recDraw(data: Vo.gift.DrawS2C): void {
        if (data.code < 0) {
            // 兑换码没用
            // GIns.floatingTextMgr.showTips(GiftI18nKeys.NO_FOUND_REDEMPTION_CODE);
            return; 
        }

        console.info("兑换码领取成功");
        
        const content = data.content;

        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW, content);
    }

    /*********************************协议推送*********************************/

}
