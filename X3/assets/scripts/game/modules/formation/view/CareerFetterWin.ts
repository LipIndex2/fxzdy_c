import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { UICaptainSkillKeys } from "../../captainSkill/UICaptainSkillKeys";
import { CaptainSkillUtils } from "../../captainSkill/utils/CaptainSkillUtils";
import { HeroItem } from "../../common/item/HeroItem";
import { GroupType } from "../../hero/HeroEnum";
import { HeroManager } from "../../hero/HeroManager";
import { HeroVo } from "../../hero/HeroVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIFormationKey } from "../const/UIFormationConfig";
import { FormationVo } from "../vo/FormationVo";
import { IFromationFetterCntCfgs } from "../vo/IFormationFetterVo";

/**
 * 职业羁绊
 */
@bindScript(UIFormationKey.CAREER_FETTER_WIN)
export class CareerFetterWin extends UIWin {
    static pkgName: string = "formation";
    static viewName: string = "CareerFetterWin";

    //当前选择item
    private _careerSelItem;
    //当前选中的职业
    private _careerType = ServerEnums.Career.MAGE;
    //当前职业的所有羁绊
    private _allCfg: IFromationFetterCntCfgs[] = [];

    private _heroVos: HeroVo[] = [];

    private _fightType: ServerEnums.FightType;

    private _tempFormationVo: FormationVo;

    protected _curTriggerCnt:number = 0;

    private get view(): ui.formation.view.CareerFetterWin {
        return this._view as any;
    }

    protected onInit(): void {
        let self = this.view;
        self.list_tab.itemRenderer = this.tabItemSel.bind(this);
        self.list_tips.itemRenderer = this.tipsItem.bind(this);
        self.list_hero.itemRenderer = this.heroItem.bind(this);
        self.bg.on(fgui.Event.CLICK, this.closeSelf, this);
        
        this.view.btnGoto.onClick(this.onClickGoto, this);
    }

    public onOpen(args: { type: ServerEnums.FightType, HeroCareerType: ServerEnums.Career, formationVo: FormationVo }): void {
        this._fightType = args?.type || ServerEnums.FightType.TRUNK_MAP;
        this._tempFormationVo = args.formationVo;
        if (args.HeroCareerType) {
            this._careerType = args.HeroCareerType;
            this.view.list_tab.selectedIndex = args.HeroCareerType - 1;
        }
        this.updateUI();
        this.view.list_tab.numItems = 6;
    }

    protected onClickGoto(): void {
        let isCanOpen = GIns.moduleOpenMgr.isCanOpenModule(ServerEnums.SystemType.CAPTAIN);
        if (isCanOpen) {
            G.UIManager.open(UICaptainSkillKeys.CaptionSkillLvUpView);
            this.closeSelf();
        }
    }

    private updateUI() {
        let self = this.view;

        //当前职业的所有羁绊
        let typeVo = GIns.formationCfgMgr.getPassiveFetterTypeVo(GroupType.CAREER, this._careerType);
        let maxTriggerCnt = GIns.captainSkillMgr.getMaxFetterCntFroCareer(this._careerType)
        self.img_icon.icon = ItemUtils.getCareerIcon(this._careerType);

        let fettter = this._tempFormationVo.getCareerCount(this._careerType)[0].num;
        let nextFetter = Math.min(fettter + 1, maxTriggerCnt);
        this._curTriggerCnt = fettter;
        self.T_allNum.text = fettter + "/" + nextFetter;

        let allCfg = typeVo ? Array.from(typeVo.cntCfgsMap.values()) : [];
        this._allCfg.length = 0;
        allCfg?.forEach((cfg) => {
            if (cfg.allCfgs.length > 0 && GIns.captainSkillMgr.isHaveUnlockFetter(cfg.allCfgs[0].id)) {
                //第一个激活了 就代表已激活
                this._allCfg.push(cfg);
            }
        })
        self.list_tips.numItems = this._allCfg.length;
        this._heroVos = HeroManager.ins().getHeroVoArrByCampType(null, this._careerType);
        self.list_hero.numItems = this._heroVos.length;
    }


