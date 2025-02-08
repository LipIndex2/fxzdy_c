import * as fgui from "fairygui-cc"
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import G from "../../../../core/comm/G";
import { PetGroupShowPet } from "./PetGroupShowPet";
import GIns from "../../../GIns";
import { AttrUtils } from "../../attr/utils/AttrUtils";
import { UIPetGroupKey } from "../const/UIPetGroupConfig";
import { math } from "cc";
import { Color } from "cc";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";

enum EBtn {
    /** 不显示按钮 */
    noShow = 0,
    /** 显示激活按钮 */
    showActive = 1,
    /** 显示升级按钮 */
    showUpLV = 2,
    /** 显示已满级 */
    maxLV = 3,
}

enum EBtnState {
    /** 按钮正常显示 */
    btnLight = 0,
    /** 按钮置灰 */
    btnGrey = 1,
    /** 按钮置灰+不能点击 */
    btnGreyNoTouch = 2,
}

@bindFguiExtension("ui://petGroup/PetGroupListItem")
export class PetGroupListItem extends fgui.GComponent {
    static pkgName: string = "petGroup";
    static viewName: string = "PetGroupListItem";

    private cfg: table.pet.PetGroupConfig

    private activeAttrs: AttrConfigEffect[]

    private btnCtrl: fgui.Controller
    private btnClickCtrl: fgui.Controller
    private attrCtrl: fgui.Controller

    private get view(): ui.petGroup.view.mainView.PetGroupListItem {
        return this as any;
    }

    onInit() {
        let view = this.view
        view.detailBtn.onClick(this.onDetailBtn, this);
        view.btnAct.onClick(this.onUpBtn, this);
        view.petList.itemRenderer = this.onPetRenderer.bind(this);
        view.petList.setVirtual();

        view.attrList.itemRenderer = this.onAttrRenderer.bind(this);
        view.attrList.setVirtual()

        this.btnCtrl = view.getController("c1");
        this.btnClickCtrl = view.getController("c2");
        this.attrCtrl = view.getController("attr");
    }

    setData(petGroupId: number) {
        this.cfg = G.TableManager.getDataById(table.pet.PetGroupConfig, petGroupId);
        this.updateView();
    }

    updateView() {
        let view = this.view
        view.lblTitle.text = this.cfg.groupName;

        let petGroupContext = GIns.petModel.petGroupContext;
        let groupVo = petGroupContext.getGroupVo(this.cfg.id);

        let attrIndex = 1, c1 = EBtn.noShow, c2 = EBtnState.btnGrey;
        if (groupVo.activated == false) {
            let colorStr: string
            if (groupVo.isCanActive()) {
                //够条件激活羁绊
                colorStr = ColorUtils.COLOR_GREEN2.toHEX();
                c2 = EBtnState.btnLight;
                c1 = EBtn.showActive;
            } else {
                //不够条件激活
                colorStr = ColorUtils.COLOR_RED2.toHEX();
            }
            attrIndex = 0;
            view.lblActiveDesc.text = `收集组合内星灵即可激活：[color=#${colorStr}](${groupVo.getActivePetNum()}/${groupVo.getAllActivePetNum()})[/color]`;
        } else {
            let curStage = groupVo.getCurStage();
            if (curStage == 0) {
                view.lblActiveDesc.text = `收集组合内星灵即可激活：[color=#${ColorUtils.COLOR_GREEN2.toHEX()}](${groupVo.getActivePetNum()}/${groupVo.getAllActivePetNum()})[/color]`;
            } else {
                let maxStar = groupVo.getStageMaxStar();
                view.lblActiveDesc.text = `羁绊Lv.${curStage + 1}：总星级[color=#${ColorUtils.COLOR_GREEN2.toHEX()}](${maxStar}/${maxStar})[/color]激活`;
            }

            if (groupVo.isMax() == false) {
                c1 = EBtn.showUpLV;
                if (groupVo.isCanUpLV()) {
                    c2 = EBtnState.btnLight;
                }
            } else {
                c1 = EBtn.maxLV;
                c2 = EBtnState.btnGreyNoTouch;
            }
        }

        this.activeAttrs = AttrUtils.parseKvArrayToAttrArray(groupVo.getStarAllActiveAttrs())
        view.attrList.numItems = this.activeAttrs.length;
        view.petList.numItems = this.cfg.petBaseIds.length;

        let hasRed = groupVo.isCanActive() || groupVo.isCanUpLV();
        let redDot = view.btnAct.redDot as any as RedDotCom;
        redDot.showByType(hasRed ? EnumRedDotShowType.HIGH : EnumRedDotShowType.NULL);

        this.btnCtrl.selectedIndex = c1;
        this.btnClickCtrl.selectedIndex = c2;
        this.attrCtrl.selectedIndex = attrIndex
    }

    protected onDetailBtn() {
        G.UIManager.open(UIPetGroupKey.PET_GROUP_ADD_INFO_VIEW, this.cfg.id);
    }

    protected onUpBtn() {
        let vo = GIns.petModel.petGroupContext.getGroupVo(this.cfg.id);
        if (vo.activated == false) {
            GIns.petModel.sendActiveUpPetGroup(this.cfg.id);
            return;
        }

        if (vo.isCanUpLV() == false) {
            let curStage = vo.getCurStage();
            let curStageInfo = vo.getStageGroupInfo(curStage + 1);
            GIns.floatingTextMgr.showTips(`需组合内星灵总星级达到${curStageInfo.activeStar}`);
            return;
        }

        GIns.petModel.sendActiveUpPetGroup(this.cfg.id);
    }

    protected onPetRenderer(index: number, item: PetGroupShowPet) {
        let petCfgId = this.cfg.petBaseIds[index];
        item.setData(petCfgId);
        let vo = GIns.petModel.petContext.getDataByCfgId(petCfgId);
        if (vo.active) {
            item.setPetColor(Color.WHITE);
        } else {
            item.setPetColor(math.color(60, 60, 60));
        }

    }

    protected onAttrRenderer(index: number, item: ui.petGroup.com.PetGroupAddAttrListItem) {
        item.width = this.view.attrList.width / 2;
        let attr = this.activeAttrs[index];
        item.desc.text = "队伍" + attr.config.attrName + attr.getShowValueTextWithSymbol();
        let activated = GIns.petModel.petGroupContext.getGroupVo(this.cfg.id).activated;
        item.getController("c1").selectedIndex = activated ? 1 : 0;
    }
}