import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { ClipboardUtils } from "db://assets/scripts/core/utils/ClipboardUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { AccountModel } from "db://assets/scripts/game/modules/account/model/AccountModel";
import { ChatUIKeys } from "db://assets/scripts/game/modules/chat/ChatUIKeys";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { ChatMainViewOpenArgs } from "db://assets/scripts/game/modules/chat/structs/ChatMainViewOpenArgs";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { FightManager } from "db://assets/scripts/game/modules/fight/FightManager";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { LeagueManager } from "db://assets/scripts/game/modules/league/leagueManager";
import {
    PlayerInfoOneHeroSlotComp
} from "db://assets/scripts/game/modules/player/components/PlayerInfoOneHeroSlotComp";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "db://assets/scripts/game/modules/player/structs/PlayerInfoMainViewOpenArgs";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { CollectionsVo } from "../../collections/vo/CollectionsVo";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";
import { ICondition } from "../../condition/ICondition";
import { FormationSkillIcon } from "../../formation/components/FormationSkillIcon";
import { FormationSkillType } from "../../formation/const/FormationSkillType";
import { FriendI18nKeys } from "../../friend/const/FriendI18nKeys";
import { FriendModel } from "../../friend/model/FriendModel";
import ShowInfoType = ServerEnums.ShowInfoType;
import { UICollectionsKey } from "../../collections/const/UICollectionsConfig";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import { SkillInfoWinOpenArgs } from "../../hero/view/SkillInfoWin";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";

/**
 * 玩家信息
 */
@bindScript(PlayerUIKeys.PlayerInfoMainView)
export class PlayerInfoMainView extends UICommWin {

    static pkgName: string = "playerInfo";
    static viewName: string = "PlayerInfoMainView";

    private _playerId: number = 0;
    private _posIdToCompMap: Map<number, PlayerInfoOneHeroSlotComp> = new Map();
    private _otherPersonInfo: Vo.player.PlayerPersonInfoVo | null;

    /***上阵的收藏品ID */
    private collectionSkillId: string
    /***上阵的宠物 */
    private petCfgId: number;
    /***上阵的宠物技能 */
    private petSkillData: IPet.PetSkillData

