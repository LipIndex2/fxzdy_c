import { tween } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { GuardShipBattleBuff } from "../../model/vo/GuardShipBattleBuffVo";

@bindFguiExtension('ui://guardShip/GuardShipBuffShowItem')
export class GuardShipBuffShowItem extends fgui.GButton {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipBuffShowItem";

    /**当前品质*/
    protected _quality: number = 0

    protected buffId: number = 0
    protected level: number = 0

    private get view(): ui.guardShip.item.GuardShipBuffShowItem {
        return this as any;
    }

    public updateQuality(quality: number): void {
        let qualityCtrl = this.view.getController('quality')
        if (quality <= 0 || quality >= qualityCtrl?.pageCount) {
            quality = 0
        }
        if (this._quality != quality) {
            this._quality = quality
            this.view.getController('quality').selectedIndex = quality

            let qualityCfg = G.TableManager.getDataById(table.quality.QualityConfig, quality)
            if (qualityCfg) {
                this.view.buffBgLoader.icon = qualityCfg.battleBgImagePath
                this.view.buffSwapLoader.icon = qualityCfg.battleFgIconPath
            }
        }
    }

    public setData(buffData: GuardShipBattleBuff): void {
        let cfg = buffData.cfg?.skillCfg
        this.updateQuality(cfg ? cfg.quality : 0)
        if (cfg) {
            this.view.lbName.text = cfg.name
            this.view.buffLoader.icon = cfg.icon
            this.view.lbDes.lbDes.text = cfg.desc
            if (cfg.targetParam?.length >= 2) {
                if (cfg.targetParam[0] == 1) {
                    //阵营
                    this.view.targetLoader.icon = ItemUtils.getCampIcon(cfg.targetParam[1])
                } else if (cfg.targetParam[0] == 2) {
                    //职业
                    let career: string = cfg.targetParam[1]
                    this.view.targetLoader.icon = ItemUtils.getCareerIcon(ServerEnums.Career[career])
                } else if (cfg.targetParam[0] == 3) {
                    //英雄
                    let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, cfg.targetParam[1])
                    if (heroCfg) {
                        this.view.targetLoader.icon = heroCfg.headPath
                    }
                }
            } else {
                this.view.targetLoader.icon = 'image/icon/all_icon'
            }
        }
    }

    public playEffect(index: number): void {
        this.view.scaleX = 0
        tween(this.view).delay(index * 0.2).to(0.3, { scaleX: 1 }).start()
    }
}