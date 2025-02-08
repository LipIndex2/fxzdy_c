import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { ILeagueExploreBuildingVo } from "../../modules/leagueExplore/model/vo/ILeagueExploreBuildingVo";
import { MapBuildingUI } from "./MapBuildingUI";
import { MapOccupyHeroItem } from "./MapOccupyHeroItem";

/** 宠物副本建筑信息展示 */
@bindFguiExtension("ui://map/MapPetDungeon")
export class MapPetDungeon extends MapBuildingUI {
    static pkgName: string = "map";
    static viewName: string = "MapPetDungeon";

    /**建筑数据*/
    protected _buildingVo: ILeagueExploreBuildingVo = null;
    protected _heros: MapOccupyHeroItem[] = [];
    private get view(): ui.map.item.MapPetDungeon {
        return this as any;
    }

    constructor() {
        super();
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected onInit() {
        super.onInit();
    }

    protected onPreDispose() {
        super.onPreDispose();
    }

    protected initUI(): void {

    }

    protected updateUI(): void {

    }

    /**更新关卡显示*/
    public updateFloor(floorName: string): void {
        this.view.lbChapter.text = floorName;
    }
}
