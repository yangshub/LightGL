import { Euler } from "./Euler";
import { clamp } from "./MathUtils";
import { Matrix3 } from "./Matrix3";
import { Matrix4 } from "./Matrix4";
import { Quaternion } from "./Quaternion";
import { Spherical } from "./Spherical";

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  set(x?: number, y?: number, z?: number) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;

    return this;
  }

  setScalar(scalar: number) {
    return this.set(scalar, scalar, scalar);
  }

  setX(x: number) {
    return this.set(x, this.y, this.z);
  }

  setY(y: number) {
    return this.set(this.x, y, this.z);
  }

  setZ(z: number) {
    return this.set(this.x, this.y, z);
  }

  setComponent(index: number, value: number) {
    switch (index) {
      case 0:
        return this.setX(value);
      case 1:
        return this.setY(value);
      case 2:
        return this.setZ(value);
      default:
        throw new Error("index is out of range: " + index);
    }

    return this;
  }

  getComponent(index: number) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + index);
    }
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    return this.set(v.x, v.y, v.z);
  }

  add(v: Vector3) {
    return this.set(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  addScalar(s: number) {
    return this.set(this.x + s, this.y + s, this.z + s);
  }

  addVectors(a: Vector3, b: Vector3) {
    return this.set(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  addScaledVector(v: Vector3, s: number) {
    return this.add(v.clone().multiplyScalar(s));
  }

  subtract(v: Vector3) {
    return this.set(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  subtractScalar(s: number) {
    return this.set(this.x - s, this.y - s, this.z - s);
  }
  subtractVectors(a: Vector3, b: Vector3) {
    return this.set(a.x - b.x, a.y - b.y, a.z - b.z);
  }
  multiply(v: Vector3) {
    return this.set(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  multiplyScalar(scalar: number) {
    return this.set(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  multiplyVectors(a: Vector3, b: Vector3) {
    return this.set(a.x * b.x, a.y * b.y, a.z * b.z);
  }

  applyEuler(euler: Euler) {
    const quaternion = new Quaternion();

    return this.applyQuaternion(quaternion.setFromEuler(euler));
  }

  /**
   * 应用轴角旋转到当前向量.
   *
   * 此方法通过指定轴和角度来计算一个四元数，然后将这个四元数应用于当前向量，以实现绕给定轴的旋转.
   * 它是实现向量在3D空间中旋转的基本方法之一，特别适用于需要进行精确旋转操作的场景.
   *
   * @param axis 旋转轴，表示绕哪个轴进行旋转.
   * @param angle 旋转角度，以弧度表示，表示旋转的程度.
   * @returns 返回应用旋转后的当前向量，允许进行链式调用.
   */
  applyAxisAngle(axis: Vector3, angle: number) {
    // 创建一个新的四元数对象，用于后续的旋转计算.
    const quaternion = new Quaternion();
    // 通过指定的轴和角度设置四元数，并应用到当前向量.
    return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
  }

  applyMatrix3(m: Matrix3) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    const rx = e[0] * x + e[3] * y + e[6] * z;
    const ry = e[1] * x + e[4] * y + e[7] * z;
    const rz = e[2] * x + e[5] * y + e[8] * z;
    return this.set(rx, ry, rz);
  }

  applyNormalMatrix(m: Matrix3) {
    return this.applyMatrix3(m).normalize();
  }

  /**
   * 将当前向量应用给定的4x4矩阵变换
   *
   * @param m 要应用的矩阵变换
   * @returns 返回变换后的新向量
   */
  applyMatrix4(m: Matrix4) {
    // 保存当前向量的x, y, z坐标
    const x = this.x;
    const y = this.y;
    const z = this.z;
    // 获取矩阵的元素数组
    const e = m.elements;

    // 计算齐次坐标w，用于归一化变换后的向量
    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    // 应用矩阵变换并归一化向量
    return this.set(
      (e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
      (e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
      (e[2] * x + e[6] * y + e[10] * z + e[14]) * w
    );
  }

  /**
   * 应用四元数变换到当前向量
   *
   * @param q - 一个四元数，用于变换当前向量
   * @returns 返回变换后的向量（即当前向量）
   *
   * 此方法通过四元数变换来计算当前向量在新坐标系中的位置
   * 它避免了欧拉角带来的万向锁问题，适用于3D游戏和图形应用中的向量变换
   */
  applyQuaternion(q: Quaternion) {
    // 为了提高性能，预先计算向量和四元数的元素乘积
    const x = this.x,
      y = this.y,
      z = this.z;
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;

    // 计算四元数和向量的乘积
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // 计算结果向量在原始坐标系中的表示
    const rx = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    const ry = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    const rz = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    // 应用计算结果到当前向量并返回
    return this.set(rx, ry, rz);
  }

  /**
   * 将向量通过给定的变换矩阵转换, 返回变换后的方向向量
   *
   * @param m - 一个4x4的矩阵，用于转换方向向量
   * @returns 返回转换后的方向向量
   */
  transformDirection(m: Matrix4) {
    // 解构当前对象的x, y, z分量
    const { x, y, z } = this;
    // 获取矩阵元素以备计算
    const e = m.elements;

    // 计算转换后的x, y, z分量
    // 分别是矩阵的前、后、中三行与原向量分量的点积
    return this.set(
      e[0] * x + e[4] * y + e[8] * z,
      e[1] * x + e[5] * y + e[9] * z,
      e[2] * x + e[6] * y + e[10] * z
    ).normalize();
  }

  divide(v: Vector3) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  min(v: Vector3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  max(v: Vector3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  /**
   * 将当前向量的每个分量限制在由给定的最小和最大向量定义的范围内
   *
   * @param min 定义每个分量的最小值的向量
   * @param max 定义每个分量的最大值的向量
   *
   * 注意：假设min和max向量的每个分量都满足min < max
   *
   * 该方法分别对x、y、z分量进行操作，确保它们各自位于对应的min和max分量之间
   * 这是通过使用Math.max和Math.min函数实现的，首先确保当前向量的分量不小于min向量的对应分量，
   * 然后确保结果不超过max向量的对应分量
   */
  clamp(min: Vector3, max: Vector3) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
  }

  /**
   * 将向量的每个分量限制在[min, max]范围内
   *
   * 此方法假设min和max满足min < max
   *
   * @param min - 向量每个分量的最小值
   * @param max - 向量每个分量的最大值
   */
  clampScalar(min: number, max: number) {
    // assumes min < max, componentwise

    this.x = Math.max(min, Math.min(max, this.x));
    this.y = Math.max(min, Math.min(max, this.y));
    this.z = Math.max(min, Math.min(max, this.z));
  }

  /**
   * 将向量的长度限制在指定的最小值和最大值之间
   *
   * 此方法首先计算当前向量的长度，然后将该长度与提供的最小值和最大值进行比较
   * 如果长度小于最小值，则将其缩放至最小值；如果长度大于最大值，则将其缩放至最大值
   * 如果长度已经在最小值和最大值之间，则向量不变
   *
   * @param min - 想要限制的最小长度值
   * @param max - 想要限制的最大长度值
   * @returns 返回经过长度限制后的向量
   */
  clampLength(min: number, max: number) {
    // 计算当前向量的长度
    const length = this.length();

    // 将向量长度限制在[min, max]之间
    // 如果length为0，则使用默认值1以避免除以0
    // 使用Math.max和Math.min确保结果在[min, max]范围内
    return this.divideScalar(length || 1).multiplyScalar(
      Math.max(min, Math.min(max, length))
    );
  }

  /**
   * 将当前对象的坐标值x、y、z向下取整
   *
   * 此方法通过调用Math.floor函数将对象的每个坐标值x、y、z取整数部分
   * 主要用于需要对坐标进行整数化处理的场景，以确保后续操作基于整数坐标进行
   *
   * @returns 返回当前对象，以便于链式调用
   */
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  /**
   * 对当前对象的坐标（x, y, z）进行向上取整操作
   *
   * 此方法遍历对象的每个坐标维度，并使用Math.ceil函数将每个维度的值向上取整到最近的整数
   * 它修改了原始对象的坐标值，并保持对象引用不变
   *
   * @returns {this} 返回当前对象实例，支持链式调用
   */
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  /**
   * 对当前对象的坐标进行四舍五入操作
   *
   * 此方法将对象的 x、y 和 z 属性值四舍五入为最接近的整数
   * 它用于在需要整数坐标时对浮点数坐标进行处理，以确保精确度
   *
   * @returns {this} 返回当前对象，经过四舍五入处理后
   */
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  }

  negate() {
    return this.multiplyScalar(-1);
  }

  /**
   * 计算当前三维向量与另一个三维向量的点积
   * 点积的结果是一个标量，它等于两个向量的对应元素乘积的和
   * 这个方法常用于计算两个向量的夹角、投影等问题中
   *
   * @param v 另一个三维向量
   * @returns 返回当前向量与向量v的点积
   */
  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  length() {
    return Math.sqrt(this.lengthSq());
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  /**
   * 线性插值函数
   *
   * 该函数对当前向量和目标向量v之间进行线性插值，根据给定的插值因子alpha
   * 插值结果会改变当前向量的xyz分量，以向目标向量靠近
   *
   * @param v 目标向量，我们想要插值到的方向和距离由该向量指定
   * @param alpha 插值因子，表示插值的程度，通常在0到1之间，但不严格限制
   * @returns 返回当前向量，经过插值后，它是更接近目标向量v的向量
   */
  lerp(v: Vector3, alpha: number) {
    // 对x分量进行插值，使当前向量在x轴上向目标向量靠近
    this.x += (v.x - this.x) * alpha;
    // 对y分量进行插值，使当前向量在y轴上向目标向量靠近
    this.y += (v.y - this.y) * alpha;
    // 对z分量进行插值，使当前向量在z轴上向目标向量靠近
    this.z += (v.z - this.z) * alpha;

    // 返回当前向量，现在它已经根据插值因子alpha向目标向量v靠近
    return this;
  }

  lerpVectors(v1: Vector3, v2: Vector3, alpha: number) {
    // 计算两个向量之间的插值，并保存在当前向量中
    return this.subtractVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }

  /**
   * 计算当前向量与另一个向量的叉积
   *
   * 向量的叉积是一个新的向量，其方向垂直于原来的两个向量，长度表示原两个向量构成的平行四边形的面积
   * 这个方法主要用于计算三维空间中向量的叉积，对于物理模拟、计算机图形学等领域有广泛应用
   *
   * @param v 另一个向量，与当前向量计算叉积
   * @returns 返回一个新的向量，为当前向量与参数向量的叉积
   */
  cross(v: Vector3) {
    // 调用crossVectors方法计算叉积，传入当前向量和参数向量
    // 这里使用了委托的方式来实现功能，而不是直接实现向量运算
    return this.crossVectors(this, v);
  }

  crossVectors(a: Vector3, b: Vector3) {
    // 计算两个向量之间的叉积
    const ax = a.x,
      ay = a.y,
      az = a.z;
    const bx = b.x,
      by = b.y,
      bz = b.z;

    // 更新当前向量的xyz分量，使其与计算出的叉积相同
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }

  /**
   * 将当前向量在给定向量上的投影
   * @param v 给定的投影向量
   * @returns 返回投影后的向量
   */
  projectOnVector(v: Vector3) {
    // 计算给定向量的长度平方，用于后续计算
    const denominator = v.lengthSq();

    // 如果给定向量的长度平方为0，则返回零向量
    if (denominator === 0) return this.set(0, 0, 0);

    // 计算当前向量在给定向量上的投影向量
    // 首先计算当前向量与给定向量的点积
    const scalar = v.dot(this) / denominator;

    // 将当前向量乘以点积的结果，得到投影向量
    return this.copy(v).multiplyScalar(scalar);
  }

  /**
   * 将当前向量在指定平面上进行投影
   *
   * @param planeNormal 平面的法向量，用于确定平面的方向
   * @returns 返回在平面上的投影向量
   */
  projectOnPlane(planeNormal: Vector3) {
    // 计算当前向量在平面上的投影向量
    // 首先计算当前向量与平面法线的点积
    const v1 = new Vector3();
    v1.copy(this).projectOnVector(planeNormal);
    return this.subtract(v1);
  }

  /**
   * 计算当前向量关于给定法向量的反射向量
   * 反射向量是光学中一个重要的概念，用于描述光线在平面镜上的反射行为
   * 该方法首先计算当前向量在法向量上的投影，然后通过减去这个投影的两倍，得到反射向量
   *
   * @param normal 法向量，表示平面镜的法线方向，用于计算反射向量
   * @returns 返回当前向量关于给定法向量的反射向量
   */
  reflect(normal: Vector3) {
    // 计算当前向量在法向量上的投影向量
    // 这一步是通过点积运算和标量乘法实现的，目的是找到当前向量在法向量方向上的分量的两倍
    const v1 = new Vector3();
    v1.copy(normal).multiplyScalar(2 * this.dot(normal));

    // 将当前向量减去投影向量，得到反射向量
    // 这里通过向量减法，消除了当前向量在法向量方向上的分量的两倍，从而得到反射向量
    return this.subtract(v1);
  }

  /**
   * 计算当前向量与另一向量之间的夹角
   *
   * @param v 另一个向量
   * @returns 返回两个向量之间的夹角，单位为弧度
   */
  angleTo(v: Vector3) {
    // 计算两个向量长度的乘积，用于后续计算夹角
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

    // 当两个向量中至少有一个为零向量时，直接返回90度（π/2弧度），因为与零向量的夹角定义为90度
    if (denominator === 0) return Math.PI / 2;

    // 计算两个向量点积与长度乘积的比值，即cos(theta)
    const theta = this.dot(v) / denominator;

    // 反余弦变换得到夹角，确保输入值在[-1, 1]范围内，避免数学错误
    return Math.acos(clamp(theta, -1, 1));
  }

  /**
   * 计算当前向量与另一个向量之间的欧几里得距离
   * @param v 另一个向量
   * @returns 两个向量之间的欧几里得距离
   */
  distanceTo(v: Vector3) {
    // 计算当前向量与参数向量之间的欧几里得距离
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * 计算当前向量与另一个向量之间的欧几里得距离的平方
   * @param v 另一个向量，用于计算与当前向量的距离
   * @returns 返回当前向量与参数向量之间距离的平方
   *
   * 注：此方法主要用于比较两个向量之间的距离，而不必计算实际的距离
   * 通过计算距离的平方，可以避免开方运算，从而提高性能
   */
  distanceToSquared(v: Vector3) {
    // 计算当前向量与参数向量之间的欧几里得距离的平方
    const dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  /**
   * 计算当前向量与另一个向量之间的曼哈顿距离
   * @param v 另一个向量 用于计算与当前向量的曼哈顿距离
   * @returns  返回当前向量与参数向量之间的曼哈顿距离
   */
  manhattanDistanceTo(v: Vector3) {
    // 计算当前向量与另一个向量之间的曼哈顿距离
    return (
      Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z)
    );
  }
  setFromSpherical(s: Spherical) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }

  setFromSphericalCoords(radius: number, phi: number, theta: number) {
    const sinPhiRadius = Math.sin(phi) * radius;

    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);

    return this;
  }

  // todo
  /**
   * setFromCylindrical
   * setFromCylindricalCoords
   * setFromMatrixPosition
   * setFromMatrixScale
   * setFromMatrixColumn
   * setFromEuler
   * fromBufferAttribute
   */

  setFromMatrixColumn(matrix: Matrix4, index: number) {
    return this.fromArray(matrix.elements, index * 4);
  }
  setFromMatrix3Column(matrix: Matrix3, index: number) {
    return this.fromArray(matrix.elements, index * 3);
  }

  equals(v: Vector3) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }

  fromArray(array: number[], offset: number = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  toArray(array: number[], offset: number = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  random() {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();

    return this;
  }

  randomDirection() {
    const u = (Math.random() - 0.5) * 2;
    const t = Math.random() * Math.PI * 2;
    const f = Math.sqrt(1 - u ** 2);

    this.x = f * Math.cos(t);
    this.y = f * Math.sin(t);
    this.z = u;

    return this;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
}
