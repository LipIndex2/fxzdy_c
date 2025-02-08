import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { AttrData } from "../../attr/AttrManager";
import { ModelNode } from "../../common/node/ModelNode";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { WeaponI18nKeys } from "../const/WeaponI18nKeys";
import { WeaponUpAttrItem } from "../item/WeaponUpAttrItem";
import { WeaponManager } from "../WeaponManager";

/**
 * 武器升星成功界面
 */
export class WeaponUpStarSuccWin extends UICommWin {

    static pkgName: string = "weapon";
    static viewName: string = "WeaponUpStarSuccWin";

    protected _curAttrs: AttrData[] = []
    protected _oldAttrs: AttrData[] = []

    private get view(): ui.weapon.view.WeaponUpStarSuccWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {
    }

    protected onInit(): void {
        this.view.btnClose.onClick(this.onClickClose, this)
        this.view.listAttr.itemRenderer = this.itemRenderer.bind(this)
        this.view.btnClose.title = G.I18nManager.lang(WeaponI18nKeys.great)
    }

    protected itemRenderer(index: number, item: ui.weapon.item.WeaponUpAttrItem): void {
        //@ts-ignore
        let comp = item as WeaponUpAttrItem
        comp.setData(this._curAttrs[index], this._oldAttrs[index], index)
    }

    protected onClickClose(): void {
        this.closeSelf()
    }

    protected updateAttrAndStar(args: Vo.awakeweapon.UpStarS2C): void {
        let vo: Vo.awakeweapon.AwakeWeaponVo = args.content.weaponVo
        let weaponCfg: table.awakeweapon.AwakeWeaponConfig = G.TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, vo.baseId)
        if (weaponCfg) {
            this._curAttrs = WeaponManager.ins().converWeaponAttr(weaponCfg, vo.star)
            this._oldAttrs = WeaponManager.ins().converWeaponAttr(weaponCfg, vo.star - 1)
            this.view.listAttr.numItems = Math.max(this._curAttrs.length, this._oldAttrs.length);
        }
        this.view.listStarOld.numItems = vo.star - 1
        this.view.listStarNew.numItems = vo.star;

        let bagVo = WeaponManager.ins().getWeaponVo(args.content.weaponVo.id)
        if (bagVo) {
            let skillId = bagVo.getSkillByStar(vo.star)
            if (skillId) {
                let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skillId)
                if (skillCfg) {
                    this.view.skillMc.visible = true;
                    this.view.lbSkillDes.text = skillCfg.desc;
                }
            }
        }

    }

    protected updateBackText(args: Vo.awakeweapon.UpStarS2C): void {
        //回退展示
        let backItemCfgMap: Map<number, { cfg: table.item.ItemConfig, cnt: number }> = new Map()
        args.content?.rewardResults?.forEach((value) => {
            let vo = value.contents as Vo.awakeweapon.AwakeWeaponVo
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, vo.baseId)
            if (itemCfg) {
                let cfgData: { cfg: table.item.ItemConfig, cnt: number } = backItemCfgMap.get(itemCfg.id)
                if (cfgData == null) {
                    cfgData = {
                        cfg: itemCfg,
                        cnt: 1
                    }
                    backItemCfgMap.set(itemCfg.id, cfgData)
                } else {
                    cfgData.cnt++
                }
            }
        })
        if (backItemCfgMap.size > 0) {
            //有回退道具
            let itemStrs: string = ""
            backItemCfgMap.forEach((value) => {
                let name: string = G.I18nManager.lang(value.cfg.name)
                let color: string = ItemUtils.getTextColorText(value.cfg.quality)
                itemStrs += G.I18nManager.lang(WeaponI18nKeys.starCount, 0) + `[color=${color}]${name}[/color]x${value.cnt},`
            })
            this.view.lbBackDes.text = G.I18nManager.lang(WeaponI18nKeys.backTip, itemStrs)
        }
    }

    protected onOpen(args: Vo.awakeweapon.UpStarS2C, isReopen?: boolean): void {
        //更新图标
        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, args.content.weaponVo.baseId)
        this.view.iconLoader.icon = itemCfg?.bigIconPath

        this.view.skillMc.visible = false;
        this.updateAttrAndStar(args)
        this.updateBackText(args)

        this.view.getTransition("t0").play();

        let modelNode = this.view.modelNode as ModelNode
        modelNode.loadByPath('spine/ui/gongxihuode/ui_biaotidianzui_tongyong')
        modelNode.playOrders([
            {
                name: 'animation',
                isLoop: true
            }
        ])
    }

    protected onClose(): void {

    }
}