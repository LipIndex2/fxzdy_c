import { sys } from "cc";
import { IRoleVo, IServerVo } from "../vo/ILoginVo";
import LoginModel from "./LoginModel";
import { Logger } from "../../../../core/log/Logger";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import LoginNotificationKey from "../../LoginNotificationKey";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import { LocalStorageKeys } from "db://assets/scripts/game/comm/cache/LocalStorageKeys";

/**
 * 选服信息
 */
export class ChooseServerModel extends BaseModel {
    /**每组的数量 */
    static PER_PAGE_COUNT: number = 100;

    /**选择中的 server */
    private _serverVo: IServerVo;

    /**服务器列表数据 */
    private _serverList: Array<IServerVo>;

    /**服务器分页表
     * @see IServerVo */
    private _serverPageMap: any;

    /**角色数据
     * @see IRoleVo */
    private _roleMap: any;

    /**角色列表 */
    private _roleVos: Array<IRoleVo>;

    /**最新服 */
    private _newServerVo: IServerVo;

    /**是否被推荐 */
    private _isRecommend: boolean = false;

    /**服务器列表数据 */
    public get serverList(): Array<IServerVo> {
        return this._serverList;
    }

    /**选择中的 server */
    public get serverVo(): IServerVo {
        return this._serverVo;
    }

    /**选择中的 server */
    public set serverVo(vo: IServerVo) {
        this._serverVo = vo;
    }

    /**是否被推荐 */
    public get isRecommend() {
        return this._isRecommend;
    }

    /**重置 */
    public reset() {
        this._serverVo = null;
        this._roleMap = null;
        this._roleVos = null;
        this._serverList = null;
        this._serverPageMap = null;
        this._isRecommend = false;
    }

    public getHistoryServer(): Array<IServerVo> {
        if (!this._roleVos) this.initHistroyRole();
        let serverVos = [];
        for (let i = 0; i < this._roleVos.length; i++) {
            let vo = this.getServerVoById(this._roleVos[i].serverId);
            if (vo) serverVos.push(vo);
        }
        return serverVos;
    }

    /**获取分页服务器列表 */
    public getServerVosByPage(pageId: number) {
        let map = this.pageMap;
        let serverVos = [];
        if (map[pageId]) {
            for (const key in map[pageId]) {
                serverVos.push(map[pageId][key]);
            }
        }
        return serverVos;
    }

    /**服务器页签 */
    public getPageIdList() {
        let map = this.pageMap;
        return Object.keys(map);
    }

    /**获取最新的服务器 （id最大） */
    public getNewServerVo() {
        if (!this._newServerVo) {
            let map = this.pageMap;
            let pageList = Object.keys(map);
            if (pageList.length > 0) {
                let lastPage = pageList[pageList.length - 1];
                let serverKeys = Object.keys(map[lastPage]);
                if (serverKeys.length > 0) {
                    this._newServerVo = map[lastPage][serverKeys[serverKeys.length - 1]];
                }
            }
        }
        return this._newServerVo;
    }

    /**获取服务器页表 */
    public get pageMap() {
        if (!this._serverPageMap && this._serverList) {
            let perPageCount: number = ChooseServerModel.PER_PAGE_COUNT;
            let map = {};
            for (let i = 0; i < this._serverList.length; i++) {
                var vo = this._serverList[i];
                var pageId = Math.ceil(vo.id / perPageCount);
                if (!map[pageId]) map[pageId] = {};
                map[pageId][vo.id] = vo;
            }
            this._serverPageMap = map;
        }

        return this._serverPageMap || {};
    }

    /**初始化服务器页表 */
    public initPageMap() {
        this._serverPageMap = null;
        this.pageMap;
    }

    /**根据服务器Id 返回服务器数据 */
    public getServerVoById(id: number): IServerVo {
        let serversMap = this.pageMap[Math.ceil(id / ChooseServerModel.PER_PAGE_COUNT)];
        if (!serversMap) return null;
        return serversMap[id];
    }

    /**根据游戏服务器Id 返回服务器数据 （oid_serverId）*/
    public getServerVoByGameServerId(serverId: string): IServerVo {
        if (!serverId || serverId.indexOf("_") <= 0) return null;
        let id = Number(serverId.split("_")[1]);
        return this.getServerVoById(id);
    }

    /**初始化角色表 */
    public initHistroyRole() {
        let roleVos = LoginModel.ins().vo.roleVos;
        this._roleMap = {};

        for (let i = 0; i < roleVos.length; i++) {
            let roleVo = roleVos[i];
            this._roleMap[roleVo.serverId] = roleVo;
        }

        this._roleVos = roleVos.sort((a, b) => {
            return b.loginTime - a.loginTime;
        })
    }

