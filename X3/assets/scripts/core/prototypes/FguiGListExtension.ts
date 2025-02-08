import { Vec2 } from "cc";
import * as fgui from "fairygui-cc";
import { ListLayoutType } from "fairygui-cc";
import G from "../comm/G";
import { FguiGListEffect, GListEffectParams, GListEffectType } from "./FguiGListEffect";

/**自定义fguiEvent*/
(fgui.Event as any).LIST_LOADED = 'fui_list_loaded';

/**list每帧刷新数量默认值*/
const LIST_DEFAULT_PERFRAME_COUNT: number = 1;
/**默认加载间隔*/
const LIST_DEFAULT_LOAD_INTERVAL: number = 100;

/**list底层数据结构*/
interface ItemInfo {
    width: number;
    height: number;
    obj?: fgui.GObject;
    updateFlag: number;
    selected?: boolean;
}

var s_n: number = 0;

/**滚动刷新一次的数据*/
interface ListScrollOnceData {
    max: number;
    end: boolean;
    oldFirstIndex: number;
    newFirstIndex: number;
    curIndex: number;
    forward: boolean;
    childCount: number;
    lastIndex: number;
    reuseIndex: number;
    curX: number;
    curY: number;
    deltaSize: number;
    firstItemDeltaSize: number;
    partSize: number;
}

/**滚动刷新一次的数据*/
interface PageScrollOnceData {
    reuseIndex: number,
    virtualItemCount: number,
    pageSize: number,
    startCol: number,
    viewWidth: number,
    page: number,
    startIndex: number,
    lastIndex: number,
    partWidth: number,
    partHeight: number;
    curIndex: number;
}

declare module "fairygui-cc" {

    interface GList {
        /**list已刷新次数*/
        refreshTimes: number;
        /**每帧加载多少个item 开启分帧加载后才有效*/
        preFrameCount: number;
        /**分帧加载间隔(毫秒)*/
        loadInterval: number;
        /**当前是否正在加载item*/
        _isLoading: boolean;
        /**原list handleScroll1-3次数记录*/
        enterCounter: number;
        /**是否触发list刷新 脏标记*/
        _refreshDirty: number;
        /**是否开启分帧加载*/
        isLoadInFrames: boolean;
        /**当前分帧加载的下标*/
        _loadInFrameIdx: number;
        /**item特效类型 (默认没有特效) 参考GListEffectType*/
        effectType: number;
        /**特效参数*/
        _effectParams: GListEffectParams;


        /**item特效处理类*/
        itemEffectRenderer: (index: number, item: fgui.GObject, delay: number) => void;
        /**重置刷新次数*/
        resetRefreshTimes(): void;
        handleScrollCompleteAll(): void;
        handleEffect(index: number, item: fgui.GObject): void;

        //复写GList的函数
        handleScroll(forceUpdate: boolean): void;
        handleScroll1(forceUpdate: boolean): void;
        handleScroll2(forceUpdate: boolean): void;
        handleScroll3(forceUpdate: boolean): void;
        handleScrollFrame1(forceUpdate: boolean, data: ListScrollOnceData): boolean;
        handleScrollFrameComplete1(forceUpdate: boolean, result: boolean): void;
        handleScrollComplete1(): void;
        handleScrollFrame2(forceUpdate: boolean, data: ListScrollOnceData): boolean;
        handleScrollFrameComplete2(forceUpdate: boolean, result: boolean): void;
        handleScrollComplete2(): void;
        handleScrollFrame3(forceUpdate: boolean, data: PageScrollOnceData): boolean;
        handleScrollComplete3(): void;
        //下面四个函数因为用到了外部变量s_n所以复制了一份 实际上没有修改
        getSnappingPosition(xValue: number, yValue: number, resultPoint?: Vec2): Vec2;
        getIndexOnPos1(forceUpdate: boolean): number;
        getIndexOnPos2(forceUpdate: boolean): number;
        getIndexOnPos3(forceUpdate: boolean): number;
    }
}

