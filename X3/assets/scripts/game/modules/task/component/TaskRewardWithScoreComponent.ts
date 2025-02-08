import { Color, Node, tween, Tween, v3, Vec3 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { DailyTaskModel } from "db://assets/scripts/game/modules/task/model/DailyTaskModel";
import * as fgui from "fairygui-cc";
import { EventClickItem } from "../../item/event/EventClickItem";

// 活跃箱子类型
export enum EnumDailyTaskActiveBoxType {
    // 日
    DAILY = "daily",
    // 周
    WEEKLY = "weekly",
}

/**
 * 活跃奖励的箱子
 */
export class TaskRewardWithScoreComponent extends fgui.GComponent {

    // 奖励物品
    private _rewardItem: NoOwnerItem;
    // 类型
    private _type: EnumDailyTaskActiveBoxType;
    // 箱子ID
    private _boxId: number;
    // 分数
    private _needScore: number;
    // 动画
    private _canGainTween: Tween<Node>
    // 老的组件位置
    private _oldPos: Vec3 = null;
    // 领取状态
    private _isGain: boolean = false;

    // region 静态属性 for FGUI
    static pkgName: string = "task";

    static viewName: string = "TaskRewardWithScoreComponent";


    // endregion


    // FGUI 任务按钮的 controller 


    private get view(): ui.task.dailyTask.TaskRewardWithScoreComponent {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.view.itemPart.onClick(this.onClickItem0, this);
    }


    @LogBusiness("点击了活跃度箱子")
    private onClickItem0(event: fgui.Event) {

        let score = this.getScoreByType();
        // 领取状态
        if (score >= this._needScore && this._isGain === false) {
            return;
        }
        this.view.itemPart.node.clickWithUIScaleTween()


        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            this._rewardItem.getItemConfig(),
            this.view.itemPart.img_item._uiTrans,
            this._rewardItem.count,
        ));
    }

    /**
     * 重置组件
     */
    reset(type: EnumDailyTaskActiveBoxType, boxId: number, needScore: number) {
        if (!this._oldPos) {
            this._oldPos = this.view.itemPart.node.position.clone()
        }

        this.view.offClick(this.gainDailyActiveBox0, this)
        this._canGainTween?.stop()

        this._type = type;
        this._boxId = boxId;
        this._needScore = needScore;


        // 领取状态
        let score = this.getScoreByType();
        let isGain = this.getIsGainStateByType();
        this._rewardItem = this.getRewardItemByType()


        if (!this._rewardItem) {
            G.Logger.error(`活跃度箱子配置错误. 没有奖励! type = ${this._type}, boxId = ${this._boxId}, needScore = ${this._needScore}`)
        }
        this._isGain = isGain;

        // red dot
        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        redDotCom.showByType(EnumRedDotShowType.NULL);

        // 已领取
        if (isGain) {
            this.view.scoreComp.imageTips.color = new Color("#666666");

            // reset pos
            this.view.itemPart.node.setPosition(this._oldPos)

            this.setGainStateUI(true);
        } else {
            // 未领取
            this.setGainStateUI(false);

            const isCanGain = score >= needScore;
            if (isCanGain) {
                // 可以领取
                this.view.scoreComp.imageTips.color = new Color("#FFCC00")

                // 点击领取
                this.view.onClick(this.gainDailyActiveBox0, this)

                // can 
                if (this._oldPos) {
                    this.view.itemPart.node.setPosition(this._oldPos)
                }
                this._canGainTween = tween(this.view.itemPart.node)
                    .sequence(
                        tween().by(0.5, { position: v3(0, 10, 0) }, { easing: 'smooth' }),
                        tween().by(0.5, { position: v3(0, -10, 0) }, { easing: 'smooth' })
                    )
                    .repeatForever()
                    .start();

                // red sweep
                redDotCom.showByType(EnumRedDotShowType.ITEM_HEIGHT_LIGHT);
            } else {
                // 不能领取
                this.view.scoreComp.imageTips.color = new Color("#566187");
            }
        }


    }

    /**
     * 获取奖励道具
     */
    getRewardItemByType(): NoOwnerItem {
        const boxId = this._boxId;
        if (this._type === EnumDailyTaskActiveBoxType.DAILY) {
            const config = G.TableManager.getDataById(table.dailytask.DailyActiveBoxConfig, boxId);
            return ItemUtils.parseStringToOnlyOneItem(config.rewardText);
        }
        if (this._type === EnumDailyTaskActiveBoxType.WEEKLY) {
            const config = G.TableManager.getDataById(table.dailytask.WeeklyActiveBoxConfig, boxId);
            return ItemUtils.parseStringToOnlyOneItem(config.rewardText);
        }
        return null;
    }

    /**
     * 获取领取状态
     */
    getIsGainStateByType(): boolean {
        if (this._type === EnumDailyTaskActiveBoxType.DAILY) {

            return DailyTaskModel.ins().isGainDailyActiveBox(this._boxId);
        }
        if (this._type === EnumDailyTaskActiveBoxType.WEEKLY) {
            return DailyTaskModel.ins().isGainWeekActiveBox(this._boxId);
        }
        return false;
    }

    /**
     * 获取积分
     */
    getScoreByType(): number {
        if (this._type === EnumDailyTaskActiveBoxType.DAILY) {
            return DailyTaskModel.ins().getDailyScore();
        }
        if (this._type === EnumDailyTaskActiveBoxType.WEEKLY) {
            return DailyTaskModel.ins().getWeekScore();
        }
        return 0;
    }

    /**
     * 设置领取状态 UI
     * @param isGain
     */
    setGainStateUI(isGain: boolean) {
        this.view.itemPart.getController('haveGain').selectedIndex = isGain ? 1 : 0
        // this.view.itemPart.maskFg.visible = isGain;
        // this.view.itemPart.imageGou.visible = isGain;
    }

    gainDailyActiveBox0() {
        G.Logger.debug(`点击领取活跃度箱子. type = ${this._type}, boxId = ${this._boxId}, needScore = ${this._needScore}`)


        // net
        // 日活
        if (this._type === EnumDailyTaskActiveBoxType.DAILY) {
            // 一键领取
            const boxIdArray = DailyTaskModel.ins().getCanGainDailyBoxIdArray()

            if (ArrayUtils.isNotEmpty(boxIdArray)) {
                DailyTaskModel.ins().sendDrawDailyActiveBox({
                    dailyBoxConfigIds: boxIdArray
                } as Vo.dailytask.DrawDailyActiveBoxC2S)
            }

            // 一个一个领
            // DailyTaskModel.ins().sendDrawDailyActiveBox({
            //     dailyBoxConfigIds: [this._boxId]
            // } as Vo.dailytask.DrawDailyActiveBoxC2S)
            return
        }

        // 周活
        if (this._type === EnumDailyTaskActiveBoxType.WEEKLY) {
            const boxIdArray = DailyTaskModel.ins().getCanGainWeekBoxIdArray()

            if (ArrayUtils.isNotEmpty(boxIdArray)) {
                DailyTaskModel.ins().sendDrawWeeklyActiveBox({
                    weeklyBoxConfigIds: boxIdArray
                } as Vo.dailytask.DrawWeeklyActiveBoxC2S)
            }

            return
        }
    }
}