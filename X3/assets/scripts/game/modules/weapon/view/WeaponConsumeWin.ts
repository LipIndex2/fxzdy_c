import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { UIWeaponConsumeOpenData } from "../const/UIWeaponConfig";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponConsumeItem } from "../item/WeaponConsumeItem";
import { WeaponVo } from "../vo/WeaponVo";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器消耗界面
 */
export class WeaponConsumeWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponConsumeWin";

    protected _openData: UIWeaponConsumeOpenData = null

    protected _consumeVos: WeaponVo[] = []

    protected _selectVoMap: Map<number, WeaponVo> = new Map()

    protected _maxCnt: number = 0

    private get view(): ui.weapon.view.WeaponConsumeWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.HERO_UP_STAR,
            NotificationKey.HERO_UP_STAGE,
            NotificationKey.HERO_SWITCH_HERO,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.EVENT_CHANGE_ITEMS2,
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.HERO_SWITCH_HERO:
                break;
            case NotificationKey.HERO_UP_LEVEL:
            case NotificationKey.HERO_UP_STAGE:
            case NotificationKey.HERO_UP_STAR:
            case NotificationKey.EVENT_CHANGE_ITEMS:
            case NotificationKey.EVENT_CHANGE_ITEMS2:
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
                break;
        }
    }

    protected onInit(): void {
        this.view.listConsume.setVirtual()
        this.view.listConsume.itemRenderer = this.itemRender.bind(this)
        this.view.listConsume.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        this.view.btnSure.onClick(this.onClickSure, this)

        this.view.lbTitle.text = G.I18nManager.lang(WeaponI18nKeys.myWeapon)
        this.view.btnSure.title = G.I18nManager.lang(WeaponI18nKeys.confirmSelection)
    }

    protected itemRender(index: number, item: ui.weapon.item.WeaponConsumeItem): void {
        //@ts-ignore
        let comp = item as WeaponConsumeItem
        comp.setData(this._consumeVos[index], index)

        let isSelect = this._selectVoMap.has(this._consumeVos[index].base.id)
        comp.setSelectState(isSelect)

        comp.setSelectEnabled(this._selectVoMap.size < this._maxCnt)
    }

    protected onClickItem(item: WeaponConsumeItem): void {
        let index = item.index//this.view.listConsume.getChildIndex(item)
        let data = this._consumeVos[index]
        let isSelect = this._selectVoMap.has(data.base.id)

        if (isSelect) {
            this._selectVoMap.delete(data.base.id)
        } else {
            if (this._selectVoMap.size >= this._maxCnt) {
                //代表已经选满了 不能再选
                return
            }
            this._selectVoMap.set(data.base.id, data)
        }
        this.view.listConsume.numItems = this._consumeVos.length
    }

    protected onClickSure(): void {
        this.closeSelf()
    }

    protected updateUI(): void {
        this._consumeVos = WeaponManager.ins().getConsumeWeapons(this._openData.target)
        this.view.listConsume.numItems = this._consumeVos.length
    }

    protected onOpen(args: UIWeaponConsumeOpenData, isReopen?: boolean): void {
        this._openData = args
        this._maxCnt = args.selectVos.length
        this._selectVoMap.clear()
        args.selectVos.forEach((value: WeaponVo) => {
            if (value) {
                this._selectVoMap.set(value.base.id, value)
            }
        })

        this.updateUI()

        if (this._selectVoMap.size <= 0) {
            //代表玩家没有选择 默认选中需要的数量
            this._consumeVos.forEach((value: WeaponVo, index: number) => {
                if (value && index < this._maxCnt) {
                    this._selectVoMap.set(value.base.id, value)
                }
            })
            this.view.listConsume.numItems = this._consumeVos.length
        }
    }

    protected onClose(): void {
        //关闭的时候马上将选中的武器发送给升星页面
        this.emitNow(NotificationKey.WEAPON_SELECT_CONSUME_COMPLETE, this._selectVoMap)
    }


}