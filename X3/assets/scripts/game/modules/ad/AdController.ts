import { sys } from "cc";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { NativeAPI } from "../../../core/native/NativeAPI";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { UIGainKeys } from "../gain/const/UIGainKeys";
import { MallController } from "../mall/MallController";
import { UIMapKey } from "../map/const/UIMapConfig";
import { UIADConfig } from "./const/UIADConfig";
import { IAdPlayVo } from "./model/vo/IAdPlayVo";

export class AdController extends BaseController {

    protected _cachePlayVos: Map<ServerEnums.AdvertType, IAdPlayVo> = new Map()

    listenNotifications(): string[] {
        return [
            NotificationKey.AD_START_PLAY,
            NotificationKey.AD_REWARD_ARRIVE,
            NotificationKey.AD_GET_REWARD_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.AD_START_PLAY:
                if (args) {
                    let vo = args as IAdPlayVo
                    if (vo && vo.type) {
                        this._cachePlayVos.set(vo.type, vo)
                        this.playAd(vo)
                    }
                }
                break
            case NotificationKey.AD_REWARD_ARRIVE:
                if (args) {
                    let type: number = Number(ServerEnums.AdvertType[args])
                    if (type) {
                        this.playAdComplete(type)
                    }
                }
            case NotificationKey.AD_GET_REWARD_COMPLETE:
                this.handleGetRewardComplete(args);
                break;
        }
    }

    protected handleGetRewardComplete(type: ServerEnums.AdvertType): void {
        switch (type) {
            case ServerEnums.AdvertType.TRUNK_MAP_BOX_DOUBLE_REWARD:
                G.UIManager.close(UIGainKeys.GainItemPopUpView)
                break
            case ServerEnums.AdvertType.TRUNK_MAP_BOSS_EXTRA_REWARD:
                G.UIManager.close(UIMapKey.MAP_BOSS_FIRST_KILL)
                break
        }
    }

    protected playAd(vo: IAdPlayVo): void {
        if (GIns.monthCardModel.isAciveByType(ServerEnums.MonthCardType.FOREVER)) {
            //激活了终身卡 直接跳过广告
            this.playAdComplete(vo.type)
        } else {
            if (GIns.adModel.isShowTip) {
                //弹出购买提示
                G.UIManager.open(UIADConfig.AdPlayTipWin, vo)
            } else {
                if (sys.isBrowser) {
                    this.playAdComplete(vo.type)
                } else {
                    //调用播放广告sdk
                    NativeAPI.showAd(ServerEnums.AdvertType[vo.type])
                }
            }
        }
    }

    public playAdComplete(type: ServerEnums.AdvertType): void {
        if (this._cachePlayVos.has(type)) {
            let vo = this._cachePlayVos.get(type)
            switch (type) {
                case ServerEnums.AdvertType.MALL:
                    MallController.ins().buyMallById(Number(vo.param), true)
                    break
                case ServerEnums.AdvertType.SHOP:
                    GIns.shopModel.buyGoodsById(Number(vo.param), 1, true)
                    break
                case ServerEnums.AdvertType.WEAPON_RECRUIT:
                    GIns.drawCardModel.sendAddAwakeWeaponNormalAdvertTimes()
                    break
                case ServerEnums.AdvertType.FAST_HANG_UP:
                    GIns.hangUpModel.sendDrawHangUpAdvertReward()
                    break
                case ServerEnums.AdvertType.TRUNK_MAP_BOX_DOUBLE_REWARD:
                    GIns.mapModel.sendDrawBoxBuildingAdvertReward({ boxBuildingId: vo.extra.extra.buildingId }, vo.extra);
                    break
                case ServerEnums.AdvertType.TRUNK_MAP_BOSS_EXTRA_REWARD:
                    GIns.mapModel.sendDrawMapBossAdvertReward({ mapBossResourceConfigId: vo.extra })
                    break
                case ServerEnums.AdvertType.MAIN_CITY_RANDOM_BOX_REWARD:
                    GIns.mapModel.sendDrawMainCityAdvertBox()
                    break
                case ServerEnums.AdvertType.DAILY_BOSS:
                    GIns.dailyBossModel.sendAddAdvertChallengeTimes()
                    break
                case ServerEnums.AdvertType.REFRESH_PET_DUNGEON_TOY_BOX:
                    GIns.petDungeonModel.sendRefreshToyBox({ advert: true });
                    break;
                case ServerEnums.AdvertType.NORMAL_RECRUIT:
                    GIns.drawCardModel.sendNormalRecruit({ oneKey: false, advert: true });
                    break;
                case ServerEnums.AdvertType.SECRET_INSTANCE:
                    GIns.secretAreaModule.sendSweep(vo.extra, 1, true);
                    break;
                case ServerEnums.AdvertType.COLLECTIBLES_DUNGEON:
                    GIns.collectiblesDungeonModel.sendAddAdvertCount();
                    break;
                case ServerEnums.AdvertType.LEAGUE_BOSS:
                    GIns.LeagueModel.sendAddAdvertBossCount();
                    break;
                case ServerEnums.AdvertType.STIMULATION_DEVICE_UP_LEVEL:
                    GIns.stimulationModel.sendAdShortenUpLevelWait({ deviceId: vo.extra });
                    break;
            }
            this._cachePlayVos.delete(type)
        }
    }

    public openDailyAdBox(): void {
        if (GIns.mapVisibleMgr.isAdvertBoxShow()) {
            G.UIManager.open(UIADConfig.AdDailyRewardWin)
        }
    }
}

AdController.ins().doInit();