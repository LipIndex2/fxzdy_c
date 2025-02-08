import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { VideoNode } from "../../common/node/VideoNode";
import { HeroManager } from "../../hero/HeroManager";
import { HeroSkillData } from "../../hero/HeroVo";
import { UIActivityKey } from "../const/UIActivityConfig";

/** 英雄演示弹窗 */
@bindScript(UIActivityKey.FirstChargeDemoWin)
export class FirstChargeDemoWin extends UICommWin {

    static pkgName: string = "activityFirstCharge";
    static viewName: string = "FirstChargeDemoWin";

    private get view(): ui.activityFirstCharge.FirstChargeDemoWin {
        return this._view as any;
    }

    protected onOpen(args: any): void {
        let heroId = args?.heroId
        let videoId = args?.videoId
        let videoCfg = G.TableManager.getDataById(table.video.VideoConfig, videoId)
        if (videoCfg) {
            let videoNode = this.view.videoNode as VideoNode
            // videoNode.nativeScale = 8.6//7.73
            videoNode.play(videoCfg)
        }

        let heroVo = HeroManager.ins().getHeroVoByID(heroId)
        if (heroVo) {
            let skillData: HeroSkillData = heroVo.skillList[0]?.data
            this.view.skill.img_skill.img_skill.icon = skillData?.cfg?.icon
            this.view.skill.lbName.text = skillData?.cfg?.name
            this.view.skill.pDes.lbDes.text = StringUtils.repleaceDescToAtkImage(skillData?.cfg?.desc);
        }
    }
}