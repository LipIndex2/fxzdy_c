export interface IContainer {
    /**
     * 获取view
     */
    _view: fgui.GComponent;

    /**点击页签判断
     * @returns 返回是否可以打开界面
    */
    onClickTabAndCheck?(subIndex: number): boolean;

    /**页签切换前
     * @returns 将打开界面的参数
     */
    onPreChangeView?(subIndex: number): any;

    /**页签切换完成
     */
    onChangedView?(subIndex: number): any;
}