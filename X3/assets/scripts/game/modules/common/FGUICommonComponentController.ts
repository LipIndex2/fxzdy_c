import * as fgui from "fairygui-cc";

import { _decorator } from 'cc';
import G from "db://assets/scripts/core/comm/G";
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { ProgressBarCommonView } from "db://assets/scripts/game/modules/common/progressBar/ProgressBarCommonView";
import { ItemIconWithChooseCount } from "db://assets/scripts/game/modules/common/item/ItemIconWithChooseCount";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";

import { HeroSelectItem } from './item/HeroSelectItem';
import { HeroItem } from './item/HeroItem';
import { SoltItem } from './item/SoltItem';
import { AnimNode } from './item/AnimNode';
import { EquipItem } from './item/EquipItem';
import { GateNode } from '../../tiledMap/ui/GateNode';
import { IconItem } from './item/IconItem';
import NotificationKey from '../../event/NotificationKey';
import { UIFloatingTextKey } from '../floatingText/const/UIFloatingTextConfig';
import { ModelNode } from './node/ModelNode';
import { CommonFooterView } from "db://assets/scripts/game/modules/common/footer/CommonFooterView";
import { UIManager } from '../../../core/mvc/UIManager';
import { UICommonKey } from './const/UICommonConfig';
import { UnlockResAnimNode } from './anim/UnlockResAnimNode';
import ViewContainer from '../../../core/mvc/viewContainer/ViewContainer';
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import { HeroHeadSkillItem } from './item/HeroHeadSkillItem';
import { CommonHeroItemComp } from "db://assets/scripts/game/modules/common/hero/CommonHeroItemComp";
import {
    CommonPVPRankSmallLogoComp
} from "db://assets/scripts/game/modules/common/pvp/components/CommonPVPRankSmallLogoComp";
import { HeroAvatar } from "db://assets/scripts/game/modules/common/hero/HeroAvatar";
import { RightTabBtn } from "db://assets/scripts/game/modules/common/btn/RightTabBtn";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { CommonSubTabListComp } from "db://assets/scripts/game/modules/common/item/CommonSubTabListComp";
import { CommonRankSubTabBtn } from "db://assets/scripts/game/modules/common/item/CommonRankSubTabBtn";
import {
    BattleForDailyBossHpComp
} from "db://assets/scripts/game/modules/common/battle/components/BattleForDailyBossHpComp";
import { RankValueWithLogoComp } from "db://assets/scripts/game/modules/common/item/RankValueWithLogoComp";
import {
    CommonBattleTotalDamageComp
} from "db://assets/scripts/game/modules/common/battle/components/CommonBattleTotalDamageComp";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { BtnChangGui1WithItem } from "db://assets/scripts/game/modules/common/btn/BtnChangGui1WithItem";
import { HeaderItem3 } from "db://assets/scripts/game/modules/common/header/HeaderItem3";
import { ResoureceBtn } from "./header/resoureceBtn";
import { ItemListComp2 } from "./item/ItemListComp2";
import { CommonBattleManyHpComp } from "./battle/components/CommonBattleManyHpComp";
import { RedDotCom } from "./redDot/redDotCom";
import { PlayerTitleSmallComp } from "db://assets/scripts/game/modules/common/playerInfo/PlayerTitleSmallComp";
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";
import { HeroDetailsAvatar } from "./hero/HeroDetailsAvatar";
import { HeroSkillItem } from "../hero/item/HeroSkillItem";
import { BtnChangGui1WithItemList1 } from "./btn/BtnChangGui1WithItemList1";
import { ItemFrameStateBtn } from "./item/ItemFrameStateBtn";

const { ccclass, property } = _decorator;

/**
 * FGUI 通用组件
 * 绑定 comm/ 包下的
 */
