import { v3 } from "cc";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { AttrUtils } from "db://assets/scripts/game/modules/attr/utils/AttrUtils";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import { TalentMainView } from "db://assets/scripts/game/modules/talent/view/TalentMainView";
import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { TalentConfigManager } from "db://assets/scripts/game/modules/talent/config/TalentConfigManager";

/**
 * 天赋一行数据 v3
 */
export class TalentOneLvComp extends fgui.GComponent implements INotification {

    private _rowId: number = 1;

    // 小天赋
    private _smallConfig: table.talent.TalentConfig = null;
    // 大天赋
    private _bigConfig: table.talent.TalentConfig = null;
    private _parentView: TalentMainView;

    private _bigTalentId: number = 0;


    private get view(): ui.talent.components.TalentOneLvComp {
        return this as any;
    }


    listenNotifications(): string[] | null {
        return [
            NotificationKey.TALENT_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.TALENT_CHANGE:
                const talentId = args as number;
                this.unlockTalent(talentId)
                break;
        }
    }

    protected onConstruct(): void {
        FacadeManager.ins().registerNotification(this);

        // click 小天赋
        this.view.small1.onClick((event: fgui.Event) => {
            const config: table.talent.TalentConfig = this._smallConfig;
            if (!config) {
                console.error(`小天赋配置有问题! rowId = ${this._rowId}`);
                return;
            }
            const talentId = config.id;

            console.debug(`点击了 rowId = ${this._rowId} 个小天赋!`)

            this._parentView.onClickTalent(
                talentId,
                this.view.small1.talentComp.bg._uiTrans,
                v3(74, 10, 0),
            );

        }, this);

        //  大天赋
        this.view.big1.talentBig.onClick((event: fgui.Event) => {
            console.debug(`点击了 rowId = ${this._rowId}, 大天赋!`)

            this._parentView.onClickTalent(
                this._bigTalentId,
                this.view.big1.talentBig.bg._uiTrans,
                v3(40, -25, 0)
            );

        }, this);

    }


