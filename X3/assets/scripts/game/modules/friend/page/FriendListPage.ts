import G from "../../../../core/comm/G";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { UIFactoryConfig } from "../../factory/const/UIFactoryConfig";
import { FriendI18nKeys } from "../const/FriendI18nKeys";
import { FriendItem } from "../item/FriendItem";
import { FriendModel } from "../model/FriendModel";
import { FriendBasePage } from "./FriendBasePage";


/** 好友列表页面 */
export class FriendListPage extends FriendBasePage {
    static pkgName: string = "friend";
    static viewName: string = "FriendListPage";

    protected _datas: Vo.friend.SingleFriendVo[] = []

    private get view(): ui.friend.page.FriendListPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRenderer.bind(this)
        this.view.btnOnekey.onClick(this.onClickOnekey, this)

        this.view.btnOnekey.title = G.I18nManager.lang(FriendI18nKeys.onkeyGiveAndDraw)
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Friend_giveAndDrawGift)

        this.view.btnFactory.onClick(this.onClickFactory, this)
        FguiScriptUtils.toMyScriptClass(this.view.btnFactory.redDot, RedDotCom).reset(RedDotKeys.Factory)
    }

    protected onClickOnekey(): void {
        FriendModel.ins().sendGiveAndDrawAllFriendGift()
    }

    protected onClickFactory(): void {
        G.UIManager.open(UIFactoryConfig.FactoryMainView)
    }

    protected onEnable(): void {
        super.onEnable()
        FriendModel.ins().checkAndRefreshFriends()
        this.view.btnFactory.visible = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FACTORY)
    }

    protected itemRenderer(index: number, item: ui.friend.item.FriendItem): void {
        //@ts-ignore
        let itemComp = item as FriendItem
        itemComp.setData(this._datas[index])
    }

    public updateUI(): void {
        super.updateUI()
        this._datas = FriendModel.ins().friends
        this.view.list.numItems = this._datas.length

        this.setOperBtnEnabled(this.view.btnOnekey, FriendModel.ins().hasGiveOrDrawGift())
        this.view.lbLimit.text = `每日领取上限：${FriendModel.ins().giftDrawCount}/${FriendModel.ins().maxDrawGiftCount}`
    }

}