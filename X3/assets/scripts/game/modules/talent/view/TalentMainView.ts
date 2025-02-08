import { TalentOneLvComp } from "db://assets/scripts/game/modules/talent/components/TalentOneLvComp";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ConstTalent } from "db://assets/scripts/game/modules/talent/const/ConstTalent";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { UITransform, v2, Vec3 } from "cc";
import {
    TalentConfirmLvUpViewComp
} from "db://assets/scripts/game/modules/talent/components/TalentConfirmLvUpViewComp";
import { EnumOpenSide, TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import { TalentUtils } from "db://assets/scripts/game/modules/talent/utils/TalentUtils";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { TalentConfigManager } from "db://assets/scripts/game/modules/talent/config/TalentConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { FguiGListUtils } from "db://assets/scripts/core/utils/FguiGListUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";


/**
 * 天赋 v3
 */
export class TalentMainView extends UIPage {

    static pkgName: string = "talent";
    static viewName: string = "TalentMainView";


    // <行id, 小天赋>
    private _rowIdToSmallTalentMap: Map<number, table.talent.TalentConfig> = new Map();
    // <行id, 大天赋>
    private _rowIdToBigTalentMap: Map<number, table.talent.TalentConfig> = new Map();
    // anim ?
    private _isAnimBar: boolean = false;
    private _scrollFirst = false;
    // 可升级的大天赋行 id
    private _canLvUpBigTalentRowId: number = 0;

    private get view(): ui.talent.TalentMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.TALENT_CHANGE,
            NotificationKey.TALENT_CLICK_BIG_LV_UP_TIPS,
        ];

    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.resetHeaderItem();
                this.refreshOneKeyLvUp();
                break;
            }
            case NotificationKey.TALENT_CHANGE: {
                setTimeout(() => {
                    if (NodeUtils.isNotValidNode(this.view.node)) {
                        return;
                    }
                    this.onLvUpTalentId(args);
                    this.view.emptyBtn.visible = false;
                    // this.resetView();
                }, 200);
                this.playLvUpAni(args)
                break;
            }
            case NotificationKey.TALENT_CLICK_BIG_LV_UP_TIPS: {
                this.onClickBigTalentLvUpTips(args);
                break;
            }
            case NotificationKey.TALENT_CAN_LV_UP_BIG: {
                this.onSetCanLvUpBigTalent(args);
                break;
            }
        }

    }


    protected onPreDispose() {
        super.onPreDispose();

        GameTimer.ins().clearAll(this);
    }

    public onInit(): void {
        Logger.debug(" onInit ")

        // 触摸外部
        this.view.footer.btnBack.clearClick();
        this.view.footer.btnBack.onClick(this.onFguiClickExit, this);

        this.view.lvUpTalentTipsTop.onClick(this.onClickTipsR, this);
        this.view.lvUpTalentTipsDown.onClick(this.onClickTipsR, this);

        // 列表 
        this.view.talentList.setVirtual();
        this.view.talentList.itemRenderer = this.irRow.bind(this);

        // 监听 talentList 的滚动事件
        this.view.talentList.on(FGUI.Event.SCROLL, this.onScrollTalentList, this);

        this.setCanSee(false);

        this.view.ruleBtn.onClick(this.onClickRule, this);

        this.view.lvUpTalentTipsTop.visible = false;
        this.view.lvUpTalentTipsDown.visible = false;
        
        // 屏蔽一键升级
        // this.view.btnOneKeyLvUp.onClick(this.onClickBtnOneKeyLvUp, this);
        this.view.btnOneKeyLvUp.visible = false;
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.TALENT, this.view.ruleBtn)
    }

    // talentList 滚动事件回调
    onScrollTalentList() {

        const context = TalentModel.ins().context;

        // 渲染进度背景 | 
        this.refreshVirtualBgBar(this.view.talentList, this.view.barBgL, context.maxRowIdForSmall, -90);
        this.refreshVirtualBgBar(this.view.talentList, this.view.barBgR, context.maxRowIdForBig, -80);

        // 提示 | TODO 先屏蔽
        // this.refreshTipsTop();
        // this.refreshTipsDown();

    }

    private refreshTipsDown() {
        const index = Math.max(0, this._canLvUpBigTalentRowId - 1);
        if (index > 0) {
            let maxCount = this.view.talentList.numItems;
            const targetRowIndex = Math.max(0, maxCount - this._canLvUpBigTalentRowId);
            const childIndex = this.view.talentList.itemIndexToChildIndex(targetRowIndex);

            const canSeeMinIndex = FguiGListUtils.getCanSeeMinIndex(this.view.talentList);
            // 在升级的上方 | 反转了
            if (canSeeMinIndex > targetRowIndex) {
                this.view.lvUpTalentTipsDown.visible = false;
                return;
            }
            if (childIndex < 0 || childIndex >= this.view.talentList.numChildren) {
                this.view.lvUpTalentTipsDown.visible = true;
                return;
            }
            const item = this.view.talentList.getChildAt(childIndex);
            if (!item) {
                this.view.lvUpTalentTipsDown.visible = true;
                return;
            }

            const isChildInView = this.view.talentList.scrollPane.isChildInView(item);

            this.view.lvUpTalentTipsDown.visible = !isChildInView;
        } else {
            this.view.lvUpTalentTipsDown.visible = false;
        }
    }

    private refreshTipsTop() {
        const index = Math.max(0, this._canLvUpBigTalentRowId - 1);
        if (index > 0) {
            let maxCount = this.view.talentList.numItems;
            const targetRowIndex = Math.max(0, maxCount - this._canLvUpBigTalentRowId);
            const childIndex = this.view.talentList.itemIndexToChildIndex(targetRowIndex);

            const canSeeMinIndex = FguiGListUtils.getCanSeeMinIndex(this.view.talentList);
            // 在升级的上方 | 反转了
            if (canSeeMinIndex < targetRowIndex) {
                this.view.lvUpTalentTipsTop.visible = false;
                return;
            }
            if (childIndex < 0 || childIndex >= this.view.talentList.numChildren) {
                this.view.lvUpTalentTipsTop.visible = true;
                return;
            }
            const item = this.view.talentList.getChildAt(childIndex);
            if (!item) {
                this.view.lvUpTalentTipsTop.visible = true;
                return;
            }

            const isChildInView = this.view.talentList.scrollPane.isChildInView(item);

            this.view.lvUpTalentTipsTop.visible = !isChildInView;
        } else {
            this.view.lvUpTalentTipsTop.visible = false;
        }
    }

    onClickBtnOneKeyLvUp() {
        console.info("一键升级天赋");

        const context = TalentModel.ins().context;

        let maxCount = this.view.talentList.numItems;
        const targetRowIndex = Math.max(0, maxCount - this._canLvUpBigTalentRowId - 4);
        this.view.talentList.scrollToView(targetRowIndex, false, true);

        // 连升五级
        const count = TalentConfigManager.ONE_KEY_LV_UP_COUNT;
        const talentIdArray = context.getContinuousLvUpSmallTalentIdArray(count);
        for (let i = 0; i < talentIdArray.length; i++) {
            const talentId = talentIdArray[i];
            GameTimer.ins().once(i * 500, this, () => {
                TalentModel.ins().sendActiveTalent({
                    talentId: talentId
                });
            });
        }

        // 一键升级
        this.view.touchable = false;
        GameTimer.ins().once(3500, this, () => {
            console.info("可以点击了")
            this.view.touchable = true;
        });
    }


    /**
     * 渲染进度条 + 背景
     * @param gList
     * @param bar
     * @param reachRowId
     * @param offsetH
     */
    refreshVirtualBgBar(gList: FGUI.GList,
                        bar: ui.talent.progressBar.TalentFgProgressBar,
                        reachRowId: number,
                        offsetH: number,
    ) {
        // 确保所有项目的边界正确计算，即使超出可视范围
        gList.ensureBoundsCorrect();

        let itemHeight = gList.virtualItemSize.height;

        // 当前滚动位置
        let posY = gList.scrollPane.posY;

        // 当前可见的起始索引
        let startIndex = Math.floor(posY / itemHeight);
        // 当前可见的结束索引
        let endIndex = Math.floor((posY + gList.viewHeight) / itemHeight);

        let maxSize = gList.numItems;

        // startRowId = endIndex
        const startRowId = Math.max(1, maxSize - endIndex)
        // endRowId = startIndex
        const endRowId = Math.max(1, maxSize - startIndex)

        let childIndex1 = gList.itemIndexToChildIndex(startIndex);
        let childAt: FGUI.GObject | null = null;
        // 检查节点是否可见
        if (childIndex1 >= 0 && childIndex1 < gList.numChildren) {
            childAt = gList.getChildAt(childIndex1);
        }


        let canSeeMaxRowId = Math.max(startRowId, endRowId);
        let canSeeMinRowId = Math.min(startRowId, endRowId);
        const diffRowId = canSeeMaxRowId - canSeeMinRowId;

        const context = TalentModel.ins().context;

        // 当前所有看到的行全部激活
        let curSeeAllRowActiveFlag = true;
        if (reachRowId < canSeeMaxRowId) {
            curSeeAllRowActiveFlag = false;
        }

        // --------- 小天赋
        // 计算解锁行的进度条位置
        const unlockRowIndex = Math.max(0, maxSize - reachRowId);
        // 背景激活的进度条
        let rowComp: FGUI.GObject | null = null;
        let childIndex2 = gList.itemIndexToChildIndex(unlockRowIndex);
        if (childIndex2 >= 0 && childIndex2 < gList.numChildren) {
            // -2
            rowComp = gList.getChildAt(childIndex2);
        }
        if (rowComp) {

            // 追加减少部分偏移
            let curY = rowComp.node.worldPosition.y + offsetH;
            // 终点是顶部
            let startY = bar.node.worldPosition.y - bar._uiTrans.height;
            let scrollPaneHeight = gList.scrollPane.viewHeight;

            let relativeY = curY - startY;

            if (relativeY <= 0) {
                bar.value = 0;
            } else {
                let height = Math.abs(relativeY);
                let maxHeight = scrollPaneHeight;
                let percent = (height / maxHeight) * 100;
                // bar.value = percent;

                const oldValue = bar.value;
                if (this._isAnimBar) {
                    bar.tweenValue(percent, 0.6);
                    this._isAnimBar = false;
                } else {
                    bar.value = percent;
                    this._isAnimBar = false;
                }
            }
        } else {
            // 
            if (curSeeAllRowActiveFlag) {
                bar.value = 100;
            }
        }
    }


    public onOpen(): void {
        this._scrollFirst = true;
        Logger.debug(" onOpen ")

        this.view.getController("canOneKey").selectedIndex = 0;
        this._rowIdToSmallTalentMap = TalentConfigManager.getRowIdToConfigMapByType(ServerEnums.TalentType.NORMAL);
        this._rowIdToBigTalentMap = TalentConfigManager.getRowIdToConfigMapByType(ServerEnums.TalentType.ADVANCED);

        this.reset();
    }

    reset() {
        this._canLvUpBigTalentRowId = TalentModel.ins().context.getNextCanLvUpRowId(ServerEnums.TalentType.ADVANCED);
        this.resetView();
        this.resetHeaderItem();
    }

    /**
     * 头顶道具
     */
    resetHeaderItem() {
        const itemId1 = TableManager.getDataById(table.talent.TalentConstantConfig, ConstTalent.KV_CONFIG_HEADER_ITEM_ID_1).content.toInt();
        const itemId2 = TableManager.getDataById(table.talent.TalentConstantConfig, ConstTalent.KV_CONFIG_HEADER_ITEM_ID_2).content.toInt();

        // 对应的头顶图标
        const itemIdToImageLoaderMap = new Map<number, ui.comm.header.HeadItemCompV2>([
            [itemId1, this.view.header1],
            [itemId2, this.view.header2]
        ]);

        itemIdToImageLoaderMap.forEach((headerItem, itemId) => {
            const itemConfig = ItemUtils.getItemConfigByItemId(itemId);
            if (!itemConfig) {
                return;
            }
            headerItem.imageItem.icon = itemConfig.smallIconPath;
            const itemCount = BackpackManager.ins().getItemCountByItemId(itemId) || 0;
            headerItem.labelItemCount.text = itemCount.toString();
        });


    }


    public onClose(): void {

        GameTimer.ins().clearAll(this);

        Logger.debug(" onClose ")

    }


    private onFguiClickExit(event: FGUI.Event) {

        Logger.debug(event, " onTouchEnd ")
        this.closeSelf()
    }

    private irRow(index: number, comp: TalentOneLvComp) {
        comp.setParentView(this);

        // 倒序!
        const rowId = this._rowIdToSmallTalentMap.size - index;

        comp.node.name = "row" + rowId

        // 获取道具
        const smallConfig: table.talent.TalentConfig = this._rowIdToSmallTalentMap.get(rowId);
        const bigConfig: table.talent.TalentConfig = this._rowIdToBigTalentMap.get(rowId);
        comp.reset(rowId, smallConfig, bigConfig);

    }

    // click any talent
    @LogBusiness("点击天赋")
    onClickTalent(talentId: number,
                  clickItemUITransform: UITransform,
                  offsetPos: Vec3
    ) {
        // 确认升级
        const confirmComp = FguiScriptUtils.toMyScriptClass(this.view.confirmComp, TalentConfirmLvUpViewComp);
        confirmComp.reset({
            talentId: talentId
        });

        // mask once
        this.view.emptyBtn.visible = true;
        this.view.emptyBtn.onceClick(() => {
            this.view.emptyBtn.visible = false;
            this.view.confirmComp.visible = false;
        }, this);


        const isBigTalent = TalentUtils.isBigTalent(talentId);

        // 打开的 UI 大小
        const openUITransform: UITransform = this.view.confirmComp._uiTrans;

        // 最后一行
        const side = TouchUtils.getOpenSideByClickItemUI(clickItemUITransform);

        // 打开 ui 的位置
        let uiPosition: Vec3 = null
        if (isBigTalent) {
            // 大天赋
            uiPosition = TouchUtils.calculateFguiOpenUILocalPosition(
                clickItemUITransform,
                openUITransform,
                side,
                (side) => {
                    if (side === EnumOpenSide.TOP) {
                        return v2(-30, 80);
                    }
                    if (side === EnumOpenSide.BOTTOM) {
                        return v2(-30, 0);
                    }
                    return v2(0, 0);
                }
            );
        } else {
            // 小天赋
            uiPosition = TouchUtils.calculateFguiOpenUILocalPosition(
                clickItemUITransform,
                openUITransform,
                side,
                (side) => {
                    if (side === EnumOpenSide.TOP) {
                        return v2(180, 100);
                    }
                    if (side === EnumOpenSide.BOTTOM) {
                        return v2(180, 0);
                    }
                    return v2(0, 0);
                }
            );
        }
        // confirm
        this.view.confirmComp.node.position = uiPosition.clone().add(offsetPos || new Vec3(0, 0, 0));

    }


    private resetView(isScroll: boolean = true) {


        // mask
        this.view.emptyBtn.visible = false;

        // 共鸣等级
        this.view.labelLv
            .setVar("lv", FormationManager.ins().getAvgCommonLevel() + "")
            .flushVars();
        // 天赋
        let maxCount = this._rowIdToSmallTalentMap.size;
        this.view.talentList.numItems = maxCount;


        // 最大激活行
        const maxActiveRowId = TalentModel.ins().getMaxActiveRowId() || 1;
        let startIndex = Math.max(0, maxCount - 1);

        // 滚动到底部
        if (this._scrollFirst) {
            this.view.talentList.scrollToView(startIndex, false, false);
            this._scrollFirst = false;
        }


        this.setCanSee(true);

        if (isScroll) {
            // 滚动到升级目标位置
            const targetRowIndex = Math.max(0, maxCount - maxActiveRowId - 4);
            this.view.talentList.scrollToView(targetRowIndex, true, false)
        }

        this.refreshOneKeyLvUp();


        // bar
        this.onScrollTalentList();
    }


    //  连续升级
    private refreshOneKeyLvUp() {
        const context = TalentModel.ins().context;

        // 是否可以连续升级
        const isCan = context.isCanContinuousLvUpSmallByCount(TalentConfigManager.ONE_KEY_LV_UP_COUNT)
        this.view.getController("canOneKey").selectedIndex = isCan ? 1 : 0;
    }

    private setCanSee(canSee: boolean) {
        const opacity = canSee ? 255 : 0;
        this.view.talentList._uiOpacity.opacity = opacity;
    }

    private onLvUpTalentId(talentId: number) {
        const rowId = TalentConfigManager.getRowIdByTalentId(talentId);
        let maxCount = this.view.talentList.numItems;
        // 滚动到升级目标位置
        const targetRowIndex = Math.max(0, maxCount - rowId - 4);
        this.view.talentList.scrollToView(targetRowIndex, true, false);

        this._isAnimBar = true;

        // bar
        this.onScrollTalentList();

        // GameTimer.ins().once(1000, this, () => {
        //     if (this.view?.node?.isValid) {
        //         this.resetView(false);
        //     }
        // });
    }

    protected playLvUpAni(talentId: number): void {
        const rowId = TalentConfigManager.getRowIdByTalentId(talentId);
        let maxCount = this.view.talentList.numItems;
        let itemIndex = Math.max(0, maxCount - rowId)
        let childIndex = this.view.talentList.itemIndexToChildIndex(itemIndex)
        // 不在视野范围内
        if (childIndex < 0) {
            return;
        }
        let item = this.view.talentList.getChildAt(childIndex);
        if (item) {
            let comp = item as TalentOneLvComp
            comp.playLvUpAni(talentId)
        }
    }

    /**
     * 点击大天赋升级
     * @param rowId
     */
    onClickBigTalentLvUpTips(rowId: number) {
        // 滚动到升级目标位置
        let maxCount = this.view.talentList.numItems;
        const targetRowIndex = Math.max(0, maxCount - rowId - 4);
        this.view.talentList.scrollToView(targetRowIndex, true, true);

        // 更新 大天赋滚动
        const context = TalentModel.ins().context;
        this._canLvUpBigTalentRowId = context.getNextCanLvUpRowId(ServerEnums.TalentType.ADVANCED);
    }

    onSetCanLvUpBigTalent(rowId: number) {
        this._canLvUpBigTalentRowId = rowId;
    }

    onClickTipsR() {
        this.onClickBigTalentLvUpTips(this._canLvUpBigTalentRowId);
    }
}