    protected onPreDispose() {

        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    setParentView(parentView: TalentMainView) {
        this._parentView = parentView;
    }

    // @LogBusiness("[天赋] 一行 3 个小天赋 + (optional) 1 个大)
    public reset(
        rowId: number,
        smallConfig: table.talent.TalentConfig,
        bigConfig: table.talent.TalentConfig
    ) {
        this._rowId = rowId;
        this._smallConfig = smallConfig;
        this._bigConfig = bigConfig;

        const isRow1 = rowId == 1;
        this.view.barFirst.visible = isRow1;
        if (isRow1) {
            this.view.barFirst.value = 100;
        } else {
            this.view.barFirst.value = 0;
        }

        this.view.node.name = "row" + rowId;

        const isLeft = rowId % 2 == 0;
        this.view.bar.scaleX = isLeft ? 1 : -1;

        const maxRowIdByUnlockLv = TalentConfigManager.getMaxRowIdByUnlockLv(smallConfig.unlockLv);
        const isKeepLv = rowId == maxRowIdByUnlockLv;

        this.view.getController("isSkipLv").selectedIndex = isKeepLv ? 0 : 1;

        this.refreshUI()
    }

    // 刷新 UI
    refreshUI() {
        // 最大解锁行
        const context = TalentModel.ins().context;
        const maxCanUnlockRowId = context.getMaxCanUnlockRowId();
        this.view.lineLv.visible = this._rowId == maxCanUnlockRowId;

        // 小天赋解锁等级
        if (this._smallConfig) {
            const unlockLv = this._smallConfig.unlockLv || 1;

            const avgLv = FormationManager.ins().getAvgCommonLevel();
            if (avgLv >= unlockLv) {
                this.view.bar.value = 100;
            } else {
                this.view.bar.value = 0;
            }

            // rowId
            this.view.labelLv.text = `${unlockLv}`;

            // -- 解锁


            const isUnlock = FormationManager.ins().getAvgCommonLevel() >= unlockLv;
            const talentId = this._smallConfig.id;
            // 置灰 = 玩家未升级过
            // 玩家是否解锁过
            let haveLvUpFlag = TalentModel.ins().isHaveLvUpTalent(talentId)

            const isNotHaveLvUp = !haveLvUpFlag;

            // 小天赋
            this.view.small1.talentComp.bg.grayed = isNotHaveLvUp;
            this.view.small1.talentComp.imageTalent.grayed = isNotHaveLvUp;
            this.view.small1.talentComp.labelCount.grayed = isNotHaveLvUp;

            // 又说用属性去处理了
            const attrConfigEffect = AttrUtils.parseKvArrayToOneAttr(this._smallConfig.addAttrArray1);
            if (attrConfigEffect) {
                this.view.small1.talentComp.labelCount.text = attrConfigEffect.getValueStringForUIShow();
                this.view.small1.talentComp.imageTalent.icon = this._smallConfig.iconPathForSmallTalent;
            } else {
                console.error("config 没有配置属性1 = ", this._smallConfig.id);
            }

            // 消耗的道具
            const costItems = ItemUtils.parseKvArrayToItemArray(this._smallConfig.costItemArray) || [];

            // 是否可以支付
            const isCanPay = BackpackManager.ins().isCanAddTheseItemArray(costItems);
            let parentTalentId = this._smallConfig.parentTalentId;
            let isParentLvUp = false

            // 父级是否升级
            if (TalentModel.ins().isHaveLvUpTalent(parentTalentId)) {
                isParentLvUp = true;
            }
            const isCanLvUp = isUnlock && isNotHaveLvUp && isCanPay && isParentLvUp;
            this.view.small1.talentComp.getController("canLvUpFlag").selectedIndex = (isCanLvUp ? 1 : 0);

        }


        // 大天赋
        if (this._bigConfig) {
            // 显示大天赋
            this.view.getController("haveBigTalentFlag").selectedIndex = 1;

            // 大天赋配置
            const config = this._bigConfig;
            const bigTalentId = config.id;
            this._bigTalentId = bigTalentId;

            // 道具消耗
            const costItems = ItemUtils.parseKvArrayToItemArray(config.costItemArray) || [];


            // 加成属性
            const attrKvArray = config.addAttrArray1;
            const attrConfigEffect = AttrUtils.parseKvArrayToOneAttr(attrKvArray);
            if (attrConfigEffect) {
                this.view.big1.talentBig.labelTitle.text = attrConfigEffect.getValueStringForUIShow();
                this.view.big1.talentBig.imageTalent.icon = config.iconPathForBigTalent;
            }

            const isHaveLvUpBig = TalentModel.ins().isHaveLvUpTalent(bigTalentId);


            if (isHaveLvUpBig) {
                // 已升级
                this.view.big1.talentBig.imageTalent.grayed = false;
                this.view.big1.talentBig.labelTitle.grayed = false;
                this.view.big1.talentBig.bg.grayed = false;
                this.view.big1.talentBig.getController("canLvUpFlag").selectedIndex = 0;

            } else {
                // 未升级

                // 置灰 = 玩家未升级过
                this.view.big1.talentBig.imageTalent.grayed = !isHaveLvUpBig;
                this.view.big1.talentBig.labelTitle.grayed = !isHaveLvUpBig;
                this.view.big1.talentBig.bg.grayed = !isHaveLvUpBig;


                // 是否可以升级
                const isCanLvUp = context.isCanLvUpTalent(bigTalentId);
                this.view.big1.talentBig.getController("canLvUpFlag").selectedIndex = (isCanLvUp ? 1 : 0);


                if (isCanLvUp) {
                    // 必须立刻
                    FacadeManager.ins().emitNow(NotificationKey.TALENT_CAN_LV_UP_BIG, this._rowId);
                }
            }

        } else {
            this.view.getController("haveBigTalentFlag").selectedIndex = 0;
        }


        // -------- 进度条


        // 是否升级
        // const haveLvUp = this.refreshTalentReturnIsLvUp(this._smallConfig?.id);
        


        this.refreshRedDot();
    }


    // region 点击道具的打开方式

    private unlockTalent(talentId: number) {
        if (NodeUtils.isNotValidNode(this.view.node)) {
            return;
        }

        const talentConfig = TableManager.getDataById(table.talent.TalentConfig, talentId);
        if (!talentConfig) {
            console.error(`天赋配置有问题! talentId = ${talentId}`);
            return;
        }
        if (talentConfig.rowId !== this._rowId) {
            return;
        }


        this.refreshUI();


    }

    // 红点
    private refreshRedDot() {
        const redDotComL = RedDotUtils.castComp(this.view.small1.talentComp.redDot);
        if (this._smallConfig) {
            redDotComL.reset(RedDotKeys.talent_small, [this._smallConfig.id])
        } else {
            redDotComL.reset(RedDotKeys.Null);
        }

        const redDotComR = RedDotUtils.castComp(this.view.big1.redDot);
        if (this._bigConfig) {
            const talentId = this._bigConfig.id;
            redDotComR.reset(RedDotKeys.talent_big, [talentId])
        } else {
            redDotComR.reset(RedDotKeys.Null);
        }

    }

    /**播放升级特效*/
    public playLvUpAni(talentId: number): void {
        let modelNode: ModelNode = null
        if (talentId == this._smallConfig?.id) {
            modelNode = this.view.small1.modelNode as ModelNode
        } else if (talentId == this._bigConfig?.id) {
            modelNode = this.view.big1.modelNode as ModelNode
        }
        if (modelNode) {
            modelNode.loadByPath('spine/ui/S_shengjitianfu/UI_shengji2_upper')
            modelNode.playOrders([
                {
                    name: 'enter',
                    isLoop: false
                }
            ])
        }
    }
}