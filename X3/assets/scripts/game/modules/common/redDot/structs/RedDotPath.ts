import { KvTemplate } from "db://assets/scripts/core/utils/KvTemplate";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { Logger } from "db://assets/scripts/core/log/Logger";

/**
 * 红点路径
 */
export class RedDotPath {


    // 路径模板 | 动态参数格式 = ${key0}
    private _templatePath: string = "";
    private _showType: EnumRedDotShowType = EnumRedDotShowType.NULL;

    private static _templateToPathMap: Map<string, RedDotPath> = new Map();

    static create(template: string,
                  showType: EnumRedDotShowType = EnumRedDotShowType.NORMAL
    ): RedDotPath {
        const path = new RedDotPath();
        if (!template.startsWith("/")) {
            Logger.error(`[红点] 路径格式有问题. 必须是 /dir/name/\${key0} 这种格式 | \${key0} = 数组[0] 的动态参数 `);
            return path;
        }


        path._templatePath = template;
        path._showType = showType;

        this._templateToPathMap.set(template, path);


        return path;
    }

    /**
     * 模板路径
     * @param template
     */
    static fromTemplatePath(template: string): RedDotPath | null {
        return this._templateToPathMap.get(template);
    }


    get templatePath(): string {
        return this._templatePath;
    }

    get showType(): EnumRedDotShowType {
        return this._showType;
    }

    // 事件名
    toEventName(): string {
        // 唯一的事件名
        return `${NotificationKey.RED_DOT_CHANGE}_${this.templatePath}`;
    }

    /**
     * 渲染路径
     * @param args
     */
    render(...args: string[]): string {
        const kvTemplate = KvTemplate.create(this._templatePath);
        if (args) {
            for (let i = 0; i < args.length; i++) {
                kvTemplate.put(`key${i}`, args[i]);
            }
        }
        return kvTemplate
            .render();
    }
    
    toString(): string {
        return `path = ${this._templatePath}, showType = ${this._showType}`;
    }

}