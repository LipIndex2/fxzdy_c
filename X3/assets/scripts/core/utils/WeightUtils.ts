


export class WeightObject<T> {
    protected _totalWeight: number = 0
    protected _values: T[] = []
    protected _weight: number[] = []

    /**重置数据*/
    public reset(): void {
        this._values.length = 0
        this._weight.length = 0
        this._totalWeight = 0
    }

    /**添加到权重池*/
    public add(value: T, weight: number): void {
        if (weight > 0) {
            this._values.push(value)
            this._weight.push(weight)
            this._totalWeight += weight
        }
    }

    /**从权重池移除*/
    public remove(value: T): void {
        let index = this._values.indexOf(value)
        if (index != -1) {
            let weight = this._weight[index]
            this._values.splice(index, 1)
            this._weight.splice(index, 1)
            this._totalWeight -= weight
        }
    }

    /**根据概率在列表中取出一个满足要求的下标*/
    protected extractOneIndex(random: number, excludes: T[] = null): number {
        let weight: number = 0
        for (let i = 0; i < this._values.length; i++) {
            if (excludes && excludes.indexOf(this._values[i]) != -1) {
                continue
            }
            weight += this._weight[i]
            if (weight >= random) {
                return i
            }
        }
        return -1
    }

    /**取出一个对象*/
    public extractOne():T {
        let value:T = null
        if (this._values.length <= 1) {
            value = this._values.length >= 1 ? this._values[0] : null
        } else {
            let weight = this._totalWeight
            let random = Math.floor(Math.random() * weight) + 1;
            let index: number = this.extractOneIndex(random);
            if (index != -1) {
                value = this._values[index]
            }
        }
        return value
    }

    /**取出指定数量的对象*/
    public extract(count: number = 1, repeat: boolean = false): T[] {
        let weight = this._totalWeight
        let results: T[] = []
        if (count >= this._values.length) {
            results = this._values.concat()
        } else {
            for (let i = 0; i < count; i++) {
                if (weight <= 0) {
                    break;
                }
                let random = Math.floor(Math.random() * weight) + 1;
                let index: number = this.extractOneIndex(random, repeat ? null : results);
                if (index != -1) {
                    results.push(this._values[index])
                    weight -= this._weight[index]
                } else {
                    break;
                }
            }
        }
        return results
    }
}

/**权重工具类*/
export class WeightUtils {
    /**创建权重对象*/
    static create<T>(): WeightObject<T> {
        return new WeightObject<T>()
    }
}