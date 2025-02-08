import G from "../../../../core/comm/G";

export class CollectionTaskVo {
    taskId: number
    progress = 0

    taskProgress: number

    cfg: table.collectibles.CollectiblesTaskAttrConfig

    constructor(vo: Vo.task.TaskVo) {
        this.reset(vo)
    }

    reset(vo: Vo.task.TaskVo) {
        if (this.taskId !== vo.taskId) {
            this.taskId = vo.taskId;
            this.cfg = G.TableManager.getDataById(table.collectibles.CollectiblesTaskAttrConfig, this.taskId);
        }
        if (this.progress !== vo.progress) {
            this.progress = vo.progress;
            this.taskProgress = undefined;
        }
    }

    getTaskProgress() {
        if (this.taskProgress === undefined) {
            let p = Math.floor(this.progress / this.cfg.progress);
            this.taskProgress = Math.min(p, this.cfg.validLimit);
        }

        return this.taskProgress;
    }
}