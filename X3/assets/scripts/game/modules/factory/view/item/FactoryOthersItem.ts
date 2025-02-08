import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import GIns from "../../../../GIns";
import { PlayerAvatar } from "../../../common/playerInfo/PlayerAvatar";
import { FactoryOtherMainType } from "../../const/FactoryEnum";
import { FactoryOtherMainViewOpenArgs, UIFactoryConfig } from "../../const/UIFactoryConfig";
import { FactoryUtils } from "../../FactoryUtils";

/**
 * 星际工厂其他人工厂信息item
 */
@bindFguiExtension('ui://factory/FactoryOthersItem')
export class FactoryOthersItem extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryOthersItem";

    protected _data: Vo.factory.PlayerFactoryBaseVo = null
    protected _index: number = 0
    protected _type: FactoryOtherMainType
    protected _timerKey: string = null

    private get view(): ui.factory.item.FactoryOthersItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnGoto.onClick(this.onClickGoto, this)
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onClickGoto(): void {
        let allDatas: Vo.factory.PlayerFactoryBaseVo[] = []
        if (this._type == FactoryOtherMainType.Friend) {
            allDatas = GIns.factoryModel.friends
        } else if (this._type == FactoryOtherMainType.Rank) {
            allDatas = GIns.factoryModel.ranks
        }
        if (allDatas) {
            G.UIManager.close(UIFactoryConfig.FactoryOthersWin)
            G.UIManager.open(UIFactoryConfig.FactoryOtherMainView, FactoryOtherMainViewOpenArgs.create(allDatas, this._index, this._type))
        }
    }

    protected refreshOccupied(): void {
        this.view.gOccupied.visible = false
    }

    public setData(data: Vo.factory.PlayerFactoryBaseVo, index: number, type: FactoryOtherMainType): void {
        this._data = data
        this._index = index
        this._type = type
        G.GameTimer.clearAll(this)
        if (data) {
            this.view.getController('state').selectedIndex = 1
            if (index < 3) {
                //前三名显示图标
                this.view.getController('rank').selectedIndex = index
            } else {
                //其他显示文本
                this.view.getController('rank').selectedIndex = 3
                this.view.lbRank.text = (index + 1) + ''
            }
            FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar).resetByPlayerInfo(data.baseVo)
            this.view.lbName.text = data.baseVo.name
            this.view.lbFight.text = '战力：' + StringUtils.getFightStr(data.baseVo.fight)
            let remainTime: number = data.occupyEndTime - G.TimeManager.serverNow
            if (data.productLineConfigId > 0 && (remainTime > 0 || data.occupyEndTime <= 0)) {
                this.view.gProductLine.visible = true
                let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, data.productLineConfigId)
                if (cfg) {
                    this.view.lbProductLine.text = cfg.name
                    this.view.lbProductLine.color = FactoryUtils.getTextColor(cfg.quality)
                } else {
                    this.view.lbProductLine.text = ''
                }
            } else {
                this.view.gProductLine.visible = false
            }
            if (remainTime > 0) {
                this.view.gOccupied.visible = true
                G.GameTimer.once(remainTime, this, this.refreshOccupied)
            } else {
                this.view.gOccupied.visible = false
            }
            this.view.btnGoto.visible = data.baseVo.id != GIns.playerModel.playerId
        } else {
            this.view.getController('state').selectedIndex = 0
        }
    }
}