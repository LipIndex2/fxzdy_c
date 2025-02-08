import * as fgui from "fairygui-cc";
import { MiniMapManager } from "../MiniMapManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { MiniMapModule } from "../MiniMapModule";


/** 星球章节Item */
export class MiniMapCollectionListItem extends fgui.GComponent {
    static pkgName: string = "miniMap";
    static viewName: string = "MiniMapCollectionListItem";

    /** 章节id */
    private _chapterId: number = 0;
    /** 当前章节所有任务类型Map */
    private _mapChapterTaskTypeMap:{[key:number]:table.map.TrunkMapTaskConfig[]};
    /** 当前章节cfg */
    private _chapterCfg:table.map.ChapterConfig;

    private get view(): ui.miniMap.item.MiniMapCollectionListItem {
        return this as any;
    }

    protected onConstruct(): void {
        this.onInit();
    }

    public onInit() {
        this.view.list_count1.itemRenderer = this.onRenderCount1.bind(this);
        this.view.list_count2.itemRenderer = this.onRenderCount2.bind(this);

        this.view.itemFrame.on(fgui.Event.CLICK, this.onItemClick, this);
    }

    private onRenderCount1(index: number, item: ui.miniMap.item.CountItem) {
        let keys = Object.keys(this._mapChapterTaskTypeMap)[index];
        let itemData:table.map.TrunkMapTaskConfig[] = this._mapChapterTaskTypeMap[keys];
        if(!itemData) return;
        item.img_icon.icon = itemData[0].icon;

        let count = 0;
        for(let cfg of itemData){
            if(MiniMapManager.ins().isTaskComplete(cfg.id)){
                count++;
            }
        }

        item.title.text = `${count}/${itemData.length}`;
    }

    private onRenderCount2(index: number, item: ui.miniMap.bar.UpperLimitValueBar) {
        let object1 = this._chapterCfg.resourceLimitAdditionRewards[index];
        if(!object1) return;
        let itemData = ItemUtils.getItemConfigByItemId(object1.k)
        item.img_item.icon = itemData.smallIconPath;
        item.T_add.text = `+${object1.v}`;
        item.bar.max = object1.v;
        item.bar.value = 0;
    }

    /** 设置控制器状态 */
    public setControllerState(state: number) {
        this.view.getController("c2").selectedIndex = state;
    }

    public setData(id: number) {
        if(!id) return;
        this._chapterId = id;
        this._chapterCfg = TableManager.getDataById(table.map.ChapterConfig, id);
        this._mapChapterTaskTypeMap = MiniMapManager.ins().MapChapterTaskCfgByType(this._chapterId);

        this.updateUI();
    }

    private updateUI(){
        let keys = Object.keys(this._mapChapterTaskTypeMap);
        this.view.list_count1.numItems = keys.length;
        this.view.list_count2.numItems = this._chapterCfg.resourceLimitAdditionRewards.length;

        
        //@ts-ignore
        this.view.itemFrame.reset(this._chapterCfg.chapterTaskRewards[0].k, this._chapterCfg.chapterTaskRewards[0].v);
        this.view.T_name.text = this._chapterCfg.chapter_name;

        this.taskState();
    }
    
    // 任务状态
    private taskState(){
        //0未解锁 1未完成 2已完成未领取 3已完成已领取
        let state = 0;
        if(MiniMapManager.ins().isChapterUnlock(this._chapterId)){
            state = 1;
        }
        if(MiniMapManager.ins().isChapterTaskComplete(this._chapterId)){
            state = 2;
        }
        if(MiniMapManager.ins().MapChapterRewardIds.indexOf(this._chapterId) != -1){
            state = 3;
        }
        this.view.getController("c1").selectedIndex = state;
    }

    private onItemClick() {
        if(this.view.getController("c1").selectedIndex == 2){
            MiniMapModule.ins().sendDrawMapChapterReward(this._chapterId)
        }
    }
}