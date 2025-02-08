/**
 * 固定奖励箱子的奖励单个对象结构
 *
 * 对应配置 = BoxFixedRewardConfig.rewardArray
 */
export class BoxFixedRewardItemConfigVo {

    // 道具id
    itemId: number
    // 数量
    amount: number

    static create(itemId: number, amount: number): BoxFixedRewardItemConfigVo {
        const vo = new BoxFixedRewardItemConfigVo();
        vo.itemId = itemId
        vo.amount = amount
        return vo
    }
}