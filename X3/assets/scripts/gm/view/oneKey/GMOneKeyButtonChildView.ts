import { Color, Input, profiler } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LongForNetwork } from "db://assets/scripts/core/prototypes/LongForNetwork";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { EmailModel } from "db://assets/scripts/game/modules/email/model/EmailModel";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { BtnGmView } from "db://assets/scripts/gm/view/common/BtnGmView";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import { HeroModel } from "db://assets/scripts/game/modules/hero/model/HeroModule";
import * as fgui from "fairygui-cc";
import { UIManager } from "../../../core/mvc/UIManager";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../../game/GIns";
import { MapObjectType } from "../../../game/tiledMap/MapEnum";
import { MapManager } from "../../../game/tiledMap/MapManager";
import { MapModel } from "../../../game/tiledMap/model/MapModule";
import { BuildingNode } from "../../../game/tiledMap/ui/BuildingNode";
import { GateNode } from "../../../game/tiledMap/ui/GateNode";
import { UIJoystickKey } from "../../../game/ui/joystick/const/UIJoystickConfig";
import { GuideManager } from "../../../game/modules/guide/GuideManager";
import { UIGmKeys } from "../../const/UIGmKeys";

// GM 一键按钮配置
export interface GMOneKeyButtonConfig {
    name: string;
    fontColor?: Color
    clickCallback: Function;
}

/**
 * GM 一键
 */
export class GMOneKeyButtonChildView extends fgui.GComponent {


    private _filterConfigArray: GMOneKeyButtonConfig[] = [];


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMOneKeyButtonChildView";

    // endregion

