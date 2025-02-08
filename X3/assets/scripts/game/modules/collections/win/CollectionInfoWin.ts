import G from "../../../../core/comm/G"
import { bindScript } from "../../../../core/comm/UIScriptManager"
import { UICommWin } from "../../../../core/mvc/view/UICommWin"
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils"
import { TimeUtils } from "../../../comm/utils/TimeUtils"
import NotificationKey from "../../../event/NotificationKey"
import GIns from "../../../GIns"
import { AttrUtils } from "../../attr/utils/AttrUtils"
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem"
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem"
import { HeaderItem } from "../../common/header/HeaderItem"
import { QualityUtils } from "../../common/quality/QualityUtils"
import { RedDotCom } from "../../common/redDot/redDotCom"
import { RedDotKeys } from "../../common/redDot/RedDotKeys"
import { CommonCollectionSkillItem } from "../../hero/item/CommonCollectionSkillItem"
import { CollectionItem2 } from "../com/CollectionItem2"
import { quality2DiCol, UICollectionsKey } from "../const/UICollectionsConfig"

declare global {
    namespace XJ {
        namespace collections {
            interface ICollectionsInfoViewParam {
                collectionId: number
                viewFlag?: number //flag ECollectionInfoViewType, 默认 ECollectionInfoViewType.infoView
            }
        }
    }
}

enum EUpBtnState {
    noShow = 0,     //不显示
    upStar = 1,     //选择升星
    upLV = 2,       //选择升级
}

/** 界面显示类型 */
enum EViewState {
    showInfo = 0,       //信息显示
    showUpStarLV = 1,   //升级升星
}

enum EMaxState {
    no = 0,
    maxStar = 1,
    maxLV = 2,
    noActive = 3,
}

export enum ECollectionInfoViewType {
    infoView = 0, //纯信息展示，无额外显示
    active = 1 << 0, //需要判断显示激活状态
    UP = 1 << 1, //需要判断显示升星升级
}

@bindScript(UICollectionsKey.COLLECTION_INFO)
export class CollectionInfoWin extends UICommWin {
    public static pkgName = "collectibles"
    public static viewName = "CollectionInfoWin"

    private collectionId: number
    private collViewType: ECollectionInfoViewType

    private ctrlUpBtnState: fgui.Controller
    private viewState: EViewState
    private ctrlViewState: fgui.Controller
    private upBtnState: EUpBtnState

    private costItem: NoOwnerItem

    private ctrlMaxState: fgui.Controller

    protected _timerKey: string = null;
    protected _endTime: number = 0;

    protected RTCostId: number[]

