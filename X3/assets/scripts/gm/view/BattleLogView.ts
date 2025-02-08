import * as fgui from "fairygui-cc";
import { UIPage } from "../../core/mvc/view/UIPage";
import { GameTimer } from "../../core/timer/GameTimer";
import { BattleLogAttrHeroInfo, BattleLogAttrInfo, BattleLogEndureInfo, BattleLogHeroDamageInfo, BattleLogHeroEndureInfo, BattleLogInfo, BattleLogManager, BattleLogSkillDamageInfo, IBattleLogAttrInfo, IBattleLogInfo } from "../../game/comm/battle/BattleLogManager";
import { StringUtils } from "../../core/utils/StringUtils";
import { MathUtils } from "../../core/utils/MathUtils";
import { TimeUtils } from "../../game/comm/utils/TimeUtils";
import { UIView } from "../../core/mvc/view/UIView";
import { UIGmKeys } from "../const/UIGmKeys";
import UIScriptManager from "../../core/comm/UIScriptManager";
import { BattleLogicManager } from "../../game/comm/battle/BattleLogicManager";
import { FightType } from "../../game/comm/battle/enum/FightType";
import { BattleManager } from "../../game/comm/battle/BattleManager";
import G from "../../core/comm/G";
import BattleConstantConfig from "../../game/comm/battle/config/BattleConstantConfig";
import { WorldUnitTeam } from "../../game/comm/battle/enum/BattleEnum";
import { BuffType } from "../../game/comm/battle/skill/SkillEnum";
import GIns from "../../game/GIns";
import { AttrEnum } from "../../game/comm/battle/attribute/AttrEnum";

export class BattleAttrOneItem extends fgui.GComponent {
    static pkgName: string = "gm";
    static viewName: string = "BattleAttrOneItem";

    public info: IBattleLogAttrInfo

    private get view(): ui.gm.BattleAttrOneItem {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
    }

    // 更新渲染
    updateData(data: IBattleLogAttrInfo, logMgr: BattleLogManager) {
        this.info = data;
        if (data.showLevel == 0)
            this.view.labelTitle.text = `${data.name} uid:${data.uid}`;
        else
            this.view.labelTitle.text = `${data.name} :${data.value}`;
    }
}

export class BattleLogOneItem extends fgui.GComponent {
    // region 静态属性 for FGUI
    static pkgName: string = "gm";
    static viewName: string = "BattleLogOneItem";

    private proWidth: number
    public info: IBattleLogInfo

    private get view(): ui.gm.BattleLogOneItem {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.proWidth = this.view.img_jdt.width;
    }

    // 更新渲染
    updateData(data: IBattleLogInfo, logMgr: BattleLogManager) {
        this.info = data;
        let sec = logMgr.getTime() / 1000;
        this.view.labelTitle.text = `${data.name} ${StringUtils.numShortToKM(data.value)}(${MathUtils.toFiexd(data.value / sec, 1)}/s)`;
        if (data.totalHurt == 0) {
            this.view.img_jdt.width = this.proWidth;
        }
        else
            this.view.img_jdt.width = this.proWidth * data.value / data.firstValue;
    }
}

export class BattleLogView extends UIView {

    // region 静态属性 for FGUI
    static pkgName: string = "gm";
    static viewName: string = "BattleLogView";

    private logDatas: IBattleLogInfo[];
    private attrDatas: IBattleLogAttrInfo[];
    private nowShowLevel: number = 0;
    private clickHeroUid: string
    private clickEndureHeroUid: string
    private clickType: number
    private clickSkillId: string
    private logMgr: BattleLogManager;

    private nowAttrShowLevel: number = 0;
    private clickAttrUnitUid: number
    private clickAttrId: number

    private get view(): ui.gm.BattleLogView {
        return this._view as any;
    }

    public onInit() {
        this.logMgr = GIns.battleMgr.battleLogic.logManager
        this.view.closeBtn.onClick(this.onClickClose, this);
        this.view.leftBtn.onClick(this.onClickLeftBtn, this);
        this.view.rightBtn.onClick(this.onClickRightBtn, this)

        this.view.stopBtn.onClick(this.onClickStopBtn, this);
        this.view.logBtn.onClick(this.onClickLogBtn, this);
        this.view.attrBtn.onClick(this.onClickAttrBtn, this)

        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.listRenderer.bind(this);
        this.view.list.on(fgui.Event.CLICK_ITEM, this.onClickItem, this);

        this.view.list2.setVirtual();
        this.view.list2.itemRenderer = this.listRenderer2.bind(this);
        this.view.list2.on(fgui.Event.CLICK_ITEM, this.onClickItem2, this);
    }

    private listRenderer(index: number, view: BattleLogOneItem) {
        const itemVo = this.logDatas[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo, this.logMgr)
    }

    private listRenderer2(index: number, view: BattleAttrOneItem) {
        const itemVo = this.attrDatas[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo, this.logMgr)
    }

