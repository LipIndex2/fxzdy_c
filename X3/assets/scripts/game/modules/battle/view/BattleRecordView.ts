import { BattleRecordUtils } from "db://assets/scripts/game/modules/battle/utils/BattleRecordUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { bindFguiExtension, bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { UnitType } from "../../../comm/battle/enum/BattleEnum";
import GIns from "../../../GIns";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIBattleKeys } from "../UIBattleKeys";
import { BattleRecordHeroInfo, BattleRecordInfo } from "./recordInfo/BattleRecordInfo";

export interface IBattleRecord {
    // 战斗类型
    fightType: ServerEnums.FightType;
    /**
     * 攻击方基础信息
     */
    attackerBaseVo: BattleRecordInfo;
    /**
     * 防守方基础信息,null则表示机器人
     */
    defenderBaseVo: BattleRecordInfo;
    /**
     * 攻击方是否胜利
     */
    attackerWin: boolean;
}

@bindFguiExtension("ui://battleRecord/BattleRecordItem")
export class BattleRecordItem extends fgui.GComponent {
    // region 静态属性 for FGUI
    static pkgName: string = "battleRecord";
    static viewName: string = "BattleRecordItem";

    private proWidth: number
    public info: BattleRecordHeroInfo

    private get view(): ui.battleRecord.BattleRecordItem {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.proWidth = this.view.hurtPro.width;
    }

    // 更新渲染
    updateData(data: BattleRecordHeroInfo, isWin: boolean, index: number) {
        this.info = data;

        if (this.info.unitType == UnitType.Hero) {
            let heroCfg = TableManager.getDataById(table.hero.HeroConfig, this.info.configId)
            this.view.qualityIcon.icon = ItemUtils.getQualityIconResourcePath(heroCfg.quality)
            if (this.info.unitModel?.heroSkinId) {
                let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this.info.unitModel.heroSkinId)
                this.view.headIcon.icon = ItemUtils.getNormalHeroHead(skinCfg.headPath);
            }
            else
                this.view.headIcon.icon = ItemUtils.getNormalHeroHead(heroCfg.headPath);

        } else if (this.info.unitType == UnitType.Pet) {
            let petCfg = TableManager.getDataById(table.pet.PetConfig, this.info.configId)
            this.view.qualityIcon.icon = ItemUtils.getQualityIconResourcePath(petCfg.quality)
            this.view.headIcon.icon = ItemUtils.getNormaHeadByPath(petCfg?.headPath);
        } else {
            let monsterCfg = TableManager.getDataById(table.monster.MonsterAttributeConfig, this.info.configId)
            this.view.qualityIcon.icon = ItemUtils.getQualityIconResourcePath(6)
            this.view.headIcon.icon = ItemUtils.getNormaHeadByPath(monsterCfg?.headPath);
        }
        this.view.hurtLab.text = StringUtils.numShortToKM(data.hurt)
        this.view.hurtPro.width = this.proWidth * data.hurt / data.firstHurtValue;

        this.view.endureLab.text = StringUtils.numShortToKM(data.beHurt)
        this.view.endurePro.width = this.proWidth * data.beHurt / data.firstBeHurtValue;

        this.view.healLab.text = StringUtils.numShortToKM(data.cure)
        this.view.healPro.width = this.proWidth * data.cure / data.firstHealValue;

        this.view.bg1.visible = false
        this.view.bg2.visible = false
        if (index % 2 == 0) {
            if (isWin) {
                this.view.bg1.visible = true
            } else {
                this.view.bg2.visible = true
            }
        }
    }
}

/**
 * 战斗统计
 */
@bindScript(UIBattleKeys.BattleRecordView)
export class BattleRecordView extends UICommWin {
    static pkgName: string = "battleRecord";
    static viewName: string = "BattleRecordView";

    private winHeros: Vo.battle.UnitStatisticsBaseVo[]
    private loseHeros: Vo.battle.UnitStatisticsBaseVo[]
    private _isShowDefender: boolean = true;
    private fightType: ServerEnums.FightType;

    private get view(): ui.battleRecord.BattleRecordView {
        return this._view as any;
    }

    public onInit(): void {
        this.view.closeBtn.onClick(this.onClickClose, this)
    }

