import { Vec2 } from "cc";

/**宠物副本UI配置*/
export enum UIPetDungeonConfig {
    /**战斗失败*/
    PetDungeonBattleFailView = 'PetDungeonBattleFailView',
    /**战斗成功*/
    PetDungeonBattleWinView = 'PetDungeonBattleWinView',
    /**挑战界面*/
    PetDungeonChallengeWin = 'PetDungeonChallengeWin',
    /**主界面*/
    PetDungeonMainView = 'PetDungeonMainView',
    /**关卡界面*/
    PetDungeonMapView = 'PetDungeonMapView',
    /**选择英雄界面*/
    PetDungeonSelectHeroWin = 'PetDungeonSelectHeroWin',
    /**传送动画界面*/
    PetDungeonTransferAnimWin = 'PetDungeonTransferAnimWin',
    /**玩具宝箱界面*/
    PetDungeonToyBoxWin = 'PetDungeonToyBoxWin',
    /**玩具删除确认界面*/
    PetDungeonToyDelWin = 'PetDungeonToyDelWin',
    /**玩具信息界面*/
    PetDungeonToyInfoWin = 'PetDungeonToyInfoWin',
    /**玩具主界面*/
    PetDungeonToyWin = 'PetDungeonToyWin',
}

/**宠物副本传送数据*/
export interface IPetDungeonTransOpenArgs {
    /**传送点所在坐标*/
    transPointPos: Vec2;
    /**传送目的地坐标 没有就直接移动到moveToPos*/
    transTargetPos: Vec2;
    /**最终移动坐标*/
    endPos: Vec2;
}

/**宠物副本删除玩具确认*/
export interface IPetDungeonToyDelOpenArgs {
    /**玩具唯一id*/
    toyId: number;
    /**玩具配置id*/
    toyConfigId: number;
    /**确认回调*/
    okFunc: () => void;
    /**取消*/
    cancelFunc: () => void;
    /**本地记录key*/
    localKey: string;
}

/**玩具拖动来源*/
export enum PetDungeonToyDragFrom {
    /**玩具主界面格子中*/
    Main_Cell = 1,
    /**玩具主界面仓库中*/
    Main_Box = 2,
    /**玩具暂存宝箱*/
    Box = 3,
}

/**玩具图标开始拖动参数*/
export interface IPetDungeonToyIconStarParam {
    /**当前鼠标X坐标(世界坐标)*/
    mouseY: number;
    /**当前鼠标Y坐标(世界坐标)*/
    mouseX: number;
    /**拖动位置宽度百分比 (因为拖动出来的大小可能不同 所以用百分比定位)*/
    percentW: number;
    /**拖动位置高度百分比 (因为拖动出来的大小可能不同 所以用百分比定位)*/
    percentH: number;
}

/**玩具拖动参数*/
export interface IPetDungeonToyDragArgs extends IPetDungeonToyIconStarParam {
    /**玩具唯一id*/
    id: number;
    /**玩具配置id*/
    toyConfigId: number;
    /**拖动来源*/
    from: PetDungeonToyDragFrom;
    /**原本所在格子位置 没有就是-1*/
    lastCellIdx: number;
}

/**宠物副本玩具界面打开参数*/
export interface IPetDungeonToyOpenArgs {
    /**是否是自动打开*/
    isAutoOpen: boolean;
}

/**宠物副本暂存宝箱界面打开参数*/
export interface IPetDungeonToyBoxOpenArgs extends IPetDungeonToyOpenArgs {

}