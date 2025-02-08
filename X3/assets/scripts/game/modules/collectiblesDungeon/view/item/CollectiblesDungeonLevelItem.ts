import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import GIns from "../../../../GIns";
import { UICollectiblesDungeonConfig } from "../../const/UICollectiblesDungeonConfig";
import { ICollectiblesDungeonLevelVo } from "../../model/vo/ICollectiblesDungeonLevelVo";

@bindFguiExtension('ui://collectiblesDungeon/CollectiblesDungeonLevelItem')
export class CollectiblesDungeonLevelItem extends fgui.GButton {

    static pkgName: string = "collectiblesDungeon";
    static viewName: string = "CollectiblesDungeonLevelItem";

    protected _levelId: number;
    protected _levelVo: ICollectiblesDungeonLevelVo = null;
    protected _stars: ui.collectiblesDungeon.component.CollectiblesDungeonStar[];

    private get view(): ui.collectiblesDungeon.item.CollectiblesDungeonLevelItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.onClick(this.onClickItem, this);

        this._stars = [
            this.view.star1,
            this.view.star2,
            this.view.star3
        ];
    }

    protected onPreDispose(): void {

    }

    protected onClickItem(): void {
        G.UIManager.open(UICollectiblesDungeonConfig.CollectiblesDungeonChallengeWin, this._levelId);
    }

    public setData(levelId: number): void {
        if (this._levelId != levelId) {
            this._levelId = levelId;
            this._levelVo = GIns.collectiblesDungeonModel.getLevelVo(levelId);

            this.view.lbName.text = this._levelVo ? this._levelVo.cfg.name : '';
        }

        let canChallenge: boolean = GIns.collectiblesDungeonModel.isLevelCanChallenge(this._levelVo);
        if (canChallenge) {
            this.view.touchable = true;
            if (this._levelVo.id == GIns.collectiblesDungeonModel.maxPassLevelId + 1) {
                this.view.getController('state').selectedIndex = 1;
            } else {
                this.view.getController('state').selectedIndex = 0;
            }
            this._stars.forEach((star, index) => {
                if (index < this._levelVo.curStar) {
                    star.getController('state').selectedIndex = 0;
                } else {
                    star.getController('state').selectedIndex = 1;
                }
            });
        } else {
            this.view.getController('state').selectedIndex = 2;
            this.view.touchable = false;
        }
        if ( this.view.getController('state').selectedIndex == 1) {
            this.view.getTransition('curAni').play(null, Number.MAX_SAFE_INTEGER);
        } else {
            this.view.getTransition('curAni').stop(true);
        }
    }
}