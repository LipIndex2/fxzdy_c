import { tween } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import { GameModeTabComp } from "../components/GameModeTabComp";
import { UIGameModeKeys } from "../UIGameModeKeys";


/**
 * 玩法
 */
@bindScript(UIGameModeKeys.GameModeMainView)
export class GameModeMainView extends UIView {

    static pkgName: string = "gameMode";

    static viewName: string = "GameModeMainView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _configArray: table.gameMode.GameModeMainConfig[];

    private get view(): ui.gameMode.GameModeMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SECRET_AREA_UPDATE_INFO,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.GUIDE_GAME_MODE_SCOLL,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SECRET_AREA_UPDATE_INFO:
                this.updateList();
                break
            case NotificationKey.SYSTEM_NEW_DAY:
                //新的天数演示刷新 等待各个模块数据返回
                G.GameTimer.once(1000, this, () => {
                    if (this.view.node.isValid) {
                        this.updateList();
                    }
                });
                break;
            case NotificationKey.GUIDE_GAME_MODE_SCOLL:
                if (args?.length > 0) {
                    let index = Number(args[0]);
                    if (isNaN(index) || index < 0) {
                        index = 0;
                    } else if (index >= this.view.itemList.numItems) {
                        index = this.view.itemList.numItems - 1;
                    }
                    this.view.itemList.scrollToView(index);
                }
                break;
            default:
                break;
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ")


        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.itemList.node.uuid, this.itemRendererForBagpack, this, { delay2: 50 })//this.itemRendererForBagpack.bind(this);
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    public onOpen(args, isReopen = false): void {
        G.Logger.debug(" onOpen ")
        if (isReopen)
            UiTweenMgr.ins().removeListItemRendererEffect(this.view.itemList.node.uuid)
        this.updateGameData();

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)

        // 列表
        let allData = G.TableManager.getAllData(table.gameMode.GameModeMainConfig);
        this._configArray = allData;
        // this._configArray.sort((a:table.gameMode.GameModeMainConfig, b:table.gameMode.GameModeMainConfig)=>{
        //     return a.order - b.order;
        // })
        this.view.itemList.numItems = allData.length;
    }

    private updateGameData() {

        //请求奇点秘境信息协议
        // SecretAreaModule.ins().sendLoadSecretInstanceInfo();
    }

    //刷新活动列表
    updateList() {
        this.view.itemList.refreshVirtualList();
    }


    public onClose(): void {

        G.Logger.debug(" onClose ")
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.itemList.node.uuid)
    }


    private onFguiBack0(event: fgui.Event) {
        AudioManager.ins().playSound(SoundType.winBack)
        this.closeSelf()
    }


    private itemRendererForBagpack(index: number,
        comp: ui.gameMode.components.GameModeTabComp
    ) {
        let config = this._configArray[index];
        if (!config) {
            return;
        }

        let comp1 = FguiScriptUtils.toMyScriptClass(comp, GameModeTabComp);
        comp1.reset(config)

        if (!comp["__onListItemRendererEffect__"]) {
            let targetY = comp.mc.y;
            comp.mc.y -= 30
            tween(comp.mc).delay(index * 0.05).to(0.2, { y: targetY }, { easing: "backOut" }).start()
        }

        //放到GameModeTabComp里面了，
        // comp.onClick(()=>{
        //     // 条件检查
        //     const isOk = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType[config.moduleId]);
        //     if(isOk){
        //         G.FacadeManager.emit(NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE, config.jumpId);
        //     }else{
        //         GIns.floatingTextMgr.showTips("活动未开启");
        //     }
        // })
    }
}