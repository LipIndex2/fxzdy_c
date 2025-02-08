/**章节信息*/
export interface ICollectiblesDungeonChapterVo {
    /**章节id*/
    chapterId: number;
    /**关卡id列表*/
    levelIds: number[];
    /**章节当前星级*/
    curStar: number;
    /**章节最高星级*/
    maxStar: number;
    /**是否领取奖励 key星级 value是否领取*/
    rewardStateMap: Map<number, boolean>;
}