/**列表刷新次数*/
fgui.GList.prototype.refreshTimes = 0;
/**每帧加载的数量*/
fgui.GList.prototype.preFrameCount = LIST_DEFAULT_PERFRAME_COUNT;
/**加载间隔(毫秒)*/
fgui.GList.prototype.loadInterval = LIST_DEFAULT_LOAD_INTERVAL;
/**是否正在刷新数据*/
fgui.GList.prototype._isLoading = false;
/**刷新时触发了新的刷新 1或者2 2代表强制刷新*/
fgui.GList.prototype._refreshDirty = 0;
/**原list handleScroll1-3次数记录*/
fgui.GList.prototype.enterCounter = 0;
/**是否开启分帧加载 默认不开启*/
fgui.GList.prototype.isLoadInFrames = false;
/**item特效类型 (默认没有特效)*/
fgui.GList.prototype.effectType = GListEffectType.None;
/**item特效参数 (默认null)*/
fgui.GList.prototype._effectParams = null;
/**重置刷新次数*/
fgui.GList.prototype.resetRefreshTimes = function (): void {
    this.refreshTimes = 0
};

/**分帧加载完成函数*/
fgui.GList.prototype.handleScrollCompleteAll = function (): void {
    this._boundsChanged = false;
    this._isLoading = false;
    this._node.emit(fgui.Event.LIST_LOADED)
    if (this._refreshDirty > 0) {
        let forceUpdate: boolean = this._refreshDirty == 2;
        this._refreshDirty = 0;
        this.handleScroll(forceUpdate);
    }
}

/**动效回调处理*/
fgui.GList.prototype.handleEffect = function (index: number, item: fgui.GObject): void {
    if (this.isShowEffect == false) {
        return;
    }
    if (this._effectParams?.starIndex >= 0 && index < this._effectParams?.starIndex) {
        return;
    }
    if (this._effectParams?.endIndex >= 0 && index > this._effectParams?.endIndex) {
        return;
    }
    let delay: number = 0
    if (this.isLoadInFrames) {
        delay = this._loadInFrameIdx * this.loadInterval / (this.preFrameCount * 1000);
    }
    if (this.effectType == GListEffectType.FADE_IN) {
        FguiGListEffect.fadeIn(index, item, delay, this._effectParams);
    } else if (this.effectType == GListEffectType.Custom) {
        if (this.itemEffectRenderer) {
            this.itemEffectRenderer(index, item, delay);
        }
    }
}

fgui.GList.prototype.handleScroll = function (forceUpdate: boolean): void {
    if (this._eventLocked)
        return;
    if (this._isLoading) {
        this._refreshDirty = Math.max(this._refreshDirty, forceUpdate ? 2 : 1);
        return;
    }
    this.refreshTimes++;
    this._isLoading = true;
    this.enterCounter = 0
    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
        this.handleScroll1(forceUpdate)
    } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
        this.handleScroll2(forceUpdate)
    } else {
        this.handleScroll3(forceUpdate);
    }
}

fgui.GList.prototype.handleScroll1 = function (forceUpdate: boolean): boolean {
    var pos: number = this._scrollPane.scrollingPosY;
    var max: number = pos + this._scrollPane.viewHeight;
    var end: boolean = max == this._scrollPane.contentHeight;//这个标志表示当前需要滚动到最末，无论内容变化大小

    //寻找当前位置的第一条项目
    s_n = pos;
    var newFirstIndex: number = this.getIndexOnPos1(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate) {
        return this.handleScrollFrameComplete1(forceUpdate, false);
    }

    var oldFirstIndex: number = this._firstIndex;
    this._firstIndex = newFirstIndex;
    var curIndex: number = newFirstIndex;
    var forward: boolean = oldFirstIndex > newFirstIndex;
    var childCount: number = this.numChildren;
    var lastIndex: number = oldFirstIndex + childCount - 1;
    var reuseIndex: number = forward ? lastIndex : oldFirstIndex;
    var curX: number = 0, curY: number = pos;
    var deltaSize: number = 0;
    var firstItemDeltaSize: number = 0;

    var partSize: number = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;

    /**刷新初始化数据*/
    let scrollData: ListScrollOnceData = {
        max: max,
        end: end,
        oldFirstIndex: oldFirstIndex,
        newFirstIndex: newFirstIndex,
        curIndex: curIndex,
        forward: forward,
        childCount: childCount,
        lastIndex: lastIndex,
        reuseIndex: reuseIndex,
        curX: curX,
        curY: curY,
        deltaSize: deltaSize,
        firstItemDeltaSize: firstItemDeltaSize,
        partSize: partSize
    }

    this.itemInfoVer++;
    this._loadInFrameIdx = 0;
    return this.handleScrollFrame1(forceUpdate, scrollData)
}

