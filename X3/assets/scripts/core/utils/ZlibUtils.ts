/**zlib 工具 */
export class ZlibUtils {
  /**
   * 解析数据
   * @param data
   * @return ArrayBuffer
   */
  public static analyzeData(data: ArrayBuffer) {
    var byt = new Uint8Array(data);
    var z = new Zlib.Inflate(byt);
    var de8ab = z.decompress();
    return de8ab.buffer;
  }

  /**
   * 压缩js数据
   * @param jsonData
   * @returns
   */
  static compressData(jsonData: string) {
    function stringToUint8Array(str) {
      var arr = [];
      for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
      }
      //return arr;
      var tmpUint8Array = new Uint8Array(arr);
      return tmpUint8Array;
    }
    var byt = stringToUint8Array(jsonData);
    var z = new Zlib.Deflate(byt, { compressionType: 2 });
    var de8ab = z.compress();
    return de8ab;
  }

  /**
   * 压缩数据
   * @param data
   * @return ArrayBuffer
   */
  static compress(data: ArrayBuffer) {
    var byt = new Uint8Array(data);
    var z = new Zlib.Deflate(byt, null);
    var de8ab = z.compress();
    return de8ab;
  }
}
