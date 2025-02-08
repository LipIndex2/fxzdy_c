import * as fgui from "fairygui-cc";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";


const {GObject} = fgui;

export class HangUpAutoChallengeConfirmViewOpenArgs {
    // 关卡ID
    levelId: number;

    static create(levelId: number,
    ): HangUpAutoChallengeConfirmViewOpenArgs {
        let args = new HangUpAutoChallengeConfirmViewOpenArgs();
        args.levelId = levelId;

        return args;
    }
}

/**
 * 挂机 - 自动挑战
 */
@bindScript(HangUpUIKeys.HangUpAutoChallengeConfirmView)
export class HangUpAutoChallengeConfirmView extends UICommWin {

    // 关卡ID
    private _levelId: number;

    static pkgName: string = "hangUp";

    static viewName: string = "HangUpAutoChallengeConfirmView";

    private get view(): ui.hangUp.HangUpAutoChallengeConfirmView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    public onInit(): void {
        console.debug(" onInit ")


        // 确认
        this.view.btnConfirm.onClick(this.onClickConfirm0, this);
        // 取消
        this.view.btnCancel.onClick(this.onClickCancel0, this);


    }

    /**
     * 取消
     * @private
     */
    private onClickCancel0() {
        console.debug(" onClickCancel0 ")

        this.closeSelf()
    }

    /**
     * 确认自动挑战
     * @private
     */
    private onClickConfirm0() {
        console.debug(" onClickConfirm0 ")


        const model = HangUpModel.ins();
        model.sendChallengeTrunkInstance({
            instanceId: this._levelId
        })

        this.closeSelf();
    }


    public onOpen(args: HangUpAutoChallengeConfirmViewOpenArgs): void {
        console.debug(" onOpen ")


        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view);

        let levelId = args.levelId;
        this.reset(levelId);

    }


    private reset(levelId: number) {
        this._levelId = levelId;
        if (!levelId) {
            console.error("levelId is null")
            return;
        }

        // 挂机关卡配置
        let levelConfig = HangUpUtils.getHangUpConfigByLevelId(levelId);
        if (!levelConfig) {
            console.error("config is null")
            return;
        }


        this.view.desc
            .setVar("levelName", levelConfig.title)
            .flushVars();

    }

    public onClose(): void {

        console.debug(" onClose ")

    }


}