import G from "db://assets/scripts/core/comm/G";
import { Res } from "db://assets/scripts/core/res/Res";
import { AssetBundleKeys } from "../../../../core/res/AssetBundleKeys";
import { Layers, Node, sp } from "cc";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { NodeEventType } from "cc";
import { ResRef } from "../../../../core/res/ResRef";

/**
 * 模型
 */
export class ModelUtils {

    /**
     * 根据模型ID获取模型配置
     * @param modelId
     */
    static getModelConfigById(modelId: number): table.model.ModelConfig {
        const modelConfig = G.TableManager.getDataById(table.model.ModelConfig, modelId);
        if (!modelConfig) {
            G.Logger.error(`ModelConfig 配置有误. 不存在 modelId=${modelId}`)
            return null;
        }
        return modelConfig;
    }

    /**
     * 根据模型ID获取界面动作
     * @param modelId
     */
    static getUiModelActionById(modelId: number): string {
        const modelConfig = G.TableManager.getDataById(table.model.ModelConfig, modelId);
        if (!modelConfig) {
            G.Logger.error(`ModelConfig 配置有误. 不存在 modelId=${modelId}`)
            return null;
        }
        return modelConfig.uiAction ? modelConfig.uiAction : modelConfig.action;
    }

    /**
     * 创建 spine 模型
     * @param modelConfig
     * @param parentNode
     * @deprecated
     */
    static createSpineByModelConfig(modelConfig: table.model.ModelConfig, parentNode: Node): Promise<sp.Skeleton> {
        return new Promise((resolve, reject) => {
            Res.getResRef({ bundle: AssetBundleKeys.SPINE, url: modelConfig.modelPath, type: sp.SkeletonData },
                null,
                (res: ResRef) => {
                    if (!res) {
                        G.Logger.error("加载 spine 失败")
                        reject(null)
                        return;
                    }
                    if (NodeUtils.isNotValidNode(parentNode)) {
                        return;
                    }

                    // 加载 spine
                    const node = new Node();
                    node.layer = Layers.Enum.UI_2D;
                    const skeleton1 = node.addComponent(sp.Skeleton);
                    parentNode.addChild(node)
                    skeleton1.skeletonData = res.content;
                    skeleton1.setAnimation(0, modelConfig.action, true)

                    // skeleton.addRef();
                    // node.once(NodeEventType.NODE_DESTROYED, () => {
                    //     skeleton.decRef();
                    // })
                    resolve(skeleton1)
                })

        });

    }

    /**
     * 创建 spine by asset path
     * @param spineAssetPath
     * @param parentNode
     * @deprecated
     */
    static createSpineNodeByAssetPath(spineAssetPath: string, parentNode: Node): Promise<sp.Skeleton> {
        if (StringUtils.isBlank(spineAssetPath)) {
            console.error("spineAssetPath 为空. parentNode = ", parentNode)
            return Promise.reject("spineAssetPath 为空")
        }
        return new Promise((resolve, reject) => {
            Res.getResRef({ bundle: AssetBundleKeys.SPINE, url: spineAssetPath, type: sp.SkeletonData },
                null,
                (res: ResRef) => {
                    if (!res) {
                        G.Logger.error("加载 spine 失败")
                        reject(res)
                        return;
                    }
                    if (NodeUtils.isNotValidNode(parentNode)) {
                        return;
                    }

                    // 加载 spine
                    const node = new Node();
                    node.layer = Layers.Enum.UI_2D;
                    const skeleton1 = node.addComponent(sp.Skeleton);
                    parentNode.addChild(node)

                    skeleton1.skeletonData = res.content;
                    // skeleton.addRef();
                    // node.once(NodeEventType.NODE_DESTROYED, () => {
                    //     skeleton.decRef();
                    // })
                    resolve(skeleton1)
                })

        });

    }
}