    // 按钮配置
    private static readonly GM_ONE_KEY_BUTTON_ARRAY: GMOneKeyButtonConfig[] = new Array<GMOneKeyButtonConfig>(
        {
            name: "刷新后端Server",
            fontColor: new Color("#FF0000"),
            clickCallback: () => {
                console.log("[刷新后端Server] 更新并重新加载资源")
                GmModel.ins().sendUpdateAndReloadResource()
            }
        },
        {
            name: "一键通过所有新手引导",
            clickCallback: () => {
                this.passAllNewPlayerGuide();
            },
            fontColor: ColorUtils.COLOR_GREEN
        },
        {
            name: "一键升级英雄",
            clickCallback: () => {
                this.lvUpAllHero();

            },
            fontColor: ColorUtils.COLOR_BLUE
        },
        {
            name: "一键榜一大哥",
            clickCallback: () => {
                console.log("[一键榜一大哥] todo")

                this.passAllNewPlayerGuide();

                GmModel.ins().gainAllHero();


            }
        },
        {
            name: "一键获取所有Hero",
            fontColor: ColorUtils.COLOR_PURPLE,
            clickCallback: () => {
                GmModel.ins().gainAllHero();
            }
        },
        {
            name: "开关network报错飘字",
            clickCallback: () => {
                G.networkDebugFlag = !G.networkDebugFlag
                GIns.floatingTextMgr.showTips(`网络报错状态 = ${G.networkDebugFlag}`)
            }
        },
        {
            name: "一键清空背包道具",
            clickCallback: () => {
                GmModel.ins().clearPlayerBackpack()
            },
            fontColor: ColorUtils.COLOR_BROWN
        },
        {
            name: "[主线任务]当前任务进度+1",
            clickCallback: () => {
                GmModel.ins().add1ForCurrentTrunkTaskProgress()
            }
        },
        {
            name: "[主线任务]开启自动领奖模式",
            clickCallback: () => {
                GmModel.ins().setAutoTurnkTask()
            },
            fontColor: ColorUtils.COLOR_GREEN
        },
        {
            name: "[每日任务]一键完成",
            clickCallback: () => {
                GmModel.ins().oneKeyFinishAllDailyTask()
            }
        },
        {
            name: "[每日任务]随机完成1个",
            clickCallback: () => {
                GmModel.ins().completeRandomOneDailyTask()
            }
        },
        {
            name: "[成就任务]一键完成",
            clickCallback: () => {
                GmModel.ins().oneKeyFinishAllAchieveTask()
            }
        },
        {
            name: "[成就任务]随机完成1个",
            clickCallback: () => {
                GmModel.ins().completeRandomOneAchieveTask()
            }
        },
        {
            name: "[挂机] 通关当前关卡",
            clickCallback: () => {
                GmModel.ins().passNextHangUpLevel()
            },
            fontColor: ColorUtils.COLOR_ORANGE
        },
        {
            name: "打印服务器时间",
            clickCallback: () => {
                GIns.floatingTextMgr.showTips("服务器时间 = " + DateUtils.dateTimeFormat(G.TimeManager.serverNow))
            }
        },
        {
            name: "开关CocosDebug模式",
            clickCallback: () => {
                const isShow = profiler.isShowingStats();
                if (isShow) {
                    profiler.hideStats()
                } else {
                    profiler.showStats()
                }
                const tips = isShow ? "关闭CocosDebug模式" : "开启CocosDebug模式"
                GIns.floatingTextMgr.showTips(tips)
            }
        },
        {
            name: "建筑位置编辑",
            clickCallback: () => {
                GIns.floatingTextMgr.showTips("建筑位置编辑已开启，切换地图后生效");

                let view = UIManager.ins().getViewInstance(UIJoystickKey.JOYSTICK_VIEW);
                view._view.y = view._view.height / 3 * 2; // 摇杆区域减到三分之一
                //view._view.touchable = false;

                GateNode.prototype.onInit = function () {
                    this.view.emptyBtn.on(Input.EventType.TOUCH_END, () => {
                        UIManager.ins().open(UIGmKeys.BuildingEditorView, {
                            com: this,
                            mapObject: this.mapObject,
                            path: this.cfg.building_spine
                        });
                    }, this);
                }

                BuildingNode.prototype.onInit = function () {
                    this.view.emptyBtn.on(Input.EventType.TOUCH_END, () => {
                        UIManager.ins().open(UIGmKeys.BuildingEditorView, {
                            com: this,
                            mapObject: this.mapObject,
                            path: this.cfg.building_spine
                        });
                    }, this);
                }
            }
        },
        {
            name: "地图信息",
            clickCallback: () => {
                UIManager.ins().close(UIGmKeys.GMView);
                UIManager.ins().open(UIGmKeys.MapInfoView);
            }
        },
        {
            name: "发送奖励邮件给自己",
            clickCallback: () => {
                const currentDateTimeText = G.TimeManager.getServerTimeString()
                GmModel.ins().sendSendEmail({
                    title: "[GM] 测试奖励邮件:" + currentDateTimeText,
                    content: "[color=#DDFBFF]测试奖励邮件 - " + currentDateTimeText + " \n  \nDemo\n\n感谢你的参与！[/color]",
                    rewards: [
                        { code: 5, amount: 10 },
                        { code: 1001, amount: 10 },
                        { code: 10001, amount: 10 },
                    ],
                    // 过期分钟 Long
                    expireMinutes: LongForNetwork.fromNumber(60)
                })

            }
        },
        {
            name: "发送文本邮件给自己",
            clickCallback: () => {
                const currentDateTimeText = G.TimeManager.getServerTimeString()
                GmModel.ins().sendSendEmail({
                    title: "[GM] 测试文本邮件:" + currentDateTimeText,
                    content: `[color=#DDFBFF][color=#00FFFF][url=https://www.baidu.com]调查问卷[/url][/color] \n  \nDemo\n\n感谢你的参与！ [/color]`,
                    rewards: [],
                    // 过期分钟 Long
                    expireMinutes: LongForNetwork.fromNumber(60)
                })

            }
        },
        {
            name: "发送模板邮件1给自己",
            clickCallback: () => {
                const currentDateTimeText = G.TimeManager.getServerTimeString()
                GmModel.ins().sendSendTemplateEmail({
                    templateId: 51,
                    rewards: [
                        { code: 1, amount: 10 },
                    ],
                    termVo: {
                        id: 9999,
                        playerName: "测试模板邮件1",
                        content: "demo",
                        itemId: 1,
                        itemList: [],
                        activityId: 1010,
                        arenaRankConfigId: 1,
                        rank: 1,
                        fundId: 1,
                        setShowId: 1000,
                        teamInstanceConfigId: 101,
                    }
                } as any);
            }
        },
        {
            name: "一键清空邮件",
            clickCallback: () => {
                EmailModel.ins().clearAllEmail()

            }
        },
        {
            name: "一键屏蔽功能检测",
            clickCallback: () => {
                GmModel.ins().delFuncCheck();
            }
        },
        {
            name: "一键解锁所有传送阵",
            clickCallback: () => {
                let allGateCfg = TableManager.getAllData(table.map.MapBuildingConfig);
                for (let cfg of allGateCfg) {
                    if (cfg && (cfg.building_type == MapObjectType.TELEPORT || cfg.building_type == MapObjectType.MIST_UNLOCKED)) {
                        if (!MapManager.ins().getBuildingUnlockById(cfg.id)) {
                            MapModel.ins().sendUnlockBuilding(cfg.id);
                        }
                    }
                }
            }
        },
        {
            name: "攻击加速",
            clickCallback: () => {
                GmModel.ins().setBattleSpeed();
            }
        },
        {
            name: "一键刷新资源点",
            clickCallback: () => {
                GmModel.ins().sendRefreshMapResource();
            }
        },
        {
            name: "热更新",
            clickCallback: () => {
                UIManager.ins().open(UIGmKeys.SetHotUpdateView);
            }
        },
        {
            name: "性能",
            clickCallback: () => {
                UIManager.ins().open(UIGmKeys.PerformanceView);
            }
        },
        {
            name: "视频调试",
            clickCallback: () => {
                UIManager.ins().open(UIGmKeys.GMVideoView);
            }
        },
        {
            name: "增加收藏品副本次数",
            clickCallback: () => {
                GmModel.ins().sendAddCollectiblesDungeonCount({ count: 10, sweepCount: 1 });
            }
        },
    )