    private tabItemSel(index: number, item: ui.formation.btn.SelectBtn) {
        let career = index + 1;
        let fettter = this._tempFormationVo.getCareerCount(career)[0].num;
        if (GIns.captainSkillMgr.isHaveUnlockAnyFetterForCareer(career, fettter) == false) {
            //没有激活
            item.getController('state').selectedIndex = 1;
        } else {
            item.getController('state').selectedIndex = 0;
        }
        item.clearClick();
        item.onClick(() => {
            if (item.getController('state').selectedIndex == 1) {
                //未激活
                GIns.floatingTextMgr.showTips('未解锁当前职业羁绊');
                this.view.list_tab.selectedIndex = this._careerType - 1;
                return;
            }
            if (!this._careerSelItem) {
                this._careerSelItem = item;
            } else {
                if (this._careerSelItem != item) {
                    this._careerSelItem = item;
                } else {
                    return;
                }
            }
            this.view.list_tab.selectedIndex = index;
            this._careerType = index + 1;
            this.updateUI();
        }, this);
    }

    private tipsItem(index: number, item: ui.formation.item.CareerItem) {
        let cfgs = this._allCfg[index];
        item.T_num.text = cfgs.triggetCnt + "";
        if (cfgs.passiveCfgs.length <= 0 && cfgs.captainSkillCfgs.length <= 0) {
            //没有被动
            item.T_tips.text = ''
            return;
        }
        let num = this._tempFormationVo.getCareerCount(this._careerType)[0].num;
        let unlockCfgs: table.formation.FormationGroupConfig[] = [];
        let firstCfg = cfgs.allCfgs[0];
        let nextUnlockCfg = null;
        cfgs.allCfgs.forEach((cfg) => {
            if (cfg.triggerCount <= num && GIns.captainSkillMgr.isHaveUnlockFetter(cfg.id)) {
                unlockCfgs.push(cfg);
            } else if (nextUnlockCfg == null) {
                nextUnlockCfg = cfg;
            }
        })
        let endTip: string = ''
        if (unlockCfgs.length > 0) {
            //可激活
            item.getController("c1").selectedIndex = num >= cfgs.triggetCnt ? 1 : 0;
            if (nextUnlockCfg) {
                //还可继续强化
                let fetterData = CaptainSkillUtils.getFetterData(nextUnlockCfg.id);
                if (fetterData) {
                    let captainCfg = G.TableManager.getDataById(table.captain.CaptainConfig, fetterData.captainId);
                    if (captainCfg) {
                        endTip = `(${G.I18nManager.lang(captainCfg.name)}${fetterData.captainLv}级后强化)`
                    }
                }

            }
        } else {
            //没激活默认显示第一个
            unlockCfgs = [firstCfg];
            item.getController("c1").selectedIndex = 0;
            let fetterData = CaptainSkillUtils.getFetterData(firstCfg.id);
            if (fetterData) {
                let captainCfg = G.TableManager.getDataById(table.captain.CaptainConfig, fetterData.captainId);
                if (captainCfg) {
                    endTip = `(${G.I18nManager.lang(captainCfg.name)}${fetterData.captainLv}级后解锁)`
                }
            }
        }
        if (item.getController('c1').selectedIndex == 1) {
            //激活状态需要赋值颜色
            endTip = '<color=#ffffff>' + endTip + '</color>';
        }
        let arr = [];
        unlockCfgs?.forEach((cfg) => {
            if (cfg.passiveId > 0) {
                let skillCfg = TableManager.getDataById(table.battle.SkillConfig, cfg.passiveId);
                if (skillCfg) {
                    arr.push(skillCfg.desc);
                }
            } else if (cfg.captainSkillId > 0) {
                let skillCfg = TableManager.getDataById(table.captain.CaptainSkillConfig, cfg.captainSkillId);
                if (skillCfg) {
                    arr.push(G.I18nManager.lang(skillCfg.desc));
                }
            }

        })
        //羁绊4才展示解锁提示
        if (this._curTriggerCnt >= 4 && endTip) {
            arr.push(endTip);
        }
        let desc: string = arr.join('<br/>')

        item.T_tips.text = desc;
        item.height = item.T_tips.y + item.T_tips.height;
    }

    private heroItem(index: number, item: HeroItem) {
        item.setHeroVo(this._heroVos[index]);

        item.isShowSmallGou(this._heroVos[index].posId ? true : false);
        item.isShowName(false);
        item.isShowStar(false);
        item.isShowLevel(false);
    }
}