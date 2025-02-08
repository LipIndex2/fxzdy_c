import { Rect } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { ViewBlackBgComp } from "db://assets/scripts/core/mvc/view/comp/ViewBlackBgComp";
import { ViewEffectComp2 } from "db://assets/scripts/core/mvc/view/comp/ViewEffectComp2";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { IPetDungeonToyDragContainer } from "../const/IPetDungeonToyDragContainer";
import { IPetDungeonToyBoxOpenArgs, PetDungeonToyDragFrom, UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonToyCellContainer } from "./component/PetDungeonToyCellContainer";
import { PetDungeonToyDelBtn } from "./component/PetDungeonToyDelBtn";
import { IPetDungeonToyDragTarget, PetDungeonToyDragComp } from "./component/PetDungeonToyDragComp";
import { PetDungeonToyBoxItem } from "./item/PetDungeonToyBoxItem";

@bindScript(UIPetDungeonConfig.PetDungeonToyWin)
export class PetDungeonToyWin extends UICommWin implements IPetDungeonToyDragContainer {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyWin";

    protected _canCloseByBg: boolean = false;

    protected _toyBoxVos: Vo.petdungeon.PetDungeonToy[] = [];
    /**总属性加成*/
    protected _attrs: { attrName: string, attrValue: string }[] = [];

