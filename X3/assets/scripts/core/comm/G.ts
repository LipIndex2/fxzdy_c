//import LangMgr from './lang/LangMgr';
import type BattleTimer from '../timer/BattleTimer';
import type { GameTimer } from '../timer/GameTimer';
import type { Logger } from "db://assets/scripts/core/log/Logger";
import type { UIManager } from '../mvc/UIManager';
import type { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import type { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import type { TableManager } from '../table/TableManager';
import type FacadeManager from '../mvc/FacadeManager';
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";

import { Utils } from '../utils/Utils';
import { Camera, find, game, Node, sys, Vec3 } from "cc";
import * as fgui from "fairygui-cc";
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";
import { NativeAPI } from '../native/NativeAPI';

/**
 * 全局单例访问用
 *
 * 常用于访问:
 * 1. Manager
 * 2. Log
 *
 * ps: game/ 目录里面的业务 Manager 不要挪进来, 未来可能会分包, 会导致问题
 */
export default class G {

    // 网络报错提示 必须打开
    static networkDebugFlag: boolean = true;

    /**
     * 策划配置管理
     */
    static TableManager: typeof TableManager;

    /**
     * 日志
     */
    static Logger: typeof Logger;

    /**
     * 静态时间管理器 | 非调度
     */
    static TimeManager: typeof TimeManager;

    /** 战斗时间管理器 */
    static BattleTimer: BattleTimer;

    /**
     * 游戏时间管理器 + 分帧管理
     */
    static GameTimer: GameTimer;

    /**
     * i18n 多语言管理器
     */
    static I18nManager: I18nManager;


    /**
     * UI 管理器
     */
    static UIManager: UIManager;


    /**
     * MVC管理器
     * */
    static FacadeManager: FacadeManager;

    /**
     * 系统设置
     */
    static SystemSettingManager: SystemSettingManager

    /**
     * 已弃用，请使用装饰器 @see bindFguiExtension
     * FGUI 访问入口
     * @deprecated
     */
    public static get FGUIManager(): FGUIManager {
        return FGUIManager.ins();
    }


    /**
     * 画布中心位置, 世界坐标
     */
    static get CanvasCenterWorldPosition(): Vec3 {
        const worldPosition = G.Canvas.worldPosition;
        return worldPosition.clone();
    }

    /**
     * 画布
     */
    static get Canvas(): Node {
        return find("/Canvas");
    }

    /**
     * FGUI 根节点
     * @constructor
     */
    static get FguiRoot(): fgui.GRoot {
        return fgui.GRoot.inst;
    }

    /**
     * UI 相机
     * @constructor
     */
    static get CameraForUI(): Camera {
        const uiCameraPath = "/Canvas/Camera";
        const camera = find(uiCameraPath)?.getComponent(Camera);
        if (!camera) {
            G.Logger.error(`UI Camera not found, path = ${uiCameraPath}`);
        }
        return camera;
    }


    /**
     * 唯一id生成
     * */
    public static get guid(): string {
        return Utils.getGUID();
    }

    /**
     * 重启游戏
     */
    public static reload() {
        if (sys.isNative) {
            NativeAPI.splash(true);

            setTimeout(() => {
                game.restart();
            }, 200);
        } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            // @ts-ignore
            wx?.restartMiniProgram();
        } else if (window.location && window.location.reload) {
            window.location.reload();
        }

        //SdkManager 需要上报
    }

    /**
     * 退出游戏
     */
    public static exitGame() {
        if (sys.isNative) {
            NativeAPI.exitGame();
        } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            // @ts-ignore
            wx?.exitMiniProgram();
        } else {
            window.close?.();
        }
    }

    // /**
    //  * 地图管理器 for TiledMap | game 里面
    //  */
    // public static get MapManager(): MapManager {
    //     return MapManager.ins()
    // }
}