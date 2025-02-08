import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBaseComp } from "../../../../core/mvc/view/comp/ViewBaseComp";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIView } from "../../../../core/mvc/view/UIView";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { IGuardShipBattleSelectBuff } from "../model/vo/GuardShipBattleVo";
import { GuardShipBuffShowItem } from "./item/GuardShipBuffShowItem";

/**
 * 守卫母舰已选择buff
 */
@bindScript(UIGuardShipConfig.GuardShipBuffShowWin)
export class GuardShipBuffShowWin extends UIView {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipBuffShowWin";

    protected _canCloseByBg: boolean = false;

    protected _playEffect: boolean = false
    protected _buffData: IGuardShipBattleSelectBuff = null
    protected _buffIds: number[] = null
    protected _refreshCost: NoOwnerItem = null
    protected _closeFunc: () => void
    private get view(): ui.guardShip.view.GuardShipBuffShowWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GUARDSHIP_BUFF_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUARDSHIP_BUFF_UPDATE:
                this.updateUI()
                break
        }
    }

    protected initComp(): void {
        this.addComp(new ViewBlackBgComp())
    }

    protected onInit(): void {
        this.view.listBuff.setVirtual()
        this.view.listBuff.itemRenderer = this.itemRendererForBuff.bind(this)
        this.view.btnBack.onClick(this.closeSelf, this)
    }

    protected itemRendererForBuff(index: number, item: GuardShipBuffShowItem): void {
        item.setData(GIns.guardShipModel.battleBuffVo.curBuffs[index])
    }

    protected updateUI(): void {
        this.view.listBuff.numItems = GIns.guardShipModel.battleBuffVo.curBuffs.length
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._closeFunc = args?.closeFunc ? args.closeFunc : null
        this.updateUI()
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._closeFunc) {
            this._closeFunc()
        }
    }
}