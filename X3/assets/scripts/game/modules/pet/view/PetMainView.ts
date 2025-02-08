import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrData } from "../../attr/AttrManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItemList1 } from "../../common/btn/BtnChangGui1WithItemList1";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { PetCellV } from "../com/PetCellV";
import { PetMainAttrItem } from "../com/PetMainAttrItem";
import { PetSkillItem } from "../com/PetSkillItem";
import { UIPetKey } from "../const/UIPetConfig";
import { UIPetGroupKey } from "../../petGroup/const/UIPetGroupConfig";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { EnumQuality } from "../../common/quality/enums/EnumQuality";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";

/** 宠物主界面 */
@bindScript(UIPetKey.PET_MAIN_VIEW)
export class PetMainView extends UIPage {
    static pkgName: string = "pet";
    static viewName: string = "PetMainView";

    //当前选中的宠物
    private _curChosePetIdx = 0;
    private _curChosePetStar = 0;

    //升星/解锁需要的消耗
    private _costItem: NoOwnerItem;

    private _petListData: table.pet.PetConfig[];

    private _petAttrs: AttrConfigEffect[] = [];

    private get view(): ui.pet.view.PetMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.PET_ACTIVER, NotificationKey.PET_UP_STAR, NotificationKey.PET_UP_SHARE_LV, NotificationKey.PET_UP_STAGE_LV, NotificationKey.EVENT_CHANGE_ITEMS];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_ACTIVER:
            case NotificationKey.PET_UP_STAR:
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.updatePetInfo();
                this.view.petList.refreshVirtualList();
                break;
            case NotificationKey.PET_UP_SHARE_LV:
                this.updatePetLV();
                this.updatePetAttr();
                break;
            case NotificationKey.PET_UP_STAGE_LV:
                this.updatePetAttr();
                break;
        }
    }

    /**
     * 子类继承并实现
     * 绑定，注册，静态数据获取
     * @override
     * */
    protected onInit() {
        let view = this.view;
        let { petList } = view;
        view.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);
        view.LVUpBtn.on(fgui.Event.CLICK, this.onLVUpBtn, this);
        view.helpBtn.on(fgui.Event.CLICK, this.onHelperBtn, this);
        view.petGroupBtn.on(fgui.Event.CLICK, this.onPetGroupBtn, this);
        view.previewStarAddBtn.on(fgui.Event.CLICK, this.onPreviewStarAdd, this);
        view.previewSkillBtn.on(fgui.Event.CLICK, this.onPreviewSkillBtn, this);

        /** 星灵招募页面 */
        view.drawCardBtn.on(fgui.Event.CLICK,this.onPetDrawCard, this);
        let hubEnter = view.drawCardBtn.redDot as any as RedDotCom;
        hubEnter.reset(RedDotKeys.Pet_Hub_Enter);

        let red = view.LVUpBtn.red as any as RedDotCom;
        red.reset(RedDotKeys.Pet_upLVStage);

        let redGroup = view.petGroupBtn.redDot as any as RedDotCom;
        redGroup.reset(RedDotKeys.Pet_group_active_up);

        let upStarBtn = view.upStarBtn as any as BtnChangGui1WithItemList1;
        upStarBtn.setStyle(0);
        upStarBtn.setCostStyle(1);
        upStarBtn.on(fgui.Event.CLICK, this.onUpStarBtn, this);

        petList.itemRenderer = this.petListRenderer.bind(this);
        petList.setVirtual();
        petList.selectionMode = fgui.ListSelectionMode.Single;
        petList.on(fgui.Event.CLICK_ITEM, this._onChickPet, this);

        view.star.itemRenderer = this.starItem.bind(this);

        this._costItem = NoOwnerItem.create(0, 0);

        this.view.listAttr.itemRenderer = this.itemRendererForAttr.bind(this);
    }

    /**
     * 子类继承并实现
     * 动态数据获取，界面逻辑
     * @override
     * @param {any} args 打开界面的参数
     * @param {boolean} isReopen 重新打开的界面（从后台恢复）
     * */
    protected onOpen(args: any, isReopen?: boolean) {
        let view = this.view;

        this._petListData = GIns.petCfgMgr.getSortedPetCfgList();

        //隐藏未获得的红色及其以上品质的星灵
        let petCfgMgr = GIns.petCfgMgr;
        this._petListData = this._petListData.filter(v=>{
            return petCfgMgr.isCanShow(v.id);
        })

        view.petList.numItems = this._petListData.length;


        view.petGroupBtn.visible = GIns.moduleOpenMgr.isCanOpenModule(ServerEnums.SystemType.PET_GROUP, false) 

        // view.petList.addSelection(0)

        this.setChosePetIdx(0);
    }

    //设置选择宠物初始值并且刷新界面
    private setChosePetIdx(idx: number) {
        this._curChosePetIdx = idx;

        let petCfg = this._petListData[this._curChosePetIdx];
        let petContext = GIns.petModel.petContext;
        let curShowPetVo = petContext.getDataByCfgId(petCfg.id);
        let redDot = this.view.upStarBtn.redDot as any as RedDotCom;


        if (curShowPetVo.active) {
            redDot.reset(RedDotKeys.Pet_UpStar, [petCfg.id]);
        } else {
            redDot.reset(RedDotKeys.Pet_active, [petCfg.id]);
        }

        this.updatePetInfo();
    }
    //刷新当前选中的星灵的信息
    private updatePetInfo() {
        let view = this.view,
            petCfgMgr = GIns.petCfgMgr;
        let petCfg = this._petListData[this._curChosePetIdx];
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfg.id);
        // let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petVo.petBaseId)

        let model = view.modelNode as any as ModelNode;
        model.loadByModelId(petCfg.showModelId);

        this.updatePetLV();
        this.updatePetAttr();
        this.updatePetSkill();

        QualityUtils.setFGUIFontColorByQuality(view.txPetName, petCfg.quality);
        view.txPetName.text = petCfg.name;
        this._curChosePetStar = petVo.star;
        view.star.numItems = HeroUtils.getShowStarCount(this._curChosePetStar);

        let upStarBtn = view.upStarBtn as any as BtnChangGui1WithItemList1;
        let maxStar = 1;
        if (petCfgMgr.isMaxStar(petCfg.id)) {
            maxStar = 2;
        } else {
            if (petVo.active) {
                //升星
                let needFragementnum = petCfgMgr.getUpStarNeedFragmentNum(petCfg.id);
                this._costItem.count = needFragementnum;
                upStarBtn.title = "升星";
            } else {
                //解锁
                this._costItem.count = petCfg.activeCostFragment;
                upStarBtn.title = "解锁";
            }
            this._costItem.itemId = petCfg.fragmentItemId;
            this._costItem.itemId = petCfg.fragmentItemId;
            upStarBtn.reset(this._costItem);
        }

        //名字跟彩色底
        let qualityCfg = G.TableManager.getDataById(table.quality.QualityConfig, petCfg.quality)
        view.getController("nameBottom").selectedIndex = qualityCfg?.petNameBottom || 6;

        view.getController("maxStar").selectedIndex = maxStar;
        view.getController("active").selectedIndex = petVo.active ? 1 : 0;
    }

    private updatePetLV() {
        this.view.LVUpBtn.text = `lv.${GIns.petModel.petContext.shareLevel}`;
    }

    protected updatePetAttr(): void {
        let petCfg = this._petListData[this._curChosePetIdx];
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfg.id);
        let attrKV = GIns.petCfgMgr.getStarAttrKV(petVo.petBaseId, petVo.star);
        this._petAttrs = AttrUtils.parseKvArrayToAttrArray(attrKV);
        this._petAttrs.sort((a, b) => {
            return a.config.tid - b.config.tid;
        });
        this.view.listAttr.numItems = this._petAttrs.length;
    }

    protected updatePetSkill() {
        let view = this.view,
            petCfgMgr = GIns.petCfgMgr;
        let petCfg = this._petListData[this._curChosePetIdx];
        let skillData = petCfgMgr.getPetPureSkillDatasByParams(petCfg.id);
        let skill = view.skill as any as PetSkillItem;
        skill.updateInfo(skillData, petCfg.id);
        view.petSkillDesc.text = StringUtils.repleaceDescToAtkImage(skillData.cfg.desc);

        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfg.id);
        if (petVo.active) {
            view.petSkillName.text = skillData.cfg.name + ` LV${skillData.level}`;
        } else {
            view.petSkillName.text = skillData.cfg.name;
        }
    }

    protected itemRendererForAttr(index: number, item: PetMainAttrItem): void {
        let petCfg = this._petListData[this._curChosePetIdx];
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfg.id);
        item.updateInfo(this._petAttrs[index], petVo.active ? 1 : 0);
    }

    //星灵升级
    private onLVUpBtn() {
        G.UIManager.open(UIPetKey.PET_UP_LV_VIEW);
    }

    private onPetDrawCard() {
        G.UIManager.open(UIPetKey.PET_DRAW_CARD_VIEW);
    }

    private onHelperBtn() {
        RuleController.ins().openRule(EnumRuleKeys.PET_UP_STAR, this.view.helpBtn);
    }

    private onPetGroupBtn() {
        G.UIManager.open(UIPetGroupKey.PET_GROUP_VIEW);
    }

    //星灵激活/升星
    private onUpStarBtn() {
        let petContext = GIns.petModel.petContext;
        let petCfg = this._petListData[this._curChosePetIdx];
        let petVo = petContext.getDataByCfgId(petCfg.id);
        if (petVo.active) {
            let needFragementnum = GIns.petCfgMgr.getUpStarNeedFragmentNum(petCfg.id);
            this._costItem.count = needFragementnum;
        } else {
            this._costItem.count = petCfg.activeCostFragment;
        }

        if (GIns.backpackMgr.isCanPayItem(this._costItem, true)) {
            if (petVo.active) {
                GIns.petModel.sendUpStar(petCfg.id);
            } else if (this._costItem.getItemType() == ServerEnums.ItemType.PET_FRAGMENT) {
                GIns.petModel.sendActivePet(petCfg.id);
            }
        }
    }

    private onPreviewStarAdd() {
        let petCfg = this._petListData[this._curChosePetIdx];
        G.UIManager.open(UIPetKey.PET_STAR_ADD_INFO_VIEW, petCfg.id)
    }

    private onPreviewSkillBtn() {
        let skill = this.view.skill as any as PetSkillItem;
        skill.previewSkill();
    }

    //星灵列表
    private petListRenderer(index: number, item: PetCellV) {
        let data = this._petListData[index];
        item.index = index;
        item.setData(data);
        item.choose = this._curChosePetIdx == index;
    }

    private _onChickPet(item: PetCellV) {
        if (this._curChosePetIdx == item.index) {
            return;
        }

        this.setChosePetIdx(item.index);
        this.view.petList._children.forEach((c: PetCellV) => {
            c.choose = this._curChosePetIdx == c.index;
        });
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._curChosePetStar);
    }
}
