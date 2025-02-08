import { Color, Tween, tween } from "cc";
import * as fgui from "fairygui-cc";
import { HeroVo } from "../HeroVo";
import { HeroManager } from "../HeroManager";
import { AttrType } from "../../attr/AttrEnum";
import { FormationManager } from "../../formation/FormationManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PositionVo } from "../../formation/vo/PositionVo";
import { HeroModel } from "../model/HeroModule";
import { TableManager } from "../../../../core/table/TableManager";
import { ItemModel } from "../../item/model/ItemModel";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIHeroKey } from "../const/UIHeroConfig";
import { AttrManager } from "../../attr/AttrManager";
import { FloatingTextParameters } from "../../../../gm/floatingText/FloatingTextComponent";
import { Vec2 } from "cc";
import { v2 } from "cc";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { HeroSkillItem } from "../item/HeroSkillItem";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { BackpackManager } from "../../backpack/BackpackManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import GIns from "../../../GIns";
import { CdUtils } from "../../../comm/utils/CdUtils";

/** 英雄升级页 */
export class HeroUpLevelPage extends fgui.GComponent {
    static pkgName: string = "hero";
    static viewName: string = "HeroUpLevelPage";

    private _upLevelTween;

    private _stage: number;
    private _heroId: number;
    //英雄Vo
    private _heroVo: HeroVo;

    /** 最大相差等级 */
    private _maxLevel: string;

    /** 下一级的等级表 */
    private _nextLevelCfg: table.hero.HeroLevelConfig;
    /** 下一阶的等阶表 */
    private _nextStageCfg: table.hero.HeroStageConfig;

    /** 槽位Vo */
    private _posVo: PositionVo;

    /** 当前状态 */
    private _state: number = 0;

    //记录属性
    private _atk: number;
    private _hp: number;
    private _def: number;

    private get view(): ui.hero.page.HeroUpLevelPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        let self = this.view;
        self.btn_tips.on(fgui.Event.CLICK, this.onBtnClick, this);
        // self.btn_upLevel.on(fgui.Event.TOUCH_BEGIN, this.onUpLevel, this);
        self.btn_upLevel.on(fgui.Event.TOUCH_BEGIN, this.onBeginUpLevel, this);
        self.btn_upLevel.on(fgui.Event.TOUCH_END, this.onEndUpLevel, this);

        self.btn_upStage.on(fgui.Event.CLICK, this.onUpStage, this);

