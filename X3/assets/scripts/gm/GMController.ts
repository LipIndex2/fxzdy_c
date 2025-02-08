import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { GMItemView } from "db://assets/scripts/gm/view/GMItemView";
import { ButtonGmTypeView } from "db://assets/scripts/gm/view/ButtonGmTypeView";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { GMIconItemView } from "db://assets/scripts/gm/view/GMIconItemView";
import { GMOneKeyButtonChildView } from "db://assets/scripts/gm/view/oneKey/GMOneKeyButtonChildView";
import { BtnGmView } from "db://assets/scripts/gm/view/common/BtnGmView";
import { GMAssetCheckerChildView } from "db://assets/scripts/gm/view/assetChecker/GMAssetCheckerChildView";
import { GMSpineCheckerView } from "db://assets/scripts/gm/view/spineChecker/GMSpineCheckerView";
import { GMEmailView } from "db://assets/scripts/gm/view/email/GMEmailView";
import { GMAddServerTimeView } from "db://assets/scripts/gm/view/serverTime/GMAddServerTimeView";
import { GMTaskView } from "db://assets/scripts/gm/view/task/GMTaskView";
import { GMHeroAttrView } from 'db://assets/scripts/gm/view/GMHeroAttrView';
import { DrawCardTestNewHeroComp } from "db://assets/scripts/gm/view/drawCard/DrawCardTestNewHeroComp";
import { GMGuideView } from './view/GMGuideView';
import { GMLevelView } from "db://assets/scripts/gm/view/level/GMLevelView";
import { GMFightSelectItem, GMFightView, } from './view/GMFightView';
import { BattleAttrOneItem, BattleLogOneItem } from './view/BattleLogView';
import { GMTransferMapView } from './view/GMTransferMapView';
import { GMPVPScoreView } from "db://assets/scripts/gm/view/pvp/GMPVPScoreView";
import { GmModel } from './model/GMModel';
import { GMTrunkTaskView } from "db://assets/scripts/gm/view/task/GMTrunkTaskView";
import { GMUnlockBuildingView } from './view/GMUnlockBuildingView';
import { GMAddItemTextView } from "db://assets/scripts/gm/view/item/GMAddItemTextView";
import { GMOneClickStrongerView } from './view/oneClickSrtonger/GMOneClickStrongerView';
import { GMManager } from './GMManager';

const { ccclass, property } = _decorator;

export class GMController extends BaseController {
    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        //绑定脚本给组件
        G.FGUIManager.bindScript("ui://gm/GMAddItemTextView", GMAddItemTextView);
        G.FGUIManager.bindScript("ui://gm/GMItemView", GMItemView);
        G.FGUIManager.bindScript("ui://gm/ButtonGmTypeView", ButtonGmTypeView);
        G.FGUIManager.bindScript("ui://gm/iconItem", GMIconItemView);
        G.FGUIManager.bindScript("ui://gm/GMFightView", GMFightView);
        G.FGUIManager.bindScript("ui://gm/BattleLogOneItem", BattleLogOneItem);
        G.FGUIManager.bindScript("ui://gm/BattleAttrOneItem", BattleAttrOneItem);
        G.FGUIManager.bindScript("ui://gm/GMFightSelectItem", GMFightSelectItem);
        // G.FGUIManager.bindScript("ui://gm/TestFightComboBox", TestFightComboBox);

        // 一键按钮界面
        G.FGUIManager.bindScript("ui://gm/GMOneKeyButtonChildView", GMOneKeyButtonChildView);
        G.FGUIManager.bindScript("ui://gm/BtnGm", BtnGmView);

        // 检查图片资源
        G.FGUIManager.bindScript("ui://gm/GMAssetCheckerChildView", GMAssetCheckerChildView);

        // spine 检查界面
        G.FGUIManager.bindScript("ui://gm/GMSpineCheckerView", GMSpineCheckerView);
        // G.FGUIManager.bindScript("ui://gm/GMSpineCheckerComboBox1", GMSpineCheckerComboBox1View);
        // G.FGUIManager.bindScript("ui://gm/GMSpineCheckerComboBox1_item", GMSpineCheckerComboBox1_itemView);
        // G.FGUIManager.bindScript("ui://gm/GMSpineCheckerComboBox1_popup", GMSpineCheckerComboBox1_popupView);

        // email
        G.FGUIManager.bindScript("ui://gm/GMEmailView", GMEmailView);

        // 服务器时间
        G.FGUIManager.bindScript("ui://gm/GMAddServerTimeView", GMAddServerTimeView);

        // 任务
        G.FGUIManager.bindScript("ui://gm/GMTaskView", GMTaskView);
        G.FGUIManager.bindScript("ui://gm/GMTrunkTaskView", GMTrunkTaskView);
        // level
        G.FGUIManager.bindScript("ui://gm/GMLevelView", GMLevelView);

        //英雄属性
        G.FGUIManager.bindScript("ui://gm/GMHeroAttrView", GMHeroAttrView);

        // 抽卡
        G.FGUIManager.bindScript("ui://gm/DrawCardTestNewHeroComp", DrawCardTestNewHeroComp);

        //引导
        G.FGUIManager.bindScript("ui://gm/GMGuideView", GMGuideView);

        G.FGUIManager.bindScript("ui://gm/GMTransferMapView", GMTransferMapView);
        G.FGUIManager.bindScript("ui://gm/GMUnlockBuildingView", GMUnlockBuildingView);
        // pvp
        G.FGUIManager.bindScript("ui://gm/GMPVPScoreView", GMPVPScoreView);
        // 一键变强
        G.FGUIManager.bindScript("ui://gm/GMOneClickStrongerView", GMOneClickStrongerView);


        window["GMManager"] = GMManager;
        setTimeout(() => {
            GMManager.ins().initDebugShortcut();
            GmModel.ins();
        }, 5000);
    }
}

GMController.ins().doInit();



