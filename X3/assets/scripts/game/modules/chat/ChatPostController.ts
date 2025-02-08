import { game, Game } from "cc";
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { UICommonKey } from "../common/const/UICommonConfig";
import { ChatConfigManager } from "./config/ChatConfigManager";
import { PostVo } from "./vo/PostVo";
import { TableManager } from "../../../core/table/TableManager";

export class ChatPostController extends BaseController {
    /**是否正在运行跑马灯*/
    protected _isPlaying: boolean = false;

    /**是否首次运行跑马灯*/
    protected _isFirst: boolean = true;

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_POST_UPDATE,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.ENTER_WORLD_COMPLETE,

            //登录完成
            NotificationKey.LOAD_WORLD,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_POST_UPDATE:
                this.playNext();
                break;
            case NotificationKey.ENTER_WORLD_COMPLETE:
                this.removeTimoutPosts();
                this.playNext();
                break;
            case NotificationKey.LOAD_WORLD:
                this.selfPost();
                this.playNext();
                break;
            case NotificationKey.CLOSE_ViEW:
                if (args == UICommonKey.PostView) {
                    this._isPlaying = false;
                    this.playNext();
                }
                break;
        }
    }

    protected onGameShow(): void {
        if (GIns?.chatModel) {
            this.removeTimoutPosts();
            this.playNext();
        }
    }

    protected removeTimoutPosts(): void {
        if (!GIns?.chatModel?.postContext) {
            return;
        }
        let playTimeMs: number = ChatConfigManager.postPlayTimeSecond * 1000;
        let nowTime = Date.now();
        while (GIns.chatModel.postContext.vos.length > 0) {
            let vo = GIns.chatModel.postContext.vos[0];
            let remainTimeMs = nowTime - vo.createTime;
            if (remainTimeMs >= playTimeMs) {
                //跑马灯已过期
                GIns.chatModel.postContext.vos.shift();
            } else {
                break;
            }
        }
    }

    /**是否可展示跑马灯*/
    protected canShowPost(): boolean {
        if (GIns?.mapMgr?.isInMainCity()) {
            return true;
        }
        if (GIns?.battleMgr?.battleLogic?.fightType == FightType.TRUNK_MAP) {
            //主线战斗中
            return true;
        }
        return false;
    }

    protected playNext(): void {
        if (this.canShowPost() == false) {
            G.UIManager.close(UICommonKey.PostView);
            return;
        }
        if (this._isPlaying) {
            return;
        }
        if (GIns.chatModel.postContext.vos.length > 0) {
            this._isPlaying = true;
            let vo = GIns.chatModel.postContext.vos.shift();
            G.UIManager.open(UICommonKey.PostView, vo);
        }
    }

    onInit(): void {
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
    }

    onDestroy(): void {
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 纯前端跑马灯
     */
    public selfPost(): void {
        if (!this._isFirst) return;
        this._isFirst = false;

        let cfgs = ChatConfigManager.getSelfPostConfig();
        if (cfgs) {
            for (let cfg of cfgs) {
                let postVo = new PostVo();
                postVo.content = GIns.chatModel.postContext.parsePostContent(cfg, null);
                postVo.byStyle = cfg.bgStyle;
                postVo.createTime = Date.now();
                GIns.chatModel.postContext.addClientPostVo(postVo);
            }
        }

        let loopCfgs = ChatConfigManager.getSelfLoopPostConfig();
        if (loopCfgs) {
            for (let cfg of loopCfgs) {
                let time = cfg.intervalMinutes * 60 * 1000;
                if (time > 0) {
                    G.GameTimer.loop(time, this, () => {
                        this.loopPost(cfg);
                    });
                }
            }
        }
    }
    public loopPost(cfg: table.chat.PostConfig): void {
        let postVo = new PostVo();
        postVo.content = GIns.chatModel.postContext.parsePostContent(cfg, null);
        postVo.byStyle = cfg.bgStyle;
        postVo.createTime = Date.now();
        GIns.chatModel.postContext.addClientPostVo(postVo);
    }
}

ChatPostController.ins().doInit();
