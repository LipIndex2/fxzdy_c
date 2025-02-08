import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { GVGTabItemBtn } from "db://assets/scripts/game/modules/gvg/btn/GVGTabItemBtn";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { GVGChallengeViewOpenArgs } from "db://assets/scripts/game/modules/gvg/view/GVGChallengeView";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { GVGConfigManager } from "db://assets/scripts/game/modules/gvg/config/GVGConfigManager";
import { EnumGVGTeamType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGTeamType";
import { math, Vec3 } from "cc";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";
import GIns from "db://assets/scripts/game/GIns";
import { GVGUtils } from "db://assets/scripts/game/modules/gvg/utils/GVGUtils";
import { UILeagueKey } from "db://assets/scripts/game/modules/league/const/UILeagueConst";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { LeagueFlagComp } from "db://assets/scripts/game/modules/league/comp/LeagueFlagComp";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { LeagueCenterViewOpenArgs } from "db://assets/scripts/game/modules/league/structs/LeagueCenterViewOpenArgs";
import { ChatComp } from "db://assets/scripts/game/ui/main/components/ChatComp";

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGMainView)
export class GVGMainView extends UIPage {

    static pkgName: string = "gvg";
    static viewName: string = "GVGMainView";

    // 人数 -> 位置数组映射 (不含 root)
    private _personCountToPosOffsetArray: Map<number, Vec3[]> = new Map<number, Vec3[]>([
        // 4人布局：战力 1、2、3、4
        [4, [
            new Vec3(-40, 0, 0),  // 战力1
            new Vec3(0, -40, 0),   // 战力2
            new Vec3(0, 40, 0), // 战力3
            new Vec3(40, 0, 0),  // 战力4
        ]],

        // 5人布局：战力 1、2、3、4、5
        [5, [
            new Vec3(-120, 0, 0),  // 战力1
            new Vec3(-40, -40, 0),   // 战力2
            new Vec3(-40, 40, 0), // 战力3
            new Vec3(40, -40, 0),  // 战力4
            new Vec3(40, 40, 0),  // 战力5
        ]],

        // 6人布局：战力 1、2、3、4、5、6
        [6, [
            new Vec3(-120, 0, 0),  // 战力1
            new Vec3(-40, -40, 0),   // 战力2
            new Vec3(-40, 40, 0), // 战力3
            new Vec3(40, -40, 0),  // 战力4
            new Vec3(40, 40, 0),  // 战力5
            new Vec3(120, 0, 0),  // 战力6
        ]],
    ]);

