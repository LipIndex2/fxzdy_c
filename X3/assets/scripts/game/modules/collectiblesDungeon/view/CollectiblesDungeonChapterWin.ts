import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { UICollectiblesDungeonConfig } from "../const/UICollectiblesDungeonConfig";
import { CollectiblesDungeonChapterItem } from "./item/CollectiblesDungeonChapterItem";

@bindScript(UICollectiblesDungeonConfig.CollectiblesDungeonChapterWin)
export class CollectiblesDungeonChapterWin extends UICommWin {
    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonChapterWin";

    private get view(): ui.collectiblesDungeon.view.CollectiblesDungeonChapterWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listChapter.setVirtual();
        this.view.listChapter.itemRenderer = this.itemRendererForChapter.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForChapter(index: number, item: CollectiblesDungeonChapterItem): void {
        item.setData(GIns.collectiblesDungeonModel.chapterIds[index]);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let defaultChapterId: number = args;
        this.view.listChapter.numItems = GIns.collectiblesDungeonModel.chapterIds.length;
        let index = GIns.collectiblesDungeonModel.chapterIds.indexOf(defaultChapterId);
        if (index != - 1) {
            this.view.listChapter.scrollToView(index, false, true);
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}