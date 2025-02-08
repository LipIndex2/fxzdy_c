import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { UIMagicCubeKey } from "../const/UIMagicCubeConfig";
import { MagicCubeVo } from "../MagicCubeVo";
import { AttrData } from "../../attr/AttrManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import NotificationKey from "../../../event/NotificationKey";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { Color } from "cc";
import { ModelNode } from "../../common/node/ModelNode";
import { HeaderItem } from "../../common/header/HeaderItem";

/**
 * 魔方信息界面
 */
@bindScript(UIMagicCubeKey.MagicCubeMainWin)
export class MagicCubeMainWin extends UICommWin {
    static pkgName: string = "magicCube";
    static viewName: string = "MagicCubeMainWin";

    private _heroId: number;
    private _vo: MagicCubeVo;

    //当前属性
    private _attrs1: AttrData[] = [];
    //下一级属性
    private _attrs2: AttrData[] = [];
    //转换属性
    private _attrs3: AttrData[] = [];

    private get view(): ui.magicCube.MagicCubeMainWin {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [NotificationKey.MAGICCUBE_REFRESH_DATA, NotificationKey.MAGICCUBE_INCREASE, NotificationKey.MAGICCUBE_CONVERT];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MAGICCUBE_REFRESH_DATA:
                if (args == this._heroId) {
                    this.updateData();
                }
                break;
            case NotificationKey.MAGICCUBE_INCREASE:
                if (args == this._heroId) {
                    this.playEffect(1);
                }
                break;
            case NotificationKey.MAGICCUBE_CONVERT:
                if (args == this._heroId) {
                    this.playEffect(2);
                }
                break;
        }
    }

    protected onInit(): void {
        //@ts-ignore
        const headerItem1 = this.view.headerItem1 as HeaderItem;
        //@ts-ignore
        const headerItem2 = this.view.headerItem2 as HeaderItem;
        // @ts-ignore
        const headerItem3 = this.view.headerItem3 as HeaderItem;
        headerItem1.reset(1, true);
        headerItem2.reset(4, true);
        headerItem3.reset(31, true);

        this.view.btn_isLock.on(fgui.Event.CLICK, this.onLockClick, this);
        this.view.btn_up.on(fgui.Event.CLICK, this.onUpClick, this);
        this.view.btn_unlock.on(fgui.Event.CLICK, this.onUnlockClick, this);
        this.view.btn_sev.on(fgui.Event.CLICK, this.onSevClick, this);

        this.view.list_attr1.itemRenderer = this.onAttr1ItemRenderer.bind(this);
        this.view.list_attr2.itemRenderer = this.onAttr2ItemRenderer.bind(this);

        this.view.btn_up.list_cost.itemRenderer = this.onUpCostItemRenderer.bind(this);

        this.view.list_tab.on(fgui.Event.CLICK_ITEM, this.onTabClick, this);
    }

    public onOpen(heroId: number, isReopen?: boolean): void {
        if (!heroId) return;
        this._heroId = heroId;
        this.view.list_attr1.numItems = 0;
        this.view.list_attr2.numItems = 0;
        this.view.getController("c2").selectedIndex = 0;

        this.updateData();
        FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.Cube_activate, [heroId]);
        FguiScriptUtils.toMyScriptClass(this.view.redDot2, RedDotCom).reset(RedDotKeys.Cube_upgrade, [heroId]);
        // FguiScriptUtils.toMyScriptClass(this.view.redDot3, RedDotCom).reset(RedDotKeys.Cube_convert, [heroId]);

        let modelNode = this.view.modelNode as ModelNode;
        let modelId = GIns.heroMgr.getHeroVoByID(heroId).heroCfg.showModelId;
        modelNode.loadByModelId(modelId);
        modelNode.setScale(-3, 3);
    }

    //更新数据
    public updateData() {
        this._vo = GIns.magicCubeMgr.getMagicCubeVoByHeroId(this._heroId);
        if (this._vo) {
            this._attrs1 = this._vo.getAttr();
            this._attrs2 = this._vo.getNextLevelAttr();

            if (this._vo.getConvertAttr().length > 0) {
                this._attrs3 = this._vo.getConvertAttr();
            }
        }

        this.view.getController("c1").selectedIndex = !this._vo ? 0 : 1;
        this.view.T_lock1.visible = !this._vo;

        this.updateView();
    }

    //更新界面
    public updateView() {
        if (this._vo) {
            this.view.list_attr1.numItems = this._attrs1.length;
            this.view.getController("c1").selectedIndex = this._vo.isMaxLevel() ? 2 : 1;
            if (this._vo.isMaxLevel()) this.view.getController("c2").selectedIndex = 1;
            if (this.view.getController("c2").selectedIndex == 0) {
                if (GIns.magicCubeMgr.isLock) {
                    this.view.list_attr2.numItems = this._attrs2.length;
                    this.view.T_lock2.visible = false;
                } else {
                    this.view.list_attr2.numItems = 0;
                    this.view.T_lock2.visible = true;
                }
            } else {
                if (this._vo.getConvertAttr().length > 0) {
                    this.view.list_attr2.numItems = this._attrs3.length;
                    this.view.T_lock2.visible = false;
                    this.view.btn_sev.grayed = false;
                } else {
                    this.view.list_attr2.numItems = 0;
                    this.view.T_lock2.visible = true;
                    this.view.btn_sev.grayed = true;
                }
            }
        } else {
            this.view.T_lock2.visible = true;
        }
        this.view.btn_up.getController("c1").selectedIndex = this.view.getController("c2").selectedIndex;
        this.view.btn_isLock.Img_gou.visible = GIns.magicCubeMgr.isLock;

        //左边魔方
        this.view.MagicCubeItem1.img_suo.visible = !this._vo;
        this.view.MagicCubeItem1.img_item.icon = this._vo ? this._vo.cubeIcon : "image/item/MF_999";
        this.view.MagicCubeItem1.img_frame.icon = this._vo ? ItemUtils.getQualityIconResourcePath(this._vo.quality) : ItemUtils.getQualityIconResourcePath(1);
        this.view.MagicCubeItem1.T_level.text = this._vo && this._vo.level >= 1 ? `+${this._vo.level}` : "";

        //右边魔方
        this.view.MagicCubeItem2.img_suo.visible = false;
        if (this.view.getController("c2").selectedIndex == 0) {
            if (GIns.magicCubeMgr.isLock && this._vo) {
                this.view.MagicCubeItem2.img_item.icon = this._vo.nextCubeIcon;
            } else {
                this.view.MagicCubeItem2.img_item.icon = "image/item/MF_999";
            }
            let quality = this._vo ? (this._vo.isHaveNextLevel() ? this._vo.quality : this._vo.quality + 1) : 2;
            this.view.MagicCubeItem2.img_frame.icon = ItemUtils.getQualityIconResourcePath(quality);
            this.view.MagicCubeItem2.T_level.text = this._vo && this._vo.isHaveNextLevel() ? `+${this._vo.level + 1}` : "";
        } else {
            // if (this._vo.getConvertAttr()) {
            //     this.view.MagicCubeItem2.img_item.icon = this._vo.unknowCubeIcon;
            // } else {
            // }
            this.view.MagicCubeItem2.img_item.icon = this._vo?.convertCubeIcon || "image/item/MF_999";
            this.view.MagicCubeItem2.img_frame.icon = this._vo ? ItemUtils.getQualityIconResourcePath(this._vo.quality) : ItemUtils.getQualityIconResourcePath(2);
            this.view.MagicCubeItem2.T_level.text = this._vo && this._vo.level >= 1 ? `+${this._vo.level}` : "";
        }

        //升级消耗
        if (this._vo) {
            if (this.view.getController("c2").selectedIndex == 0) {
                this.view.btn_up.list_cost.numItems = this._vo.getUpCost(GIns.magicCubeMgr.isLock).length;
            } else {
                this.view.btn_up.list_cost.numItems = this._vo.getConvertCost().length;
            }
        }

        this.view.btn_up.img_jiantou2.icon = this.view.btn_up.img_jiantou1.icon = this._vo ? "image/magicCube/jiantou" + this._vo.quality : "image/magicCube/jiantou2";
        this.view.btn_up.img_zuanshi2.icon = this.view.btn_up.img_zuanshi1.icon = this._vo ? "image/magicCube/zuanshi" + this._vo.quality : "image/magicCube/zuanshi2";
    }

    private onAttr1ItemRenderer(index: number, item: ui.magicCube.item.MagicCubeAttrItem) {
        item.getController("c1").selectedIndex = 0;
        let attrData = this._attrs1[index];
        let cfg = TableManager.getDataById(table.battle.AttributeConfig, attrData.id);
        item.T_attr.text = `${cfg.attrName}`;
        if (cfg.isPermyriad) {
            item.T_num.text = `+${attrData.num / 100}%`;
        } else {
            item.T_num.text = `+${attrData.num}`;
        }
    }

    private onAttr2ItemRenderer(index: number, item: ui.magicCube.item.MagicCubeAttrItem) {
        item.getController("c1").selectedIndex = 1;
        let attrData;
        if (this.view.getController("c2").selectedIndex == 0) {
            attrData = this._attrs2[index];
        } else {
            attrData = this._attrs3[index];
        }
        let cfg = TableManager.getDataById(table.battle.AttributeConfig, attrData.id);
        item.T_attr.text = `${cfg.attrName}`;
        if (cfg.isPermyriad) {
            item.T_num.text = `+${attrData.num / 100}%`;
        } else {
            item.T_num.text = `+${attrData.num}`;
        }
    }

    //消耗
    private onUpCostItemRenderer(index: number, item: ui.magicCube.item.CountItem) {
        let data;
        if (this.view.getController("c2").selectedIndex == 0) {
            data = this._vo.getUpCost(GIns.magicCubeMgr.isLock)[index];
        } else {
            data = this._vo.getConvertCost()[index];
        }

        let itemData = NoOwnerItem.create(data.k, data.v);
        item.icon_item.icon = itemData.getItemSmallIconPath();
        item.T_count.text = data.v;
        if (itemData.isCanPay()) {
            item.T_count.color = Color.WHITE;
        } else {
            item.T_count.color = Color.RED;
        }
    }

    /** 锁定当前属性按钮 */
    private onLockClick() {
        GIns.magicCubeMgr.isLock = !GIns.magicCubeMgr.isLock;
        this.updateView();
    }

    /** 增幅/转换 按钮 */
    private onUpClick() {
        if (this.view.getController("c2").selectedIndex == 0) {
            // 消耗
            if (!this._vo.isCanUp(GIns.magicCubeMgr.isLock)) {
                GIns.floatingTextMgr.showTips("道具不足");
                return;
            }
            GIns.magicCubeModel.sendUpLevel(this._heroId, GIns.magicCubeMgr.isLock);
        } else {
            if (!this._vo.isCanConvert()) {
                GIns.floatingTextMgr.showTips("道具不足");
                return;
            }
            GIns.magicCubeModel.sendConvert(this._heroId);
        }
    }

    /** 解锁按钮 */
    private onUnlockClick() {
        if (!GIns.magicCubeMgr.isCanUnlock()) {
            let cfg = TableManager.getDataById(table.magiccube.MagicCubeConstantConfig, "MAGICCUBE_OPEN_TIPS");
            GIns.floatingTextMgr.showTips(cfg.content);
            return;
        }
        GIns.magicCubeModel.sendActivate(this._heroId);
    }

    /** 保存按钮 */
    private onSevClick() {
        if (this._vo.convertCubeId > 0) {
            GIns.magicCubeModel.sendSaveConvert(this._heroId);
        }
    }

    private onTabClick() {
        this.updateView();
    }

    /**
     * 播放增幅特效
     * 1是增幅
     * 2是转换
     * */
    public playEffect(type: number): void {
        let modelNode: ModelNode
        if (type == 1)
            modelNode = this.view.modelNodeLeft as ModelNode;
        else if (type == 2)
            modelNode = this.view.modelNodeRight as ModelNode;

        if (modelNode) {
            modelNode.loadByPath('spine/ui/S_shengjitianfu/UI_shengji2_upper')
            modelNode.playOrders([
                {
                    name: 'enter',
                    isLoop: false
                }
            ])
        }
    }
}
