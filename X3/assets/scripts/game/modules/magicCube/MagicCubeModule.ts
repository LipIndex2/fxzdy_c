import G from "../../../core/comm/G";
import { BaseModel } from "../../../core/mvc/model/BaseModel";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";

/**
 * 魔方模块
 * @author GameCreator
 */
export class MagicCubeModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 47;

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
        this.registerMsg(moduleId, 1, this.recActivate);
        this.registerMsg(moduleId, 2, this.recUpLevel);
        this.registerMsg(moduleId, 3, this.recConvert);
        this.registerMsg(moduleId, 4, this.recSaveConvert);
    }

    public initData(vo: Vo.magiccube.MagicCubeVo[]) {
        if (vo.length > 0) {
            GIns.magicCubeMgr.initData(vo);
        }
    }

    /*********************************协议发送*********************************/

    /**
     * 激活魔方
     * 模块号：47	指令号：1
     * @param heroId 英雄id
     */
    public sendActivate(heroId: number): void {
        let c2s = {} as Vo.magiccube.ActivateC2S;
        c2s.heroBaseId = heroId;
        this.send(this.MODULE, 1, c2s);
    }

    /**
     * 升级魔方
     * 模块号：47	指令号：2
     * @param heroId 英雄id
     * @param locked 是否锁定
     */
    public sendUpLevel(heroId: number, locked: boolean): void {
        let c2s = {} as Vo.magiccube.UpLevelC2S;
        c2s.heroBaseId = heroId;
        c2s.locked = locked;
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 转换魔方
     * 模块号：47	指令号：3
     * @param heroId 英雄id
     */
    public sendConvert(heroId: number): void {
        let c2s = {} as Vo.magiccube.ConvertC2S;
        c2s.heroBaseId = heroId;
        this.send(this.MODULE, 3, c2s);
    }

    /**
     * 保存魔方转换
     * 模块号：47	指令号：4
     * @param heroId 英雄id
     */
    public sendSaveConvert(heroId: number): void {
        let c2s = {} as Vo.magiccube.SaveConvertC2S;
        c2s.heroBaseId = heroId;
        this.send(this.MODULE, 4, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 激活魔方
     * 模块号：47	指令号：1
     */
    public recActivate(data: Vo.magiccube.ActivateS2C): void {
        if (data.code >= 0) {
            GIns.magicCubeMgr.setMagicCubeVoByHeroId(data.content.id, data.content);
            this.emit(NotificationKey.MAGICCUBE_ACTIVATE, data.content.id);
            this.emit(NotificationKey.MAGICCUBE_REFRESH_DATA, data.content.id);
            GIns.floatingTextMgr.showTips("激活成功");
        }
    }

    /**
     * 升级魔方
     * 模块号：47	指令号：2
     */
    public recUpLevel(data: Vo.magiccube.UpLevelS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content.costItemResults) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
            }
            GIns.magicCubeMgr.setMagicCubeVoByHeroId(data.content.magicCubeVo.id, data.content.magicCubeVo);
            this.emit(NotificationKey.MAGICCUBE_INCREASE, data.content.magicCubeVo.id);
            this.emit(NotificationKey.MAGICCUBE_REFRESH_DATA, data.content.magicCubeVo.id);
            GIns.floatingTextMgr.showTips("升级成功");
        }
    }

    /**
     * 转换魔方
     * 模块号：47	指令号：3
     */
    public recConvert(data: Vo.magiccube.ConvertS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            if (data.content.costItemResults) {
                this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
            }
            GIns.magicCubeMgr.setMagicCubeVoByHeroId(data.content.magicCubeVo.id, data.content.magicCubeVo);
            this.emit(NotificationKey.MAGICCUBE_CONVERT, data.content.magicCubeVo.id);
            this.emit(NotificationKey.MAGICCUBE_REFRESH_DATA, data.content.magicCubeVo.id);
            GIns.floatingTextMgr.showTips("转换成功");
        }
    }

    /**
     * 保存魔方转换
     * 模块号：47	指令号：4
     */
    public recSaveConvert(data: Vo.magiccube.SaveConvertS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            GIns.magicCubeMgr.setMagicCubeVoByHeroId(data.content.id, data.content);
            this.emit(NotificationKey.MAGICCUBE_SAVE_CONVERT, data.content.id);
            this.emit(NotificationKey.MAGICCUBE_REFRESH_DATA, data.content.id);
            GIns.floatingTextMgr.showTips("保存成功");
        }
    }

    /*********************************协议推送*********************************/
}
