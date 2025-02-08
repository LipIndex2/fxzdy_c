import * as fgui from "fairygui-cc";
import { TableManager } from "../../../core/table/TableManager";
import { GmModel } from "../../model/GMModel";
import { FloatingTextManager } from "../../../game/modules/floatingText/FloatingTextManager";
import { GameTimer } from "../../../core/timer/GameTimer";
import GIns from "../../../game/GIns";

/**
 * GM 一键变强
 */
export class GMOneClickStrongerView extends fgui.GComponent {
    static pkgName: string = "gm";
    static viewName: string = "GMOneClickStrongerView";

    private _allCfg: table.accounttpl.AccountTplConfig[];

    // private _vo:Vo.gm.AccountTplVo = {};
    /**
     * 账号模板配置ID,大于0则使用该配置模板,其他字段不处理`
     */
    private _accountTplConfigId: number = -1;

    /**
     * 激活并上阵的英雄配置ID
     */
    private _heroConfigIds: Array<number>;

    /**
     * 激活英雄对应星级
     */
    private _heroStars: Array<number>;

    /**
     * 激活英雄对应等级
     */
    private _heroLevels: Array<number>;

    /**
     * 使用的装备ID列表
     */
    private _equipConfigIds: Array<number>;

    /**
     * 战队科技等级列表,按战队科技id从小到大对应等级
     */
    private _captainLevels: Array<number>;

    /** 队伍英雄对应魔方ID列表 */
    private _magicCubeIds: Array<number>;

    /** 队伍英雄对应魔方等级列表 */
    private _magicCubeLevels: Array<number>;

    /** 激活宠物id列表 */
    private _activePetConfigIds: Array<number>;

    /** 激活宠物对应星级列表 */
    private _activePetStars: Array<number>;

    /** 激活收藏品ID列表 */
    private _activeCollectiblesIds: Array<number>;

    /** 激活的收藏品对应的等级列表 */
    private _activeCollectiblesLevels: Array<number>;

    /** 激活的收藏品对应的星级列表 */
    private _activeCollectiblesStars: Array<number>;

