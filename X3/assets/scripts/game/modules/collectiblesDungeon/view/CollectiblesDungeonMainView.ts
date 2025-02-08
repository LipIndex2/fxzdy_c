import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ITransfer } from "../../../tiledMap/interface/ITransfer";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RankUIKeys } from "../../rank/RankUIKeys";
import { RankMainViewOpenArgs } from "../../rank/view/RankMainView";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { ShopType } from "../../shop/const/UIShopConst";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { ICollectiblesDungeonChapterVo } from "../model/vo/ICollectiblesDungeonChapterVo";
import { CollectiblesDungeonRewardTipView } from "./CollectiblesDungeonRewardTipView";
import { CollectiblesDungeonChapterStarBtn } from "./component/CollectiblesDungeonChapterStarBtn";
import { CollectiblesDungeonLevelItem } from "./item/CollectiblesDungeonLevelItem";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonMainView)
export class CollectiblesDungeonMainView extends UIPage {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonMainView";

    protected _chapterId: number = 0;
    protected _chapterVo: ICollectiblesDungeonChapterVo = null;
    protected _levelItems: CollectiblesDungeonLevelItem[] = null;
    protected _chapterStarCfgs: table.collectiblesdungeon.CollectiblesDungeonChapterStarConfig[] = null;

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE,
            NotificationKey.COLLECTIBLES_DUNGEON_SHOW_CHAPTER_REWARD,
            NotificationKey.COLLECTIBLES_DUNGEON_SELECT_CHAPTER,
            NotificationKey.ENTER_WORLD,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.COLLECTIBLES_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
            case NotificationKey.COLLECTIBLES_DUNGEON_SHOW_CHAPTER_REWARD:
                this.showChapterReward(args);
                break;
            case NotificationKey.COLLECTIBLES_DUNGEON_SELECT_CHAPTER:
                this.setChapter(args);
                break;
            case NotificationKey.ENTER_WORLD:
                this.onEnterWorldHandler(args[0], args[1]);
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this._chapterStarCfgs = G.TableManager.getAllData(table.collectiblesdungeon.CollectiblesDungeonChapterStarConfig);

        this.view.chapterStarComp.listStar.itemRenderer = this.itemRendererForChapterStar.bind(this);
        this.view.btnChapter.onClick(this.onClickChapter, this);
        this.view.btnRank.onClick(this.onClickRank, this);
        this.view.btnShop.onClick(this.onClickShop, this);
        this.view.btnSweep.onClick(this.onClickSweep, this);
        this.view.btnRule.onClick(this.onClickRule, this);
        this.view.btnBack.onClick(this.closeSelf, this);
        this.view.btnAd.onClick(this.onClickAd, this);

