import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../../core/mvc/view/FguiNotificationGComponent";
import GIns from "../../../../GIns";
import { PetDungeonHeroItem } from "../item/PetDungeonHeroItem";

@bindFguiExtension('ui://petDungeon/PetDungeonBattleHeroList')
export class PetDungeonBattleHeroList extends FguiNotificationGComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonBattleHeroList";

    protected _timerKey: string = null;
    protected _endTime: number = 0;

    listenNotifications(): string[] {
        return [

        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    private get view(): ui.petDungeon.component.PetDungeonBattleHeroList {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();

        this.view.listHero.setVirtual();
        this.view.listHero.itemRenderer = this.itemRendererForHero.bind(this);
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    protected itemRendererForHero(index: number, item: PetDungeonHeroItem): void {
        item.setDataById(GIns.petDungeonModel.battleHeroIds[index]);
    }

    public updateUI(): void {
        this.view.listHero.numItems = GIns.petDungeonModel.battleHeroIds.length;
    }
}