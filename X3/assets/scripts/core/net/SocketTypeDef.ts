
    /**协议 数据类型 */
    export class SocketTypeDef {
        /**序号 */
        private _code: number;

        /**类名 */
        private _name: string;

        /**字段 */
        private _fields: Array<FieldDef>;

        constructor(code: number, clsName: string, tlField: Array<FieldDef>) {
            this._code = code;
            this._name = clsName;
            this._fields = tlField;
        }

        static getType(buf) {
            // 类型, 类标识, (类名长度, 类名字节), 属性数量, (名字长度, 名字字节), (类型长度, 类型字节)....
            var code = buf.readInt16();
            if (code === 0) {
                //解压长度有bug，临时容错 （英文解压工具问题 100的长度，他也会是65536长度,所以遇到0跳出)
                return null;
            }
            var nLen = buf.readInt16();
            var clzName = buf.readUTFBytes(nLen);
            var fields = new Array();
            var len = buf.readInt16();
            var sname;
            var sindx;
            for (var i = 0; i < len; i++) {
                sindx = buf.readInt16();
                sname = buf.readUTFBytes(sindx);
                fields[i] = new FieldDef(i, sname);
            }
            return new SocketTypeDef(code, clzName, fields);
        }

        /**序号 */
        getCode() {
            return this._code;
        }

        /**类名 */
        getName() {
            return this._name;
        }

        /**字段 */
        getFields() {
            return this._fields;
        }
    }

    /**字段 */
    export class FieldDef {
        /**序号 */
        private _code: number;

        /**属性 */
        private _name: string;

        constructor(code, name) {
            this._code = code;
            this._name = name;
        }

        public getCode(): number {
            return this._code;
        }

        public getName(): string {
            return this._name;
        }
    }
