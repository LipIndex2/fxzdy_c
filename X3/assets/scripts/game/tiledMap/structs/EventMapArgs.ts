import { Vec2 } from "cc";


/**
 * 队伍位置更新事件参数
 * 1. 引导. 移动镜头用
 */
export class EventTeamPositionUpdateWithTweenArgs {
    // 地图中的相对位置
    positionInMap: Vec2;
}