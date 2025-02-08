import { FriendBlackItem } from "../item/FriendBlackItem";
import { FriendModel } from "../model/FriendModel";
import { FriendBasePage } from "./FriendBasePage";


/** 好友黑名单页面 */
export class FriendBlackPage extends FriendBasePage {
    static pkgName: string = "friend";
    static viewName: string = "FriendBlackPage";

    protected _datas: Vo.friend.FriendQueryVo[] = []
    /**是否可刷新*/
    protected _isBtnRefreshEnabled: boolean = true
    /**最大刷新间隔(毫秒)*/
    protected _maxRefreshInterval: number = 5000

    private get view(): ui.friend.page.FriendBlackPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRenderer.bind(this)
    }

    protected onEnable(): void {
        super.onEnable()
        FriendModel.ins().checkAndRefreshBlacks()
    }

    protected itemRenderer(index: number, item: ui.friend.item.FriendBlackItem): void {
        //@ts-ignore
        let itemComp = item as FriendBlackItem
        itemComp.setData(this._datas[index])
    }

    public updateUI(): void {
        super.updateUI()
        this._datas = FriendModel.ins().blacks
        this.view.list.numItems = this._datas.length
    }

}