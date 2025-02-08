import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { EquipItem } from "../../common/item/EquipItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIEquipKey } from "../const/UIEquipConfig";
import { EquipVo } from "../vo/EquipVo";
import { equipData } from "../EquipManager";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { QualityUtils } from "../../common/quality/QualityUtils";

/**
 * 装备
 * 批量分解
 */
@bindScript(UIEquipKey.EquipRecycleWin)
export class EquipRecycleWin extends UICommWin {
    static pkgName: string = "equip";
    static viewName: string = "EquipRecycleWin";

    /** 需要分解的装备id列表 */
    private _equipIds: number[] = [];

    private _equipVos: EquipVo[];

    /** 展示分解奖励（已合并） */
    private _rewards1 = [];
    /** 记录分解奖励（未合并） */
    private _rewards2 = [];

    /** 筛选品质 */
    private _selQuilaty = [];

    private _name = ["基能", "精锐", "高阶", "光铸", "超载", "无界", "创世"];

    private get view(): ui.equip.view.EquipRecycleWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EQUIP_RECYCLE_EQUIP];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EQUIP_RECYCLE_EQUIP:
                this.updateData();
                break;
        }
    }

    protected onInit(): void {
        this.view.list_equip.itemRenderer = this.equipItemRenderer.bind(this);
        this.view.list_item.itemRenderer = this.itemRenderer.bind(this);
        this.view.list_sel.itemRenderer = this.selItemRenderer.bind(this);

        this.view.btn_recycle.on(fgui.Event.CLICK, this.recycleClick, this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateData();
    }

    private updateData() {
        this._rewards1 = [];
        this._rewards2 = [];
        this._equipIds = [];
        this._selQuilaty = GIns.equipMgr.recycleQuliatys;
        this._equipVos = GIns.equipMgr.canRecycleEquip;
        if (this._equipVos.length == 0) GIns.floatingTextMgr.showTips("暂无多余可分解装备");
        this.view.list_sel.numItems = 7;
        this.view.list_equip.numItems = this._equipVos.length;
        this.recycleReward();
    }

    /** 更新分解奖励 */
    private recycleReward() {
        this._rewards1 = ItemUtils.combineObject1s(this._rewards2);
        this.view.list_item.numItems = this._rewards1.length;
    }

    //装备
    private equipItemRenderer(index: number, item: EquipItem) {
        let equipVo = this._equipVos[index];
        let data: equipData = {
            id: equipVo.posId,
            isUnlock: true,
            equipId: this._equipVos[index].severId,
        };
        item.setData(data);
        item.isCanTouch(false);
        item.clearClick();

        if (this._equipIds.indexOf(equipVo.severId) !== -1) {
            item.isShowGou(true);
        } else {
            item.isShowGou(false);
        }

        item.onClick(() => {
            this.onItemClick(item, equipVo);
        }, this);
    }

    private onItemClick(item: EquipItem, equipVo: EquipVo) {
        let index = this._equipIds.indexOf(equipVo.severId);
        if (index !== -1) {
            item.isShowGou(false);
            this._equipIds.splice(index, 1);
            this.updateDecomposeRewards(false, equipVo.equipCfg.decomposeRewards);
        } else {
            item.isShowGou(true);
            this._equipIds.push(equipVo.severId);
            this.updateDecomposeRewards(true, equipVo.equipCfg.decomposeRewards);
        }

        this.recycleReward();
    }

    //添加单个装备分解奖励
    private updateDecomposeRewards(isAdd: boolean, rewards) {
        for (let reward of rewards) {
            if (isAdd) {
                this._rewards2.push(reward);
            } else {
                this._rewards2.splice(this._rewards2.indexOf(reward), 1);
            }
        }
    }

    //奖励预览
    private itemRenderer(index: number, item: ItemFrameBtn) {
        let data = this._rewards1[index];
        item.reset(data.k, data.v);
    }

    private selItemRenderer(index: number, item: ui.equip.item.EquipRecycleSelItem) {
        item.T_quality.text = this._name[index];
        QualityUtils.setFGUIFontColorByQuality(item.T_quality, index + 1);
        item.btn_sel.img_gou.visible = false;
        item.btn_sel.clearClick();
        if (this._selQuilaty.indexOf(index + 1) !== -1) {
            // this.onSelClick(index);
            item.btn_sel.img_gou.visible = true;

            for (let vo of this._equipVos) {
                if (vo.equipCfg.quality == index + 1) {
                    if (this._equipIds.indexOf(vo.severId) == -1) {
                        this._equipIds.push(vo.severId);
                        this.updateDecomposeRewards(true, vo.equipCfg.decomposeRewards);
                    }
                }
            }
        }
        item.btn_sel.onClick(() => {
            item.btn_sel.img_gou.visible = !item.btn_sel.img_gou.visible;
            this.onSelClick(index);
        }, this);
    }

    private onSelClick(index: number) {
        let quality = index + 1;
        let isAdd = this._selQuilaty.indexOf(quality) == -1;

        for (let vo of this._equipVos) {
            if (vo.equipCfg.quality == quality) {
                if (!isAdd) {
                    //取消选择
                    if (this._equipIds.indexOf(vo.severId) !== -1) {
                        this._equipIds.splice(this._equipIds.indexOf(vo.severId), 1);
                        this.updateDecomposeRewards(false, vo.equipCfg.decomposeRewards);
                    }
                } else {
                    if (this._equipIds.indexOf(vo.severId) == -1) {
                        this._equipIds.push(vo.severId);
                        this.updateDecomposeRewards(true, vo.equipCfg.decomposeRewards);
                    }
                }
            }
        }

        if (!isAdd) {
            this._selQuilaty.splice(this._selQuilaty.indexOf(quality), 1);
        } else {
            this._selQuilaty.push(quality);
        }
        GIns.equipMgr.recycleQuliatys = this._selQuilaty;

        this.recycleReward();
        this.view.list_equip.numItems = this._equipVos.length;
    }

    //分解
    private recycleClick() {
        if (this._equipIds.length > 0) {
            GIns.equipModel.sendDecomposeEquip(this._equipIds);
        } else if (this._equipVos.length == 0) {
            GIns.floatingTextMgr.showTips("没有装备可分解");
        } else {
            GIns.floatingTextMgr.showTips("没有选择装备");
        }
    }
}
