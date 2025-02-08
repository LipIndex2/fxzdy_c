import FacadeManager from "../../../../core/mvc/FacadeManager";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { ReportDataType } from "../../../../core/sdk/SdkBase";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import LoginNotificationKey from "../../../../main/modules/LoginNotificationKey";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import NotificationKey from "../../../event/NotificationKey";
import { FormationManager } from "../../formation/FormationManager";
import { HeroManager } from "../HeroManager";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";

declare global {
    namespace XJ {
        namespace IHero {
            interface IHeroUpCommonLVParam {
                oldCommonLV: number;
                newCommonLV: number;
            }
        }
    }
}
/**
 * 英雄模块协议号
 * @author GameCreator
 */
export class HeroModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 20;

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recActive);
        this.registerMsg(moduleId, 2, this.recUpStar);
        this.registerMsg(moduleId, 3, this.recUpLevel);
        this.registerMsg(moduleId, 4, this.recUpStage);
        this.registerMsg(moduleId, 5, this.recSkinWear);
        this.registerMsg(moduleId, 6, this.recUpDNALevel);
        this.registerMsg(moduleId, 7, this.recAwakenDNA);
        this.registerMsg(moduleId, 8, this.recReplaceAwakenDNA);
    }

    /**初始化英雄数据(英雄激活了，或者英雄没激活但是有碎片才有数据) */
    public initData(vo: Vo.hero.HeroLoginVo): void {
        HeroConfigManager.init();

        let voArr: Vo.hero.HeroVo[] = [];
        let heroCfg = TableManager.getAllData(table.hero.HeroConfig);
        if (vo && vo.heroVos.length > 0) {
            for (let cfg of heroCfg) {
                let isAdd = true;
                for (let k in vo.heroVos) {
                    if (vo.heroVos[k].heroBaseId == cfg.id) {
                        voArr.push(vo.heroVos[k]);
                        isAdd = false;
                        break;
                    }
                }
                if (isAdd) {
                    let heroVoDate = {
                        id: null,
                        heroBaseId: cfg.id,
                        fragment: 0,
                        star: 0,
                        active: false,
                        useSkinId: 0,
                        heroSkinIds: [],
                        heroDna: {} as Vo.hero.HeroDnaVo
                    } as Vo.hero.HeroVo;
                    voArr.push(heroVoDate);
                }
            }
        } else {
            for (let cfg of heroCfg) {
                let heroVoDate = {
                    id: null,
                    heroBaseId: cfg.id,
                    fragment: 0,
                    star: 0,
                    active: false,
                    useSkinId: 0,
                    heroSkinIds: [],
                    heroDna: {} as Vo.hero.HeroDnaVo
                } as Vo.hero.HeroVo;
                voArr.push(heroVoDate);
            }
        }

        HeroManager.ins().setHeroData(voArr);
    }

    /*********************************协议发送*********************************/

    /**
     * 激活英雄
     * 模块号：20	指令号：1
     * @param baseId 英雄id
     */
    public sendActive(baseId: number): void {
        let c2s = {} as Vo.hero.ActiveC2S;
        c2s.baseId = baseId;
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 英雄升星
     * 模块号：20	指令号：2
     * @param baseId 英雄id
     */
    public sendUpStar(baseId: number): void {
        let c2s = {} as Vo.hero.UpStarC2S;
        c2s.baseId = baseId;
        this.send(this.MODULE, 2, c2s);
    }

    /**
     * 升级
     * 模块号：20	指令号：3
     * @param slotBaseId 阵位卡槽ID
     */
    public sendUpLevel(slotBaseId: number, upStage: boolean = false): void {
        let c2s = {} as Vo.hero.UpLevelC2S;
        c2s.slotBaseId = slotBaseId;
        c2s.upStage = upStage;
        this.send(this.MODULE, 3, c2s, upStage);
    }

    /**
     * 升阶
     * 模块号：20	指令号：4
     * @param slotBaseId 阵位卡槽ID
     */
    public sendUpStage(slotBaseId: number): void {
        let c2s = {} as Vo.hero.UpStageC2S;
        c2s.slotBaseId = slotBaseId;
        this.send(this.MODULE, 4, c2s);
    }

    /**
     * 升阶
     * 模块号：20	指令号：5
     * @param baseId 阵位卡槽ID
     */
    public sendSkinWear(baseId: number, skinId): void {
        let c2s = {} as Vo.hero.UseSkinC2S;
        c2s.baseId = baseId;
        c2s.skinId = skinId;
        this.send(this.MODULE, 5, c2s);
    }

    /**
     * 潜能升级
     * 模块号：20	指令号：6
     * @param baseId 英雄配置Id
     */
    public sendDNALevelUp(baseId: number): void {
        let c2s = {} as Vo.hero.UpDnaLevelC2S;
        c2s.baseId = baseId;
        this.send(this.MODULE, 6, c2s, baseId);
    }

    /**
     * 潜能觉醒或者刷新
     * 模块号：20	指令号：7
     * @param baseId 英雄配置Id
     * @param stage 潜能阶段
     */
    public sendDNAAwakenOrRefresh(baseId: number, stage: number): void {
        let c2s = {} as Vo.hero.AwakenDnaC2S;
        c2s.baseId = baseId;
        c2s.stage = stage;
        this.send(this.MODULE, 7, c2s, c2s)
    }

    /**
     * 替换潜能觉醒属性
     * 模块号：20	指令号：8
     * @param baseId 英雄配置Id
     * @param stage 潜能阶段
     * @param type 0-替换 1-取消
     */
    public sendDNAAwakenReplace(baseId: number, stage: number, type: number): void {
        let c2s = {} as Vo.hero.ReplaceAwakenDnaC2S;
        c2s.baseId = baseId;
        c2s.stage = stage;
        c2s.type = type;
        this.send(this.MODULE, 8, c2s, c2s)
    }

    /*********************************协议监听*********************************/

    /**
     * 激活英雄
     * 模块号：20	指令号：1
     */
    public recActive(data: Vo.hero.ActiveS2C, c2s: Vo.hero.ActiveC2S): void {
        if (data.code >= 0) {
            //奖励
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.rewardResults);
            //消耗
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);

            //更新英雄碎片数量
            let heroVo = HeroManager.ins().getHeroVoByID(c2s.baseId);
            //@ts-ignore
            heroVo.fragment = data.content.rewardResults[0].contents.fragment;

            this.emit(NotificationKey.HERO_ACTIVATE, c2s.baseId);
        }
    }

    /**
     * 英雄升星
     * 模块号：20	指令号：2
     */
    public recUpStar(data: Vo.hero.UpStarS2C): void {
        if (data.code >= 0) {
            //更新英雄信息
            HeroManager.ins().updateHeroData(data.content.heroVo);
            //消耗
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);

            this.emit(NotificationKey.HERO_UP_STAR, data.content.heroVo.heroBaseId);

            let heroVo = HeroManager.ins().getHeroVoByID(data.content.heroVo.heroBaseId);
            if (heroVo?.posId) {
                this.emit(NotificationKey.BATTLE_ATTR_CHANGED, data.content.heroVo.heroBaseId);
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, data.content.heroVo.heroBaseId);
            }

            AudioManager.ins().playSound(SoundType.shengjishengxing);
        }
    }

    /**
     * 槽位升级
     * 模块号：20	指令号：3
     */
    public recUpLevel(data: Vo.hero.UpLevelS2C, upStage: boolean): void {
        if (data.code >= 0) {
            let oldCommonLevel = FormationManager.ins().getCommonLevel();

            //更新槽位vo
            FormationManager.ins().updateSoltData(data.content.slotVo);
            //消耗
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
            if (upStage) {
                this.emit(NotificationKey.HERO_UP_STAGE, data.content.slotVo.slotBaseId);
            }

            this.emit(NotificationKey.HERO_UP_LEVEL, data.content.slotVo.slotBaseId);

            let posVo = FormationManager.ins().getPosVoById(data.content.slotVo.slotBaseId);
            if (posVo) {
                this.emit(NotificationKey.BATTLE_ATTR_CHANGED, posVo.heroId);
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, posVo.heroId);
            }

            let newCommonLV = FormationManager.ins().getCommonLevel();
            if (oldCommonLevel != newCommonLV) {
                let param: XJ.IHero.IHeroUpCommonLVParam = {
                    oldCommonLV: oldCommonLevel,
                    newCommonLV: newCommonLV,
                };
                this.emit(NotificationKey.HERO_UP_COMMON_LV, param);
                GameTimer.ins().once(1000, this, this.delayReportUpgrage); //定时器会自动覆盖
            }

            AudioManager.ins().playSound(SoundType.shengjishengxing);
        }
    }

    private delayReportUpgrage() {
        //上报共鸣等级提升
        this.emit(LoginNotificationKey.REPORT_DATA_TO_SDK, ReportDataType.upgradeRole);
    }

    /**
     * 槽位升阶
     * 模块号：20	指令号：4
     */
    public recUpStage(data: Vo.hero.UpStageS2C): void {
        if (data.code >= 0) {
            //TODO 在这里处理服务端返回的数据
            //更新槽位vo
            FormationManager.ins().updateSoltData(data.content.slotVo);
            //消耗
            this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults);
            this.emit(NotificationKey.HERO_UP_STAGE, data.content.slotVo.slotBaseId);

            let posVo = FormationManager.ins().getPosVoById(data.content.slotVo.slotBaseId);
            if (posVo) {
                this.emit(NotificationKey.BATTLE_ATTR_CHANGED, posVo.heroId);
                this.emit(NotificationKey.FIGHT_UPDATE_ONE_HERO, posVo.heroId);
            }

            AudioManager.ins().playSound(SoundType.shengjishengxing);
        }
    }

    /**
     * 皮肤穿戴
     * 模块号：20	指令号：5
     */
    public recSkinWear(data: Vo.hero.UseSkinS2C): void {
        if (data.code >= 0) {
            //更新英雄信息
            HeroManager.ins().updateHeroData(data.content);
            //消耗
            this.emit(NotificationKey.HERO_SKIN_WEAR, data.content);
            FacadeManager.ins().emit(NotificationKey.BATTLE_SKIN_CHANGED, data.content.heroBaseId);
        }
    }

    /**
     * 潜能升级
     * 模块号：20	指令号：6
     */
    public recUpDNALevel(data: Vo.hero.UpDnaLevelS2C, baseId: number): void {
        if (data.code >= 0) {
            HeroManager.ins().updateDNAInfo(data.content, baseId);
        }
    }

    /**
     * 潜能觉醒或者刷新
     * 模块号：20	指令号：7
     */
    public recAwakenDNA(data: Vo.hero.AwakenDnaS2C, c2s: Vo.hero.AwakenDnaC2S): void {
        if (data.code >= 0) {
            HeroManager.ins().updateAwakenInfo(data.content, c2s);
        }
    }

    /**
     * 替换潜能觉醒属性
     * 模块号：20	指令号：8
     */
    public recReplaceAwakenDNA(data: Vo.hero.ReplaceAwakenDnaS2C, c2s: Vo.hero.ReplaceAwakenDnaC2S) {
        if (data.code >= 0) {
            HeroManager.ins().updateAwakenReplaceInfo(data.content, c2s);
        }
    }

    /*********************************协议推送*********************************/
}
