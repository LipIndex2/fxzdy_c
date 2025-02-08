/**地图类型 */
export enum MapType {

}


/**
 * 地图层 关键字
 */
export enum MapLayerKey {
    /**ui对象层 */
    UI_LAYER = "ui_layer",
    /** 区域划分层 */
    AREA_LAYER = "area_layer",
    /**障碍对象层 */
    BLOCK_OBJECT_LAYER = "collider_layer",
    /**装饰物对象层 */
    DECORATION_LAYER = "ornament_layer",
    /**安全区对象层 */
    SAFEAREA_LAYER = "safearea_layer",
    /**角色渲染层 */
    ROLE_LAYER = "role_layer",
    /**角色对象层 */
    PLAYER_LAYER = "player_layer",
    /**引导对象层 */
    GUIDE_LAYER = "guide_layer",
    /**触发器对象层 */
    TRIGGER_LAYER = "trigger_layer",
    /**角色对象最底层 */
    UNDER_LAYER = "under_layer",
    /**地图拼接的连接信息 */
    CONNECT_LAYER = "connect_layer",
}

/**
 * 地图对象类型
 */
export enum MapObjectType {
    /** 建筑 */
    BUILDING = "building",
    /** 传送点 */
    TELEPORT = "teleport",
    /** 迷雾解锁 */
    MIST_UNLOCKED = "mist_unlocked",
    /** 主角出生点 */
    PLAYER = "player",
    /** 敌人出生点 */
    ENEMY = "enemy",
    /** 资源点（主线读MapResourceConfig表）（其他玩法读MonsterResourceConfig） */
    RESOURCES = "resources",
    /** 回城点 */
    BORN_PLACE = "born_place",
    /** 障碍 */
    BLOCK = "collider",
    /** 单位状态 */
    UNIT_POS = "unitPos",
    /** 门 */
    GATE = "gate",
    /** 解救英雄 */
    help_hero = "help_hero",
    /** 单向传送阵 */
    once_tp = "once_tp",
    /** 爆破楼（解锁刷怪） */
    create_monster = "create_monster",
    /** npc */
    npc = "npc",
    /** 宝箱 */
    box = "box",
    /** 高级一些的宝箱 */
    box_mid = "box_mid",
    /** 宝箱怪宝箱 */
    box_max = "box_max",
    /** 副本boss */
    instance = "instance",
    /**世界boss */
    world_boss = "world_boss",
    /**范围触发器 */
    TRIGGER = "trigger",
    /**火箭浣熊*/
    Raccoon = "raccoon",
    /**经营建筑*/
    stimulation = "stimulation",
    /**勘探工厂*/
    factories = "factories",
    /**勘探矿*/
    mine = "mine",
    /**秘境下一层传送点*/
    secretTP = "secretTP",
    /**地图上不显示的传送点*/
    teleportPoint = 'teleportPoint',
    /**工厂范围*/
    factories_area = "factories_area",
    /**宠物副本*/
    petinstance = "petinstance",
}

/**
 * 地图对象类型(可现实的建筑类型)
 */
export enum ObjectVisibleType {
    /** 建筑 */
    building = "building",
    /** 传送点 */
    teleport = "teleport",
    /** 迷雾解锁 */
    mist_unlocked = "mist_unlocked",
    /**门 */
    gate = "gate",
    /** 解救英雄 */
    help_hero = "help_hero",
    /** 单向传送阵 */
    once_tp = "once_tp",
    /** 爆破楼（解锁刷怪） */
    create_monster = "create_monster",
    /** npc */
    npc = "npc",
    /** 宝箱 */
    box = "box",
    /** 高级一些的宝箱 */
    box_mid = "box_mid",
    /** 宝箱怪宝箱 */
    box_max = "box_max",
    /** 副本boss */
    instance = "instance",
    /**世界boss */
    world_boss = "world_boss",
    /**火箭浣熊*/
    raccoon = "raccoon",
    /**经营建筑*/
    stimulation = "stimulation",
    /**勘探工厂*/
    factories = "factories",
    /**勘探矿*/
    mine = "mine",
    /**秘境下一层传送点*/
    secretTP = "secretTP",
    /**工厂范围*/
    factories_area = "factories_area",
    /**宠物副本*/
    petinstance = "petinstance",
}


export enum ResourceType {
    // 怪物
    MONSTER = "MONSTER",
    // 矿
    MINERAL = "MINERAL",
    //宝箱
    Box = "BOX",
}

export enum MoveCameraType {
    /** 任务 */
    TASK = "task",
    /** 引导 */
    GUIDE = "guide",
    /** 镜头锁定的移动 */
    FIGHT_LOCK_MOVE = "FIGHT_LOCK_MOVE",
    /** 战斗锁定镜头后的主动移动 */
    FIGHT_LOCK_CTRL_MOVE = "FIGHT_LOCK_CTRL_MOVE",
}


export enum AStarEnum {
    /** 走动所需的最小值 */
    WALK_MIN_VALUE = 1,
}