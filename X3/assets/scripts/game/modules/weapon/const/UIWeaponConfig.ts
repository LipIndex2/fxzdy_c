import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { WeaponConsumeWin } from "../view/WeaponConsumeWin";
import { WeaponInfoPreviewWin } from "../view/WeaponInfoPreviewWin";
import { WeaponInfoWin } from "../view/WeaponInfoWin";
import { WeaponUpStarSuccWin } from "../view/WeaponUpStarSuccWin";
import { WeaponUpStarTipWin } from "../view/WeaponUpStarTipWin";
import { WeaponUpStarWin } from "../view/WeaponUpStarWin";
import { WeaponWearWin } from "../view/WeaponWearWin";
import { WeaponVo } from "../vo/WeaponVo";


export enum UIWeaponInfoFrom {
    /**点击背包武器*/
    Bag = 1,
    /**点击英雄装备武器*/
    HeroWear,
    /**点击选择武器界面*/
    WearSelect
}

export interface UIWeaponInfoOpenData {
    data: WeaponVo
    from: UIWeaponInfoFrom
    curHeroId?:number
}

export interface UIWeaponConsumeOpenData {
    target:WeaponVo
    selectVos:WeaponVo[]
}

export enum UIWeaponConfig {
    /** 武器信息页面 */
    WEAPON_INFO_VIEW = "WEAPON_INFO_VIEW",
    /** 武器升星页面 */
    WEAPON_UP_STAR_VIEW = "WEAPON_UP_STAR_VIEW",
    /** 武器升星确认页面 */
    WEAPON_UP_STAR_TIP_VIEW = "WEAPON_UP_STAR_TIP_VIEW",
    /** 武器升星成功页面 */
    WEAPON_UP_STAR_SUCC_VIEW = "WEAPON_UP_STAR_SUCC_VIEW",
    /** 武器穿戴页面 */
    WEAPON_WEAR_VIEW = "WEAPON_WEAR_VIEW",
    /** 武器消耗页面 */
    WEAPON_CONSUME_VIEW = "WEAPON_CONSUME_VIEW",
    /** 武器预览页面 */
    WEAPON_INFO_PREVIEW_VIEW = "WEAPON_INFO_PREVIEW_VIEW",
}

UIScriptManager.bindScript(UIWeaponConfig.WEAPON_INFO_VIEW, WeaponInfoWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_UP_STAR_VIEW, WeaponUpStarWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_UP_STAR_TIP_VIEW, WeaponUpStarTipWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_UP_STAR_SUCC_VIEW, WeaponUpStarSuccWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_WEAR_VIEW, WeaponWearWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_CONSUME_VIEW, WeaponConsumeWin);
UIScriptManager.bindScript(UIWeaponConfig.WEAPON_INFO_PREVIEW_VIEW, WeaponInfoPreviewWin);