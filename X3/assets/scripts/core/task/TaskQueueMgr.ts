/*
*   任务队列管理器
*   1. 传入任务，进入队列顺序执行
*   2. 支持优先级（从小到大排序，priority越小优先级越高）
*   3. 支持队列Tag，允许多个互不影响的队列执行
*   4. 支持清理任务队列
*   5. 一个任务只能完成一次，避免代码的原因多次调用完成，导致后续任务提前执行
*   6. 调试模式下记录了每个Task添加时的堆栈，方便调试（可以快速查看哪个任务没有结束）
*/

import BaseSingleton  from "../base/BaseSingleton";

// 任务结束回调
export type TaskFinishCallback = () => void;
// 任务执行回调
export type TaskCallback = (TaskFinishCallback) => void;

class TaskInfo {
    public task: TaskCallback;
    public priority: number;
    public constructor(task: TaskCallback, priority: number) {
        this.task = task;
        this.priority = priority;
    }
}

export class TaskQueue {
    private _curTask: TaskInfo = null;
    private _taskQueue: TaskInfo[] = Array<TaskInfo>();

    // 添加一个任务，如果当前没有任务在执行，该任务会立即执行，否则进入队列等待
    public pushTask(task: TaskCallback, priority: number = 0): void {
        let taskInfo = new TaskInfo(task, priority);
        if (this._taskQueue.length > 0) {
            for (var i: number = this._taskQueue.length - 1; i >= 0; --i) {
                if (this._taskQueue[i].priority <= priority) {
                    this._taskQueue.splice(i + 1, 0, taskInfo);
                    return;
                }
            }
        }
        // 插到头部
        this._taskQueue.splice(0, 0, taskInfo);
        if (this._curTask == null) {
            this.executeNextTask();
        }
    }

    public clearTask(): void {
        this._curTask = null;
        this._taskQueue.length = 0;
    }

    private executeNextTask(): void {
        let taskInfo = this._taskQueue.shift() || null;
        this._curTask = taskInfo;
        if (taskInfo) {
            taskInfo.task(() => {
                if (taskInfo === this._curTask) {
                    this.executeNextTask();
                } else {
                    console.warn("your task finish twice!");
                }
            });
        }
    }
}

export class TaskQueueMgr extends BaseSingleton{
    
    private _taskQueues: { [key: number]: TaskQueue } = {}

    public pushTask(task: TaskCallback, priority: number = 0): void {
        return this.getTaskQueue().pushTask(task, priority);
    }

    public pushTaskByTag(task: TaskCallback, tag: number, priority: number = 0): void {
        return this.getTaskQueue(tag).pushTask(task, priority);
    }

    public clearTaskQueue(tag: number = 0): void {
        let taskQueue = this._taskQueues[tag];
        if (taskQueue) {
            taskQueue.clearTask();
        }
    }

    public clearAllTaskQueue(): void {
        for (let queue in this._taskQueues) {
            this._taskQueues[queue].clearTask();
        }
        this._taskQueues = {}
    }

    private getTaskQueue(tag: number = 0): TaskQueue {
        let taskQueue = this._taskQueues[tag];
        if (taskQueue == null) {
            taskQueue = new TaskQueue();
            this._taskQueues[tag] = taskQueue;
        }
        return taskQueue;
    }
}