    private onClickStopBtn(): void {
        if (GIns.battleMgr.isPause) {
            GIns.battleMgr.resumeBattle()
            this.view.stopBtn.title = "暂停"
        }
        else {
            GIns.battleMgr.pauseBattle()
            this.view.stopBtn.title = "继续"
        }
    }

    private onClickLogBtn(): void {
        this.view.getController("c1").selectedIndex = 0;
    }

    private onClickAttrBtn(): void {
        this.view.getController("c1").selectedIndex = 1;
    }

    private onClickLeftBtn(): void {
        if (this.view.getController("c1").selectedIndex == 0) {
            if (this.nowShowLevel > 0) {
                this.nowShowLevel--
                this.updateList()
            }
        }
        else {
            if (this.nowAttrShowLevel > 0) {
                this.nowAttrShowLevel--
                this.updateList2()
            }
        }
    }

    private onClickRightBtn(): void {
        if (this.view.getController("c1").selectedIndex == 0) {
            if (this.nowShowLevel < 1 && this.clickType) {
                this.nowShowLevel++
                this.updateList()
            }
            else if (this.nowShowLevel < 2 && this.clickHeroUid) {
                this.nowShowLevel++
                this.updateList()
            }
            else if (this.nowShowLevel < 3 && (this.clickEndureHeroUid || this.clickSkillId)) {
                this.nowShowLevel++
                this.updateList()
            }
        }
        else {
            if (this.nowAttrShowLevel < 1 && this.clickAttrUnitUid) {
                this.nowAttrShowLevel++
                this.updateList2()
            }
            else if (this.nowAttrShowLevel < 2 && this.clickAttrId) {
                this.nowAttrShowLevel++
                this.updateList2()
            }
        }
    }

    private onClickClose() {
        this.closeSelf();
    }

    protected onClose() {
        GameTimer.ins().clearAll(this)
        this.logMgr.stop()
    }

    protected onOpen(args: any) {
        this.logMgr.start()
        GameTimer.ins().frameLoop(5, this, this.onTimerHandler)
        if (this.view.getController("c1").selectedIndex == 0)
            this.updateList()
        else
            this.updateList2()
    }

    private onTimerHandler(): void {
        let sec = Math.floor(this.logMgr.getTime());
        this.view.timeLab.text = TimeUtils.formatTimeMsToPositiveTimeText(sec)
        if (this.view.getController("c1").selectedIndex == 0)
            this.updateList()
        else
            this.updateList2()
    }

    private updateList(): void {
        let sec = this.logMgr.getTime() / 1000;
        if (this.nowShowLevel == 0) {
            this.logDatas = this.logMgr.getAllList()
            this.view.title.text = "ALL"
        }
        else if (this.nowShowLevel == 1) {
            this.logDatas = this.logMgr.getHeroDamageList(this.clickType)
            if (this.clickType == 1) {
                let value = this.logMgr.damageInfo.value
                this.view.title.text = `伤害 ${StringUtils.numShortToKM(value)}(${MathUtils.toFiexd(value / sec, 1)}/s)`;
            }
            else if (this.clickType == 2) {
                let value = this.logMgr.endureInfo.value
                this.view.title.text = `承伤 ${StringUtils.numShortToKM(value)}(${MathUtils.toFiexd(value / sec, 1)}/s)`;
            }
            else if (this.clickType == 3) {
                let value = this.logMgr.healInfo.value
                this.view.title.text = `治疗 ${StringUtils.numShortToKM(value)}(${MathUtils.toFiexd(value / sec, 1)}/s)`;
            }
        }
        else if (this.nowShowLevel == 2) {
            this.logDatas = this.logMgr.getSkillDamageList(this.clickHeroUid, this.clickType)
            let info = this.logMgr.getHeroDamage(this.clickHeroUid, this.clickType)
            if (info)
                this.view.title.text = `${info.name} ${StringUtils.numShortToKM(info.value)}(${MathUtils.toFiexd(info.value / sec, 1)}/s)`;
        }
        else if (this.nowShowLevel == 3) {
            // this.datas = BattleLogManager.ins().getSkillDamageList(this.clickHeroUid, this.clickType)
            let info = this.logMgr.getHeroDamage(this.clickHeroUid, this.clickType)
            if (info instanceof BattleLogHeroEndureInfo) {
                let subInfo = info.formUnitMap[this.clickEndureHeroUid]
                if (subInfo) {
                    this.logDatas = subInfo.datas
                    this.view.title.text = `${subInfo.name} ${StringUtils.numShortToKM(subInfo.value)}(${MathUtils.toFiexd(subInfo.value / sec, 1)}/s)`;
                }
                else {
                    this.logDatas = [];
                    this.view.title.text = ""
                }
            }
            else {
                this.logDatas = this.logMgr.getHeroSkillDamage(this.clickHeroUid, this.clickSkillId)
            }
        }

        let firstValue = 0;
        for (let i = 0; i < this.logDatas.length; i++) {
            if (i == 0)
                firstValue = this.logDatas[i].value;
            this.logDatas[i].firstValue = firstValue;
        }

        this.view.list.numItems = this.logDatas.length;
    }

