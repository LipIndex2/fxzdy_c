import { ServerEnums } from "../../../../../libs/extras/ServerEnums";

export interface IAdPlayVo {
    type:ServerEnums.AdvertType
    param?:string
    extra?:any
}