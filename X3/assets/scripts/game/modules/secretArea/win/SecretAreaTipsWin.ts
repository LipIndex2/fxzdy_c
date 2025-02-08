import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ViewEffectComp } from "../../../../core/mvc/view/comp/ViewEffectComp";
import { TableManager } from "../../../../core/table/TableManager";
import NotificationKey from "../../../event/NotificationKey";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { SecretAreaManager } from "../SecretAreaManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";


/**
 * 秘境boss
 * 二次确认框
 */
@bindScript(UISecretAreaKey.SecretAreaTipsWin)
export class SecretAreaTipsWin extends UIWin {

    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaTipsWin";

    private _type;
    private _closeCllBack;

    private get view(): ui.secretArea.win.SecretAreaTipsWin {
        return this._view as any;
    }

    /***组件初始化 */
    protected initComp(): void {
        this.addComp(new ViewEffectComp([this._view]))
    }

    public onInit(): void {
        this.view.bg.on(fgui.Event.CLICK, this.onClickClose, this);
        this.view.btn_goon.on(fgui.Event.CLICK, this.closeSelf, this);

        this.view.btnNo.on(fgui.Event.CLICK, this.onBtnNo, this);
        this.view.btnYes.on(fgui.Event.CLICK, this.onBtnYes, this);
    }

    public onOpen(data: { type: number, closeCllBack: Function }): void {
        this.cancelAllTouches();
        if (!data) return;
        this._type = data.type;
        this._closeCllBack = data.closeCllBack;
        this.view.getController("c1").selectedIndex = data.type;
        this.updateUI();
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    private updateUI() {
        let cfg: table.secretinstance.SecretInstanceReviveConfig;
        let allCfg = TableManager.getAllData(table.secretinstance.SecretInstanceReviveConfig)
        if (SecretAreaManager.ins().payRebirth >= allCfg.length) {
            cfg = TableManager.getDataById(table.secretinstance.SecretInstanceReviveConfig, allCfg[allCfg.length - 1].id);
        } else {
            cfg = TableManager.getDataById(table.secretinstance.SecretInstanceReviveConfig, SecretAreaManager.ins().payRebirth)
        }
        let itemCfg = ItemUtils.getItemConfigByItemId(cfg.costItems[0].k)
        this.view.T_item.text = cfg.costItems[0].v;
        this.view.img_item.icon = itemCfg.smallIconPath;
        this.view.btnYes.imageItem.icon = itemCfg.smallIconPath;
        let item = ItemModel.ins().getItemById(cfg.costItems[0].k);
        this.view.btnYes.labelCount.text = cfg.costItems[0].v;
        if (item && item.count >= cfg.costItems[0].v) {
            this.view.btnYes.getController("canPayFlag").selectedIndex = 1;
        } else {
            this.view.btnYes.getController("canPayFlag").selectedIndex = 0;
        }

    }

    onClickClose() {
        if (this._type == 0) {
            this.closeSelf();
        }
    }


    public onClose(): void {
        G.Logger.debug(" onClose ")
    }

    //复活按钮
    private onBtnYes() {
        G.FacadeManager.emit(NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH, false);
    }

    private onBtnNo() {
        // if(this._type == 1){
        //     //返回起点复活（免费复活）
        //     G.FacadeManager.emit(NotificationKey.BATTLE_PLAY_REQUEST_REBIRTH, true);
        // }else{
        //退出副本
        if (this._closeCllBack) {
            this._closeCllBack();
        }
        this.closeSelf();
        // }
    }
}