    private get view(): ui.playerInfo.PlayerInfoMainView {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.PLAYER_INFO_REQ_DONE,
            NotificationKey.CHANGE_NAME,
            NotificationKey.FRIEND_DATA_ID_CHANGE,
            NotificationKey.FRIEND_MY_APPLY_CHANGE,
            NotificationKey.FRIEND_BLACK_ID_CHANGE,
            NotificationKey.FRIEND_DELETE_COMPLETE,
            NotificationKey.PLAYER_INFO_CHANGE,
        ];
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.PLAYER_INFO_CHANGE:
            case NotificationKey.CHANGE_NAME:
                this.reset();
                break;
            case NotificationKey.PLAYER_INFO_REQ_DONE:
                this.onResp(args);
                break;
            case NotificationKey.FRIEND_DATA_ID_CHANGE:
            case NotificationKey.FRIEND_MY_APPLY_CHANGE:
            case NotificationKey.FRIEND_BLACK_ID_CHANGE:
                this.updateBtns()
                break
            case NotificationKey.FRIEND_DELETE_COMPLETE:
                if (args == this._playerId) {
                    GIns.floatingTextMgr.showTips(G.I18nManager.lang(FriendI18nKeys.deleteTip));
                    this.closeSelf()
                }
                break
        }
    }

    public onInit(): void {
        // this.view.gCaptain.visible = false
        this.view.gPet.visible = false
        this.view.btnPlayerAvatar.onClick(this.changePlayerInfo, this);
        this.view.btnChangePlayerAvatar.onClick(this.changePlayerInfo, this);

        this._posIdToCompMap = new Map([
            [1, FguiScriptUtils.toMyScriptClass(this.view.hero1, PlayerInfoOneHeroSlotComp)],
            [2, FguiScriptUtils.toMyScriptClass(this.view.hero2, PlayerInfoOneHeroSlotComp)],
            [3, FguiScriptUtils.toMyScriptClass(this.view.hero3, PlayerInfoOneHeroSlotComp)],
            [4, FguiScriptUtils.toMyScriptClass(this.view.hero4, PlayerInfoOneHeroSlotComp)],
            [5, FguiScriptUtils.toMyScriptClass(this.view.hero5, PlayerInfoOneHeroSlotComp)],
            [6, FguiScriptUtils.toMyScriptClass(this.view.hero6, PlayerInfoOneHeroSlotComp)],
        ]);

        this.view.partPlayerId.btnCopy.onClick(this.onCopyPlayerId, this);
        this.view.btnChangeName.onClick(this.onChangeName, this);

        // outside
        // this.view.onClick(this.onClickOutside, this);
        this.view.pPet.onClick(this.onClickPet, this)
        this.view.pCollections.onClick(this.onClickCollections, this)

        //好友按钮
        this.view.btnAddBlack.onClick(this.onClickAddBlack, this)
        this.view.btnRemoveBlack.onClick(this.onClickRemoveBlack, this)
        this.view.btnApplyFriend.onClick(this.onClickApplyFriend, this)
        this.view.btnDeleteFriend.onClick(this.onClickDeleteFriend, this)
        this.view.btnSendMessage.onClick(this.onClickSendMessage, this)
        this.view.btnChallengeFriend.onClick(this.onClickChallengeFriend, this)
        // 切换升星/潜能显示
        if (ModuleOpenManager.ins().isCanOpenModuleWithoutTips(ServerEnums.SystemType.HERO_DNA) == false) {
            this.view.switchComp.visible = false;
        } else {
            this.view.switchComp.visible = true;
            this.view.switchComp.getController("c1").selectedIndex = 0;
            this.view.switchComp.onClick(this.onChangeHerosShow, this);
        }
    }

    public clickHeroSlotComp(heroId: number, comp: PlayerInfoOneHeroSlotComp): void {
        let list: HeroItemTipsViewOpenArgs[] = []
        for (let i = 0; i < this._posIdToCompMap.size; i++) {
            const positionId = i + 1;
            const item = this._posIdToCompMap.get(positionId);
            if (item != comp) {
                let itemConfig = ItemUtils.getItemConfigByItemId(item.heroId);
                let args = {
                    itemConfig: itemConfig,
                    star: item.starCount,
                    lv: item.lv,
                    stage: item.stage,
                    playerData: item.playerData,
                    awakeWeaponId: item.awakeWeaponId,
                    awakeWeaponStar: item.awakeWeaponStar,
                    magicCubeId: item.magicCubeId,
                    magicCubeLv: item.magicCubeLevel,
                    heroSkin: item.heroSkin,
                    fight: item.fight,
                    attr: item.attr
                } as HeroItemTipsViewOpenArgs;

                list.push(args);
            }
        }

        let itemConfig = ItemUtils.getItemConfigByItemId(heroId);
        let item = {
            itemConfig: itemConfig,
            star: comp.starCount,
            lv: comp.lv,
            stage: comp.stage,
            playerData: comp.playerData,
            list: list,
            awakeWeaponId: comp.awakeWeaponId,
            awakeWeaponStar: comp.awakeWeaponStar,
            magicCubeId: comp.magicCubeId,
            magicCubeLv: comp.magicCubeLevel,
            heroSkin: comp.heroSkin,
            fight: comp.fight,
            attr: comp.attr
        } as HeroItemTipsViewOpenArgs;
        list.unshift(item);

        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, item);
    }

    private onClickPet(): void {
        if (this.petCfgId) {
            G.UIManager.open(UIHeroKey.SkillInfoWin, { groupId: this.petSkillData.groupId, data: this.petSkillData, petCfgId: this.petCfgId } as SkillInfoWinOpenArgs)
        }
    }

    private onClickCollections(): void {
        if (this.collectionSkillId) {
            let param: XJ.collections.ISkillInfoWinParam = {
                id: this.collectionSkillId,
                fiy: 100
            };
            G.UIManager.open(UICollectionsKey.SKILL_INFO_WIN, param);
        }
    }

    changePlayerInfo() {
        if (this._playerId != PlayerModel.ins().playerId) {
            return;
        }
        UIManager.ins().open(PlayerUIKeys.PlayerInfoChangeMainView);
    }

    protected onClickAddBlack(): void {
        FriendModel.ins().sendBlacklist({ targetId: this._playerId })
    }

    protected onClickRemoveBlack(): void {
        FriendModel.ins().sendRemoveFromBlacklist({ targetId: this._playerId })
    }

    protected onClickApplyFriend(): void {
        FriendModel.ins().sendApplyFriends({ targetIds: [this._playerId] })
    }

    protected onClickDeleteFriend(): void {
        FriendModel.ins().sendDeleteFriend({ targetId: this._playerId })
    }

    protected onClickSendMessage(): void {

        if (!this._otherPersonInfo) {
            console.error(`该玩家信息还未加载完. 无法发起私聊. playerId = ${this._playerId}`);
            return;
        }
        // TODO 发送消息

        ChatModel.ins().context.addSendFriend(
            this._otherPersonInfo
        );

        // chat
        UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
            ServerEnums.ChannelType.PRIVATE,
            this._playerId
        ));

        this.closeSelf();
    }

    protected onClickChallengeFriend(): void {
        FriendModel.ins().sendChallenge({ targetId: this._playerId })
    }

    private onChangeHerosShow(){
        // 切换
        const switchCtrl = this.view.switchComp.getController("c1");
        switchCtrl.selectedIndex = (switchCtrl.selectedIndex === 0) ? 1 : 0;
        for (let i = 0; i < this._posIdToCompMap.size; i++) {
            const positionId = i + 1;
            const item = this._posIdToCompMap.get(positionId);
            item.changeCtrl(switchCtrl.selectedIndex);
        }
    }

    private onClickOutside(event: fgui.Event) {
        // 点击空白处退出
        let isIn = TouchUtils.isFguiTouchInUi(event, this.view.bg._uiTrans);
        if (isIn) {
            return
        }
        this.closeSelf()
    }

    public onOpen(args: PlayerInfoMainViewOpenArgs): void {
        this._playerId = args.playerId;
        this.reset();

        this.updateBtns()

        let showCode = G.TableManager.getDataById(table.set.SetConstantConfig, 'SET:SHOW_EXCHANGE_CODE')
    }

    protected updateBtns(): void {
        // 自己的隐藏
        const isMe = this._playerId == PlayerModel.ins().Vo.id;

        this.view.getController("type").selectedIndex = isMe ? 0 : 1;
        if (isMe) {
            return;
        }

        this.view.btnP.layout = fgui.GroupLayoutType.Horizontal
        // 其他人
        this.updateFriendBtns();
        this.view.btnP.ensureBoundsCorrect();
    }

    protected updateFriendBtns(): void {
        //friendState 0 未开启好友功能 1黑名单 2好友 3申请好友中  4不是好友
        let friendStateCtrl = this.view.getController('friendState')

        //未获取到玩家信息
        if (!this._otherPersonInfo) {
            friendStateCtrl.selectedIndex = 0
            return
        }

        //我未开启好友
        let isOpenFriend: boolean = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.FRIEND)
        if (isOpenFriend == false) {
            friendStateCtrl.selectedIndex = 0
            return
        }

        //判断其他玩家是否开启好友 数据不全只能判断等级和主线通关层数
        let openConditions: ICondition[] = GIns.moduleOpenMgr.getUnlockConditions(ServerEnums.SystemType.FRIEND)
        let isOk: boolean = true
        if (openConditions && openConditions.length > 0) {
            for (let i = 0; i < openConditions.length; i++) {
                let condition = openConditions[i]
                if (condition.type() == EnumConditionType.PLAYER_LEVEL_GE) {
                    if (this._otherPersonInfo.playerBaseVo.level < condition.value()) {
                        isOk = false
                        break
                    }
                } else if (condition.type() == EnumConditionType.PASS_TRUNK_INSTANCE) {
                    if (this._otherPersonInfo.trunkInstanceId < condition.value()) {
                        isOk = false
                    }
                }
            }
        }
        if (isOk == false) {
            //对方未开启
            friendStateCtrl.selectedIndex = 0
            return
        }

        let isBlack: boolean = FriendModel.ins().isBlack(this._playerId)
        if (isBlack) {
            friendStateCtrl.selectedIndex = 1
            return
        }
        let isFriend: boolean = FriendModel.ins().isFriend(this._playerId)
        if (isFriend) {
            friendStateCtrl.selectedIndex = 2
            return
        }
        let isApplied: boolean = FriendModel.ins().isApplied(this._playerId)
        if (isApplied) {
            friendStateCtrl.selectedIndex = 3
            return
        }
        friendStateCtrl.selectedIndex = 4
    }

    // 需要区别对待
    private reset() {

        // me
        if (this._playerId == PlayerModel.ins().Vo.id) {
            this.resetMe();
            return;
        }


        PlayerModel.ins().sendVisitPlayerPersonInfo({
            targetId: this._playerId
        });
    }

    public onClose() {

    }


    resetMe() {
        let vo = PlayerModel.ins().Vo;

        // 头像
        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.btnPlayerAvatar, PlayerAvatar);
        playerAvatar.resetMe();
        playerAvatar.setLv(FormationManager.ins().getCommonLevel())

        // title
        this.view.imageTitle.icon = SettingsModel.ins().context.getTitleAssetPath();

        this.view.partPlayerId.labelPlayerId.text = vo.id.toString();

        // 战力
        const fightNum = FightManager.ins().getFightByDefault();
        this.view.fightNum.labelFightNum.text = StringUtils.getFightStr(fightNum);

        this.view.labelPlayerName.text = vo.name || "";

        const hangUpLevelName = HangUpModel.ins().getCurrentLevelConfig()?.showLevelId || 0;
        this.view.partHangUpLevel.labelContent.text = `最高通关: ${hangUpLevelName}`;

        let serverId = AccountModel.ins().inServerName;
        this.view.partServerId.labelContent.text = `服务器: ${serverId}`;

        let leagueName = LeagueManager.ins().mLeagueVo?.name;
        const showLeagueName = StringUtils.isBlank(leagueName) ? "暂无联盟" : `联盟: ${leagueName}`;
        this.view.partLeague.labelContent.text = `${showLeagueName}`;

        const heroPosArray = FormationManager.ins().getDefaultFormationPositionArray();
        for (let i = 0; i < this._posIdToCompMap.size; i++) {
            const posVo = heroPosArray[i];

            const positionId = i + 1;


            const comp = this._posIdToCompMap.get(positionId);
            comp.resetMe(posVo, this);
        }

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_changename_free)
        FguiScriptUtils.toMyScriptClass(this.view.redDot2, RedDotCom).reset(RedDotKeys.Set_avatar)

        let formationVo = GIns.formationMgr.getDefaultFormationVo();
        if (formationVo.collectionsId > 0) {
            this.view.gCollections.visible = true;
            let collectionsComp = FguiScriptUtils.toMyScriptClass(this.view.pCollections, FormationSkillIcon);
            collectionsComp.type = FormationSkillType.COLLECTIONS;
            let vo = GIns.collectionsModel.context.getCollectionById(formationVo.collectionsId) as CollectionsVo;
            this.collectionSkillId = GIns.collectionsCfgMgr.getBattleSkill(vo.baseId)?.id;
            collectionsComp.updateByVo(vo);
            this.view.lbCollectionsName.text = collectionsComp.skillName;
        } else {
            this.view.gCollections.visible = false;
        }

        if (formationVo.petId > 0) {
            this.view.gPet.visible = true;
            let petVo = GIns.petModel.petContext.getDataByCfgId(formationVo.petId);
            this.petCfgId = formationVo.petId
            this.petSkillData = GIns.petCfgMgr.getPetPureSkillDatasByParams(this.petCfgId, petVo.star);
            let petComp = FguiScriptUtils.toMyScriptClass(this.view.pPet, FormationSkillIcon);
            petComp.type = FormationSkillType.PET;
            petComp.updateByVo(petVo);
            this.view.lbPetName.text = petComp.skillName;
        } else {
            this.view.gPet.visible = false;
        }
    }

    /**
     * 查看他人信息, 响应时
     * @param args
     * @private
     */
    private onResp(args: Vo.player.PlayerPersonInfoVo) {
        this._otherPersonInfo = args;
        // 加载到该玩家信息
        const formationVisitVo = args.formationVisitVo;
        const playerBaseVo = args.playerBaseVo;
        const leagueName = playerBaseVo.leagueName || "";
        const serverId = args.serverId || "";
        const serverName = args.serverName || "";
        const hangUpLevelId = args.trunkInstanceId || 0;

        // 头像
        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.btnPlayerAvatar, PlayerAvatar);
        playerAvatar.resetByPlayerInfo(args.playerBaseVo);
        playerAvatar.setLv(args.playerBaseVo.level)

        // title
        this.view.imageTitle.icon = PlayerInfoConfigManager.getAssetPathBySettingId(ShowInfoType.TITLE, args.playerBaseVo?.title);


        const hangUpLevelName = HangUpUtils.getHangUpConfigByLevelId(hangUpLevelId)?.showLevelId || 0;
        const playerId = playerBaseVo.id;

        this.isNeedShowUI(playerId);

        this.view.partPlayerId.labelPlayerId.text = playerId.toString();
        const heroPosArray = formationVisitVo?.positionVisitVos || [];

        for (let i = 0; i < this._posIdToCompMap.size; i++) {
            const posVo = heroPosArray[i];

            const positionId = i + 1;


            const comp = this._posIdToCompMap.get(positionId);
            comp.reset(posVo, args.playerBaseVo, this);
        }

        this.view.fightNum.labelFightNum.text = StringUtils.getFightStr(playerBaseVo.fight);

        this.view.labelPlayerName.text = playerBaseVo?.name || "";
        this.view.partPlayerId.labelPlayerId.text = playerId.toString();
        this.view.partHangUpLevel.labelContent.text = `最高通关: ${hangUpLevelName}`;
        this.view.partServerId.labelContent.text = `服务器: ${serverName}`;

        const showLeagueName = StringUtils.isBlank(leagueName) ? "暂无联盟" : `联盟: ${leagueName}`;
        this.view.partLeague.labelContent.text = `${showLeagueName}`;

        this.updateBtns();


        let formationVo = args.formationVisitVo;
        if (formationVo.collectiblesVisitVo?.collectiblesId > 0) {
            this.view.gCollections.visible = true;
            this.collectionSkillId = GIns.collectionsCfgMgr.getBattleSkill(formationVo.collectiblesVisitVo?.collectiblesId)?.id;
            let collectionsComp = FguiScriptUtils.toMyScriptClass(this.view.pCollections, FormationSkillIcon);
            collectionsComp.type = FormationSkillType.COLLECTIONS;
            collectionsComp.updateByVisitVo(formationVo.collectiblesVisitVo);
            this.view.lbCollectionsName.text = collectionsComp.skillName;
        } else {
            this.view.gCollections.visible = false;
        }

        if (args.formationVisitVo.petVisitVo?.petBaseId > 0) {
            this.view.gPet.visible = true;
            this.petCfgId = args.formationVisitVo.petVisitVo.petBaseId
            this.petSkillData = GIns.petCfgMgr.getPetPureSkillDatasByParams(this.petCfgId, args.formationVisitVo.petVisitVo.star);
            let petComp = FguiScriptUtils.toMyScriptClass(this.view.pPet, FormationSkillIcon);
            petComp.type = FormationSkillType.PET;
            petComp.updateByVisitVo(args.formationVisitVo.petVisitVo);
            this.view.lbPetName.text = petComp.skillName;
        } else {
            this.view.gPet.visible = false;
        }
    }

    private isNeedShowUI(playerId: number) {
        const myPlayerId = PlayerModel.ins().Vo.id;
        const isMe = playerId === myPlayerId;

        this.view.btnChangeName.visible = isMe;
        this.view.btnChangePlayerAvatar.visible = isMe;
    }

    private onCopyPlayerId() {
        const playerIdStr = this.view.partPlayerId.labelPlayerId.text.trim();
        ClipboardUtils.copy(playerIdStr);

        GIns.floatingTextMgr.showTips(`复制成功!`);
    }

    private onChangeName() {
        // 改名
        UIManager.ins().open(PlayerUIKeys.PlayerInfoChangeNameView);


    }
}
