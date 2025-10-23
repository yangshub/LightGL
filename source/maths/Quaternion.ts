import { Vector3 } from "./Vector3";
import { Euler, RotationOrder } from "./Euler";
import { Matrix4 } from "./Matrix4";
import { clamp } from "./MathUtils";

export class Quaternion {
  _x: number;
  _y: number;
  _z: number;
  _w: number;

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this._x = x || 0;
    this._y = y || 0;
    this._z = z || 0;
    this._w = w || 1;
  }
  get x(): number {
    return this._x;
  }
  set x(x: number) {
    this._x = x;
  }
  get y(): number {
    return this._y;
  }
  set y(y: number) {
    this._y = y;
  }
  get z(): number {
    return this._z;
  }
  set z(z: number) {
    this._z = z;
  }

  get w(): number {
    return this._w;
  }
  set w(w: number) {
    this._w = w;
  }

  set(x: number, y: number, z: number, w: number) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    return this;
  }

  clone() {
    return new Quaternion(this._x, this._y, this._z, this._w);
  }

  copy(quaternion: Quaternion) {
    this._x = quaternion._x;
    this._y = quaternion._y;
    this._z = quaternion._z;
    this._w = quaternion._w;
    return this;
  }

  setFromEuler(euler: Euler) {
    const { x, y, z, order } = euler;

    const cos = Math.cos;
    const sin = Math.sin;

    const c1 = cos(x / 2);
    const c2 = cos(y / 2);
    const c3 = cos(z / 2);

    const s1 = sin(x / 2);
    const s2 = sin(y / 2);
    const s3 = sin(z / 2);

    switch (order) {
      case RotationOrder.XYZ:
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case RotationOrder.YXZ:
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case RotationOrder.ZXY:
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case RotationOrder.ZYX:
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case RotationOrder.YZX:
        this._x = s1 * c2 * c3 + c1 * s2 * s3;
        this._y = c1 * s2 * c3 + s1 * c2 * s3;
        this._z = c1 * c2 * s3 - s1 * s2 * c3;
        this._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case RotationOrder.XZY:
        this._x = s1 * c2 * c3 - c1 * s2 * s3;
        this._y = c1 * s2 * c3 - s1 * c2 * s3;
        this._z = c1 * c2 * s3 + s1 * s2 * c3;
        this._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      default:
        console.warn(
          "THREE.Quaternion: .setFromEuler() encountered an unknown order: " +
            order
        );
    }
    return this;
  }

  /**
   * 使用轴角法设置向量
   *
   * 轴角法是一种表示空间旋转的方法，通过一个轴（axis）和旋转角度（angle）来定义旋转
   * 这个方法将给定的旋转转换为四元数，然后设置向量的x、y、z和w分量为四元数的对应分量
   *
   * @param axis 旋转轴，表示绕哪个轴旋转
   * @param angle 旋转角度，表示旋转多少度
   * @returns 返回设置后的向量
   */
  setFromAxisAngle(axis: Vector3, angle: number) {
    // 计算半角，用于计算四元数的系数
    const halfAngle = angle / 2;
    // 计算半角的正弦值，用于计算四元数的x、y、z分量
    const s = Math.sin(halfAngle);

    // 设置向量的x、y、z分量为轴的各分量乘以s，w分量为半角的余弦值
    // 这样就将轴角法表示的旋转转换为四元数表示的旋转
    return this.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
  }
  /**
   * 从旋转矩阵设置四元数
   *
   * @param m 旋转矩阵
   * @returns 返回当前四元数对象
   *
   * 此方法用于将旋转矩阵转换为四元数旋转矩阵表示了空间中的一个旋转，
   * 它通过读取旋转矩阵的特定元素来计算四元数的分量
   *
   * 注意：这里使用的是旋转矩阵到四元数转换的算法，其中考虑了不同的条件
   * 以避免数值不稳定性和确保正确的四元数计算
   */
  setFromRotationMatrix(m: Matrix4) {
    const te = m.elements,
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10],
      trace = m11 + m22 + m33;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);

      this._w = 0.25 / s;
      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      this._w = (m32 - m23) / s;
      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      this._w = (m13 - m31) / s;
      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      this._w = (m21 - m12) / s;
      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
    }

    return this;
  }

  /**
   * 根据两个方向向量vFrom和vTo设置四元数，以表示从vFrom到vTo的旋转
   * 这个方法假设vFrom和vTo已经是单位向量
   *
   * @param vFrom 起始方向向量
   * @param vTo 目标方向向量
   * @returns 返回设置后的四元数，即this
   */
  setFromUnitVectors(vFrom: Vector3, vTo: Vector3) {
    // 计算vFrom和vTo的点积，并加1，用于后续计算四元数的w分量
    let r = vFrom.dot(vTo) + 1;

    if (r < Number.EPSILON) {
      // 当r接近于0时，说明vFrom和vTo指向相反方向，此时需要特殊处理

      r = 0;

      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        // 根据vFrom的x和z分量的绝对值大小，选择不同的轴作为旋转轴
        // 构造一个垂直于vFrom的单位向量作为四元数的x、y、z分量
        this._x = -vFrom.y;
        this._y = vFrom.x;
        this._z = 0;
        this._w = r;
      } else {
        // 当vFrom的z分量的绝对值大于等于x分量的绝对值时，选择另一个垂直于vFrom的单位向量
        this._x = 0;
        this._y = -vFrom.z;
        this._z = vFrom.y;
        this._w = r;
      }
    } else {
      // 当vFrom和vTo不指向相反方向时，计算vFrom和vTo的叉积，用于构造四元数的x、y、z分量
      this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this._w = r;
    }

    // 归一化四元数，确保其为单位四元数
    return this.normalize();
  }
  angleTo(q: Quaternion) {
    return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
  }

  /**
   * 朝向给定的四元数旋转
   *
   * 该方法使得当前四元数逐渐朝向目标四元数q，旋转的步长由step参数控制
   * 如果当前四元数与目标四元数的夹角为0，则表示已经对齐，直接返回当前四元数
   * 否则，计算当前四元数与目标四元数之间的最小角度，并使用球面线性插值（slerp）方法进行旋转
   *
   * @param q 目标四元数，朝向该四元数进行旋转
   * @param step 旋转的步长，表示朝向目标四元数的旋转程度，步长越大旋转越快
   * @returns 返回旋转后的当前四元数对象
   */
  rotateTowards(q: Quaternion, step: number) {
    const angle = this.angleTo(q);

    if (angle === 0) return this;

    const t = Math.min(1, step / angle);

    this.slerp(q, t);

    return this;
  }

  identity() {
    return this.set(0, 0, 0, 1);
  }

  invert() {
    // quaternion is assumed to have unit length

    return this.conjugate();
  }

  /**
   * 求当前四元数的逆
   * @returns 返回当前四元数的逆，即 conjugate() 方法的返回值
   */
  conjugate() {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;

    return this;
  }

  /**
   * 四元数点乘
   *
   * @param v 要与当前四元数相乘的向量
   * @returns 返回当前四元数与向量v点乘的结果
   */
  dot(v: Quaternion) {
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
  }

  lengthSq() {
    return (
      this._x * this._x +
      this._y * this._y +
      this._z * this._z +
      this._w * this._w
    );
  }

  length() {
    return Math.sqrt(
      this._x * this._x +
        this._y * this._y +
        this._z * this._z +
        this._w * this._w
    );
  }
  normalize() {
    let l = this.length();

    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;

      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }

    return this;
  }

  multiply(q: Quaternion) {
    return this.multiplyQuaternions(this, q);
  }

  premultiply(q: Quaternion) {
    return this.multiplyQuaternions(q, this);
  }

  multiplyQuaternions(a: Quaternion, b: Quaternion) {
    const qax = a._x,
      qay = a._y,
      qaz = a._z,
      qaw = a._w;
    const qbx = b._x,
      qby = b._y,
      qbz = b._z,
      qbw = b._w;

    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  /**
   * 球面线性插值（Spherical Linear Interpolation，SLERP）用于计算两个四元数之间的插值。
   * 这种方法在动画中很有用，因为它可以创建平滑的旋转过渡。
   *
   * @param qb 目标四元数，即我们想要插值到的四元数。
   * @param t 插值参数，范围从0到1。0表示完全使用当前四元数，1表示完全使用目标四元数。
   * @returns 返回插值后的四元数，即qb和当前四元数的中间值。
   */
  slerp(qb: Quaternion, t: number) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);

    const x = this._x,
      y = this._y,
      z = this._z,
      w = this._w;

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

    if (cosHalfTheta < 0) {
      this._w = -qb._w;
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;

      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }

    if (cosHalfTheta >= 1.0) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;

      return this;
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;

      this.normalize();

      return this;
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this._w = w * ratioA + this._w * ratioB;
    this._x = x * ratioA + this._x * ratioB;
    this._y = y * ratioA + this._y * ratioB;
    this._z = z * ratioA + this._z * ratioB;

    return this;
  }

  slerpQuaternions(qa: Quaternion, qb: Quaternion, t: number) {
    return this.copy(qa).slerp(qb, t);
  }

  random() {
    const u1 = Math.random();
    const sqrt1u1 = Math.sqrt(1 - u1);
    const sqrtu1 = Math.sqrt(u1);

    const u2 = 2 * Math.PI * Math.random();

    const u3 = 2 * Math.PI * Math.random();

    return this.set(
      sqrt1u1 * Math.cos(u2),
      sqrtu1 * Math.sin(u3),
      sqrtu1 * Math.cos(u3),
      sqrt1u1 * Math.sin(u2)
    );
  }

  equals(quaternion: Quaternion) {
    return (
      quaternion._x === this._x &&
      quaternion._y === this._y &&
      quaternion._z === this._z &&
      quaternion._w === this._w
    );
  }

  fromArray(array: number[], offset = 0) {
    this._x = array[offset];
    this._y = array[offset + 1];
    this._z = array[offset + 2];
    this._w = array[offset + 3];

    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._w;

    return array;
  }
}
