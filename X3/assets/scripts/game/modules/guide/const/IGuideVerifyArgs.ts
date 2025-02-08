import { GuideVerifyType } from "./GuideEnum";

export interface IGuideVerifyArgs {
    /**类型 */
    type: GuideVerifyType,
    /**参数 */
    args: any
}