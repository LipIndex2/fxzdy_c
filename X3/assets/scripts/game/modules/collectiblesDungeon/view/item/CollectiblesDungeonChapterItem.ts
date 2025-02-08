import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { UICollectiblesDungeonConfig } from "../../const/UICollectiblesDungeonConfig";
import { ICollectiblesDungeonChapterVo } from "../../model/vo/ICollectiblesDungeonChapterVo";

@bindFguiExtension('ui://collectiblesDungeon/CollectiblesDungeonChapterItem')
export class CollectiblesDungeonChapterItem extends fgui.GComponent {

    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonChapterItem";

    protected _chapterId: number;
    protected _chapterVo: ICollectiblesDungeonChapterVo = null;

    private get view(): ui.collectiblesDungeon.item.CollectiblesDungeonChapterItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnGoto.onClick(this.onClickGoto, this);

    }

    protected onPreDispose(): void {

    }

    protected onClickGoto(): void {
        G.FacadeManager.emit(NotificationKey.COLLECTIBLES_DUNGEON_SELECT_CHAPTER, this._chapterId);
        G.UIManager.close(UICollectiblesDungeonConfig.CollectiblesDungeonChapterWin);
    }

    public setData(chapterId: number): void {
        if (this._chapterId != chapterId) {
            this._chapterId = chapterId;
            this._chapterVo = GIns.collectiblesDungeonModel.getChapterVo(chapterId);

            let cfg = G.TableManager.getDataById(table.collectiblesdungeon.CollectiblesDungeonChapterConfig, chapterId);
            this.view.lbName.text = cfg ? cfg.name : '';

            FguiScriptUtils.toMyScriptClass(this.view.btnGoto.redDot, RedDotCom).reset(RedDotKeys.CollectiblesDungeon_chapter, [chapterId]);
        }

        if (this._chapterVo) {
            this.view.lbStar.text = `${this._chapterVo.curStar}/${this._chapterVo.maxStar}`;
            if (this._chapterVo.curStar >= this._chapterVo.maxStar) {
                //已满星
                let hasReward: boolean = false;
                this._chapterVo.rewardStateMap.forEach((value) => {
                    if (value == false) {
                        hasReward = true;
                    }
                })
                //满星并且奖励领取完了才显示完美通关
                this.view.getController('state').selectedIndex = hasReward ? 0 : 1;
                return;
            } else if (this._chapterVo.levelIds.length > 0) {
                let firstLevelId = this._chapterVo.levelIds[0];
                if (firstLevelId == GIns.collectiblesDungeonModel.firstLevelId || firstLevelId <= GIns.collectiblesDungeonModel.maxPassLevelId + 1) {
                    //可挑战
                    this.view.getController('state').selectedIndex = 0;
                    return;
                }
            }
        }
        //默认都当做未解锁
        this.view.getController('state').selectedIndex = 2;
    }
}