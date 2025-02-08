import { _decorator, Component, DynamicAtlasManager, macro } from 'cc';
import FGUIManager from '../fgui/FGUIManager';
import { ResManager } from '../res/ResManager';
import { TimeManager } from '../time/TimeManager';
import { ScreenAdaptManager } from '../comm/ScreenAdaptManager';
import { LayerManager } from '../comm/LayerManager';
import { NativeAPI } from '../native/NativeAPI';
import G from '../comm/G';
import { Logger } from '../log/Logger';
import { GameTimer } from '../timer/GameTimer';
import BattleTimer from '../timer/BattleTimer';
import FacadeManager from '../mvc/FacadeManager';
import { I18nManager } from '../i18n/I18nManager';
import { UIManager } from '../mvc/UIManager';
import { TableManager } from '../table/TableManager';
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";

const { ccclass } = _decorator;

@ccclass('BaseLauncher')
export class BaseLauncher extends Component {

    protected onLoad(): void {
        this.init();
    }

    protected init(): void {
        macro.CLEANUP_IMAGE_CACHE = false;
        DynamicAtlasManager.instance.enabled = false;

        NativeAPI.init();
        ScreenAdaptManager.ins().init();

        // init Manager
        LayerManager.ins().init();
        FGUIManager.ins().init();
        TimeManager.initTime();


        this.injectG();

        // init done
        this.run();
    }

    /**依赖注入 */
    private injectG() {
        G.TableManager = TableManager;
        G.Logger = Logger;
        G.TimeManager = TimeManager;
        G.GameTimer = GameTimer.ins();
        G.BattleTimer = BattleTimer.ins();

        //G.FGUIManager = FGUIManager.ins();
        G.FacadeManager = FacadeManager.ins();
        G.I18nManager = I18nManager.ins();

        G.UIManager = UIManager.ins();
        G.SystemSettingManager = SystemSettingManager.ins();
    }

    /**
     * 子类复写，框架初始化完成
     */
    protected run(): void {
        // run when init done

    }

    protected update(dt: number): void {
        ResManager.ins().onUpdate(dt);
        TimeManager.update(dt);
        //G.AudioManager.onUpdate(dt);
    }

}


