/**@format */
import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import { HeroModel } from "../model/HeroModule";
import { HeroConfigManager } from "../config/HeroConfigManager";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { AttrManager } from "../../attr/AttrManager";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { BackpackManager } from "../../backpack/BackpackManager";
import { Attribute } from "../../attr/AttrEnum";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { AttrEnum } from "../../../comm/battle/attribute/AttrEnum";
import G from "../../../../core/comm/G";
import { UIHeroKey } from "../const/UIHeroConfig";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";

/** 当前界面主按钮操作类型 */
export enum DNABtnClickType {
    /** 潜能升级 */
    DNA_LEVEL_UP = 0,
    /** 潜能觉醒 */
    DNA_AWAKEN = 1,
    /** 潜能刷新 */
    DNA_AWAKEN_FRESH = 2,
}

/** 传入dna提示弹窗界面的数据接口 */
export interface dnaAwakenInfo {
    baseId: number;
    /** 打开的页面id */
    type: number;
    /** 当前阶段 */
    stage: number;
    others: any;
}

/** DNA觉醒弹窗类型 */
export enum DNAWinType {
    /** 觉醒属性总览 */
    SHOW_ALL = 0,
    /** 未满级阶段预览 */
    SHOW_CUR_STAGE = 1,
    /** 已满级阶段预览 */
    SHOW_CUR_STAGE_ALL = 2,
}

