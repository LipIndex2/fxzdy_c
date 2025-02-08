import G from "../../../../core/comm/G";
import { FriendI18nKeys } from "../const/FriendI18nKeys";
import { FriendApplyItem } from "../item/FriendApplyItem";
import { FriendModel } from "../model/FriendModel";
import { FriendBasePage } from "./FriendBasePage";


/** 好友申请页面 */
export class FriendApplyPage extends FriendBasePage {
    static pkgName: string = "friend";
    static viewName: string = "FriendApplyPage";

    protected _datas: Vo.friend.FriendApplyVo[] = []

    private get view(): ui.friend.page.FriendApplyPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRenderer.bind(this)
        this.view.btnSure.onClick(this.onClickSure, this)
        this.view.btnCancel.onClick(this.onClickCancel, this)

        this.view.btnSure.title = G.I18nManager.lang(FriendI18nKeys.acceptAll)
        this.view.btnCancel.title = G.I18nManager.lang(FriendI18nKeys.ignoreAll)
    }

    protected onClickSure(): void {
        FriendModel.ins().sendAgreeAllApply()
    }

    protected onClickCancel(): void {
        FriendModel.ins().sendDisagreeAllApply()
    }

    protected onEnable(): void {
        super.onEnable()
        FriendModel.ins().checkAndRefreshApplies()
    }
    protected onDisable(): void {
    }

    protected itemRenderer(index: number, item: ui.friend.item.FriendApplyItem): void {
        //@ts-ignore
        let itemComp = item as FriendApplyItem
        itemComp.setData(this._datas[index])
    }

    public updateUI(): void {
        super.updateUI()
        this._datas = FriendModel.ins().applies

        this.view.list.numItems = this._datas.length

        this.setOperBtnEnabled(this.view.btnSure, this._datas.length > 0)
        this.setOperBtnEnabled(this.view.btnCancel, this._datas.length > 0)

        this.view.gNone.visible = this._datas.length <= 0 && FriendModel.ins().isAppliesRefreshed()
    }

}