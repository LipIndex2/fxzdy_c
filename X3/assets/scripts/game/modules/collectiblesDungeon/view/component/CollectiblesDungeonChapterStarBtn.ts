import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ICollectiblesDungeonChapterVo } from "../../model/vo/ICollectiblesDungeonChapterVo";

@bindFguiExtension('ui://collectiblesDungeon/CollectiblesDungeonChapterStarBtn')
export class CollectiblesDungeonChapterStarBtn extends fgui.GButton {

    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonChapterStarBtn";

    protected _star: number = 0;
    protected _chapterVo: ICollectiblesDungeonChapterVo = null;

    private get view(): ui.collectiblesDungeon.component.CollectiblesDungeonChapterStarBtn {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickItem(): void {
        if (this._chapterVo.rewardStateMap.get(this._star) || this._chapterVo.curStar < this._star) {
            //已领取 或者不可领取
            let cfg = G.TableManager.getDataById(table.collectiblesdungeon.CollectiblesDungeonChapterConfig, this._chapterVo.chapterId);
            let rewards: { k: any, v: any }[] = null;
            if (cfg) {
                let index: number = GIns.collectiblesDungeonModel.chapterRewardsStars.indexOf(this._star);
                switch (index) {
                    case 0:
                        rewards = cfg.rewardsOne;
                        break;
                    case 1:
                        rewards = cfg.rewardsTwo;
                        break;
                    case 2:
                        rewards = cfg.rewardsThree;
                        break;
                }
            }
            if (rewards && rewards.length > 0) {
                G.FacadeManager.emit(NotificationKey.COLLECTIBLES_DUNGEON_SHOW_CHAPTER_REWARD, { target: this.view, rewards: rewards });
            }
        } else {
            //可领取
            GIns.collectiblesDungeonModel.sendItemReward({ id: this._chapterVo.chapterId, star: this._star });
        }
    }

    public setData(cfg: table.collectiblesdungeon.CollectiblesDungeonChapterStarConfig, chapterVo: ICollectiblesDungeonChapterVo): void {
        if (this._star != cfg.star) {
            this._star = cfg.star;
            this.view.lbStar.text = cfg.star + '';
            this.view.box.icon = cfg.boxPath;
            this.view.boxOpen.icon = cfg.boxOpenPath;
        }
        this._chapterVo = chapterVo;
        let isGetReward: boolean = chapterVo.rewardStateMap.get(cfg.star) == true;
        this.view.getController('state').selectedIndex = isGetReward ? 1 : 0;
        if (isGetReward == false && cfg.star <= chapterVo.curStar) {
            this.view.getTransition('boxAni').play(null, Number.MAX_SAFE_INTEGER);
        } else {
            this.view.getTransition('boxAni').stop(true);
        }
    }
}