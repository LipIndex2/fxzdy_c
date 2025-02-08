import { AbnormalType } from "../skill/SkillEnum";

export class AbnormalStatus {
   /**异常状态 */
   private _timeMap: { [key: number]: number } = {};

   /**设置异常状态 */
   setStatus(type: AbnormalType, param?: any) {
      if (!this._timeMap[type])
         this._timeMap[type] = 0;
      this._timeMap[type]++;
   }

   /**清理状态 */
   cleanStatus(type: AbnormalType) {
      if (this._timeMap[type])
         this._timeMap[type]--;
      if (!this._timeMap[type])
         delete this._timeMap[type];
   }

   /**清除所有1个异常状态 */
   public clearAllAbnormalStatusByType(type: AbnormalType) {
      let num = this._timeMap[type];
      delete this._timeMap[type]
      return num
   }

   hasStatus(type: AbnormalType): boolean {
      if (this._timeMap[type])
         return true
      return false;
   }
}