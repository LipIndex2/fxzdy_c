import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PostI18nKeys } from "db://assets/scripts/game/modules/chat/PostI18nKeys";
import G from "../../../../core/comm/G";
import { KvTemplate } from "../../../../core/utils/KvTemplate";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { SeasonConfigManager } from "../../season/SeasonConfigManager";
import { SeasonManager } from "../../season/SeasonManager";
import { PostVo } from "../vo/PostVo";

/**
 * 跑马灯
 */
export class PostContext implements INotification {
    protected _vos: PostVo[] = []


    listenNotifications(): string[] {
        return [
            NotificationKey.ENTER_WORLD_COMPLETE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.ENTER_WORLD_COMPLETE: {
                // 游戏提示
                const postVo = new PostVo();
                postVo.byStyle = 1
                postVo.createTime = Date.now();
                postVo.content = PostI18nKeys.enterGameTips;
                // this.addClientPostVo(postVo)
                break;
            }

        }
    }

    public reset(): void {
        this._vos.length = 0
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
    }

    public addServerPostVo(vo: Vo.chat.PostVo) {
        let isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.POST)
        if (isOpen == false) {
            //未开启跑马灯
            return
        }
        let postVo = new PostVo()
        postVo.createTime = Date.now()
        if (vo.gm) {
            postVo.content = vo.txt;
            postVo.byStyle = 1
        } else {
            let cfg = G.TableManager.getDataById(table.chat.PostConfig, vo.id)
            if (cfg) {
                postVo.byStyle = cfg.bgStyle
                if (this.isPostValid(cfg, vo)) {
                    postVo.content = this.parsePostContent(cfg, vo)
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        this.addClientPostVo(postVo);
    }

    addClientPostVo(vo: PostVo) {
        if (!vo) {
            return;
        }

        this._vos.push(vo);
        FacadeManager.ins().emit(NotificationKey.CHAT_POST_UPDATE);
    }

    /**公告是否有效 主要判断相关功能是否开启*/
    public isPostValid(cfg: table.chat.PostConfig, vo: Vo.chat.PostVo): boolean {
        let isValid: boolean = true
        let type = ServerEnums.PostType[cfg.type]
        switch (type) {
            case ServerEnums.PostType.PLAY_START:
            case ServerEnums.PostType.PLAY_WAIT_END:
            case ServerEnums.PostType.PLAY_END: {
                isValid = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(vo.termVo.systemType)
            }
                break
            case ServerEnums.PostType.ACTIVITY_START:
            case ServerEnums.PostType.ACTIVITY_WAIT_END:
            case ServerEnums.PostType.ACTIVITY_END:
            case ServerEnums.PostType.RUSH_RANK_WAIT_SETTLE:
            case ServerEnums.PostType.RUSH_RANK_SETTLE: {
                //去除活动开启限制
                // isValid = ActivityController.ins().isActivityUnlock(vo.termVo.activityId)
            }
                break
        }
        return isValid
    }

    public parsePostContent(cfg: table.chat.PostConfig, vo: Vo.chat.PostVo): string {
        let content = ''
        let descCfg = G.TableManager.getDataById(table.chat.PostDescConfig, cfg.type)
        let params: string[] = null
        if (descCfg) {
            content = descCfg.desc
            let type = ServerEnums.PostType[cfg.type]
            switch (type) {
                case ServerEnums.PostType.ASSIGN_TITLE_LOGIN: {
                    let titleCfg = G.TableManager.getDataById(table.set.SetShowConfig, vo.termVo.titleId)
                    let titleName: string = titleCfg ? titleCfg.name : ''
                    let nickName: string = vo.termVo.playerName ? vo.termVo.playerName : ''
                    params = [titleName, nickName]
                }
                    break
                case ServerEnums.PostType.CHARGE_BUY: {
                    let nickName: string = vo.termVo.playerName ? vo.termVo.playerName : ''
                    let orderCfg = G.TableManager.getDataById(table.order.ChargeGoodsConfig, vo.termVo.chargeGoodsConfigId)
                    let chargeName: string = orderCfg ? orderCfg.goodsName : ''
                    let itemDesList: string[] = []
                    orderCfg?.rewards?.forEach((value) => {
                        let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, value.k)
                        if (itemCfg) {
                            let itemName: string = G.I18nManager.lang(itemCfg.name)
                            itemDesList.push(`<color=${ItemUtils.getTextColorByQualityCfg(itemCfg.quality).toCSS("#rrggbb")}>【${itemName}x${value.v}】</color>`)
                        }
                    })
                    let itemDes = itemDesList.join(',')
                    params = [nickName, chargeName, itemDes]
                }
                    break
                case ServerEnums.PostType.SHOP_BUY: {
                    let nickName: string = vo.termVo.playerName ? vo.termVo.playerName : ''
                    let shopCfg = G.TableManager.getDataById(table.shop.ShopGoodsConfig, vo.termVo.shopGoodsConfigId)
                    let shopName: string = shopCfg ? shopCfg.name : ''
                    params = [nickName, shopName]
                }
                    break
                case ServerEnums.PostType.PLAY_START:
                case ServerEnums.PostType.PLAY_WAIT_END:
                case ServerEnums.PostType.PLAY_END: {
                    let type = ServerEnums.SystemType[vo.termVo.systemType]
                    let sysCfg = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, type)
                    let sysName: string = sysCfg ? sysCfg.showName : ''
                    params = [sysName]
                }
                    break
                case ServerEnums.PostType.ACTIVITY_START:
                case ServerEnums.PostType.ACTIVITY_WAIT_END:
                case ServerEnums.PostType.ACTIVITY_END:
                case ServerEnums.PostType.RUSH_RANK_WAIT_SETTLE:
                case ServerEnums.PostType.RUSH_RANK_SETTLE: {
                    let activityCfg = G.TableManager.getDataById(table.activity.ActivityConstant.ActivityConfig, vo.termVo.activityId)
                    let activityName: string = activityCfg ? activityCfg.name : ''
                    let nickName: string = vo.termVo.playerName ? vo.termVo.playerName : ''
                    params = [activityName, nickName]
                }
                    break
                case ServerEnums.PostType.SUB_SEASON_ACTIVITY_STARTED:
                case ServerEnums.PostType.SUB_SEASON_ACTIVITY_STOP:
                    //赛季子活动结束,参数:SubSeasonActivityConfig的Id
                    const subSeasonActivityId = vo.termVo.subSeasonActivityId
                    const subcfg = SeasonConfigManager.getSubConfigById(subSeasonActivityId);
                    const index = SeasonManager.ins().getMenuInfo(subSeasonActivityId);
                    params = [index ? index + '' : '', subcfg?.name || ''];

                    break;
                case ServerEnums.PostType.SUB_SEASON_ACTIVITY_RUSH_RANK_SETTLE:
                    break;
                case ServerEnums.PostType.CAREER_RECRUIT_GAIN_ASSIGN_QUALITY_HERO: {
                    let nickName: string = vo.termVo.playerName ? vo.termVo.playerName : ''
                    let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, vo.termVo.itemId);
                    let itemName: string = itemCfg ? G.I18nManager.lang(itemCfg.name) : '';
                    params = [nickName, itemName];
                }
                    break;
            }
        }
        if (params) {
            let kvMap: Map<string, string> = new Map()
            params.forEach((value, index) => {
                kvMap.set('key' + index, value)
            })
            content = KvTemplate.create(content, kvMap).render()
        }

        return content
    }

    public get vos(): PostVo[] {
        return this._vos;
    }
}