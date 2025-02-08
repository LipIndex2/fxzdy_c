import * as fgui from "fairygui-cc";
import { DrawCardModel } from "../../../../game/modules/drawcard/model/DrawCardModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { DrawCardUtils } from "../../../../game/modules/drawcard/utils/DrawCardUtils";
import { ItemUtils } from "../../../../game/modules/item/utils/ItemUtils";
import NotificationKey from "../../../../game/event/NotificationKey";
import { TweenUtils } from "../../../../core/utils/TweenUtils";
import G from "../../../../core/comm/G";
import { NoOwnerItem } from "../../../../game/modules/backpack/vo/NoOwnerItem";
import { ModelUtils } from "../../../../game/modules/common/model/ModelUtils";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { Node, Tween, Vec3 } from "cc";
import { TouchSideUtils } from "../../../../core/utils/TouchSideUtils";
import { DrawCardManager } from "../DrawCardManager";
import { IAnimOrder, ModelNode } from "../../common/node/ModelNode";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { DrawCardConfigManager } from "db://assets/scripts/game/modules/drawcard/config/DrawCardConfigManager";
import { EventClickItem } from "../../item/event/EventClickItem";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { EnumCDKeys } from "db://assets/scripts/core/const/EnumCDKeys";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import GIns from "db://assets/scripts/game/GIns";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

/**
 * 抽卡
 * 普通卡池页
 */
@bindFguiExtension("ui://drawCard/DrawCardNormalPage")
export class DrawCardNormalPage extends fgui.GComponent implements INotification {
    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardNormalPage";

    // 配置
    private _config: table.recruit.RecruitConfig;
    // 抽一发需要消耗的道具
    private _costItemPerDraw: NoOwnerItem;
    // 替代消耗道具
    private _costItemPerDraw2: NoOwnerItem;
    // 进度配置 []
    private _progressConfigArray: table.recruit.NormalRecruitProgressConfig[] = [];
    // 卡池类型
    private _tabType = ServerEnums.RecruitType.NORMAL;
    // 进度
    private _progressIndexToTweenMap = new Map<number, Tween<Node>>();
    // <进度index, 位置>
    private _progressIndexToPosMap = new Map<number, Vec3>();

    private _modelNode0: ModelNode;
    private _modelNode1: ModelNode;
    private _modelNode2: ModelNode;

