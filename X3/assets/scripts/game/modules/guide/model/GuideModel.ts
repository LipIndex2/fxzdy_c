import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";

/**
 * 角色模块定义信息
 * @author GameCreator
 */
export class GuideModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 11;

    /** 已完成的引导map */
    private _guideMap: { [groupId: number]: number };

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
        this.registerMsg(moduleId, 3, this.recUpdateGuide);
    }

    /**初始化帐数据 */
    public initData(vo: Vo.player.PlayerVo): void {
        this._guideMap = (vo.guideMap as any) || {};

        // for (let key in this._guideMap) {
        //     GIns.guideMgr.isMarkFirstGuideFinish(Number(key), false);
        // }
    }

    /** 存储已完成的引导组 */
    public updateGuideMap(groupId: number, id: number) {
        this._guideMap[groupId] = id;

        // GIns.guideMgr.isMarkFirstGuideFinish(groupId);
    }

    /** 获取已完成的引导组 */
    get guideMap() {
        return this._guideMap;
    }

    /** 判断是否完成该id的引导 */
    public isCompleted(guideId: number) {
        let cfg = TableManager.getDataById(table.guide.GuideConfig, guideId);
        if (!cfg) return false;
        if (this.guideMap[cfg.group] && this.guideMap[cfg.group] >= guideId) {
            return true;
        }
        return false;
    }

    /*********************************协议发送*********************************/
    /**
     * 更新玩家新手引导信息
     * 模块号：11	指令号：3
     */
    public sendUpdateGuide(group: number, guideId: number): void {
        let c2s = {} as Vo.player.UpdateGuideC2S;
        c2s.group = group;
        c2s.step = guideId;
        this.send(this.MODULE, 3, c2s);

        this.updateGuideMap(group, guideId);
    }

    /*********************************协议监听*********************************/

    /**
     * 更新玩家新手引导信息
     * 模块号：11	指令号：3
     */
    public recUpdateGuide(data: Vo.player.UpdateGuideS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            this.emit(NotificationKey.GUIDE_MARK_COMPLETED);
        }
    }
}
