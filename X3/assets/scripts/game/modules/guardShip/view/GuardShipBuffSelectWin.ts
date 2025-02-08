import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { IGuardShipBattleSelectBuff } from "../model/vo/GuardShipBattleVo";
import { GuardShipRefreshBuffBtn } from "./component/GuardShipRefreshBuffBtn";
import { GuardShipBuffSelectItem } from "./item/GuardShipBuffSelectItem";

/**
 * 守卫母舰选择buff
 */
@bindScript(UIGuardShipConfig.GuardShipBuffSelectWin)
export class GuardShipBuffSelectWin extends UICommWin {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipBuffSelectWin";

    protected _canCloseByBg: boolean = false;

    protected _playEffect: boolean = false
    protected _buffData: IGuardShipBattleSelectBuff = null
    protected _buffIds: number[] = null
    protected _refreshCost: NoOwnerItem = null
    protected _closeFunc: () => void
    private get view(): ui.guardShip.view.GuardShipBuffSelectWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GUARDSHIP_BUFF_UPDATE,
            NotificationKey.GUARDSHIP_SELECT_BUFF_REFRESH
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GUARDSHIP_BUFF_UPDATE:
                //选完了buff就关闭
                this.closeSelf()
                break
            case NotificationKey.GUARDSHIP_SELECT_BUFF_REFRESH:
                this.updateUI(true)
                break
        }
    }

    protected onInit(): void {
        this.view.listBuff.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.view.listBuff.itemRenderer = this.itemRendererForBuff.bind(this)

        this.view.btnRefresh.onClick(this.onClickRefresh, this)
    }

    protected itemRendererForBuff(index: number, item: GuardShipBuffSelectItem): void {
        item.setData(this._buffIds[index])
        if (this._playEffect) {
            item.playEffect(index)
        }
    }

    protected onClickItem(item: GuardShipBuffSelectItem): void {
        let childIndex = this.view.listBuff.getChildIndex(item)
        let itemIndex = this.view.listBuff.childIndexToItemIndex(childIndex)
        if (itemIndex >= 0 && itemIndex < this._buffIds.length) {
            this.view.listBuff.touchable = false
            GIns.battleModel.sendSelectBuff(this._buffIds[itemIndex], this._buffData.level, this._buffData.selectCount - 1, GIns.guardShipModel.battleVo.battleConfigId)
        }
    }

    protected onClickRefresh(): void {
        if (!this.refreshBtn.isCanPay(false)) {
            GIns.floatingTextMgr.showTips("钻石不足！")
            return;
        }
        this.view.listBuff.touchable = false
        let buffIds: number[] = GIns.guardShipMgr.getBuffIdsForLevel(this._buffData.level, this._buffData.optionalCount)
        GIns.battleModel.sendRefreshBuff(buffIds, this._buffData.level, this._buffData.selectCount - 1, false, GIns.guardShipModel.battleVo.battleConfigId)
    }

    protected updateUI(withAni: boolean = false): void {
        this.view.listBuff.touchable = true
        this._playEffect = withAni
        let allBuffIds = GIns.guardShipModel.battleVo.waitSelectBuffs
        if (allBuffIds.length > 0) {
            this._buffData = allBuffIds[0]
            let buffGroupIndex = this._buffData.selectCount - 1
            this._buffIds = this._buffData.buffIds.length > buffGroupIndex ? this._buffData.buffIds[buffGroupIndex] : []
            this.view.listBuff.numItems = this._buffIds.length
            this.updateBtns()
        } else {
            this.closeSelf()
        }
    }

    protected updateBtns(): void {
        let battleBuffVo = GIns.guardShipModel.battleBuffVo
        if (battleBuffVo.refreshTimes < battleBuffVo.maxRefreshTimes) {
            this.view.btnRefresh.visible = true
            let remainTimes = battleBuffVo.maxRefreshTimes - battleBuffVo.refreshTimes
            let cfg = G.TableManager.getDataById(table.guardship.GuardShipRefreshConfig, battleBuffVo.refreshTimes + 1)
            if (cfg) {
                if (cfg.costItems?.length > 0) {
                    //有消耗
                    this.refreshBtn.updateUI(cfg.costItems[0].k, cfg.costItems[0].v, remainTimes, battleBuffVo.maxRefreshTimes)
                } else {
                    this.refreshBtn.updateUI(0, 0, remainTimes, battleBuffVo.maxRefreshTimes)
                }
                return
            }
        }
        //无法刷新
        this.view.btnRefresh.visible = false
    }

    protected get refreshBtn(): GuardShipRefreshBuffBtn {
        return FguiScriptUtils.toMyScriptClass(this.view.btnRefresh, GuardShipRefreshBuffBtn)
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