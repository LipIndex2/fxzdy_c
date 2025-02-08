import G from "db://assets/scripts/core/comm/G";
import { FguiNotificationGComponent } from "db://assets/scripts/core/mvc/view/FguiNotificationGComponent";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { AttrConfigEffect } from "../../../attr/structs/AttrConfigEffect";
import { IPetDungeonToyDragArgs, IPetDungeonToyIconStarParam, PetDungeonToyDragFrom, UIPetDungeonConfig } from "../../const/UIPetDungeonConfig";
import { PetDungeonToyIconWithCell } from "../component/PetDungeonToyIconWithCell";

@bindFguiExtension('ui://petDungeon/PetDungeonToyBoxItem')
export class PetDungeonToyBoxItem extends FguiNotificationGComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonToyBoxItem";

    protected _toyIcon: PetDungeonToyIconWithCell = null;
    protected _from: PetDungeonToyDragFrom = PetDungeonToyDragFrom.Main_Box;
    protected _vo: Vo.petdungeon.PetDungeonToy = null;
    protected _toyId: number = 0;
    protected _toyConfigId: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_TOY_BACK_TO_BOX,
            NotificationKey.PET_DUNGEON_DRAG_TOY_STAR,
            NotificationKey.PET_DUNGEON_DRAG_TOY_END,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_TOY_BACK_TO_BOX:
                if (this._toyId == args) {
                    this.view.getTransition('enter').play();
                    break;
                }
                break;
            case NotificationKey.PET_DUNGEON_DRAG_TOY_STAR:
                if (args.id == this._toyId) {
                    this.view.alpha = 0.4;
                }
                break;
            case NotificationKey.PET_DUNGEON_DRAG_TOY_END:
                if (args.id == this._toyId) {
                    this.view.alpha = 1;
                }
                break;
        }
    }
    private get view(): ui.petDungeon.item.PetDungeonToyBoxItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();
        this.view.gTip.visible = false;
        //初始化图标  
        this._toyIcon = PetDungeonToyIconWithCell.create();
        this.view.addChildAt(this._toyIcon, 1);
        this._toyIcon.isCanTouchDrag = true;
        this._toyIcon.initCfg(54, 4, this.view.toyRect.width, this.view.toyRect.height);
        this._toyIcon.onStartDragCallback = this.onStartDragCallback.bind(this);

        this.view.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    protected onClickItem(): void {
        if (this._from == PetDungeonToyDragFrom.Main_Box) {
            //仓库弹出详情
            G.UIManager.open(UIPetDungeonConfig.PetDungeonToyInfoWin, this._vo.toyId);
        } else if (this._from == PetDungeonToyDragFrom.Box) {
            //放入仓库
            if (GIns.petDungeonModel.activityInfo.playerInfoVo.petDungeonToyList?.length >= GIns.petDungeonModel.constCfg.toyMaxCount) {
                //仓库满了
                GIns.floatingTextMgr.showTips('仓库空间不足');
            } else {
                GIns.petDungeonModel.sendOpenToyBox({ type: 0, id: this._toyId }, this._toyConfigId);
            }
        }
    }

    protected onStartDragCallback(param: IPetDungeonToyIconStarParam): void {
        let lastCellIdx: number = -1;
        let args: IPetDungeonToyDragArgs = {
            id: this._toyId,
            toyConfigId: this._toyConfigId,
            from: this._from,
            mouseX: param.mouseX,
            mouseY: param.mouseY,
            percentW: param.percentW,
            percentH: param.percentH,
            lastCellIdx: lastCellIdx,
        }
        G.FacadeManager.emitNow(NotificationKey.PET_DUNGEON_DRAG_TOY_STAR, args);
    }

    public setData(vo: Vo.petdungeon.PetDungeonToy, from: PetDungeonToyDragFrom = PetDungeonToyDragFrom.Main_Box): void {
        this._vo = vo;
        this._toyId = vo.id;
        this._from = from;
        if (this._toyConfigId != vo.toyId) {
            this._toyConfigId = vo.toyId;
            this._toyIcon.setToy(vo.toyId);
            //居中显示
            this._toyIcon.x = this.view.toyRect.x + (this.view.toyRect.width - this._toyIcon.width) * 0.5;
            this._toyIcon.y = this.view.toyRect.y + (this.view.toyRect.height - this._toyIcon.height) * 0.5;

            let lastCellBottomY: number = this._toyIcon.y + this._toyIcon.lastCell.y + this._toyIcon.lastCell.height;
            if (this._toyIcon.lastCell.x + this._toyIcon.lastCell.width != this._toyIcon.width) {
                //不在最右列 左对齐
                this.view.lbLv.setPivot(0, 1, true);
                this.view.lbLv.setPosition(this._toyIcon.x + this._toyIcon.lastCell.x, lastCellBottomY);
            } else {
                //其他情况右对齐
                this.view.lbLv.setPivot(1, 1, true);
                this.view.lbLv.setPosition(this._toyIcon.x + this._toyIcon.lastCell.x + this._toyIcon.lastCell.width, lastCellBottomY);
            }
            if (this._toyIcon.cfg) {
                if (this._toyIcon.cfg.addAttrArray?.length > 0) {
                    //有属性展示属性
                    let attrName: string = GIns.attrMgr.getAttrNameByType(this._toyIcon.cfg.addAttrArray[0].k);
                    let attrEffect = AttrConfigEffect.create(this._toyIcon.cfg.addAttrArray[0].k, this._toyIcon.cfg.addAttrArray[0].v);
                    if (attrName.length >= 4) {
                        this.view.lbAttr.text = `${attrName}<br/><color=#1DE451>${attrEffect.getShowValueTextWithSymbol()}</color>`;
                    } else {
                        this.view.lbAttr.text = `${attrName} <color=#1DE451>${attrEffect.getShowValueTextWithSymbol()}</color>`;
                    }
                } else {
                    //没有属性展示技能名称
                    let skillCfg = G.TableManager.getDataById(table.battle.SkillConfig, this._toyIcon.cfg.skillIds);
                    if (skillCfg) {
                        this.view.lbAttr.text = StringUtils.repleaceDescToAtkImage(skillCfg.name);
                    } else {
                        this.view.lbAttr.text = '';
                    }
                }
            }
            this.view.lbLv.text = 'Lv' + this._toyIcon.cfg.lv;
        }

        if (this._toyIcon.cfg?.nextId > 0 && GIns.petDungeonModel.toyBoxVo.isInBox(this._toyIcon.cfg?.id)) {
            this.view.gTip.visible = true;
        } else {
            this.view.gTip.visible = false;
        }

        if (this._toyId == GIns.petDungeonModel.backToBoxId) {
            this.view.getTransition('enter').play();
        }
    }
}