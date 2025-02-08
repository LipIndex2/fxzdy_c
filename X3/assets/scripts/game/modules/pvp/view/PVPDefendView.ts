import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { CommonHeroItemComp } from "db://assets/scripts/game/modules/common/hero/CommonHeroItemComp";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPRobotUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPRobotUtils";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import * as fgui from "fairygui-cc";
import GIns from "../../../GIns";
import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { FormationSkillInfo } from "../../formation/components/FormationSkillInfo";
import { FormationSkillType } from "../../formation/const/FormationSkillType";


const { GObject } = fgui;

export class PVPDefendViewOpenArgs {
    oppoId: number;

    static create(oppoId: number): PVPDefendViewOpenArgs {
        const args = new PVPDefendViewOpenArgs();
        args.oppoId = oppoId;
        return args;
    }
}

/**
 * PVP 防守阵容
 */
export class PVPDefendView extends UICommWin {

    static pkgName: string = "pvp";

    static viewName: string = "PVPDefendView";
    // 对手
    private _oppoId: number = 0;
    private _oppoVo: Vo.arena.ArenaOpponentVo;
    // hero
    private _heroIdArray: Array<number> = [];
    private _heroLvArray: Array<number> = [];
    private _heroStarCountArray: Array<number> = [];
    private _heroSkinArray: Array<number> = [];
    private _captainId: number = 0;


    private get view(): ui.pvp.PVPDefendView {
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
        G.Logger.debug(" onInit ")


        this.view.heroList.setVirtual();
        this.view.heroList.itemRenderer = this.renderForHeroItem.bind(this);
    }

    public onOpen(args: PVPDefendViewOpenArgs): void {
        const oppoId = args.oppoId;
        this._oppoId = oppoId;

        const oppoVo = PVPModel.ins().getContext().getOpponentById(oppoId);
        if (!oppoVo) {
            return;
        }
        this._oppoVo = oppoVo;

        this.reset();
    }


    public onClose(): void {
        G.Logger.debug(" onClose ");

    }

    @LogBusiness("刷新界面")
    private reset() {

        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);

        // robot
        const robotBaseVo = this._oppoVo.robotBaseVo;
        if (robotBaseVo) {
            playerAvatar.resetByRobotJJC(robotBaseVo);

            const robotConfigId = robotBaseVo.robotConfigId;
            const robotConfig = PVPRobotUtils.getRobotConfigById(robotConfigId);
            if (!robotConfig) {
                console.error(`找不到robotConfigId:${robotConfigId}`);
                return;
            }
            const rankConfigId = robotBaseVo.robotRankConfigId;
            const rankConfig = PVPUtils.getConfigById(rankConfigId);
            if (!rankConfig) {
                console.error(`找不到rankConfigId:${rankConfigId}`);
                return;
            }

            this._heroLvArray = rankConfig.robotHeroLvArray;
            this._heroStarCountArray = rankConfig.robotHeroStarArray;

            // 英雄数量
            this._heroIdArray = robotConfig.heroIdArray || [];
            this.view.heroList.numItems = this._heroIdArray.length || 0;

            this.view.labelPlayerName.text = robotBaseVo.robotName;
            this.view.labelPowerNum.text = `战力: ${robotBaseVo.fight}`;

            //收藏品 机器人暂时没有收藏品数据
            let collectionsVo = null;
            let collectionsComp = FguiScriptUtils.toMyScriptClass(this.view.petComp, FormationSkillInfo);
            collectionsComp.infoComp.type == FormationSkillType.COLLECTIONS;
            collectionsComp.updateByVo(collectionsVo as CollectionsVo);

            //宠物
            let petVo = rankConfig.robotPetBaseId > 0 ? GIns.petModel.petContext.getDataByCfgId(rankConfig.robotPetBaseId) : null
            let petComp = FguiScriptUtils.toMyScriptClass(this.view.petComp, FormationSkillInfo);
            petComp.infoComp.type == FormationSkillType.PET;
            petComp.updateByVo(petVo);
            return
        }

        // player
        const playerBaseVo = this._oppoVo.baseVo;
        if (playerBaseVo) {
            playerAvatar.resetByPlayerInfo(playerBaseVo);

            const formationVisitVo = this._oppoVo.formationVisitVo;
            if (formationVisitVo) {
                const positionVisitVos = formationVisitVo.positionVisitVos || [];

                this._heroIdArray = [];
                this._heroLvArray = [];
                this._heroStarCountArray = [];
                for (let positionVisitVo of positionVisitVos) {
                    this._heroIdArray.push(positionVisitVo.heroBaseId);
                    this._heroLvArray.push(positionVisitVo.heroLevel);
                    this._heroStarCountArray.push(positionVisitVo.star);
                    this._heroSkinArray.push(positionVisitVo.useSkinId);
                }
                // 英雄数量
                this.view.heroList.numItems = this._heroIdArray.length || 0;

                this.view.labelPlayerName.text = playerBaseVo.name;
                this.view.labelPowerNum.text = `战力: ${playerBaseVo.fight}`;

            } else {

                console.error(`后端玩家数据没有阵容信息!. data = `, this._oppoVo);
            }

            //收藏品
            let collectionsComp = FguiScriptUtils.toMyScriptClass(this.view.petComp, FormationSkillInfo);
            collectionsComp.infoComp.type == FormationSkillType.COLLECTIONS;
            collectionsComp.updateByVisitVo(formationVisitVo?.collectiblesVisitVo);

            //宠物
            let petComp = FguiScriptUtils.toMyScriptClass(this.view.petComp, FormationSkillInfo);
            petComp.infoComp.type == FormationSkillType.PET;
            petComp.updateByVisitVo(formationVisitVo?.petVisitVo);
        }
    }

    // 对手英雄信息
    renderForHeroItem(index: number, comp: ui.comm.hero.components.CommonHeroItemComp) {
        const heroId = this._heroIdArray[index];
        const lv = this._heroLvArray[index] || 1;
        const starCount = this._heroStarCountArray[index] || 1;
        const skinId = this._heroSkinArray[index] || 0;

        FguiScriptUtils.toMyScriptClass(comp, CommonHeroItemComp)
            .reset(
                heroId,
                lv,
                starCount,
                skinId
            );

    }

}