/** 英雄潜能页 */
export class HeroPotentialPage extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroPotentialPage";

    private _baseId: number = 0;
    private _heroVo: HeroVo;
    private _select_idx = 0;
    private _DNABtnsMap: { [key: number]: fgui.GButton } = {};
    private _DNAProgressMap: { [key: number]: fgui.GComponent } = {}; // 用于存储DNA进度
    private _DNAMaskWidth: number; // 遮罩原始宽度
    private _DNAInfo: any = {};

    private get view(): ui.hero.page.HeroPotentialPage {
        return this as any;
    }

    public onInit() {
        // 初始化DNA按钮
        for (let i = 0; i < 6; i++) {
            const dnaBtn = this.view[`DNA${i}`] as fgui.GButton;
            this._DNABtnsMap[i] = dnaBtn;
            //@ts-ignore
            this._DNAProgressMap[i] = dnaBtn.progress;
            //@ts-ignore
            dnaBtn.bgImg.url = `ui://hero/dna_icon_${i}`;
            //@ts-ignore
            const progressLoader = this._DNAProgressMap[i].progressBg as fgui.GLoader;
            progressLoader.url = `ui://hero/dna_progress_${i}`;
            dnaBtn.onClick(() => this.onDNAClick(i), this);
            // 微调右侧的DNA按钮位置
            if (i >= 3) {
                this._DNAProgressMap[i].x = this._DNAProgressMap[i].x - 7;
            }
        }
        this._DNAMaskWidth = this._DNAProgressMap[0].width;
        this.view.sendBtn.onClick(this.onSendBtn, this);
        this.view.infoBtn1.onClick(this.onShowAllAttr, this);
        this.view.infoBtn2.onClick(this.onShowCurAttr, this);
    }

    public onOpen() {
        this.updateInfo(this._baseId);
    }

    onShowAllAttr() {
        let allData = HeroConfigManager.getHeroAttributesById(this._baseId);
        let args = {
            type: DNAWinType.SHOW_ALL,
            data: allData,
        };
        G.UIManager.open(UIHeroKey.HERO_DNA_WIN, args);
    }

    onShowCurAttr() {
        let data = [];
        const stage = this._select_idx + 1;
        const allData = HeroConfigManager.getHeroAttributesById(this._baseId);
        if (this._DNAInfo.awaken[stage]) {
            // DNA已满级
            data[1] = allData[stage];
            let args = {
                type: DNAWinType.SHOW_CUR_STAGE_ALL,
                data: data,
                stage: stage,
            };
            G.UIManager.open(UIHeroKey.HERO_DNA_WIN, args);
        } else {
            data[1] = HeroConfigManager.getConfigAttr(stage, 9);
            data[2] = allData[stage];
            let args = {
                type: DNAWinType.SHOW_CUR_STAGE,
                data: data,
                stage: stage,
            };
            G.UIManager.open(UIHeroKey.HERO_DNA_WIN, args);
        }
    }

    /**
     * 更新信息
     * @param baseId 英雄id
     */
    public updateInfo(baseId: number) {
        if (!baseId) return;
        this._baseId = baseId;
        this._heroVo = HeroManager.ins().getHeroVoByID(this._baseId);
        this._DNAInfo = this._heroVo.getDNAInfo();
        this._select_idx = this._DNAInfo.stage - 1;
        const dnaMap = HeroManager.ins().getDNAInfoMap(this._baseId);

        for (let i = 0; i < 6; i++) {
            const dnaBtn = this._DNABtnsMap[i];
            const progressComp = this._DNAProgressMap[i];
            const { isUnlocked, level } = dnaMap[i];
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(dnaBtn.redDot, RedDotCom).reset(RedDotKeys.Hero_item_dna_level_up, [
                this._baseId,
            ]);
            //@ts-ignore
            FguiScriptUtils.toMyScriptClass(dnaBtn.redDot, RedDotCom).reset(RedDotKeys.Hero_item_dna_awaken, [
                this._baseId,
            ]);
            this.setDNAButton(i, dnaBtn, isUnlocked, level, progressComp);

            if (this._select_idx === i) {
                this.onDNAClick(i);
            }
        }
    }

    private setDNAButton(
        dnaIndex: number,
        dnaBtn: fgui.GButton,
        isUnlocked: boolean,
        level: number,
        progressComp: fgui.GComponent
    ) {
        dnaBtn.selected = false;
        //@ts-ignore
        const progressMask = progressComp.progressBar;
        // 根据解锁状态调整进度条
        if (isUnlocked) {
            progressMask.width = this._DNAMaskWidth * (level / 10);
        } else {
            progressMask.width = 0;
        }

        const lockController = dnaBtn.getController("lock");
        lockController.selectedIndex = isUnlocked ? 0 : 1;
    }

    /**
     * 处理单个DNA按钮的点击事件
     * @param dnaIndex DNA索引
     */
    private onDNAClick(dnaIndex: number) {
        if (this._select_idx !== dnaIndex) {
            const btn = this._DNABtnsMap[this._select_idx];
            btn.selected = false;
            this._select_idx = dnaIndex;
        } else {
            const btn = this._DNABtnsMap[this._select_idx];
            btn.selected = true;
        }
        this.changeBottomShow(dnaIndex);
        this.showDNAInfo(dnaIndex);
    }

    /** 点击操作按钮的升级/解锁 */
    private onSendBtn() {
        const stage = this._select_idx + 1;
        let operaType = HeroManager.ins().checkCurOperation(this._baseId, stage);
        switch (operaType) {
            case DNABtnClickType.DNA_LEVEL_UP:
                HeroModel.ins().sendDNALevelUp(this._baseId);
                break;
            case DNABtnClickType.DNA_AWAKEN:
            case DNABtnClickType.DNA_AWAKEN_FRESH:
                let args = {
                    baseId: this._baseId,
                    type: 0,
                    stage: stage,
                    others: { operaType: operaType },
                } as dnaAwakenInfo;
                G.UIManager.open(UIHeroKey.HERO_DNA_TIP_WIN, args);
                break;
            default:
                break;
        }
    }

    /**
     * 显示DNA的详细信息
     * @param dnaIndex DNA索引
     */
    private showDNAInfo(dnaIndex: number) {
        const level = HeroManager.ins().getDNALevel(this._baseId, dnaIndex); // 获取DNA等级
        const stage = dnaIndex + 1; // 阶段从1开始
        const curAttrs = HeroConfigManager.getConfigAttr(stage, level); // 当前属性
        const nextAttrs = HeroConfigManager.getConfigAttr(stage, level + 1); // 下一属性
        const attrCount = nextAttrs ? nextAttrs.length : curAttrs ? curAttrs.length : 0;

        // 更新阶段和等级显示
        this.view.stageLabel.text = `  阶段${stage}   等级${level}/10`;
        this.view.attr_list.itemRenderer = (index: number, item: ui.hero.item.HeroPotentialAttr) => {
            const curAttr = curAttrs ? curAttrs[index] : null;
            const nextAttr = nextAttrs ? nextAttrs[index] : null;

            // 设置默认状态
            item.getController("c1").selectedIndex = nextAttr ? 1 : 0;

            // 当前属性
            if (curAttr) {
                this.renderAttribute(item, curAttr, "T_num");
            } else if (level - 1 < 0) {
                item.T_num.text = "0"; // 当前等级为0时的处理
            }

            // 下一属性
            if (nextAttr) {
                this.renderAttribute(item, nextAttr, "T_up");
            }
        };

        // 更新属性列表
        this.view.attr_list.numItems = attrCount;
    }

    /**
     * 渲染属性
     * @param item UI组件
     * @param attr 属性对象
     * @param fieldName 渲染的字段名（T_num 或 T_up）
     */
    private renderAttribute(item: ui.hero.item.HeroPotentialAttr, attr: any, fieldName: string) {
        const cfg = TableManager.getDataById(table.battle.AttributeConfig, attr.id);
        if (cfg) {
            item[fieldName].text = cfg.isPermyriad ? `${attr.num / 100}%` : `${attr.num}`;
            item.T_name.text = cfg.attrName;
            item.attr_icon.icon = cfg.icon;
        }
    }

    /**
     * 根据阶段更改底部按钮和文本显示
     * @param stage 当前阶段
     */
    private changeBottomShow(stage: number) {
        const level = HeroManager.ins().getDNALevel(this._baseId, stage);
        const btn = this.view.sendBtn;
        const operaType = HeroManager.ins().checkCurOperation(this._baseId, stage + 1);
        let DNACfg = null;

        // 设置按钮显示
        const setBtnDisplay = (costItems, title) => {
            if (!costItems || costItems.length === 0) return;
            const costItem = costItems[0];
            const itemConfig = ItemUtils.getItemConfigByItemId(costItem.k);
            let noOwnerItem = NoOwnerItem.createByConfigKv(costItem);
            const isCanPay = BackpackManager.ins().isCanPayItem(noOwnerItem, false);

            btn.getController("canPayFlag").selectedIndex = isCanPay ? 1 : 0;
            btn.imageItem.icon = itemConfig.smallIconPath;
            btn.labelCount.text = `${costItem.v}`;
            btn.title = title;
        };

        switch (operaType) {
            case DNABtnClickType.DNA_LEVEL_UP:
                DNACfg = HeroConfigManager.getDNAConfig(stage + 1, level + 1);
                if (DNACfg) {
                    setBtnDisplay(DNACfg.costItems, "升级");
                    this.view.tipLabel.text = "阶段强化至满级可进行觉醒";
                }
                break;
            case DNABtnClickType.DNA_AWAKEN:
                DNACfg = HeroConfigManager.getAwakenConfig(this._baseId, stage + 1);
                if (DNACfg) {
                    setBtnDisplay(DNACfg.costItems, "觉醒");
                    this.view.tipLabel.text = "阶段强化至满级可进行觉醒";
                }
                break;
            case DNABtnClickType.DNA_AWAKEN_FRESH:
                DNACfg = HeroConfigManager.getAwakenConfig(this._baseId, stage + 1);
                if (DNACfg) {
                    setBtnDisplay(DNACfg.refreshCostItems, "刷新");
                }
                const awakenInfo = this._DNAInfo.awaken[stage + 1];
                const spAttr = awakenInfo?.attrs?.[0];
                // console.log("AttrEnum[spAttr.k]" + AttrEnum[spAttr.k]);
                const spAttrId = spAttr ? AttrEnum[spAttr.k] : null;
                const showAttr = spAttrId ? AttrConfigManager.getConfigById(spAttrId) : null;
                if (showAttr) {
                    const showAttrNum = showAttr.isPermyriad ? `${spAttr.v / 100}%` : `${spAttr.v}`;
                    this.view.tipLabel.text = showAttr.attrDesc + "  " + showAttrNum;
                }
                break;
            default:
                btn.title = "";
                break;
        }
    }

    protected onDisable(): void {}
}
