import { tween, Tween, Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ModelNode } from "../../common/node/ModelNode";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotManager } from "../../common/redDot/RedDotManager";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { IllustrationsI18nKeys } from "../const/IllustrationsI18nKeys";
import { UIIllustrationsKey } from "../const/UIIllustrationsConfig";
import { IllustrationsController } from "../IllustrationsController";
import { IllustrationsHeroItem } from "../item/IllustrationsHeroItem";
import { IllustrationsPetItem } from "../item/IllustrationsPetItem";
import { IllustrationsWeaponItem } from "../item/IllustrationsWeaponItem";
import { IllustrationsHeroCfg, IllustrationsModel, IllustrationsPetCfg, IllustrationsScoreChangeData, IllustrationsScoreState, IllustrationsWeaponCfg } from "../model/IllustrationsModel";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { TableManager } from "db://assets/scripts/core/table/TableManager";

/**
 * 图鉴界面
 */
export class IllustrationsMainWin extends UIPage {

    static pkgName: string = "illustrations";
    static viewName: string = "IllustrationsMainWin";

    protected _pageIndex: number = -1
    protected _selectIndex: number = 0
    protected _weaponIndex: number = 5
    protected _petIndex: number = 6
    protected _collectIndex: number = 7
    protected _showHeros: IllustrationsHeroCfg[] = []
    protected _showWeapons: IllustrationsWeaponCfg[] = []
    protected _showPets: Readonly<IllustrationsPetCfg>[] = []
    protected _curScore: number = 0
    protected _maxScore: number = 0
    protected _isMaxLv: boolean = false
    /**积分动画图标最大数量*/
    protected _maxIconCountForAni: number = 10
    protected _aniDelayTime: number = 500

    protected _icons: ui.illustrations.component.IllustrationsScoreIcon[] = []

