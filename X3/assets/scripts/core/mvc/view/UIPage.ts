import { UIView, ViewAdaptType, ViewType } from "./UIView";

/**UI页（一般情况下，功能的主页应当是UIPage）
 * 当打开另一个UIPage，前面的界面将会被close并隐藏
 */
export class UIPage extends UIView {
    public _viewType = ViewType.Page;
    // 刘海屏适配
    protected adaptType = ViewAdaptType.TOP_BOTTOM;
} 