import { clamp } from "./MathUtils";
import { Matrix4 } from "./Matrix4";
import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

export enum RotationOrder {
  XYZ = "XYZ",
  YZX = "YZX",
  ZXY = "ZXY",
  XZY = "XZY",
  YXZ = "YXZ",
  ZYX = "ZYX",
}

export class Euler {
  _x: number;
  _y: number;
  _z: number;
  _order: RotationOrder;

  constructor(x: number = 0, y: number = 0, z: number = 0, order?: RotationOrder) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || RotationOrder.XYZ;
  }

  get x() {
    return this._x;
  }
  set x(value: number) {
    this._x = value;
  }

  get y() {
    return this._y;
  }
  set y(value: number) {
    this._y = value;
  }
  get z() {
    return this._z;
  }
  set z(value: number) {
    this._z = value;
  }
  get order() {
    return this._order;
  }
  set order(value: RotationOrder) {
    this._order = value;
  }

  set(x: number, y: number, z: number, order?: RotationOrder) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || this._order;
    return this;
  }

  clone() {
    return new Euler(this._x, this._y, this._z, this._order);
  }

  copy(euler: Euler) {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;
    return this;
  }
  /**
   * 从旋转矩阵设置欧拉角
   *
   * @param m 旋转矩阵
   * @param order 旋转顺序，默认为当前实例的旋转顺序
   * @returns 返回当前欧拉角对象
   */
  setFromRotationMatrix(m: Matrix4, order?: RotationOrder) {
    const te = m.elements;
    const m11 = te[0],
      m12 = te[4],
      m13 = te[8];
    const m21 = te[1],
      m22 = te[5],
      m23 = te[9];
    const m31 = te[2],
      m32 = te[6],
      m33 = te[10];

    switch (order || this._order) {
      case RotationOrder.XYZ:
        this._y = Math.asin(clamp(m13, -1, 1));
        if (Math.abs(m13) < 0.99999) {
          this._x = Math.atan2(-m23, m33);
          this._z = Math.atan2(-m12, m11);
        } else {
          this._x = Math.atan2(m32, m22);
          this._z = 0;
        }
        break;

      case RotationOrder.YXZ:
        this._x = Math.asin(-clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.99999) {
          this._y = Math.atan2(m13, m33);
          this._z = Math.atan2(m21, m22);
        } else {
          this._y = Math.atan2(-m31, m11);
          this._z = 0;
        }

        break;

      case RotationOrder.ZXY:
        this._x = Math.asin(clamp(m32, -1, 1));
        if (Math.abs(m32) < 0.99999) {
          this._y = Math.atan2(-m31, m33);
          this._z = Math.atan2(-m12, m22);
        } else {
          this._y = 0;
          this._z = Math.atan2(m21, m11);
        }
        break;
      case RotationOrder.ZYX:
        this._y = Math.asin(-clamp(m31, -1, 1));
        if (Math.abs(m31) < 0.99999) {
          this._x = Math.atan2(m32, m33);
          this._z = Math.atan2(m21, m11);
        } else {
          this._x = 0;
          this._z = Math.atan2(-m12, m22);
        }
        break;

      case RotationOrder.YZX:
        this._z = Math.asin(clamp(m21, -1, 1));

        if (Math.abs(m21) < 0.99999) {
          this._x = Math.atan2(-m23, m22);
          this._y = Math.atan2(-m31, m11);
        } else {
          this._x = 0;
          this._y = Math.atan2(m13, m33);
        }
        break;

      case RotationOrder.XZY:
        this._z = Math.asin(-clamp(m12, -1, 1));
        if (Math.abs(m12) < 0.99999) {
          this._x = Math.atan2(m32, m22);
          this._y = Math.atan2(m13, m11);
        } else {
          this._x = Math.atan2(-m23, m33);
          this._y = 0;
        }
        break;

      default:
        console.warn(
          "Euler: .setFromRotationMatrix() given unsupported order: " + order
        );
    }

    this._order = order || this._order;
    return this;
  }

  setFromQuaternion(q: Quaternion, order?: RotationOrder) {
    const matrix = new Matrix4();
    matrix.makeRotationFromQuaternion(q);
    return this.setFromRotationMatrix(matrix, order);
  }
  setFromVector3(v: Vector3, order: RotationOrder = this.order) {
    return this.set(v.x, v.y, v.z, order);
  }

  reorder(newOrder: RotationOrder) {
    return this.setFromQuaternion(this.toQuaternion(), newOrder);
  }

  toQuaternion(): Quaternion {
    return new Quaternion().setFromEuler(this);
  }

  equals(euler: Euler) {
    return (
      euler._x === this._x &&
      euler._y === this._y &&
      euler._z === this._z &&
      euler._order === this._order
    );
  }

  *[Symbol.iterator]() {
    yield this._x;
    yield this._y;
    yield this._z;
    yield this._order;
  }
}
