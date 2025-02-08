import G from "../../../../core/comm/G";
import { TableManager } from "../../../../core/table/TableManager";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import { PetGiftConfigManager } from "../petGift/config/PetGiftConfigManager";

export class ActivityPetGiftVo extends BaseActivityVo {
 
 

    /**活动对应的vo数据  */
    public get activityVo(): Vo.activity.PetGiftVo {
        return this.content as Vo.activity.PetGiftVo;
    
    }

    /** 当前活动开启天数 */
    public get openDay(): number {
        return this.getPassDays();
    }

    /**获取默认选中 */
    public getChooseDay(actid:number):number{
        //活动开启天数
        let cfgs: table.activity.PetGift.PetGiftConfig[] = PetGiftConfigManager.getDayInfoByActivityId(actid);
        for(let i = cfgs.length - 1; i >=0 ; i--){
            const cfg = cfgs[i];
            if(this.isGiftOpen(cfg.id)){
                //已开启，判断是否已经购买到最大数量
                if(!this.isLimit(cfg.id)){
                    //还可以购买
                    return cfg.openDay;
                }
            }
        }
        return cfgs[0].openDay;
    }

    /**是否已经购买指定礼包到最大值 */
    public isLimit(id:number):boolean{
        const cfg = TableManager.getDataById(table.activity.PetGift.PetGiftConfig, id);
        const vo:Vo.activity.PetGiftVo = this.activityVo;
        const num = cfg.buyNumLimit;
        const alreadyNum = vo.giftId2BuyNum?.[id] ? vo.giftId2BuyNum?.[id] : 0;
        if(num <= alreadyNum){
            //还可以购买
            return true;
        }
        return false;
    }

    /**是否已经开放该礼包 */
    public isGiftOpen(id:number){
        const openDay = this.openDay;
        const cfg = TableManager.getDataById(table.activity.PetGift.PetGiftConfig, id);
        if(cfg.openDay <= openDay){
            return true;
        }
        return false;
    }


    /**活动是否过期 */
    public isActivityOver(): boolean {
        if(!(this.endTime > G.TimeManager.serverNow)){
            return true;
        }

        if(this.isDone()){
            return true;
        }

        return false;
    }

    /**是否已经全部购买 */
    public isFinishBuy(actid):boolean{
        let cfgs: table.activity.PetGift.PetGiftConfig[] = PetGiftConfigManager.getDayInfoByActivityId(actid);
        for(let i = cfgs.length - 1; i >=0 ; i--){
            const cfg = cfgs[i];
            if(this.isGiftOpen(cfg.id)){
                //已开启，判断是否已经购买到最大数量
                if(!this.isLimit(cfg.id)){
                    //还可以购买
                    return false;
                }
            }else{
                return false;
            }
        }
        return true;
    }
 
    
}