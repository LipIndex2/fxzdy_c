import G from "db://assets/scripts/core/comm/G";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";

@bindScript(UIPetDungeonConfig.PetDungeonToyInfoWin)
export class PetDungeonToyInfoWin extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyInfoWin";

    protected _configId: number = 0;

    public get view(): ui.petDungeon.view.PetDungeonToyInfoWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    protected updateUI(): void {
        let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, this._configId);
        if (cfg) {
            this.view.iconLoader.icon = cfg.icon;
            this.view.lbLv.text = 'Lv.' + cfg.lv;
            if (cfg.addAttrArray?.length > 0) {
                //有属性展示属性
                let attrName: string = GIns.attrMgr.getAttrNameByType(cfg.addAttrArray[0].k);
                let attrEffect = AttrConfigEffect.create(cfg.addAttrArray[0].k, cfg.addAttrArray[0].v);
                this.view.lbAttr.text = `${attrName} <color=#1DE451>${attrEffect.getShowValueTextWithSymbol()}</color>`;
            } else {
                //没有属性展示技能名称
                let skillCfg = G.TableManager.getDataById(table.battle.SkillConfig, cfg.skillIds);
                if (skillCfg) {
                    this.view.lbAttr.text = StringUtils.repleaceDescToAtkImage(skillCfg.desc);
                } else {
                    this.view.lbAttr.text = '';
                }
            }
        } else {
            this.closeSelf();
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._configId = args;
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}