fgui.GList.prototype.handleScrollFrame1 = function (forceUpdate: boolean, data: ListScrollOnceData): boolean {
    let endIndex: number = this._realNumItems;
    var needRender: boolean;
    var url: string = this._defaultItem;
    var ii: ItemInfo, ii2: ItemInfo;
    var i: number, j: number;

    let isEnd: boolean = data.curIndex >= this._realNumItems;
    let createCnt: number = 0;
    while (data.curIndex <= endIndex) {
        if (data.curIndex < this._realNumItems && (data.end || data.curY < data.max)) {
            ii = this._virtualItems[data.curIndex];
            if (!ii.obj || forceUpdate) {
                if (this.itemProvider != null) {
                    url = this.itemProvider(data.curIndex % this._numItems);
                    if (url == null)
                        url = this._defaultItem;
                    url = fgui.UIPackage.normalizeURL(url);
                }

                if (ii.obj && ii.obj.resourceURL != url) {
                    if (ii.obj instanceof fgui.GButton)
                        ii.selected = ii.obj.selected;
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (!ii.obj) {
                //搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
                if (data.forward) {
                    for (j = data.reuseIndex; j >= data.oldFirstIndex; j--) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                            if (ii2.obj instanceof fgui.GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == data.reuseIndex)
                                data.reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (j = data.reuseIndex; j <= data.lastIndex; j++) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                            if (ii2.obj instanceof fgui.GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == data.reuseIndex)
                                data.reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    this.setChildIndex(ii.obj, data.forward ? data.curIndex - data.newFirstIndex : this.numChildren);
                }
                else {
                    if (this._pool.count <= 0) {
                        createCnt++;
                        this._loadInFrameIdx++;
                    }
                    ii.obj = this._pool.getObject(url);
                    if (data.forward)
                        this.addChildAt(ii.obj, data.curIndex - data.newFirstIndex);
                    else
                        this.addChild(ii.obj);
                }
                if (ii.obj instanceof fgui.GButton)
                    ii.obj.selected = ii.selected;

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                if (this._autoResizeItem && (this._layout == ListLayoutType.SingleColumn || this._columnCount > 0))
                    ii.obj.setSize(data.partSize, ii.obj.height, true);

                let index = data.curIndex % this._numItems
                this.itemRenderer(index, ii.obj);
                this.handleEffect(index, ii.obj);
                if (data.curIndex % this._curLineItemCount == 0) {
                    data.deltaSize += Math.ceil(ii.obj.height) - ii.height;
                    if (data.curIndex == data.newFirstIndex && data.oldFirstIndex > data.newFirstIndex) {
                        //当内容向下滚动时，如果新出现的项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                        data.firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
                    }
                }
                ii.width = Math.ceil(ii.obj.width);
                ii.height = Math.ceil(ii.obj.height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(data.curX, data.curY);
            if (data.curIndex == data.newFirstIndex) //要显示多一条才不会穿帮
                data.max += ii.height;

            data.curX += ii.width + this._columnGap;

            if (data.curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                data.curX = 0;
                data.curY += ii.height + this._lineGap;
            }
            data.curIndex++;
            if (!isEnd && this.isLoadInFrames && createCnt >= this.preFrameCount) {
                //分帧加载控制
                break;
            }
        } else {
            isEnd = true
            break
        }
    }
    if (isEnd == false) {
        G.GameTimer.once(this.loadInterval, this, () => {
            if (this.node?.isValid) {
                this.handleScrollFrame1(forceUpdate, data)
            }
        })
        return true
    }

    for (i = 0; i < data.childCount; i++) {
        ii = this._virtualItems[data.oldFirstIndex + i];
        if (ii.updateFlag != this.itemInfoVer && ii.obj) {
            if (ii.obj instanceof fgui.GButton)
                ii.selected = ii.obj.selected;
            this.removeChildToPool(ii.obj);
            ii.obj = null;
        }
    }

    data.childCount = this._children.length;
    for (i = 0; i < data.childCount; i++) {
        let obj: fgui.GObject = this._virtualItems[data.newFirstIndex + i].obj;
        if (this._children[i] != obj)
            this.setChildIndex(obj, i);
    }

    if (data.deltaSize != 0 || data.firstItemDeltaSize != 0)
        this._scrollPane.changeContentSizeOnScrolling(0, data.deltaSize, 0, data.firstItemDeltaSize);

    if (data.curIndex > 0 && this.numChildren > 0 && this._container.position.y <= 0 && this.getChildAt(0).y > -this._container.position.y)//最后一页没填满！
        return this.handleScrollFrameComplete1(forceUpdate, true);
    else
        return this.handleScrollFrameComplete1(forceUpdate, false);
}

fgui.GList.prototype.handleScrollFrameComplete1 = function (forceUpdate: boolean, result: boolean): void {
    if (result) {
        this.enterCounter++;
        forceUpdate = false;
        if (this.enterCounter > 20) {
            console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
            this.handleScrollComplete1();
        } else {
            this.handleScroll1(forceUpdate)
        }
        return
    }
    this.handleScrollComplete1();
}

fgui.GList.prototype.handleScrollComplete1 = function (): void {
    this.handleArchOrder1();
    this.handleScrollCompleteAll()
}

fgui.GList.prototype.handleScroll2 = function (forceUpdate: boolean): boolean {
    var pos: number = this._scrollPane.scrollingPosX;
    var max: number = pos + this._scrollPane.viewWidth;
    var end: boolean = pos == this._scrollPane.contentWidth;//这个标志表示当前需要滚动到最末，无论内容变化大小

    //寻找当前位置的第一条项目
    s_n = pos;
    var newFirstIndex: number = this.getIndexOnPos2(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate) {
        return this.handleScrollFrameComplete2(forceUpdate, false);;
    }

    var oldFirstIndex: number = this._firstIndex;
    this._firstIndex = newFirstIndex;
    var curIndex: number = newFirstIndex;
    var forward: boolean = oldFirstIndex > newFirstIndex;
    var childCount: number = this.numChildren;
    var lastIndex: number = oldFirstIndex + childCount - 1;
    var reuseIndex: number = forward ? lastIndex : oldFirstIndex;
    var curX: number = pos, curY: number = 0;
    var deltaSize: number = 0;
    var firstItemDeltaSize: number = 0;
    var partSize: number = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount - 1)) / this._curLineItemCount;

    /**刷新初始化数据*/
    let scrollData: ListScrollOnceData = {
        max: max,
        end: end,
        oldFirstIndex: oldFirstIndex,
        newFirstIndex: newFirstIndex,
        curIndex: curIndex,
        forward: forward,
        childCount: childCount,
        lastIndex: lastIndex,
        reuseIndex: reuseIndex,
        curX: curX,
        curY: curY,
        deltaSize: deltaSize,
        firstItemDeltaSize: firstItemDeltaSize,
        partSize: partSize
    }

    this.itemInfoVer++;
    this._loadInFrameIdx = 0;
    return this.handleScrollFrame2(forceUpdate, scrollData);
}

fgui.GList.prototype.handleScrollFrame2 = function (forceUpdate: boolean, data: ListScrollOnceData): boolean {
    let endIndex: number = this._realNumItems;

    var needRender: boolean;
    var url: string = this._defaultItem;
    var ii: ItemInfo, ii2: ItemInfo;
    var i: number, j: number;

    let isEnd: boolean = data.curIndex >= this._realNumItems
    let createCnt: number = 0;
    while (data.curIndex <= endIndex) {
        if (data.curIndex < this._realNumItems && (data.end || data.curX < data.max)) {
            ii = this._virtualItems[data.curIndex];

            if (!ii.obj || forceUpdate) {
                if (this.itemProvider != null) {
                    url = this.itemProvider(data.curIndex % this._numItems);
                    if (url == null)
                        url = this._defaultItem;
                    url = fgui.UIPackage.normalizeURL(url);
                }

                if (ii.obj && ii.obj.resourceURL != url) {
                    if (ii.obj instanceof fgui.GButton)
                        ii.selected = ii.obj.selected;
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (!ii.obj) {
                if (data.forward) {
                    for (j = data.reuseIndex; j >= data.oldFirstIndex; j--) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                            if (ii2.obj instanceof fgui.GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == data.reuseIndex)
                                data.reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (j = data.reuseIndex; j <= data.lastIndex; j++) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
                            if (ii2.obj instanceof fgui.GButton)
                                ii2.selected = ii2.obj.selected;
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == data.reuseIndex)
                                data.reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    this.setChildIndex(ii.obj, data.forward ? data.curIndex - data.newFirstIndex : this.numChildren);
                }
                else {
                    if (this._pool.count <= 0) {
                        createCnt++;
                        this._loadInFrameIdx++;
                    }
                    ii.obj = this._pool.getObject(url);
                    if (data.forward)
                        this.addChildAt(ii.obj, data.curIndex - data.newFirstIndex);
                    else
                        this.addChild(ii.obj);
                }
                if (ii.obj instanceof fgui.GButton)
                    ii.obj.selected = ii.selected;

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                if (this._autoResizeItem && (this._layout == ListLayoutType.SingleRow || this._lineCount > 0))
                    ii.obj.setSize(ii.obj.width, data.partSize, true);
                let index = data.curIndex % this._numItems
                this.itemRenderer(index, ii.obj);
                this.handleEffect(index, ii.obj);
                if (data.curIndex % this._curLineItemCount == 0) {
                    data.deltaSize += Math.ceil(ii.obj.width) - ii.width;
                    if (data.curIndex == data.newFirstIndex && data.oldFirstIndex > data.newFirstIndex) {
                        //当内容向下滚动时，如果新出现的一个项目大小发生变化，需要做一个位置补偿，才不会导致滚动跳动
                        data.firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
                    }
                }
                ii.width = Math.ceil(ii.obj.width);
                ii.height = Math.ceil(ii.obj.height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(data.curX, data.curY);
            if (data.curIndex == data.newFirstIndex) //要显示多一条才不会穿帮
                data.max += ii.width;

            data.curY += ii.height + this._lineGap;

            if (data.curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                data.curY = 0;
                data.curX += ii.width + this._columnGap;
            }
            data.curIndex++;
            if (!isEnd && this.isLoadInFrames && createCnt >= this.preFrameCount) {
                //分帧加载控制
                break;
            }
        } else {
            isEnd = true
            break
        }
    }
    if (isEnd == false) {
        G.GameTimer.once(this.loadInterval, this, () => {
            if (this.node?.isValid) {
                this.handleScrollFrame2(forceUpdate, data)
            }
        })
        return true
    }

    for (i = 0; i < data.childCount; i++) {
        ii = this._virtualItems[data.oldFirstIndex + i];
        if (ii.updateFlag != this.itemInfoVer && ii.obj) {
            if (ii.obj instanceof fgui.GButton)
                ii.selected = ii.obj.selected;
            this.removeChildToPool(ii.obj);
            ii.obj = null;
        }
    }

    data.childCount = this._children.length;
    for (i = 0; i < data.childCount; i++) {
        let obj: fgui.GObject = this._virtualItems[data.newFirstIndex + i].obj;
        if (this._children[i] != obj)
            this.setChildIndex(obj, i);
    }

    if (data.deltaSize != 0 || data.firstItemDeltaSize != 0)
        this._scrollPane.changeContentSizeOnScrolling(data.deltaSize, 0, data.firstItemDeltaSize, 0);

    if (data.curIndex > 0 && this.numChildren > 0 && this._container.position.x <= 0 && this.getChildAt(0).x > - this._container.position.x)//最后一页没填满！
        return this.handleScrollFrameComplete2(forceUpdate, true);
    else
        return this.handleScrollFrameComplete2(forceUpdate, false);
}

fgui.GList.prototype.handleScrollFrameComplete2 = function (forceUpdate: boolean, result: boolean): void {
    if (result) {
        this.enterCounter++;
        forceUpdate = false;
        if (this.enterCounter > 20) {
            console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
            this.handleScrollComplete2();
        } else {
            this.handleScroll2(forceUpdate)
        }
        return
    }
    this.handleScrollComplete2();
}

fgui.GList.prototype.handleScrollComplete2 = function (): void {
    this.handleArchOrder2();
    this.handleScrollCompleteAll();
}

fgui.GList.prototype.handleScroll3 = function (forceUpdate: boolean): void {
    var pos: number = this._scrollPane.scrollingPosX;

    //寻找当前位置的第一条项目
    s_n = pos;
    var newFirstIndex: number = this.getIndexOnPos3(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate) {
        this.handleScrollComplete3()
        return;
    }


    var oldFirstIndex: number = this._firstIndex;
    this._firstIndex = newFirstIndex;

    //分页模式不支持不等高，所以渲染满一页就好了

    var reuseIndex: number = oldFirstIndex;
    var virtualItemCount: number = this._virtualItems.length;
    var pageSize: number = this._curLineItemCount * this._curLineItemCount2;
    var startCol: number = newFirstIndex % this._curLineItemCount;
    var viewWidth: number = this.viewWidth;
    var page: number = Math.floor(newFirstIndex / pageSize);
    var startIndex: number = page * pageSize;
    var lastIndex: number = startIndex + pageSize * 2; //测试两页
    var i: number;
    var ii: ItemInfo;
    var col: number;
    var partWidth: number = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
    var partHeight: number = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount2 - 1)) / this._curLineItemCount2;

    //初始化数据
    let scrollData: PageScrollOnceData = {
        reuseIndex: reuseIndex,
        virtualItemCount: virtualItemCount,
        pageSize: pageSize,
        startCol: startCol,
        viewWidth: viewWidth,
        page: page,
        startIndex: startIndex,
        lastIndex: lastIndex,
        partWidth: partWidth,
        partHeight: partHeight,
        curIndex: startIndex,
    }

    this.itemInfoVer++;
    this._loadInFrameIdx = 0;
    //先标记这次要用到的项目
    for (i = startIndex; i < lastIndex; i++) {
        if (i >= this._realNumItems)
            continue;

        col = i % this._curLineItemCount;
        if (i - startIndex < pageSize) {
            if (col < startCol)
                continue;
        }
        else {
            if (col > startCol)
                continue;
        }

        ii = this._virtualItems[i];
        ii.updateFlag = this.itemInfoVer;
    }
    return this.handleScrollFrame3(forceUpdate, scrollData)
}

fgui.GList.prototype.handleScrollFrame3 = function (forceUpdate: boolean, data: PageScrollOnceData): boolean {
    let endIndex: number = data.lastIndex;

    var needRender: boolean;
    var i: number;
    var ii: ItemInfo, ii2: ItemInfo;
    var url: string = this._defaultItem;
    var lastObj: fgui.GObject = null;
    var insertIndex: number = 0;
    let isEnd: boolean = endIndex == data.lastIndex
    let createCnt: number = 0;
    while (data.curIndex <= data.lastIndex) {
        if (i >= this._realNumItems)
            continue;

        ii = this._virtualItems[i];
        if (ii.updateFlag != this.itemInfoVer)
            continue;

        if (!ii.obj) {
            //寻找看有没有可重用的
            while (data.reuseIndex < data.virtualItemCount) {
                ii2 = this._virtualItems[data.reuseIndex];
                if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                    if (ii2.obj instanceof fgui.GButton)
                        ii2.selected = ii2.obj.selected;
                    ii.obj = ii2.obj;
                    ii2.obj = null;
                    break;
                }
                data.reuseIndex++;
            }

            if (insertIndex == -1)
                insertIndex = this.getChildIndex(lastObj) + 1;

            if (!ii.obj) {
                if (this.itemProvider != null) {
                    url = this.itemProvider(i % this._numItems);
                    if (url == null)
                        url = this._defaultItem;
                    url = fgui.UIPackage.normalizeURL(url);
                }
                if (this._pool.count <= 0) {
                    createCnt++;
                    this._loadInFrameIdx++;
                }
                ii.obj = this._pool.getObject(url);
                this.addChildAt(ii.obj, insertIndex);
            }
            else {
                insertIndex = this.setChildIndexBefore(ii.obj, insertIndex);
            }
            insertIndex++;

            if (ii.obj instanceof fgui.GButton)
                ii.obj.selected = ii.selected;

            needRender = true;
        }
        else {
            needRender = forceUpdate;
            insertIndex = -1;
            lastObj = ii.obj;
        }

        if (needRender) {
            if (this._autoResizeItem) {
                if (this._curLineItemCount == this._columnCount && this._curLineItemCount2 == this._lineCount)
                    ii.obj.setSize(data.partWidth, data.partHeight, true);
                else if (this._curLineItemCount == this._columnCount)
                    ii.obj.setSize(data.partWidth, ii.obj.height, true);
                else if (this._curLineItemCount2 == this._lineCount)
                    ii.obj.setSize(ii.obj.width, data.partHeight, true);
            }
            let index = i % this._numItems
            this.itemRenderer(index, ii.obj);
            this.handleEffect(index, ii.obj);
            ii.width = Math.ceil(ii.obj.width);
            ii.height = Math.ceil(ii.obj.height);
        }
        data.curIndex++;
        if (!isEnd && this.isLoadInFrames && createCnt >= this.preFrameCount) {
            //分帧加载控制
            break;
        }
    }
    if (isEnd == false) {
        G.GameTimer.once(this.loadInterval, this, () => {
            if (this.node?.isValid) {
                this.handleScrollFrame3(forceUpdate, data)
            }
        })
        return true
    }


    //排列item
    var borderX: number = (data.startIndex / data.pageSize) * data.viewWidth;
    var xx: number = borderX;
    var yy: number = 0;
    var lineHeight: number = 0;
    for (i = data.startIndex; i < data.lastIndex; i++) {
        if (i >= this._realNumItems)
            continue;

        ii = this._virtualItems[i];
        if (ii.updateFlag == this.itemInfoVer)
            ii.obj.setPosition(xx, yy);

        if (ii.height > lineHeight)
            lineHeight = ii.height;
        if (i % this._curLineItemCount == this._curLineItemCount - 1) {
            xx = borderX;
            yy += lineHeight + this._lineGap;
            lineHeight = 0;

            if (i == data.startIndex + data.pageSize - 1) {
                borderX += data.viewWidth;
                xx = borderX;
                yy = 0;
            }
        }
        else
            xx += ii.width + this._columnGap;
    }

    //释放未使用的
    for (i = data.reuseIndex; i < data.virtualItemCount; i++) {
        ii = this._virtualItems[i];
        if (ii.updateFlag != this.itemInfoVer && ii.obj) {
            if (ii.obj instanceof fgui.GButton)
                ii.selected = ii.obj.selected;
            this.removeChildToPool(ii.obj);
            ii.obj = null;
        }
    }
    this.handleScrollComplete3()
}

fgui.GList.prototype.handleScrollComplete3 = function () {
    this.handleScrollCompleteAll();
}

fgui.GList.prototype.getIndexOnPos1 = function (forceUpdate: boolean): number {
    if (this._realNumItems < this._curLineItemCount) {
        s_n = 0;
        return 0;
    }

    var i: number;
    var pos2: number;
    var pos3: number;

    if (this.numChildren > 0 && !forceUpdate) {
        pos2 = this.getChildAt(0).y;
        if (pos2 > s_n) {
            for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                pos2 -= (this._virtualItems[i].height + this._lineGap);
                if (pos2 <= s_n) {
                    s_n = pos2;
                    return i;
                }
            }

            s_n = 0;
            return 0;
        }
        else {
            for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
                if (pos3 > s_n) {
                    s_n = pos2;
                    return i;
                }
                pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._curLineItemCount;
        }
    }
    else {
        pos2 = 0;
        for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
            pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
            if (pos3 > s_n) {
                s_n = pos2;
                return i;
            }
            pos2 = pos3;
        }

        s_n = pos2;
        return this._realNumItems - this._curLineItemCount;
    }
}

