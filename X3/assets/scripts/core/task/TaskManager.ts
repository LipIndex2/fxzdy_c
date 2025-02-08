import { Handler } from "../utils/Handler";

export abstract class Task {

    public group: TaskGroup;

    private isEnd: boolean = false;

    /**
     * 任务执行的时调用，你主要在这里实现你的业务逻辑
     * @param args
     */
    abstract run(args?: any): void;

    /**
     * 你必现在任务里面手动调用这个方法，告诉任务管理器当前任务已经结束，可以调用下一个任务了
     * @protected
     */
    protected end(): void {
        if (this.isEnd) return;
        this.isEnd = true;
        this.group.next();
    }

    /**
     * 任务流被终断时调用
     */
    public onInterrupt(): void {
    }

    /**异常退出任务流 */
    public exit(): void {
        this.group.exit();
    }
}

export enum TaskGroupState {
    running = 1,
    completed,
    failed,
}

/**
 * 实现按照任务添加的顺序来执行任务。
 * 这里的任务是同步串联的方式执行的，就是执行完毕一个才会执行下一个
 */
export class TaskGroup {
    private state = TaskGroupState.running;
    private tasks: Array<Task>;
    public completeHandler: Handler;
    public errorHandler: Handler;
    public args: any;

    public getState() {
        return this.state;
    }

    public setTasks(tasks: Array<Task>): void {
        this.tasks = tasks;
        for (let i: number = 0; i < tasks.length; ++i) {
            tasks[i].group = this;
        }
    }
    public interrupt(): void {
        if (this.tasks) {
            for (let i: number = 0; i < this.tasks.length; ++i) {
                this.tasks[i].onInterrupt();
            }
            this.tasks.length = 0;
        }
    }

    public next(): void {
        if (this.tasks && this.tasks.length > 0) {
            this.state = TaskGroupState.running;
            let task: Task = this.tasks.shift();
            task.run(this.args);
        } else {
            this.end(true);
        }
    }

    private end(isComplete: boolean = false): void {
        this.args = null;
        let index = TaskManager.groups.indexOf(this);
        TaskManager.groups.splice(index, 1);

        if (isComplete) {
            this.state = TaskGroupState.completed;
            this.completeHandler && this.completeHandler.run();
        } else {
            this.state = TaskGroupState.failed;
            this.errorHandler && this.errorHandler.run();
        }

        this.completeHandler = null;
        this.errorHandler = null;

    }

    /**异常退出工作流 */
    public exit() {
        this.interrupt();
        this.end(false);
    }
}

/**
 * 任务管理器
 * 实现将呈现流程拆分不同的Task，整个流程可以分为多个Task。每个Task实现一段流程逻辑
 * 每次只执行一个Task，只有一个Task执行完毕之后，下一个Task才执行，按注册顺序执行Task
 */
export class TaskManager {
    public static groups: Array<TaskGroup> = [];

    /**
     * @param task
     * @param args 可以将参数传递到每个Task中。必现是一个JSON对象
     * @param completeHandler 所有的Task执行完毕的回调
     */
    public static runTask(task: Array<Task>, args: any = {}, completeHandler?: Handler, errorHandler?: Handler): TaskGroup {
        let group = new TaskGroup();
        TaskManager.groups.push(group);
        group.setTasks(task);
        group.args = args || {};
        group.completeHandler = completeHandler;
        group.errorHandler = errorHandler;
        group.next();
        return group;
    }

    public static clear(): void {
        for (let i: number = 0; i < TaskManager.groups.length; ++i) {
            TaskManager.groups[i].interrupt();
        }
        TaskManager.groups.length = 0;
    }
}