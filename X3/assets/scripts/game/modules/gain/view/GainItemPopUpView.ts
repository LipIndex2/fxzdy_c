import G from "db://assets/scripts/core/comm/G";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { ItemFrameBtnWithExtra } from "../../common/item/ItemFrameBtnWithExtra";
import { ModelNode } from "../../common/node/ModelNode";
import { IItemRewardParam, ItemRewardFrom } from "../../item/model/vo/IItemRewardParam";
import { UIGainKeys } from "../const/UIGainKeys";
import { GainItemEffectViewOpenArgs } from "./GainItemEffectView";
import { ViewBlackBgComp } from "db://assets/scripts/core/mvc/view/comp/ViewBlackBgComp";

const { GObject } = fgui;

export class GainItemPopUpViewOpenArgs {
    items: NoOwnerItem[];
    param: IItemRewardParam;

    static create(items: NoOwnerItem[], param: IItemRewardParam = null): GainItemPopUpViewOpenArgs {
        const args = new GainItemPopUpViewOpenArgs();
        args.items = items;
        args.param = param;
        return args;
    }
}

/**
 * 基本宝箱 | 打开后必定能获取 xx 道具
 */
@bindScript(UIGainKeys.GainItemPopUpView)
export class GainItemPopUpView extends UICommWin {
    // 获得的道具
    private _gainItemArray: NoOwnerItem[];

    static pkgName: string = "gain";

    static viewName: string = "GainItemPopUpView";

    private _args: GainItemPopUpViewOpenArgs = null;

    protected _oldRewardCnt: number = 0;

    private get view(): ui.gain.GainItemPopUpView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch (eventName) {
        // }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        // 宝箱奖励列表
        this.view.itemList.itemRenderer = this.itemRendererForItem.bind(this);

        this.view.btnPlay.onClick(this.onClickPlay, this);
        this.view.btnDraw.onClick(this.closeSelf, this);
    }

    public onOpen(args: GainItemPopUpViewOpenArgs, isReopen: boolean): void {
        G.Logger.debug(" onOpen ");
        if (isReopen) return;
        this._args = args;
        this.reset(args.items);

        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByPath("spine/ui/gongxihuode/ui_biaotidianzui_tongyong");
        modelNode.playOrders([
            {
                name: "animation",
                isLoop: true,
            },
        ]);

        if (args?.param?.from == ItemRewardFrom.MAP_BOX) {
            //地图宝箱双倍奖励 点击背景不可关闭
            this.view.gAd.visible = true;
            let comp = this.getComp(ViewBlackBgComp) as ViewBlackBgComp;
            if (comp) {
                comp.canCloseByBg = false;
            }
        } else {
            this.view.gAd.visible = false;
            let comp = this.getComp(ViewBlackBgComp) as ViewBlackBgComp;
            if (comp) {
                comp.canCloseByBg = true;
            }
        }
    }

    protected onClickPlay(): void {
        /**将就奖励数据一起传过去*/
        let extra: IItemRewardParam = {
            rewards: null,
            from: ItemRewardFrom.MAP_BOX_AD,
            extra: {
                buildingId: this._args.param.extra,
                oldRewards: this._args.items
            }
        }
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.TRUNK_MAP_BOX_DOUBLE_REWARD,
            extra: extra
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    /**
     * 渲染背包物品列表
     * @private
     */
    private updateScrollViewForItem() {
        this._length = 0;
        this.view.itemList.numItems = this._gainItemArray.length;

        this.itemRendererForTween();
        if (this._gainItemArray.length > 1) {
            G.GameTimer.loop(100, this, this.itemRendererForTween);
            //打开遮罩
            G.UIManager.open(UICommonKey.TouchMaskWin);
        }
    }

    private _length = 0;

    //列表动画
    private itemRendererForTween() {
        if (this._length >= this._gainItemArray.length) {
            G.GameTimer.clearAll(this);
            //关闭遮罩
            G.UIManager.close(UICommonKey.TouchMaskWin);
            return;
        }
        const child = this.view.itemList.getChildAt(this._length) as ItemFrameBtnWithExtra;
        if (child) {
            child.playAnim();
        }
        this._length += 1;
    }

    protected onClose(): void {
        G.Logger.debug(" onClose ");
        G.GameTimer.clearAll(this);
    }

    protected onPreDispose(): void {
        // let otherPos: { [itemId: number]: { x: number, y: number } } = {};
        // let num = this._gainItemArray.length//Math.floor(this._gainItemArray.length / 2)
        // for (let i = 0; i < num; i++) {
        //     otherPos[this._gainItemArray[i].itemId] = { x: 100, y: 600 }
        // }
        G.UIManager.open(UIGainKeys.GainItemEffectView, GainItemEffectViewOpenArgs.create(this._gainItemArray.concat(), -999, this.view.itemList.y + 200));
    }

    /**
     * 渲染奖励道具
     * @param index
     * @param view 每一个奖励道具
     * @private
     */
    private itemRendererForItem(index: number, view: ui.comm.item.ItemFrameBtnWithExtra) {
        const rewardItemConfigVo = this._gainItemArray[index];
        let itemComp = FguiScriptUtils.toMyScriptClass(view.itemFrame, ItemFrameBtn);
        itemComp.reset(rewardItemConfigVo.itemId, rewardItemConfigVo.count);
        itemComp.setScale(0, 0);
        view.pExtra.alpha = 0;
        if (this._oldRewardCnt > 0 && index >= this._oldRewardCnt) {
            view.pExtra.visible = true;
        } else {
            view.pExtra.visible = false;
        }
    }

    protected mergeReward(gainItemArray: NoOwnerItem[]): NoOwnerItem[] {
        let arr = gainItemArray
            .toDataStream()
            .toMap(
                (item) => item.itemId,
                (item) => item.count,
                (v1, v2) => v1 + v2
            )
            .toDataStream()
            .map((it) => {
                return NoOwnerItem.create(it.key, it.value);
            })
            .filter((it) => it.count > 0)
            .toArray();
        return arr;
    }

    /**
     * 重置界面
     * @param gainItemArray
     */
    public reset(gainItemArray: NoOwnerItem[]): void {
        if (!gainItemArray) {
            return;
        }
        this._gainItemArray = [];
        this._oldRewardCnt = 0;
        if (this._args?.param?.extra?.oldRewards?.length > 0) {
            //有旧奖励需要展示
            let oldArr = this.mergeReward(this._args?.param?.extra?.oldRewards);
            this._oldRewardCnt = oldArr.length;
            this._gainItemArray = this._gainItemArray.concat(oldArr);
        }
        let newArr = this.mergeReward(this._args?.items);
        this._gainItemArray = this._gainItemArray.concat(newArr)
        this.updateScrollViewForItem();
    }
}
