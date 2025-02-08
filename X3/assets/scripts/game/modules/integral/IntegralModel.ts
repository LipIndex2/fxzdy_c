import {BaseModel} from "db://assets/scripts/core/mvc/model/BaseModel";

/**
 * Integral 模块号及指令定义
 * @author GameCreator
 */
export class IntegralModel extends BaseModel
{
    /**
     * 模块标识
     */
    private MODULE = 18;

    constructor()
    {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist():void
    {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;

    }
    /*********************************协议发送*********************************/

    /*********************************协议监听*********************************/

    /*********************************协议推送*********************************/

}
