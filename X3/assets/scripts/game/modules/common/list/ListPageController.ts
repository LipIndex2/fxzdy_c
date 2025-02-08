import { Size } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";

/**列表控制参数*/
export interface IListPageControllerArgs {
    /**每页数量 固定8个*/
    prePageCount?: number
    /**列表每行item数量*/
    preRowItemCount?: number
    /**最大数量限制 (优先级比maxPage更高)*/
    maxLimitCount?: number
    /**数据偏转值 比如排行榜100名数据 list只展示4-100 偏移值就写3*/
    countOffset?: number
    /**多请求的数量*/
    moreRequestCnt?: number
}

/**分页列表控制器 目前只支持垂直滚动列表
 * 使用方法 let listCtrl = new ListPageController()
 * ui open时初始化 listCtrl.init(GList, args, key)
 * 设置请求函数绑定 listCtrl.requestCallback = func.bind(this)
 * 之后在返回数据时调用 数据更新 listCtrl.recRequstData(page, datas, maxPage)
 * list渲染自己处理 只需要在itemRenderer里面使用listCtrl.datas数据即可
 * ui close时销毁控制器 listCtrl.dispose()
*/
export class ListPageController {
    protected _key: string = ''
    /**当前列表*/
    protected _list: fgui.GList = null
    /**数据*/
    protected _datas: any[] = []
    /**已请求页数*/
    protected _requestPage: number = 0
    /**最大展示页数*/
    protected _maxShowPage: number = 0
    /**最大页数*/
    protected _maxPage: number = 1
    /**item大小*/
    protected _itemSize: Size = new Size(0, 0)
    /**初始化参数*/
    protected _args: IListPageControllerArgs = {}
    /**是否正在请求中*/
    protected _isRequest: boolean = false
    /**列表列数*/
    protected _listCol: number = 1
    /**是否已释放*/
    protected _isDispose: boolean = false
    /**超时时间*/
    protected _timeoutDelay:number = 5000

    protected _isTimeout:boolean = false

    /**翻页请求数据绑定*/
    public requestCallback: (page: number) => void

    /**
     * 初始化控制器
     * @param list 要控制的list组件
     * @param args 参考IListPageControllerArgs
     * @param key 唯一键值 防止同一个list处理不同的数据
    */
    public init(list: fgui.GList, args?: IListPageControllerArgs, key: string = ''): void {
        if (this._key != key || key == '' || this._list != list) {
            //初始化
            this._key = key
            this._list = list
            list.numItems = 0
            this._datas.length = 0
            this._requestPage = 0
            this._maxShowPage = 0
            this._maxPage = 1//最少要请求一页数据

            //获取item大小
            let obj: fgui.GObject = list.getFromPool(null);
            if (!obj) {
                throw new Error("Virtual List must have a default list item resource.");
            } else {
                this._itemSize.width = obj.width;
                this._itemSize.height = obj.height;
            }
            list.returnToPool(obj);
            //计算list列数
            if (this._list.columnCount > 0)
                this._listCol = this._list.columnCount;
            else {
                this._listCol = Math.floor((this._list.scrollPane.viewWidth + this._list.columnGap) / (this._itemSize.width + this._list.columnGap));
                if (this._listCol <= 0)
                    this._listCol = 1;
            }
        }
        this.resetArgs()
        if (args) {
            //初始化参数
            for (let key in args) {
                this._args[key] = args[key]
            }
        }
        list.on(fgui.Event.SCROLL, this.onScroll, this)
        this._isDispose = false
        this.onScroll()
    }

    protected resetArgs(): void {
        this._args.prePageCount = 8
        this._args.maxLimitCount = 0
        this._args.preRowItemCount = 1
        this._args.countOffset = 0
        this._args.moreRequestCnt = 0
    }

    protected onScroll(): void {
        if (this._isDispose) {
            return
        }
        if (this._maxShowPage >= this._maxPage && this._isTimeout == false) {
            return
        }
        let maxShowPage = this._maxShowPage
        if (this._maxShowPage < this._maxPage) {
            let endPosY = this._list.scrollPane.posY + this._list.height
            let showCount = Math.ceil(endPosY / ((this._itemSize.height + this._list.columnGap) * this._listCol)) * this._listCol + this._args.countOffset
            maxShowPage = Math.min(this._maxPage, Math.ceil(showCount / this._args.prePageCount))
        }
        if (this._maxShowPage < maxShowPage || this._isTimeout) {
            this._maxShowPage = maxShowPage
            this._isTimeout = false
            this.requestNextPage()
        }
    }

    protected requestNextPage(): void {
        if (this._isRequest) {
            return
        }
        let realMaxPage = Math.min(this._maxPage, this._maxShowPage + this._args.moreRequestCnt)
        if (realMaxPage > this._requestPage) {
            this._isRequest = true
            this._requestPage++
            this.addTimeoutHandler()
            if (this.requestCallback) {
                this.requestCallback(this._requestPage)
            }
        }
    }

    /**获取列表数据*/
    public get datas(): any[] {
        return this._datas
    }

    /**请求数据返回处理*/
    public recRequstData(page: number, datas: any[], maxPage: number = 0): void {
        if (this._isDispose) {
            return
        }
        let showCount = 0
        if (maxPage > 0) {
            this._maxPage = maxPage
        }
        if (this._args.maxLimitCount > 0) {
            showCount = this._args.maxLimitCount
            this._maxPage = Math.min(Math.ceil(this._args.maxLimitCount / this._args.prePageCount), this._maxPage)
        } else {
            showCount = this._maxPage * this._args.prePageCount
            if (page == this._maxPage) {
                //已经到最后一页了
                showCount = (this._maxPage - 1) * this._args.prePageCount + datas.length
            }
        }

        if (this._datas.length > showCount) {
            this._datas.length = showCount
        }
        let startIndex = (page - 1) * this._args.prePageCount
        let endIndex = Math.min(showCount, this._args.prePageCount + startIndex)
        if (page == this._maxPage) {
            endIndex = showCount
        }
        for (let i = startIndex; i < endIndex; i++) {
            let dataIndex = i - startIndex
            if (dataIndex < datas.length) {
                this._datas[i] = datas[dataIndex]
            } else if (this._args.maxLimitCount > 0) {
                //有限制展示数量的就赋值null
                this._datas[i] = null
            }
        }
        if (this._list.numItems != showCount - this._args.countOffset) {
            this._list.numItems = showCount - this._args.countOffset
        } else {
            this._list.refreshVirtualList()
        }

        this._isRequest = false
        this.removeTimeoutHanlder()
        this.requestNextPage()
    }

    protected onTimeout():void {
        if (this._isRequest) {
            this._isTimeout = true
            this._isRequest = false
            //回退page记录
            this._requestPage--
        }
    }

    protected addTimeoutHandler():void {
        this.removeTimeoutHanlder()
        G.GameTimer.once(this._timeoutDelay, this, this.onTimeout)
    }

    protected removeTimeoutHanlder():void {
        G.GameTimer.clearAll(this)
    }

    public dispose(): void {
        this.removeTimeoutHanlder()
        this._isDispose = true
        this._isRequest = false
        this._list = null
    }
}