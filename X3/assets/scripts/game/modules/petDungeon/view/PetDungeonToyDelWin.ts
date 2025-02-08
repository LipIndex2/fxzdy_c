import G from "db://assets/scripts/core/comm/G";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { IPetDungeonToyDelOpenArgs, UIPetDungeonConfig } from "../const/UIPetDungeonConfig";

@bindScript(UIPetDungeonConfig.PetDungeonToyDelWin)
export class PetDungeonToyDelWin extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyDelWin";

    //确认回调
    protected _args: IPetDungeonToyDelOpenArgs = null
    protected _isClickOk:boolean = false;

    private get view(): ui.petDungeon.view.PetDungeonToyDelWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    protected onInit(): void {
        this.view.btnSure.onClick(this.onClickConfirm, this);
        this.view.btnCancel.onClick(this.onClickCancel, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickConfirm(): void {
        this._isClickOk = true;
        if (this._args.okFunc) {
            this._args.okFunc();
        }
        this.closeSelf();
    }

    protected onClickCancel(): void {
        this.closeSelf();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args;
        if (this._args) {
            let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonToyConfig, this._args.toyConfigId);
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
        } else {
            this.closeSelf();
        }
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._args.localKey && this.view.btnGouXuan.selected) {
            //选中了今日只提示一次
            let todayZero: number = G.TimeManager.todayZero;
            LocalStorageUtils.set(this._args.localKey, todayZero);
        }
        if (this._isClickOk == false) {
            if (this._args?.cancelFunc) {
                this._args.cancelFunc();
            }
        }
    }
}