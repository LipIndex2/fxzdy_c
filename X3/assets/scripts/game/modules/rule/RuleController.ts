import { UITransform } from "cc";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { TableManager } from "../../../core/table/TableManager";
import { RuleView1 } from "./ruleView1";
import { RuleView2 } from "./ruleView2";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";

export class RuleController extends BaseController
{

    rule1Key = "rule1";
    rule2Key = "rule2";
    listenNotifications(): string[] {
        return [
            
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
           
        }
    }

    onInit(): void {
        UIScriptManager.bindScript(this.rule1Key, RuleView1);
        UIScriptManager.bindScript(this.rule2Key, RuleView2);
    }

    // 打开规则
    openRule(configId: EnumRuleKeys, btn: fgui.GButton) {
        let cfg = TableManager.getDataById(table.rule.RuleConfig, configId);
        if (!cfg) {
            console.error("没有规则配置", configId);
        } else {
            if (cfg.type == 1) {
                //计算出btn的世界坐标
                let showPoint = btn.node.parent.getComponent(UITransform).convertToWorldSpaceAR(btn.node.position);
                UIManager.ins().open(this.rule1Key, {configId, showPoint});
            } else if (cfg.type == 2) {
                UIManager.ins().open(this.rule2Key, configId);
            }
        }
    }

}

RuleController.ins().doInit();