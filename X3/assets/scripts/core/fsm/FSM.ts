/**
 * 简单状态机
*/
export namespace fsm {
    /**任意事件*/
    export const ANY_EVENT: string = 'FSM_ANY_EVENT'

    /**事件*/
    export interface IEvent {
        name: string
        from: string
        to: string
        callback?: (e: IEvent) => void
    }

    /**状态接口*/
    export interface IState {
        name: string
        machine: IMachine
        onEnter(): void
        onExit(): void
        onUpdate(dt: number): void
        trans(event: string): void
        transLater(event: string): void
    }

    /**初始化数据*/
    export interface IInitData {
        initState: string
        states: IState[]
        events: IEvent[]
        callback?: (from: string, to: string) => void
    }

    export interface IMachine {
        start(): void
        trans(event: string): void
        transLater(event: string): void
        update(dt: number): void
        dispose(): void
    }

    export class State implements IState {
        public name: string = 'fsm.State'
        public machine: IMachine = null

        /**进入状态*/
        public onEnter(): void {

        }

        /**退出状态*/
        public onExit(): void {

        }

        /**更新状态*/
        public onUpdate(dt: number): void {

        }

        /**切换状态*/
        public trans(name: string): void {
            if (this.machine) {
                this.machine.trans(name)
            }
        }

        /**切换状态(延时)*/
        public transLater(name: string): void {
            if (this.machine) {
                this.machine.transLater(name)
            }
        }
    }

    /**状态机*/
    export class Machine implements IMachine {
        protected _initData: IInitData = null;
        protected _stateMap: Map<string, IState> = new Map()
        protected _events: Map<string, IEvent> = new Map()
        protected _curState: IState = null

        /**创建状态机*/
        public static create(data: IInitData): Machine {
            let machine = new Machine()
            machine.init(data)
            return machine
        }

        /**状态机初始化*/
        public init(data: IInitData): void {
            if (!data) {
                return
            }
            this._initData = data
            if (!data.initState) {
                console.warn(`fsm 没有设置初始状态 initState`)
            }
            this._stateMap.clear()
            data.states?.forEach((state) => {
                state.machine = this
                this._stateMap.set(state.name, state)
            })
            if (this._stateMap.has(this._initData.initState) == false) {
                console.warn(`fsm 初始状态${data.initState} 不存在`)
            }
            this._events.clear()
            data.events?.forEach((event) => {
                if (event.from != ANY_EVENT && this._stateMap.has(event.from) == false) {
                    console.warn(`fsm 状态${event.from} 不存在 切换事件${event.name}初始化失败`)
                    return
                }
                if (event.from != ANY_EVENT && this._stateMap.has(event.to) == false) {
                    console.warn(`fsm 状态${event.from} 不存在 切换事件${event.name}初始化失败`)
                    return
                }
                this._events.set(event.name, event)
            })
        }

        /**状态机开始运行*/
        public start(): void {
            if (this._initData == null) {
                console.warn(`fsm 未初始化`)
                return
            }
            let initState = this._stateMap.get(this._initData.initState)
            this._curState = initState
            this._curState.onEnter()
        }

        /**切换状态*/
        public trans(name: string): void {
            if (!this._events.has(name)) {
                console.warn(`fsm 事件不存在 ${name} 无法切换`)
                return
            }
            let event = this._events.get(name)
            if (event.from != ANY_EVENT && this._curState?.name != event.from) {
                console.warn(`fsm 当前不处于 ${event.from}状态 事件${event.name} 无法执行`)
                return
            }
            let lastState = this._curState
            this._curState = this._stateMap.get(event.to)
            lastState?.onExit()
            this._curState.onEnter()
            if (event.callback) {
                event.callback(event)
            }
            if (this._initData?.callback) {
                this._initData.callback(lastState ? lastState.name : event.from, event.to)
            }
        }

        /**切换状态(延时)*/
        public transLater(name: string): void {
            setTimeout(() => {
                this.trans(name)
            }, 1)
            
        }

        /**更新*/
        public update(dt: number): void {
            if (this._curState) {
                this._curState.onUpdate(dt)
            }
        }

        /**当前状态*/
        public get curState():IState {
            return this._curState
        }

        /**销毁*/
        public dispose(): void {
            this._stateMap.clear()
            this._events.clear()
            this._curState = null
            this._initData = null
        }
    }
}