fgui.GList.prototype.getIndexOnPos2 = function (forceUpdate: boolean): number {
    if (this._realNumItems < this._curLineItemCount) {
        s_n = 0;
        return 0;
    }

    var i: number;
    var pos2: number;
    var pos3: number;

    if (this.numChildren > 0 && !forceUpdate) {
        pos2 = this.getChildAt(0).x;
        if (pos2 > s_n) {
            for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                pos2 -= (this._virtualItems[i].width + this._columnGap);
                if (pos2 <= s_n) {
                    s_n = pos2;
                    return i;
                }
            }

            s_n = 0;
            return 0;
        }
        else {
            for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
                if (pos3 > s_n) {
                    s_n = pos2;
                    return i;
                }
                pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._curLineItemCount;
        }
    }
    else {
        pos2 = 0;
        for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
            pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
            if (pos3 > s_n) {
                s_n = pos2;
                return i;
            }
            pos2 = pos3;
        }

        s_n = pos2;
        return this._realNumItems - this._curLineItemCount;
    }
}

fgui.GList.prototype.getIndexOnPos3 = function (forceUpdate: boolean): number {
    if (this._realNumItems < this._curLineItemCount) {
        s_n = 0;
        return 0;
    }

    var viewWidth: number = this.viewWidth;
    var page: number = Math.floor(s_n / viewWidth);
    var startIndex: number = page * (this._curLineItemCount * this._curLineItemCount2);
    var pos2: number = page * viewWidth;
    var i: number;
    var pos3: number;
    for (i = 0; i < this._curLineItemCount; i++) {
        pos3 = pos2 + this._virtualItems[startIndex + i].width + this._columnGap;
        if (pos3 > s_n) {
            s_n = pos2;
            return startIndex + i;
        }
        pos2 = pos3;
    }

    s_n = pos2;
    return startIndex + this._curLineItemCount - 1;
}

