declare module Zlib {
    export class Inflate {
        constructor(data: Uint8Array, option?: object);
        decompress(): any;
    }

    export class Deflate {
        constructor(data: any, option?: object);
        compress(): any;
    }

}