    private static passAllNewPlayerGuide() {
        console.log("[一键通过所有新手引导] go")

        GmModel.ins().sendUpdateGuide();

        GIns.floatingTextMgr.showTips("需要重新登录! 1s后重新登录!");

        GameTimer.ins().once(1000, this, () => {
            window.location.reload();
        })
    }

    private static lvUpAllHero() {
        console.log("[升级6个英雄] go")

        GmModel.ins().sendGmSendReward({
            code: 5,
            num: 10000000
        });
        GmModel.ins().sendGmSendReward({
            code: 6,
            num: 10000000
        });

        const array = [2110, 2310, 2220, 3240, 3320, 4130];
        for (let itemId of array) {
            const isHave = HeroManager.ins().isHaveHero(itemId)
            if (isHave) {
                continue;
            }
            GmModel.ins().sendGmSendReward({
                code: itemId,
                num: 1
            });

        }

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                for (let i = 0; i < 10; i++) {
                    for (let slotId = 1; slotId < 7; slotId++) {
                        const isCan = HeroManager.ins().isSlotIdCanLvUp(slotId);
                        if (isCan) {
                            HeroModel.ins().sendUpLevel(slotId);
                        } else {
                            HeroModel.ins().sendUpStage(slotId);
                        }
                    }
                }
            }, i * 2000);
        }
    }

    private get view(): ui.gm.oneKey.GMOneKeyButtonChildView {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {

        this.view.inputName.on(fgui.Event.TEXT_CHANGE, this.updateItemList, this)


        // gm 类型
        this.view.btnList.setVirtual();
        this.view.btnList.itemRenderer = this.listRendererForBtn.bind(this);
        this.updateItemList();
    }

    updateItemList() {
        this._filterConfigArray = GMOneKeyButtonChildView.GM_ONE_KEY_BUTTON_ARRAY
            .toDataStream()
            .filter(config => {
                const trimInputName = this.view.inputName.text.trim();
                if (trimInputName == "") {
                    return true;
                }
                // 输入了 itemId 则 itemName 为空不走所有匹配
                return config.name.indexOf(trimInputName) >= 0;
            })
            .toArray()
        this.view.btnList.numItems = this._filterConfigArray.length
    }

    private listRendererForBtn(index: number, view: BtnGmView) {

        const config = this._filterConfigArray[index];
        if (!config) {
            return
        }

        view.updateData(config)

    }


}