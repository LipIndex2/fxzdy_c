/**@format */
import { UIPetKey } from "../const/UIPetConfig";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import NotificationKey from "../../../event/NotificationKey";
import { PetHubCharacterPool } from "../com/PetHubCharacterPool";
import { PetHubCharacter } from "../com/PetHubCharacter";
import { PetHubModel } from "../PetHubModel";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { BackpackManager } from "../../backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { UIGainKeys } from "db://assets/scripts/game/modules/gain/const/UIGainKeys";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import G from "db://assets/scripts/core/comm/G";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { IItemRewardParam } from "../../item/model/vo/IItemRewardParam";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

/**
 *  收藏品招募子页面
 */
@bindScript(UIPetKey.PET_DRAW_CARD_VIEW)
export class PetHubSubPage extends UIPage {
    static pkgName: string = "pet";
    static viewName: string = "CollectionsHubSubPage";
    // protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    private model: PetHubModel;

    /** 小人对象池 */
    private characterPool: PetHubCharacterPool;
    /** 带物品的小人组件 */
    private baseContainer: fgui.GComponent;
    /** 抽取随机的全部物品数据队列 */
    private dataAllQueue: Array<Vo.drawcard.DrawCardRewardVo> = [];
    /** 实际获得的物品数据 */
    private cardRewards: Array<Vo.reward.RewardResult> = [];
    /** 当前正在展示的小人 */
    private activeCharacters: PetHubCharacter[] = [];
    /** 当前最大次数 */
    private maxCount: number;
    private allItemCount: number = 0;
    private isFirstOpen: boolean = true;
    private isPlaying: boolean = false;
    /** 上次是否倍数抽取 */
    private isMultiply: boolean = false;
    /** 按钮居中位置 */
    private middlePosX: number = 222;
    private initLeftBtnPosX: number;
    private initRightBtnPosX: number;
    /** 已匹配到的奖励 */
    private usedRewards: Set<number> = new Set();