export class FGUICommonComponentController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_GET_ITEM_ANIM,
            NotificationKey.LOADING_VIEW_SHOW
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_GET_ITEM_ANIM:
                this.playGetItemAnim(args);
                break;
            case NotificationKey.LOADING_VIEW_SHOW:
                this.showLoading();
                break;
        }
    }

    onInit(): void {
        FGUIManager.ins().bindScript("ui://comm1/PlayerTitleSmallComp", PlayerTitleSmallComp);

        FGUIManager.ins().bindScript("ui://comm/BtnChangGui1WithItem", BtnChangGui1WithItem);
        FGUIManager.ins().bindScript("ui://comm/BtnChangGui1WithItemList1", BtnChangGui1WithItemList1);
        // 界面容器
        FGUIManager.ins().bindScript("ui://comm/ViewContainer", ViewContainer);
        // rank
        FGUIManager.ins().bindScript("ui://comm/RankValueWithLogoComp", RankValueWithLogoComp);
        // 展示用的英雄头像
        FGUIManager.ins().bindScript("ui://comm/HeroAvatar", HeroAvatar);
        // 展示用的英雄头像
        FGUIManager.ins().bindScript("ui://comm/HeroDetailsAvatar", HeroDetailsAvatar);
        FGUIManager.ins().bindScript("ui://comm/HeroSkillItem", HeroSkillItem);
        // footer
        FGUIManager.ins().bindScript("ui://comm/CommonFooterView", CommonFooterView);
        // 通用道具 icon
        // 小图标道具
        FGUIManager.ins().bindScript("ui://comm/ItemFrameBtn", ItemFrameBtn);
        // 图标下面带有 +/- 选择数量
        FGUIManager.ins().bindScript("ui://comm/ItemIconWithChooseCount", ItemIconWithChooseCount);
         // 小图标道具带状态
        FGUIManager.ins().bindScript("ui://comm/ItemFrameStateBtn", ItemFrameStateBtn);

        FGUIManager.ins().bindScript("ui://comm/HeroSelectItem", HeroSelectItem);
        FGUIManager.ins().bindScript("ui://comm/HeroItem", HeroItem);
        FGUIManager.ins().bindScript("ui://comm/SoltItem", SoltItem);

        // header item
        FGUIManager.ins().bindScript("ui://comm/HeaderItem", HeaderItem);
        FGUIManager.ins().bindScript("ui://comm/HeaderItem3", HeaderItem3);
        FGUIManager.ins().bindScript("ui://comm/resoureceBtn", ResoureceBtn);

        //spine动画组件
        FGUIManager.ins().bindScript("ui://comm/AnimNode", AnimNode);

        /**model表 spine动画节点 */
        FGUIManager.ins().bindScript("ui://comm/ModelNode", ModelNode);

        // 数量进度条
        FGUIManager.ins().bindScript("ui://comm/ProgressBarCommonView", ProgressBarCommonView);

        //button
        FGUIManager.ins().bindScript("ui://comm/BaseBtn", fgui.GButton); //临时测试 主界面有时候会解析错类型（GComponent），所以尝试绑定
        FGUIManager.ins().bindScript("ui://comm/RightTabBtn", RightTabBtn);

        // 门节点
        FGUIManager.ins().bindScript("ui://comm/GateNode", GateNode);

        //装备item
        FGUIManager.ins().bindScript("ui://comm/EquipItem", EquipItem);

        //item图
        FGUIManager.ins().bindScript("ui://comm/IconItem", IconItem);

        /**解锁资源飞行 */
        FGUIManager.ins().bindScript("ui://comm/UnlockResAnimNode", UnlockResAnimNode);

        /**英雄头像（技能cd） */
        FGUIManager.ins().bindScript("ui://comm/HeroHeadSkillItem", HeroHeadSkillItem);
        /** 英雄 item */
        FGUIManager.ins().bindScript("ui://comm/CommonHeroItemComp", CommonHeroItemComp);

        // jjc
        FGUIManager.ins().bindScript("ui://comm/CommonPVPRankSmallLogoComp", CommonPVPRankSmallLogoComp);

        // item list
        FGUIManager.ins().bindScript("ui://comm/ItemListComp", ItemListComp);
        FGUIManager.ins().bindScript("ui://comm/ItemListComp2", ItemListComp2);
        FGUIManager.ins().bindScript("ui://comm/CommonSubTabListComp", CommonSubTabListComp);
        FGUIManager.ins().bindScript("ui://comm/CommonRankSubTabBtn", CommonRankSubTabBtn);
        FGUIManager.ins().bindScript("ui://commBattle/BattleForDailyBossHpComp", BattleForDailyBossHpComp);
        FGUIManager.ins().bindScript("ui://commBattle/BattleCommonManyHpComp", CommonBattleManyHpComp);
        FGUIManager.ins().bindScript("ui://commBattle/CommonBattleTotalDamageComp", CommonBattleTotalDamageComp);
        FGUIManager.ins().bindScript("ui://comm/RedDot", RedDotCom);

    }

    playGetItemAnim(data: any) {
        G.UIManager.open(UIFloatingTextKey.GET_ITEM_ANIM, data)
    }

    showLoading() {
        UIManager.ins().open(UICommonKey.LoadingWin);
    }
}

FGUICommonComponentController.ins().doInit();


