import { Color } from "cc";
import { FightType } from "../../../comm/battle/enum/FightType";

/** 布阵 */
export enum UIFormationKey {
    /** 布阵主页 */
    FORMATION_MAIN_VIEW = "FormationMainView",
    /** 阵营羁绊 */
    CAMP_FETTER_WIN = "CampHaloWin",
    /** 职业羁绊 */
    CAREER_FETTER_WIN = "CareerFetterWin",
    /** 布阵推荐 */
    FORMATION_REC_VIEW = "FormationRecView",
    /** 防守布阵 */
    FormationDefendView = "FormationDefendView",
}

/**排除参数*/
export interface FormationMainViewOpenArgsExcludeParam {
    tip: string
    tipColor?: Color
}

export class FormationMainViewOpenArgs {
    // 阵容类型
    type: FightType;
    // 子类型
    subType: string;
    // 位置 vo
    posVos: Vo.formation.PositionVo[];
    // 布阵标题
    title: string;
    // 需要排除的英雄附带提示列表
    excludes: Map<number, FormationMainViewOpenArgsExcludeParam> = null;
    // 需要排除的收藏品列表
    excludeCollectionsIds: number[] = null;
    // 需要排除的宠物列表
    excludePetIds: number[] = null;
    // 关闭回调 将设置的阵容返回
    okFunc:(vo:Vo.formation.SetupFormationReqVo) => void;
    // 不发送给服务器保存
    notSendToServer:boolean = true;
    /**其他打开时需要用到的参数*/
    param?:any;
    static create(type: FightType,
        subType: string = null,
        posVos: Vo.formation.PositionVo[] = null,
        excludes: Map<number, FormationMainViewOpenArgsExcludeParam> = null,
        excludeCollectionsIds: number[] = null,
        excludePetIds:number[] = null,
        title: string = null,
        okFunc:(vo:Vo.formation.SetupFormationReqVo) => void = null,
        notSendToServer:boolean = false,
        param:any = null
    ): FormationMainViewOpenArgs {
        const args = new FormationMainViewOpenArgs();
        args.type = type;
        args.subType = subType;
        args.posVos = posVos;
        args.excludes = excludes;
        args.excludeCollectionsIds = excludeCollectionsIds;
        args.excludePetIds = excludePetIds;
        args.title = title;
        args.okFunc = okFunc;
        args.notSendToServer = notSendToServer;
        args.param = param;
        return args;
    }
}

/**布阵推荐打开参数*/
export class FormationRecViewOpenArgs {
    fightType: FightType;
    // 子类型
    subType: string;
    collectionsId: number;
    petId:number
    
    static create(fightType: FightType,
        subType: string = null,
        collectionsId: number = 0,
        petId:number = 0
    ): FormationRecViewOpenArgs {
        const args = new FormationRecViewOpenArgs();
        args.fightType = fightType;
        args.subType = subType;
        args.collectionsId = collectionsId;
        args.petId = petId;
        return args;
    }
}