    public get view(): ui.petDungeon.view.PetDungeonToyWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_TOY_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_TOY_UPDATE:
                this.updateUI();
                break;
        }
    }

    protected initEffectComp(): void {
        //自定义弹框特效
        this.addComp(new ViewEffectComp2(this.view, (this.getComp(ViewBlackBgComp) as ViewBlackBgComp).bg));
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listToy.setVirtual();
        this.view.listToy.itemRenderer = this.itemRendererForToy.bind(this);
        this.view.listAttr.setVirtual();
        this.view.listAttr.itemRenderer = this.itemRendererForAttr.bind(this);

        this.view.btnBack.onClick(this.closeSelf, this);
        this.view.btnDel.onClick(this.onClickDel, this);
        this.view.btnBox.onClick(this.onClickBox, this);
        this.view.btnBox.icon = GIns.petDungeonModel.constCfg.toyBoxIcon;

        //初始化拖动
        let cellRect = new Rect(this.view.listCell.x, this.view.listCell.y, this.view.listCell.width, this.view.listCell.height);
        let delRect = new Rect(this.view.btnDel.x, this.view.btnDel.y, this.view.btnDel.width, this.view.btnDel.height);
        let boxRect = new Rect(this.view.listToy.x, this.view.listToy.y, this.view.listToy.width, this.view.listToy.height);
        let dragComp = FguiScriptUtils.toMyScriptClass(this.view.dragComp, PetDungeonToyDragComp);
        let dragTarget: IPetDungeonToyDragTarget = {
            contaier: this,
            froms: [PetDungeonToyDragFrom.Main_Cell, PetDungeonToyDragFrom.Main_Box],
            cellRect: cellRect,
            boxRect: boxRect,
            delRect: delRect,
            cellW: this.view.listCell.getChildAt(0).width,
            cellGap: this.view.listCell.lineGap,
        }
        dragComp?.setTarget(dragTarget);
        dragComp.onDragComplete = this.onDragComplete.bind(this);

        FguiScriptUtils.toMyScriptClass(this.view.btnBox.redDot, RedDotCom).reset(RedDotKeys.PetDungeon_newToy);
    }

    protected onPreDispose(): void {

    }

    protected onDragComplete(): void {
        let dragComp = FguiScriptUtils.toMyScriptClass(this.view.dragComp, PetDungeonToyDragComp);
        if (dragComp.isCollideDel) {
            //删除玩具
            let from = dragComp.args.from;
            GIns.petDungeonMgr.deleteToy(dragComp.args.id, dragComp.args.toyConfigId, () => {
                if (this.view.node.isValid && from == PetDungeonToyDragFrom.Main_Cell) {
                    //如果拖动的是格子里面的玩具 取消删除需要刷新格子
                    this.updateBoxCell();
                }
            });
            return;
        }
        if (dragComp.args.from == PetDungeonToyDragFrom.Main_Box) {
            let isAdd: boolean = false;
            if (dragComp.collideCellIdx != -1) {
                //添加玩具
                let isCanAddJoy: boolean = dragComp.isCanAddJoy;
                let isCanLvUp: boolean = false;
                //位置有重叠 判断是否可升级
                let cfg = dragComp.dragIcon.cfg;
                if (cfg.nextId > 0 && GIns.petDungeonModel.toyBoxVo.isInBox(cfg.id)) {
                    isCanLvUp = true;
                }
                if (isCanAddJoy == false && isCanLvUp == false) {
                    GIns.floatingTextMgr.showTips('玩具不可重叠！');
                    this.updateBoxCell();
                } else {
                    let grids: number[] = GIns.petDungeonModel.toyBoxVo.getGridValuesForBox(dragComp.collideCellIdx, dragComp.dragIcon.shapeVo);
                    let vo: Vo.petdungeon.PetDungeonToy = {
                        id: dragComp.args.id,
                        toyId: dragComp.args.toyConfigId,
                        grids: grids
                    }
                    GIns.petDungeonModel.sendSetToyBuff({ petDungeonToy: vo }, isCanLvUp ? 3 : 1);
                    this.updateBoxCell(dragComp.boxValues);
                    isAdd = true;
                }
            }
            if (isAdd == false) {
                //播放玩具归位动效
                this.emit(NotificationKey.PET_DUNGEON_TOY_BACK_TO_BOX, dragComp.args.id);
            }
        } else if (dragComp.args.from == PetDungeonToyDragFrom.Main_Cell) {
            if (dragComp.collideCellIdx != -1) {
                if (dragComp.isCanAddJoy == false) {
                    GIns.floatingTextMgr.showTips('玩具不可重叠！');
                    this.updateBoxCell();
                } else if (dragComp.args.lastCellIdx != dragComp.collideCellIdx) {
                    //调整玩具位置
                    let grids: number[] = GIns.petDungeonModel.toyBoxVo.getGridValuesForBox(dragComp.collideCellIdx, dragComp.dragIcon.shapeVo);
                    let vo: Vo.petdungeon.PetDungeonToy = {
                        id: dragComp.args.id,
                        toyId: dragComp.args.toyConfigId,
                        grids: grids
                    }
                    GIns.petDungeonModel.sendSetToyBuff({ petDungeonToy: vo }, 2);
                    this.updateBoxCell(dragComp.boxValues);
                } else {
                    this.updateBoxCell();
                }
            } else {
                // 返回仓库
                if (GIns.petDungeonModel.activityInfo.playerInfoVo.petDungeonToyList?.length >= GIns.petDungeonModel.constCfg.toyMaxCount) {
                    //仓库满了
                    GIns.floatingTextMgr.showTips('仓库已满！');
                    this.updateBoxCell();
                } else {
                    GIns.petDungeonModel.sendInvalidToyBuff({ id: dragComp.args.id });
                    this.updateBoxCell(dragComp.boxValues);
                }
            }
        }
    }

    protected itemRendererForToy(index: number, item: PetDungeonToyBoxItem): void {
        item.setData(this._toyBoxVos[index]);
    }

    protected itemRendererForAttr(index: number, item: ui.petDungeon.item.PetDungeonToyAttrItem): void {
        item.lbTitle.text = this._attrs[index].attrName;
        item.lbValue.text = this._attrs[index].attrValue;
        // if (item.lbTitle.text.length >= 4 && item.lbValue.text.length > 0) {
        //     item.lbValue.y = 45;
        //     item.height = 60;
        // } else {
        //     item.lbValue.y = 15;
        //     item.height = 30;
        // }
    }

    protected onClickDel(): void {
        GIns.floatingTextMgr.showTips('拖至此处可丢弃');
    }

    protected onClickBox(): void {
        if (GIns.petDungeonModel.activityInfo.playerInfoVo?.toyBoxList?.length > 0) {
            G.UIManager.open(UIPetDungeonConfig.PetDungeonToyBoxWin);
        } else {
            GIns.floatingTextMgr.showTips('当前暂无宝箱可打开');
        }
    }

    public updateTempBoxCell(dragValues: number[], boxValues: number[], isCanAdd: boolean): void {
        this.view.listCell._children.forEach((child: ui.petDungeon.item.PetDungeonToyCellItem, index) => {
            if (isCanAdd == false && dragValues[index] == 1) {
                //重叠
                child.getController('state').selectedIndex = 2;
            } else if (boxValues[index] == 1) {
                //占用
                child.getController('state').selectedIndex = 1;
            } else if (dragValues[index] == 1) {
                //预设
                child.getController('state').selectedIndex = 3;
            } else {
                child.getController('state').selectedIndex = 0;
            }
        });
    }

    public setDelOpen(value: boolean): void {
        FguiScriptUtils.toMyScriptClass(this.view.btnDel, PetDungeonToyDelBtn).isOpen(value);
    }

    public updateBoxCell(values: number[] = null): void {
        let boxValues = values ? values : GIns.petDungeonModel.toyBoxVo.boxValues;
        this.view.listCell._children.forEach((child: ui.petDungeon.item.PetDungeonToyCellItem, index) => {
            if (boxValues[index] == 1) {
                //占用
                child.getController('state').selectedIndex = 1;
            } else {
                child.getController('state').selectedIndex = 0;
            }
        });
    }

    protected updateAllCellItems(): void {
        let contaier: PetDungeonToyCellContainer = FguiScriptUtils.toMyScriptClass(this.view.cellContainer, PetDungeonToyCellContainer);
        contaier.updateToys();
        this._attrs = contaier.attrs;
        this.view.listAttr.numItems = this._attrs.length;
        //清除动效记录
        GIns.petDungeonModel.backToBoxId = 0;
    }

    protected updateUI(): void {
        let myInfo = GIns.petDungeonModel.activityInfo.playerInfoVo;
        if (myInfo.petDungeonToyList) {
            this._toyBoxVos = myInfo.petDungeonToyList
        } else {
            this._toyBoxVos = [];
        }
        this.view.lbNoneTip.visible = this._toyBoxVos.length <= 0;
        this.view.listToy.numItems = this._toyBoxVos.length;

        let boxCnt: number = 0;
        if (myInfo.toyBoxList) {
            boxCnt = myInfo.toyBoxList.length;
        }
        this.view.btnBox.title = `暂存宝箱:${boxCnt}`;

        this.updateBoxCell();
        this.updateAllCellItems();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI();

        if (args?.isAutoOpen && !isReopen && GIns.petDungeonModel.activityInfo.playerInfoVo.toyBoxList?.length > 0) {
            let args: IPetDungeonToyBoxOpenArgs = { isAutoOpen: true };
            G.UIManager.open(UIPetDungeonConfig.PetDungeonToyBoxWin, args)
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}