    public onOpen(args: IBattleRecord): void {
        this.view.pRecord.winList.setVirtual();
        this.view.pRecord.loseList.setVirtual();

        this.fightType = args.fightType || ServerEnums.FightType.TRUNK_MAP;
        // 第一个玩家
        const winAvatar = FguiScriptUtils.toMyScriptClass(this.view.pRecord.G_avatar1, PlayerAvatar);
        const loseAvatar = FguiScriptUtils.toMyScriptClass(this.view.pRecord.G_avatar2, PlayerAvatar)
        if (args.attackerWin) {
            //攻击方胜利
            this.initWinData(args.attackerBaseVo)
            this.initLoseData(args.defenderBaseVo)
            this.winHeros = args.attackerBaseVo.heros?.filter((value) => value.configId != undefined)
            this.loseHeros = args.defenderBaseVo.heros?.filter((value) => value.configId != undefined)

            this.updateAvatar(winAvatar, args.attackerBaseVo);
            this.updateAvatar(loseAvatar, args.defenderBaseVo);
        } else {
            this.initWinData(args.defenderBaseVo)
            this.initLoseData(args.attackerBaseVo)
            this.winHeros = args.defenderBaseVo.heros?.filter((value) => value.configId != undefined)
            this.loseHeros = args.attackerBaseVo.heros?.filter((value) => value.configId != undefined)

            this.updateAvatar(winAvatar, args.defenderBaseVo);
            this.updateAvatar(loseAvatar, args.attackerBaseVo);
        }


        // 防守方 
        // 是否显示防守方
        this._isShowDefender = BattleRecordUtils.isShowDefender(this.fightType);

        if (this._isShowDefender) {
            this.view.pRecord.getController("style").selectedIndex = 0;
            this.view.pRecord.winList.numItems = this.winHeros.length;
            this.view.pRecord.loseList.numItems = this.loseHeros.length;
        } else {
            //只展示攻击方
            this.view.pRecord.getController("style").selectedIndex = args.attackerWin ? 1 : 2
            if (args.attackerWin) {
                this.view.pRecord.winList.numItems = this.winHeros.length;
            } else {
                this.view.pRecord.loseList.numItems = this.loseHeros.length;
            }
        }

        if (BattleRecordUtils.isHideDefenderIcon(this.fightType)) {
            if (args.attackerWin) {
                this.view.pRecord.G_avatar2.visible = false;
            } else
                this.view.pRecord.G_avatar1.visible = false;
        }

        if (BattleRecordUtils.isHideAttkerIcon(this.fightType)) {
            if (args.attackerWin) {
                this.view.pRecord.G_avatar1.visible = false;
            } else
                this.view.pRecord.G_avatar2.visible = false;
        }
    }

    /**更新头像*/
    protected updateAvatar(avatar: PlayerAvatar, data: BattleRecordInfo): void {
        if (data.id == GIns.playerModel.playerId) {
            //是我自己 用本地数据
            avatar.resetMe();
            avatar.touchable = false;
        } else {
            avatar.reset(data.id, data.headIcon, data.headFrame, data.imageId)
        }
    }

    private initWinData(data: BattleRecordInfo): void {
        if (data.id == GIns.playerModel.playerId 
            && this.fightType != ServerEnums.FightType.TEAM_INSTANCE
        ) {
            //是我自己 用本地数据
            this.view.pRecord.winNameLab.text = GIns.playerModel.playerName;
        } else {
            this.view.pRecord.winNameLab.text = data.name;
        }
        this.view.pRecord.winList.itemRenderer = this.winRenderer.bind(this);
    }

    private initLoseData(data: BattleRecordInfo): void {
        if (data.id == GIns.playerModel.playerId
            && this.fightType != ServerEnums.FightType.TEAM_INSTANCE
        ) {
            //是我自己 用本地数据
            this.view.pRecord.loseNameLab.text = GIns.playerModel.playerName;
        } else {
            this.view.pRecord.loseNameLab.text = data.name;
        }
        this.view.pRecord.loseList.itemRenderer = this.loseRenderer.bind(this);
    }

    private winRenderer(index: number, view: BattleRecordItem) {
        const itemVo = this.winHeros[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo, true, index)
    }

    private loseRenderer(index: number, view: BattleRecordItem) {
        const itemVo = this.loseHeros[index];
        if (!itemVo) {
            return
        }
        view.updateData(itemVo, false, index)
    }

    private onClickClose(): void {
        this.closeSelf()
    }

    public onClose() {

    }
}