    private get view(): ui.gvg.GVGMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GVG_INFO_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.GVG_INFO_CHANGE: {
                Logger.debug("赛季阶段发生变化");
                FloatingTextManager.ins().showTips("阶段数据更新");
                this.reset();
                break;
            }
        }

    }

    protected onInit() {
        // 初始化

        // chat | 联盟对决频道
        FguiScriptUtils.toMyScriptClass(this.view.chat, ChatComp)
            .setOnlyCareChannelType(ServerEnums.ChannelType.LEAGUE_WAR);

        this.view.btnRule.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.LEAGUE_WAR_CHALLENGE, this.view.btnRule)
        }, this);

        // 不允许点击自己的联盟
        // this.view.btnLeagueMy.onClick(this.onClickMyLeague, this)
        this.view.btnLeagueOppo.onClick(this.onClickOppoLeague, this)

        this.view.btnList.itemRenderer = this.irItem.bind(this);
        this.view.btnList.numItems = 4;

        this.view.btnMyLayer1.onClick(this.onClickMyLayer1, this);
        this.view.btnMyLayer2.onClick(this.onClickMyLayer2, this);
        this.view.btnMyLayer3.onClick(this.onClickMyLayer3, this);
        // oppo layer
        this.view.btnOppoLayer1.onClick(this.onClickOppoLayer1, this);
        this.view.btnOppoLayer2.onClick(this.onClickOppoLayer2, this);
        this.view.btnOppoLayer3.onClick(this.onClickOppoLayer3, this);

        // oppo challenge
        this.view.btnChallenge1.onClick(this.onClickOppoLayer1, this);
        this.view.btnChallenge2.onClick(this.onClickOppoLayer2, this);
        this.view.btnChallenge3.onClick(this.onClickOppoLayer3, this);

        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);

  

        // 标记已读
        RedDotManager.ins().markRead(EnumRedDotReadType.LOGIN_ONCE, RedDotKeys.gvg_haveChallengeCount);
    }


    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        Logger.debug(" onOpen ")
        const context = GVGModel.ins().context;

        GameTimer.ins().clearAll(this);
        GameTimer.ins().loop(500, this, this.updateTime0);

        this.reset();

        if (DebugUtils.isDebugAndInBrowser()) {
            GIns.floatingTextMgr.showTips(`[Debug] 当前阶段 = ${context.getStage()}`);
        }

        // rem
        GVGModel.ins().sendEnterLeagueWar();
    }

    reset() {
        const context = GVGModel.ins().context;

        // 结束则弹出去
        const stage = context.getStage();
        Logger.game(`[GVG] GVGMainView | 更新了联盟阶段 stage = ${stage} `);
        if (stage == ServerEnums.LeagueWarStatus.END
            || stage == ServerEnums.LeagueWarStatus.SETTLE
        ) {
            // GIns.floatingTextMgr.showTips("联盟对决已结束");
            this.closeSelf();
            return;
        }

        const restChallengeCount = context.getRestChallengeCount();
        const maxChallengeTimesPerDay = GVGConfigManager.maxChallengeTimesPerWar;

        // 阶段
        if (stage == ServerEnums.LeagueWarStatus.BATTLE) {
            this.view.labelMyCanChallengeCount.text = `挑战次数: ${restChallengeCount}/${maxChallengeTimesPerDay}`;
        } else if (stage == ServerEnums.LeagueWarStatus.SIGN_UP) {
            this.view.labelMyCanChallengeCount.text = `报名中`;
        } else if (stage == ServerEnums.LeagueWarStatus.SET_FORMATION) {
            this.view.labelMyCanChallengeCount.text = `准备中`;
        } else if (stage == ServerEnums.LeagueWarStatus.SETTLE) {
            this.view.labelMyCanChallengeCount.text = `结算中`;
        } else {
            this.view.labelMyCanChallengeCount.text = `已结束`;
        }

        const isIntBattle = stage == ServerEnums.LeagueWarStatus.BATTLE;
        this.view.getController("isIntBattle").selectedIndex = isIntBattle ? 1 : 0;

        // leagueName
        this.view.labelLeagueNameMy.text = context.getLeagueName(EnumGVGTeamType.MY);
        this.view.labelLeagueNameOther.text = context.getLeagueName(EnumGVGTeamType.OPPO);
        // star
        this.view.labelStarCountMy.text = context.getLeagueStarCount(EnumGVGTeamType.MY).toString();
        this.view.labelStarCountOther.text = context.getLeagueStarCount(EnumGVGTeamType.OPPO).toString();


        // logo
        const myLea = context.getLea(EnumGVGTeamType.MY);
        if (myLea) {
            FguiScriptUtils.toMyScriptClass(this.view.imageLeagueLogoL, LeagueFlagComp)
                .change(myLea.icon, myLea.banner);
        }
        const oppoLea = context.getLea(EnumGVGTeamType.OPPO);
        if (oppoLea) {
            FguiScriptUtils.toMyScriptClass(this.view.imageLeagueLogoR, LeagueFlagComp)
                .change(oppoLea.icon, oppoLea.banner);
        }

        // 站位
        this.refreshTeam(this.view.teamMy1, EnumGVGTeamType.MY, 1);
        this.refreshTeam(this.view.teamMy2, EnumGVGTeamType.MY, 2);
        this.refreshTeam(this.view.teamMy3, EnumGVGTeamType.MY, 3);
        this.refreshTeam(this.view.teamOppo1, EnumGVGTeamType.OPPO, 1);
        this.refreshTeam(this.view.teamOppo2, EnumGVGTeamType.OPPO, 2);
        this.refreshTeam(this.view.teamOppo3, EnumGVGTeamType.OPPO, 3);

        // time
        this.updateTime0();
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        GameTimer.ins().clearAll(this);


        super.onClose();


    }

    irItem(index: number, comp: GVGTabItemBtn) {


        comp.reset(index);
    }

    onClickMyLayer1() {
        this.openLayerUI(EnumGVGTeamType.MY, 1);
    }

    onClickMyLayer2() {
        this.openLayerUI(EnumGVGTeamType.MY, 2);
    }

    onClickMyLayer3() {
        this.openLayerUI(EnumGVGTeamType.MY, 3);
    }

    onClickOppoLayer1() {
        this.openLayerUI(EnumGVGTeamType.OPPO, 1);
    }

    onClickOppoLayer2() {
        this.openLayerUI(EnumGVGTeamType.OPPO, 2);
    }

    onClickOppoLayer3() {
        this.openLayerUI(EnumGVGTeamType.OPPO, 3);
    }

    // 挑战层数
    openLayerUI(teamType: EnumGVGTeamType, layer: number) {
        const stage = GVGModel.ins().context.getStage();

        // 又改需求只允许战斗阶段进去
        if (stage != ServerEnums.LeagueWarStatus.BATTLE) {
            Logger.game("非战斗阶段, 不打开 UI");
            return;
        }

        UIManager.ins().open(GVGUIKeys.GVGChallengeView, {
            teamType: teamType,
            layerNum: layer
        } as GVGChallengeViewOpenArgs);
    }

    updateTime0() {
        const context = GVGModel.ins().context;

        const restTimeMs = context.getRestTimeMs();
        const text = TimeUtils.formatTimeMsHourOrmin(restTimeMs);
        this.view.labelTime.text = `对决中: ${text}`;

        // 阶段
        const stage = context.getStage();

        this.view.bgRestTime.visible = true;
        if (stage == ServerEnums.LeagueWarStatus.SET_FORMATION
            || stage == ServerEnums.LeagueWarStatus.BATTLE
            || stage == ServerEnums.LeagueWarStatus.SIGN_UP
            || stage == ServerEnums.LeagueWarStatus.SETTLE
        ) {
            // ignored
        } else {
            this.view.bgRestTime.visible = false;
        }

        GVGUtils.setStageRestTimeText(this.view.labelRestTime);
    }

    private refreshTeam(root: FGUI.GTextField, teamType: EnumGVGTeamType, layer: number) {

        const context = GVGModel.ins().context;

        let personCount = context.getLayerPersonCount(teamType, layer);

        // 站位人数
        personCount = math.clamp(personCount, 4, 6);
        // 站位点
        const offsetPosArray = this._personCountToPosOffsetArray.get(personCount) || [];

        root.node.removeAllChildren();
        const modelArray: ModelNode[] = [];

        // create model for fighter data 
        for (let i = 0; i < offsetPosArray.length; i++) {
            const playerData = context.getFighterData(teamType, layer, i);
            if (!playerData) {
                continue;
            }

            const offsetPos = offsetPosArray[i];
            const modelNode = FGUI.UIPackage.createObject("comm", "ModelNode") as ModelNode;
            root.node.addChild(modelNode.node);

            // pos/scale
            const position = offsetPos.clone();
            if (teamType === EnumGVGTeamType.MY) {
                modelNode.setScale(-1, 1);
                modelNode.node.setPosition(position);
            } else {
                modelNode.setScale(1, 1);
                position.x = -position.x;
                modelNode.node.setPosition(position);
            }

            // anim
            const modelId = SettingsConfigManager.getModelIdByImageId(playerData.imageId);
            modelNode.loadByModelId(modelId);
            modelNode.play("idle", true);

            // remember
            modelArray.push(modelNode);
        }

// render order
        modelArray.sort((a, b) => b.node.getPosition().y - a.node.getPosition().y);
        modelArray.forEach((modelNode, index) => {
            modelNode.node.name = `model_${index}`;
            modelNode.node.setSiblingIndex(index);
        });


    }

    onClickOppoLeague() {
        const context = GVGModel.ins().context;

        const leagueId = context.getLeagueId(EnumGVGTeamType.OPPO);

        // 查看别人的联盟
        GIns.LeagueModel.viewLeagueInfoById(leagueId, (data: Vo.league.LeagueViewVo) => {
            if (!data) {
                FloatingTextManager.ins().showTips("联盟不存在");
                return;
            }
            UIManager.ins().open(UILeagueKey.LeagueCenterView,
                LeagueCenterViewOpenArgs.createForData(data)
            );
        })
    }

    onClickMyLeague() {
        const context = GVGModel.ins().context;

        const leagueId = context.getLeagueId(EnumGVGTeamType.MY);

        UIManager.ins().open(UILeagueKey.LeagueCenterView, LeagueCenterViewOpenArgs.createForReq(leagueId));
    }
}