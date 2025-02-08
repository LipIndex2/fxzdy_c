import { bindFguiExtension, bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { FormationManager } from "../../formation/FormationManager";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { DailyBossRecommendInfo } from "../context/DailyBossRecommendInfo";
import { DailyBossUIKeys } from "../DailyBossUIKeys";
import * as fgui from "fairygui-cc";
import { IHeroHeadData } from "../interface/IHeroHeadData";
import G from "../../../../core/comm/G";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { DailyBossController } from "../DailyBossController";
import { BattleRecordManager } from "../../../comm/battle/BattleRecordManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { NumberFormatter } from "../../../../core/utils/NumberFormatter";
import { DailyBossConfigManager } from "../config/DailBossConfigManager";
import { TableManager } from "../../../../core/table/TableManager";

@bindFguiExtension("ui://dailyBoss/FormationRecHeroItem")
export class DailyBossRecommendHeroListItem extends fgui.GComponent {
    private info: IHeroHeadData;
    private heroId: number;

    private get view(): ui.dailyBoss.item.FormationRecHeroItem {
        return this as any;
    }

    protected onInit(): void {
        this.view.list_star.itemRenderer = this.itemRendererForStar.bind(this)
        this.view.onClick(this.onClickHero, this);
    }

    onClickHero() {
        let itemConfig = G.TableManager.getDataById(table.item.ItemConfig, this.heroId);
        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
            itemConfig: itemConfig,
        } as HeroItemTipsViewOpenArgs);
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this.info.star)
    }

    reset(heroData: IHeroHeadData, isShowDetail: boolean = true) {
        this.info = heroData;
        this.heroId = heroData.heroId;
        let heroCfg = HeroUtils.getHeroConfigById(this.heroId);
        const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, this.heroId);
        if (!itemConfig || !heroCfg) {
            return;
        }

        // 品质
        const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, itemConfig.quality);
        if (qualityConfig) {
            this.view.img_frame.icon = qualityConfig.itemQualityBgPath;
        }

        this.view.img_item.icon = ItemUtils.getNormalHeroHead(heroCfg.headPath);
        this.view.starMc.visible = false
        this.view.img_type.visible = true;
        this.view.lvLab.visible = true
        if (isShowDetail) {
            let num = 0;
            num = heroData.star % 5;
            this.view.list_star.numItems = num == 0 ? 5 : num;
            let isHave = GIns.heroMgr.isHaveHero(this.heroId);
            if (isHave) {
                this.view.img_gray.visible = false;
            } else {
                this.view.img_gray.visible = true;
            }
            this.view.img_type.icon = ItemUtils.getCareerIcon(ServerEnums.Career[heroCfg.career]);
            this.view.lvLab.text = heroData.lv == 0 ? "" : heroData.lv.toString()
        }
        else {
            this.view.starMc.visible = false;
            this.view.img_gray.visible = false;
            this.view.img_type.visible = false;
            this.view.lvLab.visible = false
        }
    }
}

@bindFguiExtension("ui://dailyBoss/FromationRecItem")
export class DailyBossRecommendListItem extends fgui.GComponent {
    private info: DailyBossRecommendInfo;
    private get view(): ui.dailyBoss.item.FromationRecItem {
        return this as any;
    }

    protected onInit(): void {
        this.view.list_hero.setVirtual()
        this.view.list_hero.itemRenderer = this.itemRendererForHero.bind(this)
        this.view.rankBtn.onClick(this.onClickRank, this)
        this.view.btn_use.onClick(this.onClickUse, this)
    }

    protected onClickRank(): void {
        if (this.info.bossCfg) {
            let battleCfg = TableManager.getDataById(table.battle.BattleConfig, this.info.bossCfg.battleConfigId)
            if (!battleCfg)
                return

            let defInfo = {
                name: battleCfg.name,
                headIcon: battleCfg.icon as any,
            } as Vo.player.PlayerBaseVo;
            BattleRecordManager.ins().showRecordViewByServer(ServerEnums.FightType.DAILY_BOSS, this.info.playerInfo, defInfo,
                this.info.statisticsVos, this.info.defendStatisticsVos, true);
        }
    }

    protected onClickUse(): void {
        let lackList = FormationManager.ins().getFormationDiscoutLack(this.info.heroIdStr);
        if (lackList.length > 0) {
            GIns.floatingTextMgr.showTips("未拥有全部英雄");
        }
        let datas = FormationManager.ins().getFormationDiscountDatas(this.info.heroIdStr, lackList, false);
        G.UIManager.close(DailyBossUIKeys.DailyBossRecommendView)
        DailyBossController.ins().setUpFormation(datas)
    }

    protected itemRendererForHero(index: number, item: DailyBossRecommendHeroListItem): void {
        item.reset(this.info.heroList[index])
    }

    public setData(info: DailyBossRecommendInfo): void {
        this.info = info;
        this.view.nameLab.text = info.name;
        this.view.valueLab.text = NumberFormatter.formatNumberToString(info.totalHurt);
        this.view.valueLab.ensureSizeCorrect()
        const config = DailyBossConfigManager.getDifficultyConfig(info.difficulty);
        if (config)
            this.view.typeIcon.icon = config.logoAssetPath

        if (info.type == 2) {
            this.view.getController("c1").selectedIndex = 1
        }
        else
            this.view.getController("c1").selectedIndex = 0
        this.view.list_hero.numItems = this.info.heroList.length;
    }
}

/*
* 推荐布阵
 */
@bindScript(DailyBossUIKeys.DailyBossRecommendView)
export class DailyBossRecommendView extends UICommWin {
    static pkgName: string = "dailyBoss";
    static viewName: string = "DailyBossRecommendView";

    private bossType: number = 0;
    private recommendList: DailyBossRecommendInfo[] = [];

    listenNotifications(): string[] {
        return [
            NotificationKey.DAILY_BOSS_Formation_Rank,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.DAILY_BOSS_Formation_Rank:
                this.updateUI();
                break;
        }
    }

    private get view(): ui.dailyBoss.DailyBossRecommendView {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.list_rec.setVirtual()
        this.view.list_rec.itemRenderer = this.onListItemRender.bind(this);
    }

    private onListItemRender(index: number, item: DailyBossRecommendListItem) {
        item.setData(this.recommendList[index]);
    }

    protected onOpen(bossType: number): void {
        this.bossType = bossType;
        this.updateUI();
    }

    private updateUI(): void {
        this.recommendList = GIns.dailyBossModel.context.getRecommendFormation(this.bossType)
        this.view.list_rec.numItems = this.recommendList.length;
    }
}