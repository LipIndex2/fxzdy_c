import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { BackpackView } from "db://assets/scripts/game/modules/backpack/view/BackpackView";

/**
 * 背包类型按钮
 */
export class BackpackItemTypeButtonView extends fgui.GComponent {


    // 背包视图
    private index: number = 0;
    private _backpackView: BackpackView = null

    // 配置数据
    private _configData: table.bag.BagConfig;

    private _chooseFlag = false

    // region FGUI
    static pkgName: string = "backpack";

    static viewName: string = "buttonItemType";

    // endregion
    public get chooseFlag(): boolean {
        return this._chooseFlag
    }


    private get view(): ui.backpack.buttonItemType {
        return this as any;
    }

    constructor () {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.on(fgui.Event.CLICK, this.onClick0, this);
    }

    public updateData(index: number, data: table.bag.BagConfig) {
        this.index = index
        this._configData = data;

        this._updateViewAfterDataUpdate();
    }

    /**
     * 更新 View
     * @private
     */
    private _updateViewAfterDataUpdate() {
        this.view.laelTitle.text = this._configData.name;
    }

    private onClick0() {

        G.Logger.debug(`点击了背包物品类型, name = ${this._configData.name}`)

        this.setChooseState(true)

        // let comp = this._backpackView.getComp(ViewPageEffectComp);
        // comp.execute("onOpen")
        this._backpackView.updateItemTypeChoose(this.index)
    }

    bindBackpackView(backpackView: BackpackView) {
        this._backpackView = backpackView
    }

    /**
     * 设置选中状态
     * @param chooseFlag
     */
    setChooseState(chooseFlag: boolean) {
        this._chooseFlag = chooseFlag
        this.view.imageChoose.visible = chooseFlag
        this.view.imageNoChoose.visible = !chooseFlag

        // 选中才过滤
        if (chooseFlag) {
            const filterItemTypeArray = this._configData.typeNumberArray as Array<string>;
            this._backpackView.filterItemType(filterItemTypeArray)
        }
    }
}