    private updateList2(): void {
        if (this.nowAttrShowLevel == 0) {
            //第1级是英雄
            this.attrDatas = this.getAllUnits()
            this.view.title.text = "所有单位"
        }
        else if (this.nowAttrShowLevel == 1) {
            //英雄属性
            let unit = this.logMgr.battleLogic.getBatteUintByUid(this.clickAttrUnitUid)
            if (unit)
                this.view.title.text = unit.attr.name;
            else
                this.view.title.text = ""
            this.attrDatas = this.getAttrByUnitUid(this.clickAttrUnitUid)
        }
        else if (this.nowAttrShowLevel == 2) {
            //属性的BUFF
            let unit = this.logMgr.battleLogic.getBatteUintByUid(this.clickAttrUnitUid)
            if (unit) {
                this.view.title.text = BattleConstantConfig.getAttrCfgById(this.clickAttrId).id
                let arr: IBattleLogAttrInfo[] = [];
                for (let i = 0; i < unit.attr.buffs.length; i++) {
                    if (unit.attr.buffs[i].effectType == BuffType.Attr || unit.attr.buffs[i].effectType == BuffType.ResistAttr
                        || unit.attr.buffs[i].effectType == BuffType.ChangeAttr || unit.attr.buffs[i].effectType == BuffType.AttrToAttr
                        || unit.attr.buffs[i].effectType == BuffType.AttrValue) {
                        let value = unit.attr.buffs[i].effectParm1[BattleConstantConfig.getAttrCfgById(this.clickAttrId).id]
                        if (value) {
                            let attrInfo = new BattleLogAttrInfo()
                            // attrInfo.uid = unit.attr.buffs[i].id;
                            attrInfo.name = unit.attr.buffs[i].cfg.name + " x" + unit.attr.buffs[i].layer
                            attrInfo.value = value;
                            arr.push(attrInfo)
                        }
                    }
                }
                this.attrDatas = arr;
            }
            else
                this.view.title.text = ""
        }
        this.view.list2.numItems = this.attrDatas.length;
    }

    private getAllUnits(): IBattleLogAttrInfo[] {
        let arr: IBattleLogAttrInfo[] = [];
        let heros = this.logMgr.battleLogic.unitProcessor.allUnits;
        for (let i = 0; i < heros.length; i++) {
            if (heros[i].isActive) {
                let heroInfo = new BattleLogAttrHeroInfo()
                heroInfo.name = (heros[i].teamId == WorldUnitTeam.Enemy ? "敌:" : "我:") + heros[i].attr.name;
                heroInfo.uid = heros[i].uid;
                arr.push(heroInfo)
            }
        }

        return arr;
    }

    private getAttrByUnitUid(uid: number): IBattleLogAttrInfo[] {
        let unit = this.logMgr.battleLogic.getBatteUintByUid(uid)
        let arr: IBattleLogAttrInfo[] = [];
        if (unit) {
            for (let attrKey in AttrEnum) {
                let key = +attrKey
                let attrInfo = new BattleLogAttrInfo()
                attrInfo.uid = key;
                let attrCfg = BattleConstantConfig.getAttrCfgById(key)
                if (attrCfg) {
                    attrInfo.name = attrCfg.attrName
                    attrInfo.value = unit.getAttrValue(key);
                    if (attrInfo.value)
                        arr.push(attrInfo)
                }
            }
        }
        return arr
    }

    private onClickItem(item: BattleLogOneItem): void {
        if (item.info) {
            if (item.info.showLevel < 2) {
                this.nowShowLevel = item.info.showLevel + 1;
                if (item.info instanceof BattleLogHeroDamageInfo) {
                    this.clickHeroUid = item.info.uid;
                }
                else if (item.info instanceof BattleLogHeroEndureInfo) {
                    this.clickHeroUid = item.info.uid;
                }
                else if (item.info instanceof BattleLogInfo) {
                    this.clickType = item.info.type;
                }
            }
            if (item.info.showLevel < 3 && item.info instanceof BattleLogEndureInfo) {
                this.nowShowLevel = item.info.showLevel + 1;
                this.clickEndureHeroUid = item.info.uid;
            }
            if (item.info.showLevel < 3 && item.info instanceof BattleLogSkillDamageInfo) {
                this.nowShowLevel = item.info.showLevel + 1;
                this.clickSkillId = (item.info as BattleLogSkillDamageInfo).skillId;
            }
            this.updateList();
        }
    }

    private onClickItem2(item: BattleAttrOneItem): void {
        if (item.info) {
            if (item.info.showLevel == 0) {
                this.nowAttrShowLevel = item.info.showLevel + 1;
                this.clickAttrUnitUid = item.info.uid;
            }
            else if (item.info.showLevel == 1) {
                this.nowAttrShowLevel = item.info.showLevel + 1;
                this.clickAttrId = item.info.uid;
            }
            this.updateList2();
        }
    }
}

UIScriptManager.bindScript(UIGmKeys.BattleLogView, BattleLogView);