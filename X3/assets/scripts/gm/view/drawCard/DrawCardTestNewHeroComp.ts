import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { DrawCardFirstGetItemViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardFirstGetItemView";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ModelUtils } from "db://assets/scripts/game/modules/common/model/ModelUtils";
import { EnumGainNewHeroType } from "db://assets/scripts/game/modules/drawcard/enums/EnumGainNewHeroType";


/**
 * GM 邮件
 */
export class DrawCardTestNewHeroComp extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMEmailView";

    // endregion
    private _allHeroConfigArray: table.hero.HeroConfig[];


    private get view(): ui.gm.drawCard.DrawCardTestNewHeroComp {
        return this as any;
    }

    constructor() {
        super();
    }

    onConstruct() {
        this.view.heroList.setVirtual();
        this.view.heroList.itemRenderer = this.renderHeroItem.bind(this);

        this.view.btnOk.labelTitle.text = "抽他!"
        this.view.btnCheck.labelTitle.text = "检查英雄模型"
        this.view.input1.labelTitle.text = "heroId"

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)
        this.view.btnCheck.on(fgui.Event.CLICK, this.onClickCheck, this)
        
        this.onInit()
        
    }

    renderHeroItem(index: number, item: ui.gm.common.Text2PartComp) {
        const heroConfig = this._allHeroConfigArray[index];
        item.label1.text = heroConfig.id + " /品质" + heroConfig.quality;
        item.label2.text = heroConfig.name;
        
        
    }
    
    public onInit() {
        const allHeroConfigArray = HeroUtils.getAllHeroConfigArray();
        this._allHeroConfigArray = allHeroConfigArray
        this.view.heroList.numItems = allHeroConfigArray.length
        
        this.view.input1.inputName.text = this._allHeroConfigArray[0].id + "";
    }


    private onClickOk() {
        const heroIdStr = this.view.input1.inputName.text;
        if (StringUtils.isBlank(heroIdStr)) {
            G.Logger.error("请输入英雄ID");
            return;
        }
        const heroId = heroIdStr.toInt();
        G.UIManager.open(DrawCardUIKeys.DrawCardFirstGetItemView, DrawCardFirstGetItemViewOpenArgs.create(
            heroId,
            EnumGainNewHeroType.DRAW_CARD
        ))
    }

    private onClickCheck() {
        this._allHeroConfigArray.toDataStream()
            .forEach(it => {
                const modelId = it.modelId;
                const modelConfig = ModelUtils.getModelConfigById(modelId)
                if (modelConfig) {
                    return;
                }
                const heroId = it.id;
                G.Logger.error(`heroId = ${heroId} 模型配置不存在: ${modelId}`)
            })
    }
}