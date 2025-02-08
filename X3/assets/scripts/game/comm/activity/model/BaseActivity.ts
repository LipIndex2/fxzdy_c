/**
 * 活动基类
 */
export abstract class BaseActivity {
    /** 活动id */
    public activityId: number;

    /**可覆写--是否显示红点-写入对应活动的红点判断方法 */
    public isShowRed(): boolean {
        return false;
    }

    /** 可覆写--根据UIView判断是否显示红点-写入对应活动页面的红点判断方法 */
    public isShowRedOfUIView(UIView: string): boolean {
        return false;
    }

    /**可覆写--验证活动是否开启--功能开启验证 */
    public isOpen(showTip?: boolean): boolean {
        return true;
    }

    /**可覆写-活动是否结束 */
    public isActivityOver(): boolean {
        return false;
    }

    /**可覆写--活动入口是否展示-写入对应活动的显示隐藏逻辑 */
    public isShowEntrance(): boolean {
        return true;
    }

    /**可覆写--检查对应活动是否买完了当前可购买的所有充值项目 --默认返回 false*/
    public isBuyedAllChargeItems(): boolean {
        return false;
    }

    /**必须实现--构建一个活动入口item使用的vo-写入对应活动的活动入口vo
     * @returns ComActivityItemVo
     */
    // public abstract getItemInfo(): ComActivityItemVo;

    /**获取自定义的活动icon或活动时间信息---如果使用自定义，将每秒调用一次
     * @see ComActivityItemVo.useCustomizeIconOrTimes 需先设置值为true，并实现getIconOrTimes()方法
     * @returns ComActivityItemIconOrTimes
     */
    // public getIconOrTimes(): ComActivityItemIconOrTimes { return; }

    /**更新活动vo 子类可以重写*/
    public updateVo(updateType: string, updateVal: string, additional: any): void {}

    /**自定义处理 */
    public customHandle(content: Vo.cost.CostAndRewardVo): void {}
}
