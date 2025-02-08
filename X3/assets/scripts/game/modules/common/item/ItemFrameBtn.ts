import * as fgui from "fairygui-cc";
import { tween, Tween, UITransform } from "cc";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventClickItem } from "db://assets/scripts/game/modules/item/event/EventClickItem";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ModelNode } from "../node/ModelNode";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { QualityUtils } from "../quality/QualityUtils";
import { Color } from "cc";

const { GObject } = fgui;

/**
 * 道具图标 ItemFrame
 */
export class ItemFrameBtn extends fgui.GButton {
    // 道具配置
    private _itemConfig: table.item.ItemConfig;
    // 是否在背包中
    private _isInBagFlag: boolean = false;

    static pkgName: string = "comm";

    static viewName: string = "ItemFrameBtn";
    private _count: number = 0;

    private _modelNode1: ModelNode;
    private _modelNode2: ModelNode;
    private _modelNode3: ModelNode;

    //是否可以触发点击事件
    private _isCanClick: boolean = true;

    private get view(): ui.comm.item.ItemFrameBtn {
        return this as any;
    }

    protected onInit() {
        this.view.item.getController("haveGain").selectedIndex = 0;
        this.view.onClick(this.onClickItem, this);
    }

    public onOpen(): void {
        this.isShowLockDesc(false);
    }

    // 是否在背包中
    resetIsInBagFlag(isInBag: boolean) {
        this._isInBagFlag = isInBag;
    }

    /**
     * 设置道具数据
     * @param itemId 物品id
     * @param count 数量
     * @param isShowNum
     */
    reset(itemId: number, count: number, isShowNum: boolean = true) {
        const itemConfig = TableManager.getDataById(table.item.ItemConfig, itemId);
        if (!itemConfig) {
            console.error(`找不到物品配置 ${itemId}`);
            return;
        }
        this._itemConfig = itemConfig;
        this._count = count || 0;

        this.view.item.T_num.text = StringUtils.numShortToKM(count);
        this.isShowCount(this._count > 0 && isShowNum);

        this.view.item.img_item.icon = itemConfig.iconPath;
        // 品质
        const qualityConfig = TableManager.getDataById(table.quality.QualityConfig, itemConfig.quality);
        if (qualityConfig) {
            this.view.item.img_frame.icon = qualityConfig.itemQualityBgPath;
        }
    }

    resetByConfigKv(kv: { k: any; v: any }) {
        this.reset(kv.k, kv.v);
    }

    // 更新 by 无主物品
    resetByNoOwnerItem(noOwnerItem: NoOwnerItem, showCount: boolean = true) {
        this.reset(noOwnerItem.itemId, noOwnerItem.count, showCount);
    }