    get view(): ui.collectibles.ui.win.CollectionInfoWin {
        return this._view as any
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIONS_UP_LV,
            NotificationKey.COLLECTIONS_UP_STAR,
            NotificationKey.COLLECTIONS_PUSH_EXPIRED,
            NotificationKey.GUIDE_COLLECTION_SHOW_UP_LV_TAB,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIONS_UP_LV: {
                this.updateView();
                this.floatUpLvAttrs();
                break;
            }
            case NotificationKey.COLLECTIONS_UP_STAR:
            case NotificationKey.COLLECTIONS_PUSH_EXPIRED: {
                this.updateView();
                break;
            }
            case NotificationKey.GUIDE_COLLECTION_SHOW_UP_LV_TAB: {
                this.updateTab(EUpBtnState.upLV);
                this.updateMaxState();
                break
            }
        }
    }

    protected onInit() {
        let view = this.view;
        this.ctrlUpBtnState = view.getController("upBtnState");
        this.ctrlViewState = view.getController("viewState");
        this.ctrlMaxState = view.getController("maxState");
        //升级升星按钮
        view.ActBtn.onClick(this.onClickUpBtn, this);
        (view.ActBtn as unknown as BtnChangGui1WithItem).setLbStyle(1);
        view.upStarBtn.onClick(() => {
            this.updateTab(EUpBtnState.upStar);
            this.updateMaxState();
        });
        view.upLvBtn.onClick(() => {
            this.updateTab(EUpBtnState.upLV);
            this.updateMaxState();
        });

        let scale = 1 / view.ActBtn.scaleX;
        view.ActBtn.redDot.setScale(scale, scale);

        view.RTList.itemRenderer = this.itemRendererForHeader.bind(this);
    }

    protected itemRendererForHeader(index: number, item: HeaderItem): void {
        item.reset(this.RTCostId[index], false, false);
    }

    protected onPreDispose(): void {
        this.removeTimer();
    }

    protected addTimer(): void {
        if (this._timerKey == null) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer);
        }
        this.onTimer();
    }

    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
            this._timerKey = null;
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._endTime - nowTime;
        if (remainTime <= 0) {
            this.removeTimer();
            return;
        }
        let timeStr: string = TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
        this.view.lbTime.text = `${timeStr}`;
    }

    protected onOpen(args: XJ.collections.ICollectionsInfoViewParam, isReopen?: boolean) {
        let view = this.view;
        this.collectionId = args.collectionId;
        this.collViewType = args.viewFlag;

        if (this.collViewType & (ECollectionInfoViewType.active | ECollectionInfoViewType.UP)) {
            this.updateTab(EUpBtnState.upStar);
        } else {
            this.updateTab(EUpBtnState.noShow);
        }

        this.updateView();

        FguiScriptUtils.toMyScriptClass(this.view.upLvBtn.redDot, RedDotCom).reset(RedDotKeys.Collections_item_upLV, [this.collectionId]);
        FguiScriptUtils.toMyScriptClass(this.view.upStarBtn.redDot, RedDotCom).reset(RedDotKeys.Collections_item_upStar, [this.collectionId]);
    }

    protected updateView() {
        let view = this.view;
        let collectionsCfgMgr = GIns.collectionsCfgMgr, context = GIns.collectionsModel.context;
        let collectionId = this.collectionId;
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, collectionId);
        let collItemCfg = G.TableManager.getDataById(table.item.ItemConfig, collectionId);
        let qualityConfig: table.quality.QualityConfig = QualityUtils.getQualityConfigById(collCfg.quality);

        view.getController("quality").selectedIndex = quality2DiCol[collCfg.quality];
        view.collectionName.text = collItemCfg.name;
        QualityUtils.setFGUIFontColorByQuality(view.collectionName, collCfg.quality);
        // view.collectionName.color = QualityUtils.getQualityColor(collCfg.quality);

        view.rarityIcon.icon = qualityConfig.qualityTitleIconPath;
        view.pContent.desc.text = collItemCfg.desc;

        //限时道具
        let isTimeLimitColl = GIns.collectionsCfgMgr.isTimeLimitColl(this.collectionId);
        let star: number, LV: number, spTipVisible = false;
        if (this.collViewType & (ECollectionInfoViewType.UP | ECollectionInfoViewType.active)) {
            if (context.isHaveCollection(collectionId)) {
                //已激活收藏品, 显示升星升级
                LV = context.getCollectionLV(collectionId);
                star = context.getCollectionStar(collectionId);
                this.viewState = EViewState.showUpStarLV;
            } else {
                //未拥有的情况下，显示满级满星效果
                this.viewState = EViewState.showInfo
                star = collectionsCfgMgr.getMaxStar(collCfg.quality);
                LV = collectionsCfgMgr.getMaxLV(collCfg.quality);
            }
            if (isTimeLimitColl) {
                //限时道具只能显示激活状态，不能显示升星升级
                this.viewState = EViewState.showInfo;
                spTipVisible = context.isHaveCollection(collectionId);
            }
        } else {
            //单纯看信息的情况下显示满级满星效果
            star = collectionsCfgMgr.getMaxStar(collCfg.quality);
            LV = collectionsCfgMgr.getMaxLV(collCfg.quality);
            this.viewState = EViewState.showInfo;
        }
        view.spTip.visible = spTipVisible;
        this.ctrlViewState.selectedIndex = this.viewState;

        let collectionItem2 = view.collectionItem as unknown as CollectionItem2;
        collectionItem2.setData(collectionId, LV, star);

        view.pContent.lbBaseAttr.text = collectionsCfgMgr.getBaseEffDesc(collectionId, LV);

        let extraStr = collectionsCfgMgr.getExtraEffDesc(collectionId);
        //任务属性
        let accuStr = GIns.collectionsCfgMgr.getAccuEffDesc(collCfg.taskAttrId, star);
        if (accuStr) {
            view.pContent.lbExtraEff.text = `${extraStr}\n${accuStr}`;
        } else {
            view.pContent.lbExtraEff.text = extraStr;
        }

        if (collCfg.extraAttrs != null || collCfg.taskAttrId > 0) {
            //展示附加属性
            this.view.pContent.getController('state').selectedIndex = 0;
        } else {
            this.view.pContent.getController('state').selectedIndex = 1;
        }

        //收藏品主动技能
        let skillInfoItem = view.battleSkill as unknown as CommonCollectionSkillItem;
        let inBattleSkillInfo = GIns.collectionsCfgMgr.getBattleSkill(collectionId);
        if (inBattleSkillInfo) {
            skillInfoItem.visible = true;
            skillInfoItem.updateInfo({
                id: inBattleSkillInfo.id,
            });
        } else {
            skillInfoItem.visible = false;
        }

        this.updateMaxState();

        //倒计时显示
        if (isTimeLimitColl) {
            let vo = GIns.collectionsModel.context.getCollectionById(collectionId);
            if (vo && GIns.collectionsModel.context.isValidTimeLimitCollection(collectionId)) {
                this._endTime = vo.expiredTime;
                this.view.gTime.visible = true;
                this.addTimer();
                return;
            }
        }
        this.view.gTime.visible = false;
        this.removeTimer();
    }

    protected floatUpLvAttrs() {
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, this.collectionId);
        AttrUtils.parseKvArrayToAttrArray(collCfg.growAttrs).forEach((v, index) => {
            G.GameTimer.once(index * 100, this, () => {
                GIns.floatingTextMgr.showAttrItem(
                    `+${v.config.attrName}${v.getShowValueTextWithSymbol()}`,
                    this.view.ActBtn
                );
            })
        });

    }

    protected updateTab(tab: EUpBtnState) {
        if (this.upBtnState === tab) {
            return
        }
        this.upBtnState = tab
        this.ctrlUpBtnState.selectedIndex = tab;

        let view = this.view;
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, this.collectionId);
        let redDot = this.view.ActBtn.redDot, showRed = true;
        switch (this.upBtnState) {
            case EUpBtnState.upLV: {
                this.RTCostId = GIns.collectionsCfgMgr.lvCostIds.concat();
                FguiScriptUtils.toMyScriptClass(redDot, RedDotCom).reset(RedDotKeys.Collections_item_upLV, [this.collectionId]);
                break;
            }
            case EUpBtnState.upStar: {
                this.RTCostId = [collCfg.fragmentItemId];
                FguiScriptUtils.toMyScriptClass(redDot, RedDotCom).reset(RedDotKeys.Collections_item_upStar, [this.collectionId]);
                break;
            }
            default: {
                this.RTCostId = null;
                showRed = false;
                break;
            }
        }
        view.RTList.numItems = this.RTCostId ? this.RTCostId.length : 0;
        redDot.visible = showRed;

    }


    protected updateMaxState() {
        let context = GIns.collectionsModel.context;
        let maxState = EMaxState.no;
        let collCfg = G.TableManager.getDataById(table.collectibles.CollectiblesConfig, this.collectionId);
        this.costItem = null;

        //是否限时道具
        if (this.collViewType & (ECollectionInfoViewType.UP | ECollectionInfoViewType.active)) {
            let isHaveCollection = context.isHaveCollection(this.collectionId);
            if (isHaveCollection == false) {
                //无收藏品，显示未激活
                maxState = EMaxState.noActive;
            }

            let isTimeLimitColl = GIns.collectionsCfgMgr.isTimeLimitColl(this.collectionId);
            if (isTimeLimitColl == false && isHaveCollection) {
                //有收藏品并且不是限时道具
                switch (this.upBtnState) {
                    case EUpBtnState.upLV:
                        if (context.isMaxLV(this.collectionId)) {
                            //显示满级
                            maxState = EMaxState.maxLV;
                        } else {
                            let LV = GIns.collectionsModel.context.getCollectionLV(this.collectionId);
                            let lvCfg = GIns.collectionsCfgMgr.getLVCfg(collCfg.quality, LV + 1);
                            this.costItem = NoOwnerItem.createByConfigKv(lvCfg.costItems[0]);
                        }
                        break;
                    case EUpBtnState.upStar:
                        if (context.isMaxStar(this.collectionId)) {
                            //显示满星
                            maxState = EMaxState.maxStar;
                        } else {
                            let star = GIns.collectionsModel.context.getCollectionStar(this.collectionId);
                            let starCfg = GIns.collectionsCfgMgr.getStarCfg(collCfg.quality, star + 1);
                            this.costItem = NoOwnerItem.create(collCfg.fragmentItemId, starCfg.fragmentCostAmount);
                        }
                        break;
                }
            }
        }
        this.ctrlMaxState.selectedIndex = maxState;

        if (this.costItem) {
            let btn = this.view.ActBtn as unknown as BtnChangGui1WithItem;
            btn.reset(btn.title, this.costItem);
        }
    }

    protected onClickUpBtn() {
        if (this.costItem.isCanPay(true)) {
            if (this.upBtnState == EUpBtnState.upLV) {
                GIns.collectionsModel.upLevel(this.collectionId);
            } else if (this.upBtnState == EUpBtnState.upStar) {
                GIns.collectionsModel.upStar(this.collectionId);
            }
        }
    }
}