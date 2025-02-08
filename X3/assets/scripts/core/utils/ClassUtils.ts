/**
 * class公用接口
 */
export class ClassUtils {

  /**
   * 检测是不是某个Class
   * @param instance 类或者是示例的对象
   * @param classC 类定义
   */
  public static isClass(instance: any, classC: any) {
    if (!instance) {
      return false;
    }
    return this.getClass(instance) == classC;
  }

  /**
   * 检测类定义(类其实是一个Funciton，所以获取其构造器比较)
   * @param instance 类或者实例化的对象
   * @return 返回类定义
   */
  public static getClass(instance: any) {
    return instance ? typeof instance === "function" ? instance : instance.__proto__.constructor : null;
  }
}
