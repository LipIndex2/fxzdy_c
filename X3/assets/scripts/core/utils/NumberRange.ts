/**
 * 数字范围
 */
export class NumberRange {
    readonly start: number;
    readonly end: number;

    private constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    public static create(start: number, end: number): NumberRange {
        if (start > end) {
            console.error("[数值配置区间有问题] start should not be greater than end. [start, end]", start, end);
            return new NumberRange(0, 0);
        }

        return new NumberRange(start, end);
    }

    public isIn(num: number,
                isLeftClosed: boolean = true,
                isRightClosed: boolean = true
    ): boolean {
        if (isLeftClosed) {
            if (isRightClosed) {
                return num >= this.start && num <= this.end;
            }
            return num >= this.start && num < this.end;
        }
        if (isRightClosed) {
            return num > this.start && num <= this.end;
        }
        return num > this.start && num < this.end;
    }

    public isNotIn(num: number,
                   isLeftClosed: boolean = true,
                   isRightClosed: boolean = true
    ): boolean {
        return !this.isIn(num, isLeftClosed, isRightClosed);
    }

    getPercentByValue(value: number, maxPercentValue = 1) {
        let percent = 0;
        if (value < this.start) {
            percent = 0;
        }
        if (value > this.end) {
            percent = 1;
        } else {
            percent = (value - this.start) / (this.end - this.start);
        }
        return maxPercentValue * percent;
    }
}
