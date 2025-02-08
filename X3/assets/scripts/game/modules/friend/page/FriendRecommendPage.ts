import G from "../../../../core/comm/G";
import { FriendI18nKeys } from "../const/FriendI18nKeys";
import { FriendRecommendItem } from "../item/FriendRecommendItem";
import { FriendModel } from "../model/FriendModel";
import { FriendBasePage } from "./FriendBasePage";


/** 好友列表推荐页面 */
export class FriendRecommendPage extends FriendBasePage {
    static pkgName: string = "friend";
    static viewName: string = "FriendRecommendPage";

    protected _datas: Vo.friend.FriendQueryVo[] = []
    /**是否可刷新*/
    protected _isBtnRefreshEnabled: boolean = true
    /**最大刷新间隔(毫秒)*/
    protected _maxRefreshInterval: number = 5000

    private get view(): ui.friend.page.FriendRecommendPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRenderer.bind(this)

        this.view.btnRefresh.onClick(this.onClickRefresh, this)
        this.view.btnRefresh.title = G.I18nManager.lang(FriendI18nKeys.refresh)
        this._maxRefreshInterval = FriendModel.ins().recommendRefreshInterval * 1000

    }

    protected onTimer(): void {
        this.updateRefreshBtn()
    }

    protected onClickRefresh(): void {
        FriendModel.ins().sendGetRecommendPlayers()
        FriendModel.ins().lastClickRefreshRecommendTime = Date.now()
        this.updateRefreshBtn()
    }

    protected onEnable(): void {
        super.onEnable()
        this.updateRefreshBtn()
        FriendModel.ins().checkAndRefreshRecommends()
        G.GameTimer.loop(500, this, this.onTimer)
        // console.log('FriendRecommendPage onEnable')
    }

    protected onDisable(): void {
        G.GameTimer.clearAll(this)
        // console.log('FriendRecommendPage onDisable')
    }

    protected itemRenderer(index: number, item: ui.friend.item.FriendRecommendItem): void {
        //@ts-ignore
        let itemComp = item as FriendRecommendItem
        itemComp.setData(this._datas[index])
    }

    protected updateRefreshBtn() {
        //刷新剩余时间
        let countDownTime = this._maxRefreshInterval - Date.now() + FriendModel.ins().lastClickRefreshRecommendTime
        let canRefresh = countDownTime <= 0
        if (this._isBtnRefreshEnabled != canRefresh) {
            this._isBtnRefreshEnabled = canRefresh
            this.setOperBtnEnabled(this.view.btnRefresh, canRefresh)
            this.view.lbRefreshTime.visible = !canRefresh
        }
        if (this.view.lbRefreshTime.visible) {
            this.view.lbRefreshTime.text = G.I18nManager.lang(FriendI18nKeys.refreshCountDown, Math.ceil(countDownTime / 1000))
        }
    }

    public updateUI(): void {
        super.updateUI()
        this._datas = FriendModel.ins().recommends.filter((value) => { return FriendModel.ins().isFriend(value.playerVo.baseVo.id) == false })
        this.view.list.numItems = this._datas.length
        this.updateRefreshBtn()
    }

}