        this._levelItems = [
            FguiScriptUtils.toMyScriptClass(this.view.levelItem1, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem2, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem3, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem4, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem5, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem6, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem7, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem8, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem9, CollectiblesDungeonLevelItem),
            FguiScriptUtils.toMyScriptClass(this.view.levelItem10, CollectiblesDungeonLevelItem)
        ];
        // this.initHeaderItems();
        FguiScriptUtils.toMyScriptClass(this.view.btnSweep.redDot, RedDotCom).reset(RedDotKeys.CollectiblesDungeon_sweep);
        FguiScriptUtils.toMyScriptClass(this.view.btnChapter.redDot, RedDotCom).reset(RedDotKeys.CollectiblesDungeon_chapter);
    }

    protected onPreDispose(): void {

    }

    // protected initHeaderItems(): void {
    //     let headerItems: HeaderItem[] = [
    //         FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem),
    //         FguiScriptUtils.toMyScriptClass(this.view.headerItem2, HeaderItem),
    //         FguiScriptUtils.toMyScriptClass(this.view.headerItem3, HeaderItem),
    //         FguiScriptUtils.toMyScriptClass(this.view.headerItem4, HeaderItem),
    //     ]

    //     headerItems.forEach((ui, index) => {
    //         let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonHeaderItemConfig, index + 1);
    //         if (!cfg) {
    //             ui.visible = false;
    //             return;
    //         }
    //         ui.visible = true;
    //         ui.reset(cfg.itemId, cfg.canBuyFlag, false);
    //     });
    // }

    protected itemRendererForChapterStar(index: number, item: CollectiblesDungeonChapterStarBtn): void {
        item.setData(this._chapterStarCfgs[index], this._chapterVo);
    }

    protected onEnterWorldHandler(pos: { x: number; y: number }, data: ITransfer): void {
        if (data.isExitBattle) {
            let battleId: number = GIns.collectiblesDungeonModel.battleId;
            if (GIns.collectiblesDungeonModel.isBattleWin) {
                //代表刚刚的战斗胜利了
                let levelVo = GIns.collectiblesDungeonModel.getLevelVo(battleId);
                if (levelVo && levelVo.cfg.nextId == 0 && levelVo.id != GIns.collectiblesDungeonModel.lastLevelId) {
                    //到了下一关 需要提示是否跳转
                    G.UIManager.open(UICommonKey.BtnConfirmView, {
                        title: '提示',
                        titleConfirm: '前往下一章',
                        titleCancel: '留在本章',
                        content: `当前章节已通关，还有未领取的奖励，是否要前往下一章？`,
                        onBtnYes: () => {
                            this.setChapter(levelVo.cfg.chapterId + 1);
                        },
                    } as BtnConfirmViewOpenArgs);
                }
            } else {
                //战斗失败弹出布阵界面
                GIns.collectiblesDungeonMgr.openFormationView(battleId);
            }
        }
    }

    protected onClickChapter(): void {
        G.UIManager.open(UICollectiblesDungeonConfig.CollectiblesDungeonChapterWin, this._chapterId);
    }

    protected onClickRank(): void {
        G.UIManager.open(RankUIKeys.RankMainView, RankMainViewOpenArgs.create(ServerEnums.RankingType.COLLECTIBLES_DUNGEON));
    }

    protected onClickShop(): void {
        GIns.shopModel.openShopMain(ShopType.COLLECTIBLES_DUNGEON);
    }

    protected onClickSweep(): void {
        G.UIManager.open(UICollectiblesDungeonConfig.CollectiblesDungeonSweepWin);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.COLLECTIBLES_DUNGEON, this.view.btnRule);
    }

    protected onClickAd(): void {
        let args: IAdPlayVo = {
            type: ServerEnums.AdvertType.COLLECTIBLES_DUNGEON,
        };
        this.emit(NotificationKey.AD_START_PLAY, args);
    }

    //显示章节奖励
    protected showChapterReward(args: { target: fgui.GComponent, rewards: { k: any, v: any }[] }): void {
        let rewardTipView = FguiScriptUtils.toMyScriptClass(this.view.rewardTip, CollectiblesDungeonRewardTipView);
        rewardTipView.showReward(args.target, args.rewards);
    }

    protected updateUI(): void {
        this._levelItems.forEach((item, index) => {
            if (index < this._chapterVo.levelIds.length) {
                item.visible = true;
                item.setData(this._chapterVo.levelIds[index]);
            } else {
                item.visible = false;
            }
        });

        this.view.chapterStarComp.lbTotal.text = `${this._chapterVo.curStar}/${this._chapterVo.maxStar}`;
        this.view.chapterStarComp.starBar.max = this._chapterVo.maxStar;
        this.view.chapterStarComp.starBar.value = this._chapterVo.curStar;
        this.view.chapterStarComp.listStar.numItems = this._chapterStarCfgs.length;

        let model = GIns.collectiblesDungeonModel;
        if (!model?.vo) {
            return;
        }
        this.view.lbTimes.text = model.vo.challengeCount + '';

        if (model.maxPassLevelId > 0 && model.vo.sweepCount > 0) {
            this.view.btnSweep.visible = true;
            this.view.btnSweep.lbCnt.text = `${model.vo.sweepCount}/${model.constCfg.initSweepCount}`;
        } else {
            this.view.btnSweep.visible = false;
        }

        let remianTimes = GIns.adModel.getRemainAdTimes(GIns.collectiblesDungeonModel.vo.dailyAdvertChallengeCount, ServerEnums.AdvertType.COLLECTIBLES_DUNGEON);
        if (remianTimes > 0) {
            this.view.btnAd.visible = true;
            this.view.btnAd.title = `免费挑战次数${remianTimes}/${GIns.adModel.getTotalAdTimes(ServerEnums.AdvertType.COLLECTIBLES_DUNGEON)}`
        } else {
            this.view.btnAd.visible = false;
        }
    }

    protected setChapter(chapterId: number): void {
        if (this._chapterId != chapterId) {
            this._chapterId = chapterId;
            this._chapterVo = GIns.collectiblesDungeonModel.getChapterVo(chapterId);
            if (this._chapterVo == null) {
                this.closeSelf();
                return;
            }
            this.updateUI();
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let chapterId: number = this._chapterId;
        if (chapterId == 0) {
            //初始化章节
            let curLevelId: number = GIns.collectiblesDungeonModel.maxPassLevelId;
            if (curLevelId == 0) {
                //没有记录
                chapterId = GIns.collectiblesDungeonModel.chapterIds[0];
            } else {
                let levelVo = GIns.collectiblesDungeonModel.getLevelVo(curLevelId);
                if (levelVo) {
                    if (levelVo.cfg.nextId || levelVo.id == GIns.collectiblesDungeonModel.lastLevelId) {
                        //还有关卡 或者已经通关了 留在这一章节
                        chapterId = levelVo.cfg.chapterId;
                    } else {
                        //进入下一关
                        let index = GIns.collectiblesDungeonModel.chapterIds.indexOf(levelVo.cfg.chapterId);
                        if (index != -1 && index < GIns.collectiblesDungeonModel.chapterIds.length - 1) {
                            chapterId = GIns.collectiblesDungeonModel.chapterIds[index + 1];
                        }
                    }
                }
            }
            if (chapterId == 0) {
                //没有找到合适的章节
                this.closeSelf();
                return;
            }
            this.setChapter(chapterId);
            return;
        }
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}