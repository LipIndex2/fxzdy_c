import { _decorator, } from 'cc';
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import GIns from "db://assets/scripts/game/GIns";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";

const {ccclass, property} = _decorator;

export class GVGManager extends BaseSingleton {

    onInit(): void {
        // 绑定脚本给组件


    }

    /**
     * 尝试打开GVG
     */
    tryOpenGVG() {
        const context = GIns.GVGModel.context;
        if (context.isLock()) {
            FloatingTextManager.ins().showTips("未解锁");
            return;
        }

        const stage = context.getStage();

        // // 未参与
        // if (!context.isJoin()) {
        //     GIns.floatingTextMgr.showTips(`未参与玩法`);
        //     return;
        // }

        // 匹配阶段
        if (stage == ServerEnums.LeagueWarStatus.SIGN_UP) {
            // 数据不一定准备好
            if (!context.isDataReady()) {
                GIns.floatingTextMgr.showTips(`匹配对手中`);
                return;
            }
        }

        if (stage == ServerEnums.LeagueWarStatus.END) {
            // 后端说结束阶段显示倒计时
            UIManager.ins().open(GVGUIKeys.GVGOpenTipsWin);
            return;
        }
        // 其余阶段都能看到人了
        UIManager.ins().open(GVGUIKeys.GVGMainView);

    }
}