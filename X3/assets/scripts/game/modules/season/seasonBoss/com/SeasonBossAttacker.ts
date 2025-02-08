import * as fgui from "fairygui-cc";
import { PlayerInfoConfigManager } from "../../../player/config/PlayerInfoConfigManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ModelNode } from "../../../common/node/ModelNode";

export class SeasonBossAttacker extends fgui.GComponent {
    _rewards:Array<{k:any,v:any}>;


    private get view(): ui.seasonBoss.com.SeasonBossAttacker {
      return this as any;
    }
  
    onConstruct() {
      this.onInit();
    }
  
    public onInit() {
      const t = this;
 
    }

 
    reset(data:{baseVo:Vo.player.PlayerBaseVo, rank?:number},index:number) {
        const t = this;
        if(index > 4){
            t.view.scaleX = t.view.scaleY = 0.92;
        }else{
            t.view.scaleX = t.view.scaleY = 1;
        }

        let ctr = t.view.getController("rank");
        if(data && data?.baseVo){
            t.view.lbName.text = data.baseVo.name;
            const width = this.view.lbName.width;
            if(data.rank && data.rank > 0 && data.rank <=3){
                ctr.selectedIndex = 1;
                t.view.imgTop.visible = true;
                t.view.imgTop.icon = "ui://comm/no"+data.rank+"_icon"
                t.view.imgTop.x = (150 - width- 45 - 4)/2;
                t.view.lbName.x = this.view.imgTop.x + 49;
            }else if(data.rank) {
                ctr.selectedIndex = 2;
                t.view.lbRank.text = data.rank+'';
                t.view.rankG.x = (150 - width- 35 - 4)/2;
                t.view.lbName.x = this.view.rankG.x + 39;
            }else{
                ctr.selectedIndex = 0;
                t.view.lbName.x = (150 - width)/2;
            }
          
            const modelNode = FguiScriptUtils.toMyScriptClass(t.view.spineNode, ModelNode);
            const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(data.baseVo)
            modelNode.loadByModelId(modelId);
            modelNode.play("idle", true);

            if(index%2==0){
                modelNode.setScale(1.4, 1.4);
            }else{
                modelNode.setScale(-1.4, 1.4);
            }
        }


    }
  }