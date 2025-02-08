import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { UIFactoryConfig } from "../../const/UIFactoryConfig";
import { IFactoryRecord } from "../../model/vo/IFactoryRecord";
import GIns from "../../../../GIns";

/**
 * 星际工厂战报item
 */
@bindFguiExtension('ui://factory/FactoryRecordItem')
export class FactoryRecordItem extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryRecordItem";

    protected _recordData: IFactoryRecord = null
    private get view(): ui.factory.item.FactoryRecordItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.onClick(this.onClickItem, this)
    }

    protected onPreDispose(): void {

    }

    protected onClickItem(): void {
        if (this._recordData) {
            if (this._recordData.vo.read == false) {
                //点击了就算已读
                GIns.factoryModel.sendReadFactoryRecord({recordIds:[this._recordData.vo.id]})
            }
            G.UIManager.open(UIFactoryConfig.FactoryRecordDetailWin, this._recordData)
        }
    }

    public setData(data: IFactoryRecord): void {
        this._recordData = data
        this.view.getController('state').selectedIndex = data.vo.read ? 1 : 0
        this.view.lbTitle.text = data.title
        this.view.lbContent.text = StringUtils.cutStr(data.content, 7) + '...'
        let diffTime: number = G.TimeManager.serverNow - data.vo.time
        this.view.lbTime.text = TimeUtils.formatDiffTimeMsToFriendOfflineTimeText(diffTime)
    }
}