    private get view(): ui.drawCard.tabPage.DrawCardNormalPage {
        return this as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.CLOSE_ViEW];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CLOSE_ViEW: {
                this.reset();
            }
        }
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
        G.GameTimer.clearAll(this);
        if (this.view.isDisposed) {
            [this.view.d1, this.view.d2, this.view.d3, this.view.d4].forEach((it) => {
                it.clearClick();
            });
        }

        super.onPreDispose();
    }

    protected onInit() {
        FacadeManager.ins().registerNotification(this);

        // shop
        this.view.btnJumpShop.visible = GIns.heroMgr.isHaveAnyHeroReachStarCount(DrawCardConfigManager.normalShopNeedHeroStarCount);
        this.view.btnJumpShop.onClick(this.jumpShop, this);

        this.view.btnDrawCountBox.onClick(this.onClickDrawCardBox, this);

        this.resetSpineAnim();

        // 浮动头像
        this.resetFloatingHeadAnim();

        // 进度
        const allProgressConfigArray = G.TableManager.getAllData(table.recruit.NormalRecruitProgressConfig);
        this._progressConfigArray = allProgressConfigArray;
        [this.view.tips1, this.view.tips2, this.view.tips3, this.view.tips4].forEach((it: ui.drawCard.components.DrawCardProgressTitleComp, index: number) => {
            // 进度条
            const progressConfig = allProgressConfigArray[index];
            if (!progressConfig) {
                return;
            }
            const progressValue = progressConfig.id;
            it.labelTitle.text = progressValue + "";
        });

        this._modelNode0 = this.view.anim0 as ModelNode;
        this._modelNode1 = this.view.anim as ModelNode;
        this._modelNode1.loadByModelId(DrawCardManager.ins().getSpineModelId(0), false);
        this._modelNode2 = this.view.anim1 as ModelNode;
    }

    jumpShop() {
        JumpManager.ins().jumpById(DrawCardConfigManager.normalShopJumpId);
    }

    onClickDrawCardBox() {
        UIManager.ins().open(DrawCardUIKeys.DrawCardProgressRewardWin);
    }

    /**
     * 头像浮动
     * @private
     */
    private resetFloatingHeadAnim() {
        const configs = DrawCardConfigManager.getNormalProgressConfigArray();
        const array = [this.view.d1, this.view.d2, this.view.d3, this.view.d4];
        for (let i = 0; i < array.length; i++) {
            // new tween
            const it = array[i];
            this.resetOneFloatingHeadAnim(i, it);

            const config = configs[i];
            if (config) {
                const needScore = config.id;
                const redDotCom = RedDotUtils.castComp(it.redDot);
                redDotCom.reset(RedDotKeys.drawCard_normalHero_progress, [needScore]);
            }
        }
    }

    /**
     * 重置浮动
     * @param index
     * @param it
     * @private
     */
    private resetOneFloatingHeadAnim(index: number, it: ui.drawCard.components.DrawCardFloatHeadComp) {
        const config = this._progressConfigArray[index];
        if (!config) {
            return;
        }
        const needScore = config.id;
        RedDotUtils.castComp(it.redDot).reset(RedDotKeys.drawCard_normalHero_progress, [needScore]);

        const oldTween = this._progressIndexToTweenMap.get(index);
        if (oldTween) {
            oldTween.stop();
        }
        // reset pos
        const pos = this._progressIndexToPosMap.get(index);
        if (pos) {
            it.head.node.position = pos.clone();
        }
        let offsetY = 10;
        if (index == 3) {
            offsetY = 6;
        }
        const tween = TweenUtils.yoyoOnAxisY(it.head.node, 1, offsetY);
        this._progressIndexToTweenMap.set(index, tween);
    }

    public onOpen(args: any) {
        //背景动画
        this._modelNode0.loadByModelId(10010046);

        // 进度头像点击
        const progressConfigArray = DrawCardConfigManager.getNormalProgressConfigArray();
        const array = [this.view.d1, this.view.d2, this.view.d3, this.view.d4];
        for (let i = 0; i < array.length; i++) {
            const it = array[i];
            this._progressIndexToPosMap.set(i, it.head.node.position.clone());

            it.head.onClick((event: fgui.Event) => {
                const context = DrawCardModel.ins().context;

                // 进度
                const progressConfig = this._progressConfigArray[i];
                if (!progressConfig) {
                    return;
                }

                const needScore = progressConfig.id;

                const isReach = context.isCanGainNormalProgress(needScore, false);
                if (isReach) {
                    // 消红点
                    RedDotManager.ins().markRead(EnumRedDotReadType.LOGIN_ONCE, RedDotKeys.drawCard_normalHero_progress, [needScore]);
                }

                // 未激活月卡
                if (!GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.MONTH)) {
                    UIManager.ins().open(DrawCardUIKeys.DrawCardProgressRewardWin);
                    return;
                }

                // 已付费
                const isCanGain = context.isCanGainNormalProgress(needScore, true);
                if (isCanGain) {
                    if (CdUtils.isInCd(EnumCDKeys.drawCardGainProgress, 1000)) {
                        return;
                    }
                    DrawCardModel.ins().sendDrawNormalRecruitProgressReward([needScore]);
                    return;
                }

                const rewards = progressConfig.rewards;
                const item = ItemUtils.parseKvArrayToOnlyOneItem(rewards);

                const itemUITransform = it.head._uiTrans;
                const touchSide = TouchSideUtils.getTouchSideByFgui(event);

                G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(event, item.getItemConfig(), itemUITransform, item.count));
            }, this);

            const progressConfig = progressConfigArray[i];
            if (progressConfig) {
                it.head.icon = progressConfig.headAssetPath;
                it.light.icon = progressConfig.lightAssetPath;
            }
        }
        //Logger.debug("头像位置", this._progressIndexToPosMap)

        this.reset();
    }

    /**
     * 进度提示
     * @private
     */
    private resetProgressTips() {
        const context = DrawCardModel.ins().context;

        let maxIndex = -1;
        // 进度条提示
        [this.view.tips1, this.view.tips2, this.view.tips3, this.view.tips4].forEach((it, index) => {
            const progressConfig = this._progressConfigArray[index];
            if (!progressConfig) {
                return;
            }
            const progressValue = progressConfig.id;
            // 进度是否超过
            const isPass = context.isCanGainNormalProgress(progressValue, true);
            if (isPass) {
                maxIndex = Math.max(maxIndex, index);
            }
            it.getController("fillFlag").selectedIndex = isPass ? 1 : 0;
        });

        // 策划又说不要让他停下来, 让他有动感!! - = | 来回改, 先不删了
        // 头像
        const headArray = [this.view.d1, this.view.d2, this.view.d3, this.view.d4];
        for (let index = 0; index < headArray.length; index++) {
            const it = headArray[index];
            const isNotPass = index > maxIndex || maxIndex == -1;
            if (isNotPass) {
                it.getController("reachFlag").selectedIndex = 0;
                this.stopHeadTween(index);
                continue;
            }

            // reset pos
            const pos = this._progressIndexToPosMap.get(index);
            if (pos) {
                it.head.node.position = pos.clone();
            }

            const progressConfig = this._progressConfigArray[index];
            if (!progressConfig) {
                continue;
            }

            const score = progressConfig.id;
            const isCanGain = context.isCanGainNormalProgress(score, true);
            if (isCanGain) {
                // 未领取
                this.resetOneFloatingHeadAnim(index, it);
            } else {
                // 已领取
                it.getController("reachFlag").selectedIndex = 1;
                this.stopHeadTween(index);
            }
        }
    }

    private stopHeadTween(index: number) {
        // tween
        const tween = this._progressIndexToTweenMap.get(index);
        if (!tween) {
            return;
        }
        tween.stop();
    }

    public reset() {
        const maxProgressCount = DrawCardUtils.getProgressMaxCount(ServerEnums.RecruitType.NORMAL);
        // this.view.barComp.max = maxProgressCount;
        this.view.barComp.max = 100;

        const poolId = DrawCardUtils.NORMAL_DRAW_CARD_POOL_ID;
        const drawCardConfigById = DrawCardConfigManager.getDrawCardConfigById(poolId);
        if (!drawCardConfigById) {
            G.Logger.error(`抽卡配置不存在. id = ${poolId}`);
            return;
        }
        this._config = drawCardConfigById;

        // 消耗
        this._costItemPerDraw = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems);
        this._costItemPerDraw2 = ItemUtils.parseKvArrayToOnlyOneItem(drawCardConfigById.costItems2);

        if (!this._costItemPerDraw) {
            G.Logger.error(`抽卡竟然没有消耗?! poolId=${poolId}`);
        }
        const costItemPerDraw2 = this._costItemPerDraw2;
        if (costItemPerDraw2) {
            G.Logger.debug(costItemPerDraw2, "替代抽卡的道具 = ");
        } else {
            G.Logger.debug("没有替代消耗的道具");
        }

        // // 头顶道具图标
        // this.resetHeaderIcon();
        // 进度条
        this.resetProgressTips();

        // 抽卡次数
        const context = DrawCardModel.ins().context;
        const noUseDrawCardCount = context.getNoUseNormalProgressCount();
        this.view.labelDrawCardCount.text = "" + noUseDrawCardCount;

        // 进度条
        if (noUseDrawCardCount > 0) {
            // 非规则, 特殊处理
            this.view.barComp.value = this.calcVirtualProgressValue(noUseDrawCardCount, maxProgressCount);
        } else {
            this.view.barComp.value = 0;
        }
    }

    /**
     * 计算虚拟进度
     * @param progressDrawCount 进度值
     * @param maxProgressCount 最大进度值
     * @private
     */
    private calcVirtualProgressValue(progressDrawCount: number, maxProgressCount: number) {
        const startX = this.view.barComp.node.position.x;
        const endX = this.view.barComp.node.position.x + this.view.barComp._uiTrans.width;
        const allWidth = endX - startX;

        // 进度
        const progressValueArray: number[] = DrawCardConfigManager.getNormalProgressConfigArray()
            .toDataStream()
            .map((it) => it.id)
            .toArray();

        // 进度提示
        const progressTipsArray = [this.view.tips1, this.view.tips2, this.view.tips3, this.view.tips4];

        const countToTipsMap = new Map<number, ui.drawCard.components.DrawCardProgressTitleComp>([
            [progressValueArray[0], progressTipsArray[0]],
            [progressValueArray[1], progressTipsArray[1]],
            [progressValueArray[2], progressTipsArray[2]],
            [progressValueArray[3], progressTipsArray[3]],
        ]);

        let virtualProgressValue = 0;

        for (let i = 0; i < progressValueArray.length; i++) {
            const rangeStart = i === 0 ? 0 : progressValueArray[i - 1] + 1;
            const rangeEnd = progressValueArray[i];

            // 溢出
            if (progressDrawCount >= maxProgressCount) {
                virtualProgressValue = 100;
                break;
            }

            if (MathUtils.isInRange(progressDrawCount, rangeStart, rangeEnd)) {
                const tipsComp = countToTipsMap.get(progressValueArray[i]);
                if (tipsComp) {
                    const endX = tipsComp.node.position.x;

                    // [start, end]
                    const maxOffset = endX - startX + tipsComp._uiTrans.width / 2;

                    const percent = progressDrawCount / rangeEnd;
                    const diffX = Math.min(maxOffset * percent, maxOffset);
                    const progressPercent = diffX / allWidth;

                    virtualProgressValue = progressPercent * 100;
                    break;
                }
            }
        }

        return virtualProgressValue;
    }

    /**
     * 重置主界面动画
     * @private
     */
    private resetSpineAnim() {
        const configs = G.TableManager.getAllData(table.recruit.RecruitMainViewAnimConfig);

        for (let config of configs) {
            G.Logger.debug(config, "开始播放动画");

            ModelUtils.createSpineNodeByAssetPath(config.spinePath, this.view.spineAnimNode.node).then((it) => {
                it.setAnimation(0, config.animName, true);
            });
        }
    }

    //抽卡动画(娃娃机)
    public playerAnim(data: Vo.recruit.NormalRecruitS2C, c2s: Vo.recruit.NormalRecruitC2S) {
        //打开遮罩
        G.UIManager.open(UICommonKey.TouchMaskWin);
        const finalRewards = data.content.rewardResults
            .toDataStream()
            .flatMap((it) => it)
            .toArray();

        // 获得英雄的最大品质
        let maxHeroQuality = 0;
        for (let award of finalRewards) {
            const itemId = award.baseId;

            if (award && itemId) {
                let itemConfig = ItemUtils.getItemConfigByItemId(itemId);

                // 只算英雄的品质
                const isHero = ItemUtils.isHero(itemId);
                if (isHero && itemConfig.quality > maxHeroQuality) {
                    maxHeroQuality = itemConfig.quality;
                }

                // 碎片
                if (ItemUtils.isFragment(itemId)) {
                    const contents = award.contents as Vo.hero.HeroRewardVo;
                    if (contents) {
                        const heroBaseId = contents.heroBaseId || 0;
                        const heroQuality = HeroUtils.getQualityConfigByHeroId(heroBaseId)?.id || 0;

                        // max quality
                        maxHeroQuality = Math.max(maxHeroQuality, heroQuality);
                    }
                }
            }
        }

        //爪子动画
        let self = this;
        this._modelNode1.visible = true;
        this.view.fgItem1.visible = false;
        this.view.spineAnimNode.visible = false;

        this._modelNode1.setCompleteListener(() => {
            self._modelNode1.visible = false;
            self.view.fgItem1.visible = true;
            self.view.spineAnimNode.visible = true;
        });
        let orders: IAnimOrder[] = [];
        orders.push({ name: "idle" } as IAnimOrder);
        this._modelNode1.playOrders(orders);

        // 有英雄才发光
        if (maxHeroQuality > 0) {
            //闪光动画
            G.GameTimer.once(200, this, () => {
                self._modelNode2.loadByModelId(DrawCardManager.ins().getSpineModelId(maxHeroQuality), false);
                self._modelNode2.visible = true;
                self._modelNode2.setCompleteListener(() => {
                    DrawCardManager.ins().recNormalRecruit(data, c2s);
                    //关闭遮罩
                    G.UIManager.close(UICommonKey.TouchMaskWin);
                });
                let orders2: IAnimOrder[] = [];
                orders2.push({ name: "enter" } as IAnimOrder);
                self._modelNode2.playOrders(orders2);
            });
        } else {
            // 直接打开
            G.GameTimer.once(1200, this, () => {
                DrawCardManager.ins().recNormalRecruit(data, c2s);
                //关闭遮罩
                G.UIManager.close(UICommonKey.TouchMaskWin);
            });
        }
    }
}