fgui.GList.prototype.getSnappingPosition = function (xValue: number, yValue: number, resultPoint?: Vec2): Vec2 {
    if (this._virtual) {
        resultPoint = resultPoint || new Vec2();

        var saved: number;
        var index: number;
        if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
            saved = yValue;
            s_n = yValue;
            index = this.getIndexOnPos1(false);
            yValue = s_n;
            if (index < this._virtualItems.length && saved - yValue > this._virtualItems[index].height / 2 && index < this._realNumItems)
                yValue += this._virtualItems[index].height + this._lineGap;
        }
        else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
            saved = xValue;
            s_n = xValue;
            index = this.getIndexOnPos2(false);
            xValue = s_n;
            if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
                xValue += this._virtualItems[index].width + this._columnGap;
        }
        else {
            saved = xValue;
            s_n = xValue;
            index = this.getIndexOnPos3(false);
            xValue = s_n;
            if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
                xValue += this._virtualItems[index].width + this._columnGap;
        }

        resultPoint.x = xValue;
        resultPoint.y = yValue;
        return resultPoint;
    }
    else {
        return fgui.GComponent.prototype.getSnappingPosition(xValue, yValue, resultPoint);
    }
}

/**是否正在加载list*/
Object.defineProperty(fgui.GList.prototype, 'isLoading', {
    get: function (): boolean {
        return this._isLoading;
    },
    configurable: true,
    enumerable: true
});

/**是否正在展示特效*/
Object.defineProperty(fgui.GList.prototype, 'isShowEffect', {
    get: function (): boolean {
        return this.effectType != GListEffectType.None && this.refreshTimes <= 1;
    },
    configurable: true,
    enumerable: true
});

/**是否正在展示特效*/
Object.defineProperty(fgui.GList.prototype, 'effectParams', {
    get: function (): boolean {
        return this._effectParams;
    },
    set: function (value: GListEffectParams) {
        if (this.isLoadInFrames && value?.interval * 1000 < this.loadInterval) {
            console.warn('动画间隔大于分帧加载间隔时间 自动修正加载间隔时间')
            this.loadInterval = value.interval * 1000
        }
        if (value && value.interval == undefined) {
            //自动赋值
            value.interval = this.loadInterval / 1000
        }
        this._effectParams = value
    },
    configurable: true,
    enumerable: true
});