    private get view(): ui.illustrations.view.IllustrationsMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ILLUSTRATIONS_HERO_CHANGE,
            NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE,
            NotificationKey.ILLUSTRATIONS_PET_CHANGE,
            NotificationKey.ILLUSTRATIONS_SCORE_CHANGE,
            NotificationKey.ILLUSTRATIONS_REWARD_LV_CHANGE,
            NotificationKey.ILLUSTRATIONS_ONE_KEY
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ILLUSTRATIONS_HERO_CHANGE:
                this.playHeroAni(args)
                // this.updateHeroList()
                break
            case NotificationKey.ILLUSTRATIONS_WEAPON_CHANGE:
                this.playWeaponAni(args)
                // this.updateWeaponList()
                break
            case NotificationKey.ILLUSTRATIONS_PET_CHANGE:
                this.playPetAni(args)
                break
            case NotificationKey.ILLUSTRATIONS_SCORE_CHANGE:
                this.playScoreAni(args)
                break
            case NotificationKey.ILLUSTRATIONS_REWARD_LV_CHANGE:
                this.updateUI()
                break
            case NotificationKey.ILLUSTRATIONS_ONE_KEY:
                this.onUpdateOneKey()
                break
        }
    }

    private onUpdateOneKey(): void {
        if (this._selectIndex == this._weaponIndex) {
            //选中了武器
            this.showWeaponList()
        } else if (this._selectIndex == this._petIndex) {
            //选中了宠物
            this.showPetList()
        } else if (this._selectIndex == this._petIndex) {
            //选中了收藏本
        }
        else {
            this.showHeroList()
        }
        this.updateJiHuoBtnRedDot()
    }

    protected showHeroList(): void {
        this.view.listHero.visible = true
        this.view.listWeapon.visible = false
        this.view.listPet.visible = false
        this.updateHeroList()

        let defaultIndex = this._showHeros.findIndex((value) => value.state == IllustrationsScoreState.CanDraw)
        if (defaultIndex != -1) {
            this.view.listHero.scrollToView(defaultIndex)
        }
    }

    protected updateHeroList(): void {
        this._showHeros = []
        IllustrationsModel.ins().heros?.forEach((value) => {
            if (this._selectIndex == 0 || value.cfg.camp == this._selectIndex) {
                if (GIns.illustrationsModel.isHeroShowOnlyActive(value.cfg.id)) {
                    let heroVo = GIns.heroMgr.getHeroVoByID(value.cfg.id)
                    if (heroVo.heroVoData.isActivate == false) {
                        return
                    }
                }
                this._showHeros.push(value)
            }
        })
        this.view.listHero.numItems = this._showHeros.length
    }

    protected showWeaponList(): void {
        this.view.listHero.visible = false
        this.view.listPet.visible = false
        this.view.listWeapon.visible = true
        this.updateWeaponList()

        let defaultIndex = this._showWeapons.findIndex((value) => value.state == IllustrationsScoreState.CanDraw)
        if (defaultIndex != -1) {
            this.view.listWeapon.scrollToView(defaultIndex)
        }
    }

    protected updateWeaponList(): void {
        this._showWeapons = []
        IllustrationsModel.ins().weapons?.forEach((value) => {
            if (GIns.illustrationsModel.isWeaponShowOnlyActive(value)) {
                let weaponVo = GIns.weaponMgr.getWeaponVoByBaseId(value.cfg.id)
                if (weaponVo == null) {
                    return
                }
            }
            this._showWeapons.push(value)
        })
        this.view.listWeapon.numItems = this._showWeapons.length
    }

    protected showPetList(): void {
        this.view.listHero.visible = false
        this.view.listPet.visible = false
        this.view.listWeapon.visible = true
        this.updatePetList()
    }

    protected updatePetList(): void {
        this.view.listHero.visible = false
        this.view.listWeapon.visible = false
        this.view.listPet.visible = true
        this._showPets = IllustrationsModel.ins().pets.filter(v=>{
            return GIns.petCfgMgr.isCanShow(v.cfg.id);
        })
        this.view.listPet.numItems = this._showPets.length
    }

    protected playHeroAni(heroId: number): void {
        let index = this._showHeros.findIndex((value) => value.cfg.id == heroId)
        if (index != -1) {
            let itemIndex = this.view.listHero.itemIndexToChildIndex(index)
            let item = this.view.listHero.getChildAt(itemIndex)
            if (item) {
                //@ts-ignore
                let comp = item as ui.illustrations.item.IllustrationsHeroItem
                let aniNode = comp.aniNode as ModelNode
                aniNode.loadByPath('spine/ui/T_shaoguang/T_shaoguang')
                aniNode.playOrders([
                    {
                        name: 'enter',
                        isLoop: false
                    }
                ])
                G.GameTimer.once(this._aniDelayTime, this, () => {
                    if (this.view?.node?.isValid) {
                        this.updateHeroList()
                    }
                })
                let comp2 = item as IllustrationsHeroItem
                comp2.setData(this._showHeros[index])
                this.updateJiHuoBtnRedDot()
                return
            }
        }
        this.updateUI()
    }

    protected playWeaponAni(weaponId: number): void {
        let index = this._showWeapons.findIndex((value) => value.cfg.id == weaponId)
        if (index != -1) {
            let itemIndex = this.view.listWeapon.itemIndexToChildIndex(index)
            let item = this.view.listWeapon.getChildAt(itemIndex)
            if (item) {
                //@ts-ignore
                let comp = item as ui.illustrations.item.IllustrationsWeaponItem
                let aniNode = comp.aniNode as ModelNode
                aniNode.loadByPath('spine/ui/T_shaoguang/T_shaoguang')
                aniNode.playOrders([
                    {
                        name: 'enter',
                        isLoop: false
                    }
                ])
                G.GameTimer.once(this._aniDelayTime, this, () => {
                    if (this.view?.node?.isValid) {
                        this.updateWeaponList()
                    }
                })
                let comp2 = item as IllustrationsWeaponItem
                comp2.setData(this._showWeapons[index])
                this.updateJiHuoBtnRedDot()
                return
            }
        }
        this.updateUI()
    }

    protected playPetAni(petCfgId: number) {
        let index = this._showPets.findIndex((value) => value.cfg.id == petCfgId)
        if (index != -1) {
            let itemIndex = this.view.listPet.itemIndexToChildIndex(index)
            let item = this.view.listPet.getChildAt(itemIndex)
            if (item) {
                //@ts-ignore
                let comp = item as ui.illustrations.item.IllustrationsPetItem
                let aniNode = comp.aniNode as ModelNode
                aniNode.loadByPath('spine/ui/T_shaoguang/T_shaoguang')
                aniNode.playOrders([
                    {
                        name: 'enter',
                        isLoop: false
                    }
                ])
                G.GameTimer.once(this._aniDelayTime, this, () => {
                    if (this.view?.node?.isValid) {
                        this.updatePetList()
                    }
                })
                let comp2 = item as IllustrationsPetItem
                comp2.setData(this._showPets[index])
                this.updateJiHuoBtnRedDot()
                return
            }
        }
        this.updateUI()
    }

    private updateJiHuoBtnRedDot(): void {
        let showOneKeyLv = Number(TableManager.getDataById(table.illustrations.IllustrationsConstantConfig, "ILLUSTRATIONS:ILLUSTRATIONS_ONE_KEY").content);
        this.view.jihuoBtn.visible = IllustrationsModel.ins().rewardLv >= showOneKeyLv;
        this.view.jihuoBtn.enabled = false;
        FguiScriptUtils.toMyScriptClass(this.view.jihuoBtn.redDot, RedDotCom).showByType(EnumRedDotShowType.NULL)
        if (this._selectIndex == this._weaponIndex) {
            //选中了武器
            FguiScriptUtils.toMyScriptClass(this.view.jihuoBtn.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Weapon_All);
            this.view.jihuoBtn.enabled = GIns.redDotMgr.isHaveRedDot(RedDotKeys.Illustrations_Weapon_All)
        } else if (this._selectIndex == this._petIndex) {
            //选中了宠物
            FguiScriptUtils.toMyScriptClass(this.view.jihuoBtn.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Pet_All);
            this.view.jihuoBtn.enabled = GIns.redDotMgr.isHaveRedDot(RedDotKeys.Illustrations_Pet_All)
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.jihuoBtn.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Hero_All);
            this.view.jihuoBtn.enabled = GIns.redDotMgr.isHaveRedDot(RedDotKeys.Illustrations_Hero_All)
        }
    }

    protected updateUI(): void {
        this.updateJiHuoBtnRedDot()

        let curLv: number = IllustrationsModel.ins().rewardLv
        let rewards = G.TableManager.getAllData(table.illustrations.IllustrationsLevelConfig)

        if (curLv >= rewards.length) {
            //等级已满
            this.clearBoxAni()
            this._isMaxLv = true
            this.view.progress.title.visible = false
            this.view.progress.min = 0
            this.view.progress.max = 100
            this.view.progress.value = 100
            this.view.lbRewardTip.text = G.I18nManager.lang(IllustrationsI18nKeys.rewardStateTip3)
            RedDotManager.ins().setRedDot(RedDotKeys.Illustrations_Reward, false)
            return
        }


        this._isMaxLv = false
        let curScore = IllustrationsModel.ins().score
        this._maxScore = rewards[curLv].needScore
        this.view.progress.title.visible = true
        this.view.progress.min = 0
        this.view.progress.max = this._maxScore
        this.view.progress.value = curScore
        this._curScore = curScore

        if (curScore >= this._maxScore) {
            //可领取
            this.view.lbRewardTip.text = G.I18nManager.lang(IllustrationsI18nKeys.rewardStateTip2)
            this.showBoxAni()
        } else {
            this.view.lbRewardTip.text = G.I18nManager.lang(IllustrationsI18nKeys.rewardStateTip1, this._maxScore - curScore)
            this.clearBoxAni()
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Illustrations_Reward, curScore >= this._maxScore)
    }

    protected showBoxAni(): void {
        this.clearBoxAni()
        let tween1 = tween(this.view.box).to(0.2, { rotation: 10 })
        let tween2 = tween(this.view.box).to(0.2, { rotation: -10 })
        let tween3 = tween(this.view.box).sequence(tween1, tween2).repeat(3)
        let tween4 = tween(this.view.box).to(0.2, { rotation: 0 })
        let tween5 = tween(this.view.box).delay(1)
        let tween6 = tween(this.view.box).sequence(tween3, tween4, tween5).repeatForever()
        tween6.start()
    }

    protected clearBoxAni(): void {
        if (this.view.box?.node?.isValid) {
            Tween.stopAllByTarget(this.view.box)
            this.view.box.rotation = 0
        }
    }

    protected playScoreAni(data: IllustrationsScoreChangeData): void {
        let curScore = IllustrationsModel.ins().score
        if (data.score <= 0) {
            //分数没有变大 就直接刷新 不播动画
            this.updateUI()
            return
        }
        Tween.stopAllByTarget(this)
        let endPos: Vec2 = this.view.iconScore.localToGlobal(0, 0)
        endPos = this.view.btnMask.globalToLocal(endPos.x, endPos.y)
        //起始点是屏幕中心点
        let startPos = this.view.localToGlobal(this.view.width * 0.5, this.view.height * 0.5)
        startPos = this.view.btnMask.globalToLocal(startPos.x, startPos.y)

        this.view.btnMask.visible = true
        // this.clearIconAni()
        let showCount = Math.min(data.score, this._maxIconCountForAni)
        let waitDelay = this._aniDelayTime / 1000
        let totalDelay = waitDelay + showCount * 0.2 + 0.8

        // for (let i = 0; i < showCount; i++) {
        //     let icon = this.createIcon()
        //     this.view.btnMask.addChild(icon)
        //     icon.setScale(0, 0)
        //     icon.setPosition(startPos.x, startPos.y)
        //     let tween1 = tween(icon).to(0.2, { scaleX: 0.8, scaleY: 0.8 })
        //     let tween2 = tween(icon).to(0.5, { x: endPos.x, y: endPos.y }, { easing: 'cubicInOut' })
        //     let tween3 = tween(icon).delay(0.3)
        //     let tween4 = tween(icon).to(0.2, { scaleX: 1.4, scaleY: 1.4 })
        //     let tween5 = tween(icon).to(0.2, { scaleX: 1, scaleY: 1 })
        //     let tween6 = tween(icon).sequence(tween3, tween4, tween5)
        //     let tween7 = tween(icon).parallel(tween2, tween6)
        //     let tween8 = tween(icon).delay(i * 0.2).sequence(tween1, tween7).call(() => {
        //         this.view.progress.value += 1
        //         this.removeIcon(icon)
        //     }).start()
        // }

        for (let i = 0; i < showCount; i++) {
            let icon = this.createIcon()
            this.view.btnMask.addChild(icon)
            icon.setScale(0, 0)
            icon.setPosition(startPos.x, startPos.y)
            let tween1 = tween(icon).to(0.2, { scaleX: 0.8, scaleY: 0.8 })
            let tween2 = tween(icon).call(() => {
                let comp = this.view.aniNode as ModelNode
                comp.setPosition(startPos.x, startPos.y)
                comp.visible = true
                comp.clearOrders()
                comp.playOrders([
                    {
                        name: 'enter',
                        isLoop: false
                    }
                ])
            })
            let startTween = tween(icon).parallel(tween1, tween2)

            let moveTween = tween(icon).to(0.5, { x: endPos.x, y: endPos.y }, { easing: 'cubicInOut' })
            let tween3 = tween(icon).delay(0.3).to(0.2, { scaleX: 1.4, scaleY: 1.4 }).to(0.2, { scaleX: 1, scaleY: 1 }).union()
            let tween4 = tween(icon).delay(0.5).call(() => {
                let comp = this.view.aniNode as ModelNode
                comp.setPosition(endPos.x, endPos.y)
                comp.clearOrders()
                comp.playOrders([
                    {
                        name: 'enter',
                        isLoop: false
                    }
                ])
            })
            let endTween = tween(icon).parallel(moveTween, tween3, tween4)
            tween(icon).delay(waitDelay + i * 0.2).sequence(startTween, endTween).call(() => {
                if (this.view.progress.value < this._curScore) {
                    this.view.progress.value += 1
                }
                this.removeIcon(icon)
            }).start()
        }
        tween(this).delay(totalDelay).call(() => {
            this.view.btnMask.visible = false
            this.updateUI()
        }).start()
        this._curScore = curScore
    }

    protected createIcon(): ui.illustrations.component.IllustrationsScoreIcon {
        if (this._icons.length > 0) {
            return this._icons.shift()
        }
        let icon = fgui.UIPackage.createObject("illustrations", "IllustrationsScoreIcon") as ui.illustrations.component.IllustrationsScoreIcon
        return icon
    }

    protected removeIcon(icon: ui.illustrations.component.IllustrationsScoreIcon): void {
        if (icon) {
            icon.removeFromParent()
            this._icons.push(icon)
        }
    }

    protected clearIconAni(): void {
        let children = this.view.btnMask._children
        if (children.length > 0) {
            children.forEach((icon) => {
                Tween.stopAllByTarget(icon)
            })
        }
        this.view.btnMask.removeChildren()
        this._icons?.forEach((icon) => {
            icon.dispose()
        })
        this._icons.length = 0
    }

    protected setTabIndex(index: number): void {
        if (this._selectIndex != index) {
            let view = this.view
            this._selectIndex = index
            if (this._selectIndex == this._weaponIndex) {
                //选中了武器
                view.listCamp.clearSelection()
                view.btnPet.selected = false
                this.showWeaponList()
            } else if (this._selectIndex == this._petIndex) {
                //选中了宠物
                view.btnWeapon.selected = false
                view.listCamp.clearSelection()
                this.showPetList()
            } else {
                view.btnWeapon.selected = false
                view.btnPet.selected = false
                this.showHeroList()
            }
            this.updateJiHuoBtnRedDot()
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        let view = this.view
        view.lbTitle.text = G.I18nManager.lang(IllustrationsI18nKeys.title)

        view.listHero.setVirtual()
        view.listWeapon.setVirtual()
        view.listPet.setVirtual()
        view.listCamp.on(fgui.Event.CLICK_ITEM, this.onClickItem, this)
        view.btnWeapon.onClick(this.onClickWeapon, this)
        view.listHero.itemRenderer = this.itemRendererForHero.bind(this)
        view.listWeapon.itemRenderer = this.itemRendererForWeapon.bind(this)
        view.listPet.itemRenderer = this.itemRenderForPet.bind(this)
        view.footer.btnBack.onClick(this.onClickBack, this)
        view.btnReward.onClick(this.onClickReward, this)
        view.jihuoBtn.onClick(this.onClickJiHuoBtn, this)
        view.btnPet.onClick(this.onClickPet, this)
        view.btnDetail.onClick(() => {
            RuleController.ins().openRule(EnumRuleKeys.ILLUSTRATIONS, view.btnDetail)
        })

        view.btnMask.visible = false

        view.btnWeapon.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.AWAKE_WEAPON, false)
        view.btnPet.visible = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.PET, false)

        let heroRedDots = [
            RedDotKeys.Illustrations_Hero_All,
            null,
            RedDotKeys.Illustrations_Hero_Camp1,
            RedDotKeys.Illustrations_Hero_Camp2,
            RedDotKeys.Illustrations_Hero_Camp3,
            RedDotKeys.Illustrations_Hero_Camp4,
        ]
        view.listCamp._children?.forEach((item: ui.comm.btn.HeroSelectBtn, index: number) => {
            if (heroRedDots[index]) {
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(heroRedDots[index])
            }
        })
        FguiScriptUtils.toMyScriptClass(view.btnWeapon.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Weapon_All)
        FguiScriptUtils.toMyScriptClass(view.btnPet.redDot, RedDotCom).reset(RedDotKeys.Illustrations_Pet_All)

        let comp = view.aniNode as ModelNode
        comp.loadByPath('spine/ui/T_shaoguang/T_xingxing')
        comp.visible = false

        view.btnMask.touchable = false
    }

    protected itemRendererForHero(index: number, item: IllustrationsHeroItem): void {
        item.setData(this._showHeros[index])
    }

    protected itemRendererForWeapon(index: number, item: IllustrationsWeaponItem): void {
        item.setData(this._showWeapons[index])
    }

    protected itemRenderForPet(index: number, item: IllustrationsPetItem): void {
        item.setData(this._showPets[index])
    }

    protected onClickJiHuoBtn(): void {
        if (this._selectIndex == this._weaponIndex) {
            //选中了武器
            IllustrationsModel.ins().sendOneKeyWeaponScore()
        } else if (this._selectIndex == this._petIndex) {
            //选中了宠物
            IllustrationsModel.ins().sendOneKeyPetScore()
        } else if (this._selectIndex == this._petIndex) {
            //选中了收藏本
            IllustrationsModel.ins().sendOneKeyCollectScore()
        }
        else {
            IllustrationsModel.ins().sendOneKeyHeroScore()
        }
    }

    protected onClickReward(): void {
        let curScore = IllustrationsModel.ins().score
        if (curScore >= this._maxScore && this._isMaxLv == false) {
            //可领取奖励
            let lv = IllustrationsModel.ins().rewardLv + 1
            IllustrationsModel.ins().sendDrawLevelReward({ level: lv })
            return
        }
        G.UIManager.open(UIIllustrationsKey.ILLUSTRATIONS_REWARD_VIEW)
    }

    protected onClickBack(): void {
        this.closeSelf()
    }

    protected onClickItem(item: fgui.GButton): void {
        if (item instanceof fgui.GButton == false) {
            return
        }
        this.view.btnWeapon.selected = false
        this.view.btnPet.selected = false
        let index = this.view.listCamp.getChildIndex(item)
        if (index != 0) --index
        this.setTabIndex(index)
    }

    protected onClickWeapon(): void {
        this.setTabIndex(this._weaponIndex)
    }

    protected onClickPet(): void {
        this.setTabIndex(this._petIndex)
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.updateUI()
        if (isReopen) {
            return
        }
        this.view.listCamp.selectedIndex = 0
        this.view.btnWeapon.selected = false
        this.showHeroList()
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
        Tween.stopAllByTarget(this)
        this.clearBoxAni()
        this.clearIconAni()
        //防止动画没播完 主动检测一下奖励红点
        IllustrationsController.ins().checkRewardRedDot()
    }
}