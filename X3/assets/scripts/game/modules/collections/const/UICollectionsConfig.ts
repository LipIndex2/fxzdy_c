
/** 藏品 */
export enum UICollectionsKey {
    /** 藏品主界面 */
    MAIN_VIEW = "CollectionsMainView",
    /** 藏品页面 */
    ITEM_SUB_PAGE =  "CollectionsItemsSubPage",
    /** 藏品套装界面 */
    SET_SUB_PAGE = "CollectionsSetSubPage",
    /** 藏品招募界面 */
    HUB_SUB_PAGE = "CollectionsHubSubPage",
    /** 激活弹窗 */
    SET_ACTIVE_WIN = "CollectionsSetActiveWin",
    /** 藏品信息弹窗，升星，升级 */
    COLLECTION_INFO = "CollectionInfoWin",
    /** 升级升星提示 */
    UP_TIP_WIN = "CollectionsUpTipsWin",
    /** 技能描述弹窗 */
    SKILL_INFO_WIN = "CommonCollectionSkillInfoWin",
}


//关联fgui里面的控制器，控制颜色
export enum ECQualityColor {
    q3 = 1,
    q4 = 2,
    q5 = 3,
    q6 = 4,
    q7 = 5,
}

export let quality2DiCol = {
    3: ECQualityColor.q3,
    4: ECQualityColor.q4,
    5: ECQualityColor.q5,
    6: ECQualityColor.q6,
    8: ECQualityColor.q7,
}

//收藏品技能作用对象
export enum ECollectiblesSkillTargetType {
    HERO = "HERO",  //英雄
    COLLECTIBLES = "COLLECTIBLES", //收藏品
}