        self.list_skill.itemRenderer = this.skillItem.bind(this);
        this._maxLevel = HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content;
    }

    /**
     * 更新信息
     * @param baseId 英雄id
     * @param showDanmuTextForce 是否强制显示属性变化
     */
    public updateInfo(baseId: number, showDanmuTextForce: boolean = false) {
        if (!baseId) return;
        //防止切换英雄时弹出属性飘字
        if (!this._heroId || this._heroId != baseId) {
            this._heroId = baseId;
            this._atk = null;
            this._def = null;
            this._hp = null;
        }
        this.view.getController("c1").selectedIndex = 0;
        this._heroVo = HeroManager.ins().getHeroVoByID(baseId);
        this.updateUI(showDanmuTextForce);

        // [红点]
        FguiScriptUtils.toMyScriptClass(this.view.btn_upLevel.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_train, [this._heroVo.heroCfg.id]);
        FguiScriptUtils.toMyScriptClass(this.view.btn_upStage.redDot1, RedDotCom).reset(RedDotKeys.Hero_item_train, [this._heroVo.heroCfg.id]);
    }

    private updateUI(showDanmuTextForce: boolean = false) {
        let self = this.view;

        //阵营&&职业
        self.T_zy.text = ItemUtils.getCareerName(ServerEnums.Career[this._heroVo.heroCfg.career]);
        self.img_zy.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);

        let level = FormationManager.ins().getCommonLevel();
        let stage = FormationManager.ins().getCommonStage();
        // self.T_level.text = "Lv." + FormationManager.ins().getCommonLevel();

        //技能list
        // if(this._heroVo.skillList.length)
        let scale = this._heroVo.skillList.length > 4 ? 0.9 : 1;
        self.list_skill.setScale(scale, scale);
        self.list_skill.numItems = this._heroVo.skillList.length;

        //tips提示
        self.text = "上阵英雄等级差不可超过" + HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content + "级";

        //状态
        if (!this._heroVo.posId) {
            this._state = 3;
        } else {
            this._posVo = FormationManager.ins().getPosVoById(this._heroVo.posId);
            level = this._posVo.level;
            stage = this._posVo.stage;
            this._nextLevelCfg = TableManager.getDataById(table.hero.HeroLevelConfig, this._posVo.level + 1);
            this._nextStageCfg = TableManager.getDataById(table.hero.HeroStageConfig, this._posVo.stage + 1);
            if (this._posVo.level >= FormationManager.ins().getCommonLevel() + Number(this._maxLevel)) {
                //达到最大等级差
                this._state = 2;
            } else if (!this._nextLevelCfg) {
                //满级
                this._state = 4;
            } else if (this._nextLevelCfg.stageCondition > this._posVo.stage) {
                //需要进阶
                this._state = 1;
                self.btn_upStage.getController("c1").selectedIndex = 1;
                let items = this._nextStageCfg.costItems[0];
                let itemId = Number(Object.keys(items)[0]);
                let itemNum = items[itemId];
                let item = ItemModel.ins().getItemById(itemId);
                self.btn_upStage.T_num.text = itemNum + "";
                if (item && item.count >= itemNum) {
                    self.btn_upStage.T_num.color = new Color("#FFFFFF");
                } else {
                    self.btn_upStage.T_num.color = new Color("#FF3300");
                }
                self.btn_upStage.item_icon.icon = ItemUtils.getItemConfigByItemId(itemId).smallIconPath;

                let nextLevelItems = this._nextLevelCfg.costItems[0];
                let itemId2 = Number(Object.keys(nextLevelItems)[0]);
                let itemNum2 = nextLevelItems[itemId2];
                let item2 = ItemModel.ins().getItemById(itemId2);
                self.btn_upStage.T_num2.text = itemNum2 + "";
                if (item2 && item2.count >= itemNum2) {
                    self.btn_upStage.T_num2.color = new Color("#FFFFFF");
                } else {
                    self.btn_upStage.T_num2.color = new Color("#FF3300");
                }
                self.btn_upStage.item_icon2.icon = ItemUtils.getItemConfigByItemId(itemId2).smallIconPath;
            } else {
                //升级
                this._state = 0;
                let items = this._nextLevelCfg.costItems[0];
                let itemId = Number(Object.keys(items)[0]);
                let itemNum = items[itemId];
                let item = ItemModel.ins().getItemById(itemId);
                self.btn_upLevel.T_num.text = itemNum + "";
                if (item && item.count >= itemNum) {
                    self.btn_upLevel.T_num.color = new Color("#FFFFFF");
                } else {
                    self.btn_upLevel.T_num.color = new Color("#FF3300");
                }
                self.btn_upLevel.item_icon.icon = ItemUtils.getItemConfigByItemId(itemId).smallIconPath;
            }
        }
        self.getController("c1").selectedIndex = this._state;
        if (this._state != 0) {
            this.onEndUpLevel();
        }

        //等级
        self.T_level.text = "Lv." + level;
        //防止升阶时弹出属性飘字
        if (this._stage != stage && showDanmuTextForce == false) {
            this._atk = null;
            this._def = null;
            this._hp = null;
        }
        this._stage = stage;
        //当前属性
        let atk = AttrManager.ins().getPanelAttrByHeroId(this._heroVo.baseId, AttrType.Attack);
        let hp = AttrManager.ins().getPanelAttrByHeroId(this._heroVo.baseId, AttrType.Blood);
        let def = AttrManager.ins().getPanelAttrByHeroId(this._heroVo.baseId, AttrType.Defense);
        if (!this._atk) {
            this._atk = atk;
        } else if (this._atk !== atk) {
            this.danmuText("攻击", atk - this._atk, 0);
            this._atk = atk;
        }
        if (!this._hp) {
            this._hp = hp;
        } else if (this._hp !== hp) {
            this.danmuText("血量", hp - this._hp, 100);
            this._hp = hp;
        }
        if (!this._def) {
            this._def = def;
        } else if (this._def !== def) {
            this.danmuText("防御", def - this._def, 200);
            this._def = def;
        }
        self.T_attack.text = "" + atk;
        self.T_blood.text = "" + hp;
        self.T_defense.text = "" + def;
    }

    //技能item
    private skillItem(index: number, item: HeroSkillItem) {
        let skillData = this._heroVo.skillList[index];

        item.updateInfo(skillData.data, this._heroVo.baseId);
    }

    /**外部调用赋值heroVo 防止预览界面各种逻辑错误*/
    public updateHeroVoById(baseId: number): void {
        this._heroVo = HeroManager.ins().getHeroVoByID(baseId);
    }

    private onBtnClick(evt: any) {
        // let btn = evt.currentTarget;
        // switch (btn.name) {
        //     case "btn_up":
        //         console.log("进阶");
        //         break;
        //     case "btn_tips":
        //         console.log("提示");
        //         break;
        // }
        if (this._heroVo?.baseId) {
            G.UIManager.open(UIHeroKey.HeroAttrPreviewWin, this._heroVo.baseId);
        }
    }

    //长按
    private onBeginUpLevel() {
        this.onUpLevel();
        let embedTween = tween(this.view.btn_upLevel).to(0.15, { scaleX: 0.8, scaleY: 0.8 }).to(0.15, { scaleX: 1, scaleY: 1 }).call(this.onUpLevel.bind(this));

        if (!this._upLevelTween) {
            this._upLevelTween = tween(this.view.btn_upLevel).repeat(20, embedTween);
        }
        this._upLevelTween.start();
    }

    private onEndUpLevel() {
        if (this._upLevelTween) this._upLevelTween.stop();
        this.view.btn_upLevel.setScale(1, 1);
    }

    //升级
    @CdUtils.ExecuteInCDTimeMs(250)
    private onUpLevel() {
        if (!this._posVo) return;
        //判断相差等级
        if (this._posVo.level >= FormationManager.ins().getCommonLevel() + Number(this._maxLevel)) return;
        //判断升级条件   材料和等阶
        let items = this._nextLevelCfg.costItems;
        if (this._state == 0 && this.isEnough(items)) {
            //升级
            HeroModel.ins().sendUpLevel(this._posVo.BaseId);
        } else if (this._state == 0) {
            //道具不足
            GIns.floatingTextMgr.showTips(`道具不足`);
        } else {
            this.onEndUpLevel();
        }
    }

    //升阶
    private onUpStage() {
        if (!this._posVo) return;
        if (!this._nextStageCfg) return;
        if (this._state == 1 && this.isEnough(this._nextStageCfg.costItems) && this.isEnough(this._nextLevelCfg.costItems)) {
            UIManager.ins().open(UIHeroKey.HERO_UP_STAGE_WIN, [this._posVo]);
        } else if (this._state == 1) {
            //道具不足
            GIns.floatingTextMgr.showTips(`道具不足`);
        }
    }

    /** 判断道具数组是否全部满足条件 */
    private isEnough(items: Array<number>) {
        for (let k = 0; k < items.length; k++) {
            let arr = items[k];
            let itemId = Object.keys(arr)[0];
            if (!BackpackManager.ins().isCanPayTheseItemArrayByConfig([{ k: itemId, v: arr[itemId] }], true)) return false;
            // let item = ItemModel.ins().getItemById(Number(itemId));
            // if (!item || item.count < arr[itemId]) {
            //     return false;
            // }
        }
        return true;
    }

    private danmuText(attrDes: string, changeValue: number, time: number) {
        // const params: FloatingTextParameters = {
        //     fontSize: 20,
        //     color: Color.GREEN,
        //     time: 1,
        //     xyShift: v2(0, -386),
        // };
        let str: string = attrDes;
        if (changeValue > 0) {
            str += "+";
        }
        str += changeValue.toString();
        if (time > 0) {
            G.GameTimer.once(time, this, () => {
                GIns.floatingTextMgr.showAttrItem(str);
            });
        } else {
            GIns.floatingTextMgr.showAttrItem(str);
        }
        // G.FacadeManager.emit(NotificationKey.EVENT_SET_FLOATING_TEXT, [str, params])
    }
}