    private onClickItem(event: fgui.Event) {
        if (!this._isCanClick) return;

        let itemConfig = this._itemConfig;
        if (!itemConfig) {
            console.error("ItemFrameBtn.onFguiClick0: itemConfig is null");
            return;
        }
        console.debug(`点击了道具图标button. itemId = ${itemConfig.id}`);
        if (!itemConfig) {
            return;
        }

        const itemUI = this.view.item.node.getComponent(UITransform);

        // event 点击道具
        FacadeManager.ins().emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, itemConfig, itemUI, this._count));
    }

    public isCanClick(isCan: boolean) {
        this._isCanClick = isCan;
    }

    public isShowCount(isShow: boolean) {
        this.view.item.T_num.visible = isShow;
    }

    public isShowBg(isShow: boolean): void {
        this.view.item.img_frame.visible = isShow;
    }

    /** 顶部数字 */
    public setTopCount(count: number) {
        this.view.item.T_topNum2.visible = true;
        this.view.item.T_topNum2.text = count.toString();
    }

    // 是否领取过
    public setHaveGain(isHaveGain: boolean) {
        this.view.item.getController("haveGain").selectedIndex = isHaveGain ? 1 : 0;
    }

    /** 是否显示锁 */
    public isShowLock(isShow: boolean) {
        this.view.item.getController("lock").selectedIndex = isShow ? 1 : 0;
    }

    /** 是否显示已获得图片 */
    public isShowGet(isShow: boolean): void {
        this.view.item.getController("get").selectedIndex = isShow ? 1 : 0;
    }

    /** 是否显示带描述的锁 */
    public isShowLockDesc(isShow: boolean, desc?: string): void {
        this.view.item.getController("lockAndDesc").selectedIndex = isShow ? 1 : 0;
        this.view.item.T_lockAndDesc.text = desc;
    }

    /** 是否显示名字 */
    public isShowName(isShow: boolean): void {
        this.view.item.T_name.text = isShow ? this._itemConfig.name : "";
        this.view.item.T_name.visible = isShow;
        QualityUtils.setFGUIFontColorByQuality(this.view.item.T_name, this._itemConfig.quality);
    }

    /** 名字是否置灰 */
    public isShowNameGray(): void {
        this.view.item.T_name.color = Color.GRAY;
    }

    // 是否在背包
    setInBackPack(isInBackPack: boolean) {
        if (!isInBackPack) {
            return;
        }

        if (!this._itemConfig) {
            return;
        }

        const type2 = ServerEnums.ItemSecondsType[this._itemConfig.secondsType];
        const isCare = type2 == ServerEnums.ItemSecondsType.DROP_BOX || type2 == ServerEnums.ItemSecondsType.OPTIONAL_BOX;
        if (!isCare) {
            return;
        }

        this.view.redDot.visible = isCare;
    }

    public isPlayedAnim = false;
    public _qualityConfig: table.quality.QualityConfig;

    /** 播放扫光动画 */
    public playAnim(force: boolean = false) {
        const qualityConfig = TableManager.getDataById(table.quality.QualityConfig, this._itemConfig.quality);

        if (this.isPlayedAnim && !force && this._qualityConfig == qualityConfig) {
            //已经播过了
            this.view.modelNode1.visible = true;
            this.view.modelNode2.visible = true;
            return;
        }

        this._qualityConfig = qualityConfig;
        this.isPlayedAnim = true;

        this._modelNode1 = this.view.modelNode1 as ModelNode;
        this._modelNode2 = this.view.modelNode2 as ModelNode;
        this._modelNode1.loadByPath(qualityConfig.drawCardItemPopUpSpinePath);
        this._modelNode2.loadByPath(qualityConfig.drawCardItemSweepSpinePath);

        this.view.modelNode1.visible = true;
        this.view.modelNode2.visible = true;

        Tween.stopAllByTarget(this);
        tween(this.view)
            .call(() => {
                this._modelNode1.play("animation");
            })
            .to(0.2, { scaleX: 1, scaleY: 1 })
            .delay(0.1)
            .call(() => {
                this._modelNode2.playIntervalLoop("animation", 1000, true);
            })
            .start();
    }

    /***播放其他特效，通常是根据对应的表特效字段处理 */
    public playOtherEffect(modelId: number, action?: string): void {
        if (!modelId) {
            this.clearAnim();
            return;
        }

        let modelCfg = TableManager.getDataById(table.model.ModelConfig, modelId);
        if (!modelCfg) return;

        this.view.modelNode3.visible = true;
        this._modelNode3 = this.view.modelNode3 as ModelNode;
        if (this._modelNode3.modleId == modelId) {
            return;
        }

        this._modelNode3.loadByModelId(modelId);

        if (!action) action = modelCfg.action;
        if (modelCfg.uiIntervalMs) {
            this._modelNode3.playIntervalLoop(action, modelCfg.uiIntervalMs, true);
        } else {
            this._modelNode3.play(action, true);
        }
    }

    public playEffect(): void {
        let qualityConfig = TableManager.getDataById(table.quality.QualityConfig, this._itemConfig.quality);

        this._modelNode2 = this.view.modelNode2 as ModelNode;
        this._modelNode2.loadByPath(qualityConfig.drawCardItemSweepSpinePath);

        this.view.modelNode2.visible = true;

        this._modelNode2.playIntervalLoop("animation", 1000, true);
    }

    /** 隐藏扫光动画 */
    public clearAnim() {
        this.view.modelNode1.visible = false;
        this.view.modelNode2.visible = false;
        this.view.modelNode3.visible = false;
    }

    public stopAnim() {
        Tween.stopAllByTarget(this);
        GameTimer.ins().clearAll(this);
        this.view.item.offClick(this.onClickItem, this);
    }

    onPreDispose() {
        Tween.stopAllByTarget(this);
        GameTimer.ins().clearAll(this);
    }
}