    private get view(): ui.pet.view.CollectionsHubSubPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIONS_CARD_INFO,
            NotificationKey.COLLECTIONS_DRAW_CARD,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIONS_CARD_INFO:
                this.updateUI();
                break;
            case NotificationKey.COLLECTIONS_DRAW_CARD:
                let results = this.model.drawCardResult;
                this.dataAllQueue = [...results.itemAllList];
                this.cardRewards = [...results.rewardResults];
                this.allItemCount = results.itemAllList.length;
                this.playAnimation();
                //打开遮罩
                G.UIManager.open(UICommonKey.TouchMaskWin, 6000);
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UIGainKeys.GainItemPopUpView) {
                    this.isPlaying = false;
                    this.model.sendCardInfo();
                    //关闭遮罩
                    G.UIManager.close(UICommonKey.TouchMaskWin);
                }
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.showCostItem();
                break;
            default:
                break;
        }
    }

    protected onInit() {
        this.model = PetHubModel.ins();
        this.model.sendCardInfo();
        this.characterPool = new PetHubCharacterPool();
        this.baseContainer = this.view.baseComp;
        this.view.costBtn.onClick(() => {
            this.onRecruitClick(false);
        }, this);
        this.view.costBtn2.onClick(() => {
            this.onRecruitClick(true);
        }, this);
        this.view.itemList.itemRenderer = this.showRewards.bind(this);
        this.view.titleLabel.text = "0/0";
        this.view.infoBtn.onClick(() => {
            G.UIManager.open(UIPetKey.PET_DRAW_CARD_INFO_PAGE);
        });
        this.view.btnBack.onClick(() => {
            this.onClose();
            this.closeSelf();
        }, this);
        this.initLeftBtnPosX = this.view.costBtn.x;
        this.initRightBtnPosX = this.view.costBtn2.x;
    }

    protected onOpen(args: any, isReopen?: boolean) {}

    private updateUI() {
        let info = this.model.drawCardResult ? this.model.drawCardResult : this.model.baseInfo;
        if (!info) return;
        this.maxCount = this.model.getRoundMaxCount(info.drawCardPetRoundId);
        this.view.titleLabel.text = `0/${this.maxCount}`;
        this.view.itemList.numItems = 0;
        // if (this.isFirstOpen) {
        this.view.freePopup.visible = true;
        this.view.freeTipLabel.text = `成功招募${this.maxCount}只星灵后，可再次免费招募`;
        //     this.isFirstOpen = false;
        // }

        this.showCostBtns();
        this.showCostItem();
    }

    /**@param isTenTimes 是否十倍招募 */
    private onRecruitClick(isTenTimes: boolean) {
        if (!this.isPlaying) {
            this.isMultiply = isTenTimes;
            this.model.sendDrawCard(isTenTimes);
        }
    }

    private showCostBtns() {
        const { costBtn, costBtn2 } = this.view;
        const cfg = this.model.getDrawCardConfig();

        if (!cfg || !cfg.costItems) return;

        const item = cfg.costItems[0];
        /** 单倍率免费抽数红点 */
        const redLeft = costBtn.redDot as any as RedDotCom;
        /** 十倍抽数红点 */
        const redRight = costBtn2.redDot as any as RedDotCom;

        redLeft.reset(RedDotKeys.Pet_Hub_Free);
        redRight.reset(RedDotKeys.Pet_Hub_Cost);

        const updateButton = (button: any, isFree: boolean, multiplier: number, title: string, positionX: number) => {
            button.visible = true;
            button.title = title;
            button.x = positionX;

            if (isFree) {
                button.getController("canPayFlag").selectedIndex = 2;
                button.lbFree.color = ColorUtils.createColor("#35FE64");
            } else {
                const itemConfig = ItemUtils.getItemConfigByItemId(item.k);
                const noOwnerItem = NoOwnerItem.createByConfigKv({ ...item });
                const isCanPay = BackpackManager.ins().isCanPayItem(noOwnerItem, false, multiplier);

                button.getController("canPayFlag").selectedIndex = isCanPay ? 1 : 0;
                button.imageItem.icon = itemConfig.smallIconPath;
                button.labelCount.text = `${item.v * multiplier}`;
            }
        };

        const isFreeRoundSingle = this.model.isFreeRound(1);
        const isFreeRoundTen = this.model.isFreeRound(10);

        // 一个按钮免费时另一个不可见
        if (isFreeRoundSingle) {
            costBtn2.visible = false;
            updateButton(costBtn, true, 1, "招募", this.middlePosX);
        } else if (isFreeRoundTen) {
            costBtn.visible = false;
            updateButton(costBtn2, true, 10, "10倍招募", this.middlePosX);
        } else {
            costBtn.visible = true;
            costBtn2.visible = true;
            updateButton(costBtn, false, 1, "招募", this.initLeftBtnPosX);
            updateButton(costBtn2, false, 10, "10倍招募", this.initRightBtnPosX);
        }

        GIns.redDotMgr.setRedDot(RedDotKeys.Pet_Hub_Free, isFreeRoundSingle);

        if (isFreeRoundTen) {
            redRight.showByType(EnumRedDotShowType.REWARD);
        }
    }

    private showRewards(index: number, item: ItemFrameBtn) {
        if (this.cardRewards.length >= index) {
            const data = this.cardRewards[index];
            if (data && data.baseId && data.amount) {
                item.reset(data.baseId, data.amount);
            }
        }
    }

    private showCostItem() {
        let costShowBtn = this.view.costShowBtn;
        let cfg = this.model.getDrawCardConfig();
        if (!cfg || !cfg.costItems) return;
        let item = cfg.costItems[0];
        let icon = ItemUtils.getItemConfigByItemId(item.k).smallIconPath;
        costShowBtn.imageItem.icon = icon;
        let count = BackpackManager.ins().getItemCountByItemId(item.k);
        costShowBtn.labelTitle.text = StringUtils.numShortToKM(count);
    }

    private playAnimation(): void {
        this.view.freePopup.visible = false;
        // 清空当前队列和状态
        this.activeCharacters.forEach((character) => {
            this.baseContainer.removeChild(character);
            this.characterPool.releaseCharacter(character);
        });
        this.activeCharacters = [];
        let count = 0;
        if (this.isPlaying) {
            this.view.costBtn.visible = false;
            this.view.costBtn2.visible = false;
            return;
        }
        this.usedRewards.clear();
        const playNext = () => {
            if (this.dataAllQueue.length === 0) {
                return;
            }

            const data = this.dataAllQueue.shift();
            if (!data) {
                return;
            }
            this.isPlaying = true;
            this.view.costBtn.visible = false;
            this.view.costBtn2.visible = false;
            const character = this.characterPool.getCharacter();
            this.bindCharacterWithData(character, data);
            this.activeCharacters.push(character);
            this.baseContainer.addChild(character);
            character.visible = true;
            character.moveTo(
                600,
                100,
                () => {
                    //onNext 回调。移动到指定位置后，播放下一个动画
                    playNext();
                },
                () => {
                    //onComplete 回调。动画播放完成后触发
                    count += 1;
                    this.onCharacterAnimationComplete(character, data, count);
                }
            );
        };

        playNext();
    }

    private bindCharacterWithData(character: PetHubCharacter, data: Vo.drawcard.DrawCardRewardVo): void {
        const cfg = TableManager.getDataById(table.item.ItemConfig, data.code);
        if (!cfg) return;
        character.visible = true;
        if (cfg.type === "PET_CARD") {
            const petCfg = TableManager.getDataById(table.pet.PetConfig, data.code);
            character.setItemVisible(false);
            character.playAction(null, petCfg.modelId);
        } else {
            let item = NoOwnerItem.createByConfigKv({ k: data.code, v: data.amount });
            character.setItem(item);
            character.playAction("move");
        }
    }

    private onCharacterAnimationComplete(
        character: PetHubCharacter,
        data: Vo.drawcard.DrawCardRewardVo,
        count: number
    ): void {
        const matchingRewards = this.cardRewards
            .map((reward, index) => ({ reward, index }))
            .filter(({ reward, index }) => {
                // 检查该索引是否已被处理过
                if (this.usedRewards.has(index)) {
                    return false;
                }
                if (reward.baseId !== data.baseId) {
                    return false;
                }
                if (data.baseId !== data.code) {
                    // 特殊情况：baseId 和 code 不相等，说明是碎片转化的情况
                    return reward.amount === data.realAmount;
                } else {
                    return reward.amount === data.amount;
                }
            });

        if (matchingRewards.length > 0) {
            const { reward, index } = matchingRewards[0];
            // 标记该奖励项已被处理
            this.usedRewards.add(index);
            DebugUtils.isDebugMode() && console.log(`有对应奖励的模型${count}号，匹配成功`);
            this.handleCharacterExit(character, false);
        } else {
            DebugUtils.isDebugMode() && console.log(`模型${count}号 未匹配到任何奖励，直接移除`);
            this.handleCharacterExit(character, true);
        }

        // 播放完了
        if (count === this.allItemCount) {
            const times = this.isMultiply ? 10 : 1;
            if (this.model.isFreeRound(times)) {
                this.view.tipFree.visible = true;
                this.view.tipCountLabel.text = `成功招募${this.cardRewards.length}次`;
            } else {
                this.view.tipNormal.visible = true;
            }
            this.usedRewards.clear();
            GameTimer.ins().once(800, this, () => {
                this.view.tipFree.visible = false;
                this.view.tipNormal.visible = false;
                if (this.cardRewards && this.cardRewards.length > 0) {
                    let param: IItemRewardParam = {
                        rewards: this.cardRewards as Vo.reward.RewardResult[],
                    };
                    this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_BY_POP_UP_WINDOW_WITH_PARAM, param);
                } else if (this.cardRewards.length === 0) {
                    // 没获得任意物品
                    this.isPlaying = false;
                    this.model.sendCardInfo();
                    //关闭遮罩
                    G.UIManager.close(UICommonKey.TouchMaskWin);
                }
            });
        }
    }

    private handleCharacterExit(character: PetHubCharacter, playAnimation: boolean): void {
        const removeCharacter = (): void => {
            const index = this.activeCharacters.indexOf(character);
            if (index !== -1) {
                this.activeCharacters.splice(index, 1);
            }
            this.baseContainer.removeChild(character);
            this.characterPool.releaseCharacter(character);
        };
        if (playAnimation) {
            character.playExitAnimation(-100, -150, 65, () => {
                removeCharacter();
            });
        } else {
            this.view.itemList.numItems = this.view.itemList.numChildren + 1;
            this.view.titleLabel.text = `${this.view.itemList.numChildren}/${this.maxCount}`;
            removeCharacter();
        }
    }

    private stopAllAnimations(): void {
        this.activeCharacters.forEach((character) => {
            character.stopAnimation();
        });
    }

    protected onClose(dontDispose?: boolean): void {
        this.stopAllAnimations();

        this.activeCharacters.forEach((character) => {
            this.baseContainer.removeChild(character);
            this.characterPool.releaseCharacter(character);
        });
        this.activeCharacters = [];
        this.dataAllQueue = [];
        super.onClose();
    }
}