    private get view(): ui.gm.oneClickStronger.GMOneClickStrongerView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit();
    }

    public onInit() {
        this.view.idListBtn.on(fgui.Event.CLICK, this.onClickIdList, this);
        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this);
        this.view.btnOk2.on(fgui.Event.CLICK, this.onClickOk, this);

        this.view.list_Captain.itemRenderer = this.onRenderCaptain.bind(this);
        this.view.item_select.list.itemRenderer = this.listHeroItemRenderer.bind(this);
        this.view.list_magicCube.itemRenderer = this.magicCubeIds.bind(this);
        this.view.list_magicCubeLevel.itemRenderer = this.magicCubeLevels.bind(this);

        this.onOpen();
    }

    private onOpen() {
        this._allCfg = TableManager.getAllData(table.accounttpl.AccountTplConfig);
        this.view.item_select.list.numItems = this._allCfg.length;
        this.view.item_select.visible = false;

        this.updateUI();
    }

    //显示信息
    private updateUI() {
        if (this._accountTplConfigId <= 0) return;

        let cfg = TableManager.getDataById(table.accounttpl.AccountTplConfig, this._accountTplConfigId);

        this.view.idInput.text = `${cfg.id}`;
        //英雄ID
        this._heroConfigIds = cfg.heroConfigIds;
        for (let i = 0; i < this._heroConfigIds.length; i++) {
            this.view["input_id" + (i + 1)].text = this._heroConfigIds[i];
        }
        //英雄星级
        this._heroStars = cfg.heroStars;
        for (let i = 0; i < this._heroStars.length; i++) {
            this.view["input_star" + (i + 1)].text = this._heroStars[i];
        }
        //英雄等级
        this._heroLevels = cfg.heroLevels;
        for (let i = 0; i < this._heroLevels.length; i++) {
            this.view["input_level" + (i + 1)].text = this._heroLevels[i];
        }
        //装备ID
        this._equipConfigIds = cfg.equipConfigIds;
        for (let i = 0; i < this._equipConfigIds.length; i++) {
            this.view["input_equip" + (i + 1)].text = this._equipConfigIds[i];
        }
        //普通天赋等级
        this.view.input_talentLevel1.text = `${cfg.normalTalentLevel}`;
        //高级天赋等级
        this.view.input_talentLevel2.text = `${cfg.specialTalentLevel}`;
        //战队科技核心等级
        this.view.input_useCaptain.text = `${cfg.captainCoreLevel}`;
        //战队科技等级
        this._captainLevels = cfg.captainLevels;
        this.view.list_Captain.numItems = this._captainLevels.length;
        //指定当前通关的主线关卡ID
        this.view.input_trunkInstanceId.text = `${cfg.assignTrunkInstanceId}`;
        //指定当前完成的主线任务ID
        this.view.input_trunkTaskId.text = `${cfg.assignTrunkTaskId}`;
        //探索进度
        this.view.input_sortId.text = `${cfg.assignBuildingSortId}`;
        //每日BOSS难度
        this.view.input_dayBoss.text = `${cfg.assignDailyBossDifficulty}`;
        //秘境难度
        this.view.input_Secret.text = `${cfg.assignSecretInstanceFloor}`;
        //阵营塔层数
        this.view.input_LadderFloor.text = `${cfg.assignLadderFloor}`;

        //队伍英雄对应魔方ID列表
        this._magicCubeIds = cfg.magicCubeIds;
        this.view.list_magicCube.numItems = 6;
        //队伍英雄对应魔方等级列表
        this._magicCubeLevels = cfg.magicCubeLevels;
        this.view.list_magicCubeLevel.numItems = 6;
        //上阵宠物id
        this.view.input_usePetId.text = `${cfg.usePetConfigId}`;
        //激活宠物id列表
        this._activePetConfigIds = cfg.activePetConfigIds;
        this.view.input_activePetIds.text = `${this._activePetConfigIds.toString()}`;
        //宠物等级
        this.view.input_petLevel.text = `${cfg.petLevel}`;
        //宠物阶段
        this.view.input_petStage.text = `${cfg.petStage}`;
        //激活的星灵宠物对应的星级列表
        this._activePetStars = cfg.activePetStars;
        if ((this._activePetStars, length > 0)) {
            this.view.input_activePetStars.text = `${this._activePetStars.toString()}`;
        }
        //上阵收藏品Id
        this.view.input_useCollectiblesId.text = `${cfg.useCollectiblesId}`;
        //激活收藏品ID列表
        this._activeCollectiblesIds = cfg.activeCollectiblesIds;
        if (this._activeCollectiblesIds.length > 0) {
            this.view.input_activeCollectiblesIds.text = `${this._activeCollectiblesIds.toString()}`;
        }
        //激活的收藏品对应的等级列表
        this._activeCollectiblesLevels = cfg.activeCollectiblesLevels;
        if (this._activeCollectiblesLevels.length > 0) {
            this.view.input_activeCollectiblesLevels.text = `${this._activeCollectiblesLevels.toString()}`;
        }
        //激活的收藏品对应的星级列表
        this._activeCollectiblesStars = cfg.activeCollectiblesStars;
        if (this._activeCollectiblesStars.length > 0) {
            this.view.input_activeCollectiblesStars.text = `${this._activeCollectiblesStars.toString()}`;
        }
    }

    private onRenderCaptain(index: number, item: ui.gm.oneClickStronger.InputItem1) {
        item.title.text = `战队科技${index + 1}`;
        item.input_useCaptain.text = `${this._captainLevels[index]}`;
    }
    //配置列表
    private listHeroItemRenderer(index: number, item: ui.gm.oneClickStronger.GMSelectItem) {
        item.title.text = `${this._allCfg[index].id}:${this._allCfg[index].notes}`;
        // item.clearClick();
        let self = this;
        item.on(
            fgui.Event.CLICK,
            () => {
                self._accountTplConfigId = this._allCfg[index].id;
                self.updateUI();
                self.view.item_select.visible = false;
            },
            this
        );
    }
    //魔方id列表
    private magicCubeIds(index: number, item: ui.gm.oneClickStronger.InputItem1) {
        item.title.text = `魔方Id${index + 1}:`;
        if (this._magicCubeIds && this._magicCubeIds[index]) {
            item.input_useCaptain.text = `${this._magicCubeIds[index]}`;
        }
    }
    //魔方等级列表
    private magicCubeLevels(index: number, item: ui.gm.oneClickStronger.InputItem1) {
        item.title.text = `魔方等级${index + 1}:`;
        if (this._magicCubeLevels && this._magicCubeLevels[index]) {
            item.input_useCaptain.text = `${this._magicCubeLevels[index]}`;
        }
    }

    //点击ID列表
    private onClickIdList(event: fgui.Event) {
        //TODO
        this.view.item_select.visible = true;
        this.view.item_select.x = event.initiator.x;
        this.view.item_select.y = event.initiator.y + event.initiator.height;
    }
    //点击确定
    private onClickOk() {
        this._heroConfigIds = [];
        this._heroStars = [];
        this._heroLevels = [];
        this._equipConfigIds = [];
        this._captainLevels = [];
        for (let i = 0; i < 6; i++) {
            let item1 = this.view["input_id" + (i + 1)];
            this._heroConfigIds.push(Number(item1.text));
        }
        for (let i = 0; i < 6; i++) {
            let item2 = this.view["input_star" + (i + 1)];
            this._heroStars.push(Number(item2.text));
        }
        for (let i = 0; i < 6; i++) {
            let item3 = this.view["input_level" + (i + 1)];
            this._heroLevels.push(Number(item3.text));
        }
        for (let i = 0; i < 9; i++) {
            let item4 = this.view["input_equip" + (i + 1)];
            this._equipConfigIds.push(Number(item4.text));
        }
        for (let i = 0; i < this.view.list_Captain.numChildren; i++) {
            let item5 = this.view.list_Captain.getChildAt(i).asCom.getChild("input_useCaptain");
            this._captainLevels.push(Number(item5.text));
        }
        //魔方id列表
        this._magicCubeIds = [];
        for (let i = 0; i < this.view.list_magicCube.numItems; i++) {
            let item6 = this.view.list_magicCube.getChildAt(i).asCom.getChild("input_useCaptain");
            this._magicCubeIds.push(Number(item6.text));
        }
        //魔方等级列表
        this._magicCubeLevels = [];
        for (let i = 0; i < this.view.list_magicCubeLevel.numItems; i++) {
            let item7 = this.view.list_magicCubeLevel.getChildAt(i).asCom.getChild("input_useCaptain");
            this._magicCubeLevels.push(Number(item7.text));
        }
        //激活宠物id列表
        this._activePetConfigIds = [];
        const activePetId = this.view.input_activePetIds.text;
        if (activePetId.length > 0) {
            let ids = activePetId.split(",");
            for (let id of ids) {
                this._activePetConfigIds.push(Number(id));
            }
        }
        //激活的星灵宠物对应的星级列表
        this._activePetStars = [];
        const activePetStars = this.view.input_activePetStars.text;
        if (activePetStars.length > 0) {
            let stars = activePetStars.split(",");
            for (let star of stars) {
                this._activePetStars.push(Number(star));
            }
        }
        //激活收藏品ID列表
        this._activeCollectiblesIds = [];
        const activeCollectiblesId = this.view.input_activeCollectiblesIds.text;
        if (activeCollectiblesId.length > 0) {
            let collectiblesIds = activeCollectiblesId.split(",");
            for (let collectiblesId of collectiblesIds) {
                this._activeCollectiblesIds.push(Number(collectiblesId));
            }
        }
        //激活的收藏品对应的等级列表
        this._activeCollectiblesLevels = [];
        const activeCollectiblesLevels = this.view.input_activeCollectiblesLevels.text;
        if (activeCollectiblesLevels.length > 0) {
            let collectiblesLevels = activeCollectiblesLevels.split(",");
            for (let collectiblesLevel of collectiblesLevels) {
                this._activeCollectiblesLevels.push(Number(collectiblesLevel));
            }
        }
        //激活的收藏品对应的星级列表
        this._activeCollectiblesStars = [];
        const activeCollectiblesStars = this.view.input_activeCollectiblesStars.text;
        if (activeCollectiblesStars.length > 0) {
            let collectiblesStars = activeCollectiblesStars.split(",");
            for (let collectiblesStar of collectiblesStars) {
                this._activeCollectiblesStars.push(Number(collectiblesStar));
            }
        }

        //TODO
        let vo: Vo.gm.AccountTplVo = {
            accountTplConfigId: -1,
            heroConfigIds: this._heroConfigIds,
            heroStars: this._heroStars,
            heroLevels: this._heroLevels,
            equipConfigIds: this._equipConfigIds,
            normalTalentLevel: +this.view.input_talentLevel1.text,
            specialTalentLevel: +this.view.input_talentLevel2.text,
            captainCoreLevel: +this.view.input_useCaptain.text,
            captainLevels: this._captainLevels,
            assignTrunkInstanceId: +this.view.input_trunkInstanceId.text,
            assignTrunkTaskId: +this.view.input_trunkTaskId.text,
            assignBuildingSortId: +this.view.input_sortId.text,
            assignDailyBossDifficulty: +this.view.input_dayBoss.text,
            assignSecretInstanceFloor: +this.view.input_Secret.text,
            assignLadderFloor: +this.view.input_LadderFloor.text,

            magicCubeIds: this._magicCubeIds,
            magicCubeLevels: this._magicCubeLevels,
            usePetConfigId: +this.view.input_usePetId.text,
            activePetConfigIds: this._activePetConfigIds,
            petLevel: +this.view.input_petLevel.text,
            petStage: +this.view.input_petStage.text,
            activePetStars: this._activePetStars,
            useCollectiblesId: +this.view.input_useCollectiblesId.text,
            activeCollectiblesIds: this._activeCollectiblesIds,
            activeCollectiblesLevels: this._activeCollectiblesLevels,
            activeCollectiblesStars: this._activeCollectiblesStars,
        };

        GmModel.ins().sendSetUpAccountTpl(vo as Vo.gm.AccountTplVo);
        GIns.floatingTextMgr.showTips("需要重新登录! 1s后重新登录!");

        GameTimer.ins().once(1000, this, () => {
            window.location.reload();
        });
    }
}