    public getRoleVoByServerId(id: number): IRoleVo {
        return this._roleMap[id];
    }

    /**当前服是否有角色 */
    public hasRoleInCurServer() {
        return this._serverVo && this._roleMap && this.getRoleVoByServerId(this._serverVo.id);
    }

    /**已有角色数量 */
    public getHasRoleNum() {
        let roleVos = LoginModel.ins().vo.roleVos;
        return roleVos.length || 0;
    }

    /**是否自动进入游戏 */
    public isAutoEnterGame() {
        //被推荐
        if (this.isRecommend && LoginModel.ins().vo.uid) {
            if (!this.serverVo || this.serverVo.states !== 1) return false; //不可以进入
            //let notices = LoginModel.ins().vo.notices;
            //if (notices.length && NoticeWin.isLockNotice(notices)) return false; //有强制公告
            let key = "recommendFirstEnter_" + LoginModel.ins().vo.uid;
            //有推荐且是第一次尝试
            const recommendFirstEnter = sys.localStorage.getItem(key);
            if (!recommendFirstEnter) {
                sys.localStorage.setItem(key, "true");
                return true;
            }
        }
        return false;
    }

    /**初始化服务器列表
     * @return boolean false表示初始化失败
     */
    private initServer() {
        this._newServerVo = null;
        var serverList = this._serverList = LoginModel.ins().vo.serverList;
        if (!serverList || serverList.length == 0) {
            //TipsMgr.showLoginTipView("服务器未开放，请稍后重试");
            Logger.warn("服务器未开放，请稍后重试")
            return false;
        }
        //后端要求 从小到大排序
        serverList.sort((a, b) => {
            return a.id - b.id;
        });

        this.initHistroyRole();

        if (serverList && serverList.length === 0) {
            return false;
        }

        this.initPageMap();
        return true;
    }

    /**更新服务器列表状态 */
    public updateServerState(): boolean {
        this._isRecommend = false;
        if (!this.initServer()) return false;

        if (LoginModel.ins().vo.recommendServer > 0) {
            //新账号
            this._isRecommend = true;
            this.serverVo = this.getServerVoById(LoginModel.ins().vo.recommendServer);
        } else if (this.serverVo) {
            this.serverVo = this.getServerVoById(this.serverVo.id);
        }

        if (!this.serverVo) {
            //选择最新的
            this.serverVo = this.getNewServerVo();
        }
        return true;
    }

    /**初始化服务器列表 */
    public initServerList(): boolean {
        this._isRecommend = false;
        if (!this.initServer()) {
            return false;
        }

        if (this._roleVos.length) {
            // TODO 尝试读取缓存
            const tempChooseServerId = LocalStorageUtils.get("tempChooseServerId", Number)?.toInt() || 0;
            if (tempChooseServerId > 0) {
                this.serverVo = this.getServerVoById(tempChooseServerId);
            } else {
                //选择上次登录的服
                this.serverVo = this.getServerVoById(this._roleVos[0].serverId);
            }
        } else if (LoginModel.ins().vo.recommendServer > 0) {
            this._isRecommend = true;
            this.serverVo = this.getServerVoById(LoginModel.ins().vo.recommendServer);
        }

        if (sys.isBrowser) {
            //为了测试方便
            //如网页输入 Laya.LocalStorage.setItem("defaultServerId", 40);
            let serverId = sys.localStorage.getItem("defaultServerId");
            if (+serverId) {
                let vo = this.getServerVoById(+serverId);
                if (vo) {
                    this.serverVo = vo;
                }
            }
        }

        if (!this.serverVo) {
            //选择最新的
            this.serverVo = this.getNewServerVo();
        }

        return true;
    }

    /**服务器状态 */
    public checkServerState(serverVo: IServerVo, isShowTips: boolean = false) {
        if (!serverVo) return false;

        let roleVo = this.getRoleVoByServerId(serverVo.id);
        if (roleVo && roleVo.block) {
            isShowTips && this.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "当前服务器角色已被封禁，如有疑问请联系客服");
            return false;
        }

        if (serverVo.states === 2) {
            if (!roleVo) {
                isShowTips && this.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "当前服务器已满员，请重新选服");
                return false;
            }
        } else if (serverVo.states === 3) {
            isShowTips && this.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "服务器维护中，请稍后重试");
            return false;
        } else if (serverVo.states === 4) {
            isShowTips && this.emit(LoginNotificationKey.FLOATING_LOGIN_TIPS, "服务器未开放，请稍后重试");
            return false;
        }
        return true;
    }
}