import * as MathUtils from "./MathUtils.js";
import { Vector3 } from "./Vector3.js";

/**
 * 表示一个球面坐标点。
 * 球面坐标由三个值组成：半径（radius）、极角（phi）和方位角（theta）。
 * 半径表示从原点到该点的距离，
 * 极角表示从正z轴到该点的角度，
 * 方位角表示从正x轴到该点在xy平面上的角度。
 */
class Spherical {
  /**
   * 半径
   */
  radius: number;

  /**
   * 极角
   */
  phi: number;

  /**
   * 方位角
   */
  theta: number;

  /**
   * 构造函数，初始化球面坐标点。
   * @param radius 半径，默认值为1
   * @param phi 极角，默认值为0
   * @param theta 方位角，默认值为0
   * @returns 当前对象实例
   */
  constructor(radius = 1, phi = 0, theta = 0) {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;

    return this;
  }

  /**
   * 设置球面坐标点的值。
   * @param radius 半径
   * @param phi 极角
   * @param theta 方位角
   * @returns 当前对象实例
   */
  set(radius: number, phi: number, theta: number) {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;

    return this;
  }

  /**
   * 复制另一个球面坐标点的值。
   * @param other 要复制的球面坐标点
   * @returns 当前对象实例
   */
  copy(other: Spherical) {
    this.radius = other.radius;
    this.phi = other.phi;
    this.theta = other.theta;

    return this;
  }

  /**
   * 将极角限制在 EPS 和 PI - EPS 之间，防止数值不稳定。
   * @returns 当前对象实例
   */
  makeSafe() {
    const EPS = 0.000001;
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));

    return this;
  }

  /**
   * 从三维向量设置球面坐标点。
   * @param v 三维向量
   * @returns 当前对象实例
   */
  setFromVector3(v: Vector3) {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  /**
   * 从笛卡尔坐标设置球面坐标点。
   * @param x x坐标
   * @param y y坐标
   * @param z z坐标
   * @returns 当前对象实例
   */
  setFromCartesianCoords(x: number, y: number, z: number) {
    this.radius = Math.sqrt(x * x + y * y + z * z);

    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.atan2(x, z);
      this.phi = Math.acos(MathUtils.clamp(y / this.radius, -1, 1));
    }

    return this;
  }

  /**
   * 克隆当前球面坐标点。
   * @returns 新的球面坐标点实例
   */
  clone() {
    return new Spherical().copy(this);
  }
}

export { Spherical };

