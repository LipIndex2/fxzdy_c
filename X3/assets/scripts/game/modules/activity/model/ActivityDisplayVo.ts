import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";



/** 
 * 纯展示vo
 */
export class ActivityDisplayVo extends BaseActivityVo {
    public get stateVo(): any {
       return Vo.activity.ActivityStateVo;
    }

    public get activityVo(): any {
        return this.content;
    }

   

}