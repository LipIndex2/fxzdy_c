import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { AttrEnum } from "../../../comm/battle/attribute/AttrEnum";
import { WorldUnitTeam } from "../../../comm/battle/enum/BattleEnum";
import { HeroUnit } from "../../../comm/battle/unit/battle/HeroUnit";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { UIGuardShipConfig } from "../const/UIGuardShipConfig";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import G from "../../../../core/comm/G";

/**
 * 守卫母舰选择buff
 */
@bindScript(UIGuardShipConfig.GuardShipHeroAttrWin)
export class GuardShipHeroAttrWin extends UIWin {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipHeroAttrWin";

    protected _canCloseByBg: boolean = false;

    protected _attrTypes: Attribute[] = []
    protected _attrNames: string[] = []
    protected _attrEffects: AttrConfigEffect[] = []
    protected _heros: HeroUnit[] = []
    protected _curIndex: number = -1

    private get view(): ui.guardShip.test.GuardShipHeroAttrWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [

        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected onInit(): void {
        this._attrTypes = [
            Attribute.ATK_BONUS,
            Attribute.DEF_BONUS,
            Attribute.HP_BONUS,
            Attribute.CRI_RATE,
            Attribute.CRI_DMG,
            Attribute.DMG_INC,
            Attribute.DMG_RES,
            Attribute.ATK_SPD,
            Attribute.HR_INC,
            Attribute.BAD_INC,
            Attribute.SD_INC,
            Attribute.ARP,
            Attribute.HL_INC,
            Attribute.RANGE_DMG_RES,
            Attribute.RNG_DEF,
            Attribute.ML_DEF,
            Attribute.DOD_RATE,
            Attribute.MOVE_SPD,
            Attribute.CDR,
            Attribute.RNG_DEF,
            Attribute.DEF_DEC,
            Attribute.LIFE_STEAL,
        ]
        this._attrTypes.forEach((value) => {
            this._attrNames.push(GIns.attrMgr.getAttrNameByType(value))
            this._attrEffects.push(AttrConfigEffect.create(value, 0))
        })
        this.view.pAttr.listAttr.itemRenderer = this.itemRendererForAttr.bind(this)
        this.view.pAttr.btnPrev.onClick(this.onClickPrev, this)
        this.view.pAttr.btnNext.onClick(this.onClickNext, this)
        this.view.bg.onClick(this.closeSelf, this)
    }

    protected itemRendererForAttr(index: number, item: ui.guardShip.test.GuardShopHeroAttrItem): void {
        item.lbName.text = this._attrNames[index]
        item.lbValue.text = this._attrEffects[index].getValueStringForUIShow()
    }

    protected onClickPrev():void {
        let prevIndex = this._curIndex - 1
        if (prevIndex < 0) {
            prevIndex = this._heros.length - 1
        }
        this.setHeroIndex(prevIndex)

    }

    protected onClickNext():void {
        let nextIndex = this._curIndex + 1
        if (nextIndex >= this._heros.length) {
            nextIndex = 0
        }
        this.setHeroIndex(nextIndex)
    }

    protected setHeroIndex(index: number): void {
        if (this._curIndex != index) {
            this._curIndex = index
            this.updateAttrs()
            this.view.pAttr.lbName.text = this._heros[index].heroName
        }
    }

    protected updateAttrs(withAni: boolean = false): void {
        let curHero = this._heros[this._curIndex]
        if (curHero) {
            this._attrEffects.forEach((effect) => {
                effect.value = curHero.getAttrValue(AttrEnum[effect.attrId])
            })
            this.view.pAttr.listAttr.numItems = this._attrEffects.length
        }
    }

    protected onTimer():void {
        this.updateAttrs()
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._heros = GIns.battleMgr.curUnitProcessor.getUnitsByTeamId(WorldUnitTeam.Self) as HeroUnit[];
        this.setHeroIndex(0)
        G.GameTimer.loop(5000, this, this.onTimer)
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this)
    }
}