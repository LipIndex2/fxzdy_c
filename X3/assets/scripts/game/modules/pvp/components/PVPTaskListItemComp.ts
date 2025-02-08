import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPI18nKeys } from "db://assets/scripts/game/modules/pvp/PVPI18nKeys";
import * as fgui from "fairygui-cc";
import GIns from "../../../GIns";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

export class PVPTaskListItemComp extends fgui.GComponent {
    private _config: table.arena.ArenaWeeklyRewardConfig;

    protected _rewards: { k: number, v: number }[] = [];
    protected _isHaveReward: boolean = false;
    private get view(): ui.pvp.list.PVPTaskListItemComp {
        return this as any;
    }

    constructor() {
        super();
    }


    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
    }

    protected onPreDispose() {

    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
        item.setHaveGain(this._isHaveReward);
    }

    // 点击 tab, 又说改成不走这里领取了
    onClickTab() {
        const context = PVPModel.ins().getContext();
        const weekChallengeCount = this._config.id;

        const isCanGain = context.isCanGainWeeklyReward(weekChallengeCount);
        if (!isCanGain) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.WEEKLY_REWARD_NOT_REACHED);
            return;
        }

        if (this._isHaveReward) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.WEEKLY_REWARD_HAVE_GAIN);
            return;
        }


        PVPModel.ins().sendDrawWeeklyReward({
            weeklyChallengeTimes: this._config.id,
        })
    }

    reset(config: table.arena.ArenaWeeklyRewardConfig) {
        this._config = config;
        if (!config) {
            return;
        }

        this.view.labelTitle.text = config.title;
        this._isHaveReward = PVPModel.ins().getContext().isHaveGainWeeklyRewardByCount(config.id)
        this._rewards.length = 0;
        config.rewards?.forEach((value) => {
            let cnt = value.v;
            cnt += PrivilegeAdditionController.ins().getArenaReward(value.k, value.v);
            this._rewards.push({ k: value.k, v: cnt });
        })
        this.view.listReward.numItems = this._rewards.length;


        this.view.getController("gainFlag").selectedIndex = this._isHaveReward ? 1 : 0;
    }


}