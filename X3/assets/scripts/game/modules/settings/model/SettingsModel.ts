import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { SettingsContext } from "db://assets/scripts/game/modules/settings/context/SettingsContext";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import GIns from "../../../GIns";
import G from "db://assets/scripts/core/comm/G";

export enum MobileShakeType {

    /**
     * UI震动
     */
    ui = 1,

    /**
     * 矿物震动
     */
    mineral = 2,
}


/**
 * 设置模块协议号
 * @author GameCreator
 */
export class SettingsModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 38;
    private _context = new SettingsContext();

    constructor() {
        super();
        this.regist();
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.Show_Mobile_Shake,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.Show_Mobile_Shake:
                this.onShowMobileShake(args);
                break;
        }
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recSetUpHeadIcon);
        this.registerMsg(moduleId, 2, this.recSetUpHeadFrame);
        this.registerMsg(moduleId, 3, this.recSetUpImage);
        this.registerMsg(moduleId, 4, this.recSetUpTitle);
        this.registerMsg(moduleId, 5, this.recChangeName);
        this.registerMsg(moduleId, 6, this.recSetUpChatBox);
        this.registerMsg(moduleId, 7, this.recSetUpChatWordColor);

        this.registerMsg(moduleId, -1, this.pushSetVo);

    }

    /*********************************协议发送*********************************/

    /**
     * 设置头像
     * 模块号：38	指令号：1
     */
    public sendSetUpHeadIcon(c2s: Vo.set.SetUpHeadIconC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 设置头像框
     * 模块号：38	指令号：2
     */
    public sendSetUpHeadFrame(c2s: Vo.set.SetUpHeadFrameC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 设置头像
     * 模块号：38	指令号：3
     */
    public sendSetUpImage(c2s: Vo.set.SetUpImageC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 设置称号
     * 模块号：38	指令号：4
     */
    public sendSetUpTitle(c2s: Vo.set.SetUpTitleC2S): void {
        this.send(this.MODULE, 4, c2s, c2s);
    }

    /**
     * 改名
     * 模块号：38	指令号：5
     */
    public sendChangeName(c2s: Vo.set.ChangeNameC2S): void {
        this.send(this.MODULE, 5, c2s, c2s);
    }


    /**
     * 设置聊天框
     * 模块号：38	指令号：6
     */
    public sendSetUpChatBox(c2s: Vo.set.SetUpChatBoxC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /**
     * 设置聊天文字颜色
     * 模块号：38	指令号：7
     */
    public sendSetUpChatWordColor(c2s: Vo.set.SetUpChatWordColorC2S): void {
        this.send(this.MODULE, 7, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 设置头像
     * 模块号：38	指令号：1
     */
    public recSetUpHeadIcon(data: Vo.set.SetUpHeadIconS2C, c2s: Vo.set.SetUpHeadIconC2S): void {
        if (data.code < 0) {
            return;
        }

        this._context.setHeadIconId(c2s.headIconId);
        this.refreshNow();
    }

    /**
     * 设置头像框
     * 模块号：38	指令号：2
     */
    public recSetUpHeadFrame(data: Vo.set.SetUpHeadFrameS2C, c2s: Vo.set.SetUpHeadFrameC2S): void {
        if (data.code < 0) {
            return;
        }


        this._context.setHeadFrameId(c2s.headFrameId);
        this.refreshNow();
    }

    /**
     * 设置头像
     * 模块号：38	指令号：3
     */
    public recSetUpImage(data: Vo.set.SetUpImageS2C, c2s: Vo.set.SetUpImageC2S): void {
        if (data.code < 0) {
            return;
        }


        this._context.setImageId(c2s.imageId);
        this.emit(NotificationKey.SETTINGS_SET_IMAGE_COMPLETE, c2s.imageId)
        this.refreshNow();
    }

    /**
     * 设置称号
     * 模块号：38	指令号：4
     */
    public recSetUpTitle(data: Vo.set.SetUpTitleS2C, c2s: Vo.set.SetUpTitleC2S): void {
        if (data.code < 0) {
            return;
        }


        this._context.setTitleId(c2s.titleId);
        this.refreshNow();
    }

    /**
     * 改名
     * 模块号：38	指令号：5
     */
    public recChangeName(data: Vo.set.ChangeNameS2C, c2s: Vo.set.ChangeNameC2S): void {
        if (data.code < 0) {
            return;
        }
        const costItemResults = data.content;
        const name = c2s.name;

        PlayerModel.ins().Vo.name = name;
        SettingsModel.ins().context.addChangeNameCount();

        FacadeManager.ins().emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costItemResults);

        FacadeManager.ins().emit(NotificationKey.CHANGE_NAME, name);

        GIns.floatingTextMgr.showTips("修改成功");
    }


    /**
     * 设置聊天框
     * 模块号：38	指令号：6
     */
    public recSetUpChatBox(data: Vo.set.SetUpChatBoxS2C, c2s: Vo.set.SetUpChatBoxC2S): void {
        if (data.code < 0) {
            return;
        }


        this._context.setChatBoxId(c2s.boxId);
        this.refreshNow();
    }

    /**
     * 设置聊天文字颜色
     * 模块号：38	指令号：7
     */
    public recSetUpChatWordColor(data: Vo.set.SetUpChatWordColorS2C,
                                 c2s: Vo.set.SetUpChatWordColorC2S
    ): void {
        if (data.code < 0) {
            return;
        }


        this._context.setChatFontId(c2s.colorId);
        this.refreshNow();
    }

    /*********************************协议推送*********************************/

    /**
     * 推送设置信息，PlayerSetVo
     * 模块号：38	指令号：-1
     */
    public pushSetVo(data: Vo.set.PlayerSetVo): void {
        this._context.reset(data);

    }


    /********************************* bb *********************************/

    initData(data: Vo.set.PlayerSetVo) {
        SettingsConfigManager.init();

        this._context.init();
        this._context.reset(data);
    }


    get context(): SettingsContext {
        return this._context;
    }

    private onShowMobileShake(arg: MobileShakeType): void {
        if (G.SystemSettingManager.isOpenShake()) {
            //NativeAPI.vibrate(200);
            //.....
            // ShakeUtils.shake(fgui.GRoot.inst.node)
        }
    }

    refreshNow() {
        FacadeManager.ins().emit(NotificationKey.SETTINGS_CHOOSE_REFRESH);
    }
}
