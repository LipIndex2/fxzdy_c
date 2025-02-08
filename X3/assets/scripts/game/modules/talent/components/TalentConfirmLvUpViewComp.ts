import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { TalentModel } from "db://assets/scripts/game/modules/talent/model/TalentModel";
import { I18nTalentKeys } from "db://assets/scripts/game/modules/talent/const/I18nTalentKeys";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { CommonI18nKeys } from "db://assets/scripts/game/modules/common/i18n/CommonI18nKeys";
import { Color } from "cc";
import { ItemComeFromViewOpenArgs } from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromView";
import { UIItemKeys } from "db://assets/scripts/game/modules/item/UIItemKeys";

/**
 * 打开天赋升级确认框参数
 */
export interface TalentConfirmLvUpViewOpenArgs {
    // 天赋id
    talentId: number;
}

enum EnumLvUpState {
    noActive = 0,
    canLvUp = 1,
    haveLvUp = 2
}

/**
 * 天赋一行数据
 */
export class TalentConfirmLvUpViewComp extends fgui.GComponent {


    // 天赋id
    private _talentId: number = 0;
    private _config: table.talent.TalentConfig;
    private _costItem: NoOwnerItem;

    private get view(): ui.talent.TalentConfirmLvUpView {
        return this as any;
    }

    constructor () {
        super();
    }

    protected onConstruct(): void {
        this.view.btnUnlock.onClick(this.onClickConfirm0, this);

    }

    private onClickConfirm0() {
        let isCanLvUp = TalentModel.ins().isCanLvUpThisTalentId(this._talentId);
        if (!isCanLvUp) {
            G.Logger.debug(`不能升级该天赋. talentId = ${this._talentId}`)
            return;
        }

        // click anim
        this.view.btnUnlock.node.clickWithUIScaleTween()

        let isCanCost = this._costItem.isCanPay(true);
        if (!isCanCost) {
            // G.UIManager.open(UIItemKeys.ItemComeFromView, {
            //     itemConfig: ItemUtils.getItemConfigByItemId(this._costItem.itemId),
            // } as ItemComeFromViewOpenArgs)
            return;
        }


        TalentModel.ins().sendActiveTalent({
            talentId: this._talentId,
        } as Vo.talent.ActiveTalentC2S);

        this.view.visible = false;
    }


    reset(args: TalentConfirmLvUpViewOpenArgs) {

        // 触摸外部
        this.view.visible = true;

        const talentId = args.talentId;

        this._talentId = talentId;


        const config = G.TableManager.getDataById(table.talent.TalentConfig, talentId);
        if (!config) {
            G.Logger.error("天赋配置没找到! configId", talentId);
            return;
        }
        this._config = config;

        let itemId = 0;
        let count = 0
        const costItem = config.costItemArray;
        if (costItem && costItem.length > 0) {
            const item = costItem[0];
            count = item.v as number;
            itemId = item.k as number;
        }
        this._costItem = NoOwnerItem.create(itemId, count);

        let state = EnumLvUpState.noActive;
        // 是否解锁
        const isCanLvUp = TalentModel.ins().isCanLvUpThisTalentId(talentId);
        if (isCanLvUp) {
            state = EnumLvUpState.canLvUp;
        }

        let haveLvUpFlag = TalentModel.ins().isHaveLvUpTalent(talentId);
        if (haveLvUpFlag) {
            state = EnumLvUpState.haveLvUp;
        }
        this.view.btnUnlock.getController("lvUpState").selectedIndex = state;
        if (state == EnumLvUpState.noActive) {
            this.view.btnUnlock.labelTips.text = I18nTalentKeys.LOCK;
        }
        if (state == EnumLvUpState.haveLvUp) {
            this.view.btnUnlock.labelTips.text = I18nTalentKeys.HAVE_LV_UP;
        }

        const haveCount = BackpackManager.ins().getItemCountByItemId(itemId);
        const haveEnoughFlag = haveCount >= count;
        if (haveEnoughFlag) {
            this.view.btnUnlock.labelCostCount.color = new Color("#FFFFFF")
        } else {
            this.view.btnUnlock.labelCostCount.color = new Color("#FF0000")
        }
        const isNotCanClickBtn = !haveEnoughFlag || !isCanLvUp;

        // 确认框是否置灰
        this.view.btnUnlock.imageBtnConfirm.grayed = isNotCanClickBtn;

        this.view.btnUnlock.imageCostItem.icon = ItemUtils.getItemConfigByItemId(itemId)?.iconPath;
        this.view.labelTitle.text = config.title;
        this.view.desc.text = config.desc;
        this.view.btnUnlock.labelCostCount.text = count.toString();
        this.view.btnUnlock.labelUnlockTitle.text = CommonI18nKeys.unlock;

    }

}