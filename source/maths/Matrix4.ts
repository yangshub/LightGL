import { Euler, RotationOrder } from "./Euler";
import {Matrix3} from "./Matrix3";
import {Quaternion} from "./Quaternion";
import { Vector3 } from "./Vector3";

export class Matrix4 {
  elements: number[];

  constructor() {
    this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  set(
    n11: number,
    n12: number,
    n13: number,
    n14: number,
    n21: number,
    n22: number,
    n23: number,
    n24: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n41: number,
    n42: number,
    n43: number,
    n44: number
  ) {
    const te = this.elements;

    te[0] = n11;
    te[4] = n12;
    te[8] = n13;
    te[12] = n14;
    te[1] = n21;
    te[5] = n22;
    te[9] = n23;
    te[13] = n24;
    te[2] = n31;
    te[6] = n32;
    te[10] = n33;
    te[14] = n34;
    te[3] = n41;
    te[7] = n42;
    te[11] = n43;
    te[15] = n44;

    return this;
  }

  identity() {
    this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

    return this;
  }

  clone() {
    return new Matrix4().fromArray(this.elements);
  }

  copy(m: Matrix4) {
    const te = this.elements;
    const me = m.elements;

    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    te[9] = me[9];
    te[10] = me[10];
    te[11] = me[11];
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    te[15] = me[15];

    return this;
  }

  copyPosition(m: Matrix4) {
    const te = this.elements;
    const me = m.elements;

    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];

    return this;
  }

  setFromMatrix3(m: Matrix3) {
    const me = m.elements;

    this.set(
      me[0],
      me[3],
      me[6],
      0,
      me[1],
      me[4],
      me[7],
      0,
      me[2],
      me[5],
      me[8],
      0,
      0,
      0,
      0,
      1
    );

    return this;
  }

  extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);

    return this;
  }

  makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    this.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      0,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      0,
      xAxis.z,
      yAxis.z,
      zAxis.z,
      0,
      0,
      0,
      0,
      1
    );

    return this;
  }

  /**
   * 从一个4x4矩阵中提取旋转部分，并将其应用到当前矩阵。
   *
   * @param m - 一个4x4矩阵，从其中提取旋转部分。
   * @returns 返回当前矩阵，即提取旋转后的矩阵。
   *
   * 注意：这个方法不支持反射矩阵。如果给定的矩阵包含反射，结果可能不正确。
   *
   * 此方法首先计算给定矩阵各列向量的长度，然后用这些长度值来归一化当前矩阵的元素，
   * 以从中提取出纯粹的旋转部分。这是一种常见的操作，用于分离矩阵中的旋转、缩放和其它变换。
   */
  extractRotation(m: Matrix4) {
    // this method does not support reflection matrices

    const te = this.elements;
    const me = m.elements;
    const _v1 = new Vector3();

    // 计算x、y、z轴的缩放因子，通过向量长度的倒数得到
    const scaleX = 1 / _v1.setFromMatrixColumn(m, 0).length();
    const scaleY = 1 / _v1.setFromMatrixColumn(m, 1).length();
    const scaleZ = 1 / _v1.setFromMatrixColumn(m, 2).length();

    // 应用缩放因子以提取旋转矩阵
    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;

    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;

    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;

    // 设置矩阵的平移部分为零，因为只提取旋转部分
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  /**
   * 根据欧拉角生成旋转矩阵
   *
   * @param euler 欧拉角，包含x、y、z轴的旋转角度
   * @returns 返回当前矩阵对象，以便进行链式调用
   */
  makeRotationFromEuler(euler: Euler) {
    const te = this.elements;

    // 提取欧拉角的各个分量
    const x = euler.x,
      y = euler.y,
      z = euler.z;
    const a = Math.cos(x),
      b = Math.sin(x);
    const c = Math.cos(y),
      d = Math.sin(y);
    const e = Math.cos(z),
      f = Math.sin(z);

    // 根据不同的旋转顺序，计算旋转矩阵的元素
    if (euler.order === RotationOrder.XYZ) {
      const ae = a * e,
        af = a * f,
        be = b * e,
        bf = b * f;

      te[0] = c * e;
      te[4] = -c * f;
      te[8] = d;

      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = -b * c;

      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;
    } else if (euler.order === RotationOrder.YXZ) {
      const ce = c * e,
        cf = c * f,
        de = d * e,
        df = d * f;

      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;

      te[1] = a * f;
      te[5] = a * e;
      te[9] = -b;

      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;
    } else if (euler.order === RotationOrder.ZXY) {
      const ce = c * e,
        cf = c * f,
        de = d * e,
        df = d * f;

      te[0] = ce - df * b;
      te[4] = -a * f;
      te[8] = de + cf * b;

      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;

      te[2] = -a * d;
      te[6] = b;
      te[10] = a * c;
    } else if (euler.order === RotationOrder.ZYX) {
      const ae = a * e,
        af = a * f,
        be = b * e,
        bf = b * f;

      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;

      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;

      te[2] = -d;
      te[6] = b * c;
      te[10] = a * c;
    } else if (euler.order === RotationOrder.YZX) {
      const ac = a * c,
        ad = a * d,
        bc = b * c,
        bd = b * d;

      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;

      te[1] = f;
      te[5] = a * e;
      te[9] = -b * e;

      te[2] = -d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === RotationOrder.XZY) {
      const ac = a * c,
        ad = a * d,
        bc = b * c,
        bd = b * d;

      te[0] = c * e;
      te[4] = -f;
      te[8] = d * e;

      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;

      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;
    }

    // 设置矩阵的底行和右列，完成4x4矩阵的构建
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  makeRotationFromQuaternion(quaternion: Quaternion) {
    const _zero = new Vector3(0, 0, 0);
    const _one = new Vector3(1, 1, 1);
    return this.compose(_zero, quaternion, _one);
  }

  /**
   * 计算一个摄像机矩阵，使其朝向特定的目标点。
   *
   * @param eye 摄像机的位置。
   * @param target 摄像机朝向的目标点。
   * @param up 摄像机的向上方向。
   *
   * @returns 返回当前矩阵对象，以便方法链式调用。
   *
   * 此方法根据给定的摄像机位置、目标位置和向上方向计算摄像机的右向量、向上向量和前向量，并构造摄像机矩阵。
   */

  lookAt(eye: Vector3, target: Vector3, up: Vector3) {
    const te = this.elements;
    const _x = new Vector3();
    const _y = new Vector3();
    const _z = new Vector3();

    _z.subtractVectors(eye, target);

    if (_z.lengthSq() === 0) {
      // 摄像机位置与目标位置相同

      _z.z = 1;
    }

    _z.normalize();
    _x.crossVectors(up, _z);

    if (_x.lengthSq() === 0) {
      // 向上方向与前向量平行

      if (Math.abs(up.z) === 1) {
        _z.x += 0.0001;
      } else {
        _z.z += 0.0001;
      }

      _z.normalize();
      _x.crossVectors(up, _z);
    }

    _x.normalize();
    _y.crossVectors(_z, _x);

    te[0] = _x.x;
    te[4] = _y.x;
    te[8] = _z.x;
    te[1] = _x.y;
    te[5] = _y.y;
    te[9] = _z.y;
    te[2] = _x.z;
    te[6] = _y.z;
    te[10] = _z.z;

    return this;
  }

  multiply(m: Matrix4) {
    return this.multiplyMatrices(this, m);
  }

  preMultiply(m: Matrix4) {
    return this.multiplyMatrices(m, this);
  }

  multiplyMatrices(a: Matrix4, b: Matrix4) {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    const a11 = ae[0],
      a12 = ae[4],
      a13 = ae[8],
      a14 = ae[12];
    const a21 = ae[1],
      a22 = ae[5],
      a23 = ae[9],
      a24 = ae[13];
    const a31 = ae[2],
      a32 = ae[6],
      a33 = ae[10],
      a34 = ae[14];
    const a41 = ae[3],
      a42 = ae[7],
      a43 = ae[11],
      a44 = ae[15];

    const b11 = be[0],
      b12 = be[4],
      b13 = be[8],
      b14 = be[12];
    const b21 = be[1],
      b22 = be[5],
      b23 = be[9],
      b24 = be[13];
    const b31 = be[2],
      b32 = be[6],
      b33 = be[10],
      b34 = be[14];
    const b41 = be[3],
      b42 = be[7],
      b43 = be[11],
      b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  /**
   * 将矩阵的每个元素与一个标量相乘
   *
   * @param s - 标量，用于乘以矩阵的每个元素
   * @returns 返回乘以标量后的矩阵对象本身
   */
  multiplyScalar(s: number) {
    // 获取矩阵元素的引用，以便进行元素级别的操作
    const te = this.elements;

    // 按照矩阵的行列顺序，将每个元素乘以标量s
    // 这里没有详细的注释每一行，因为代码的意图通过块注释已经清晰，
    // 并且每行都是相似的操作，不需重复解释
    te[0] *= s;
    te[4] *= s;
    te[8] *= s;
    te[12] *= s;
    te[1] *= s;
    te[5] *= s;
    te[9] *= s;
    te[13] *= s;
    te[2] *= s;
    te[6] *= s;
    te[10] *= s;
    te[14] *= s;
    te[3] *= s;
    te[7] *= s;
    te[11] *= s;
    te[15] *= s;

    // 返回乘以标量后的矩阵对象本身，允许链式调用
    return this;
  }

  /**
   * 计算四阶方阵的行列式
   *
   * 此方法用于计算一个四阶方阵的行列式值该算法目前基于
   * 欧几里得空间网站上的一个参考实现，通过将四阶行列式展开为
   * 较小的行列式来计算总和
   *
   * @returns {number} 返回四阶方阵的行列式值
   */
  determinant() {
    // 获取矩阵的元素数组
    const te = this.elements;

    // 定义矩阵的各个元素，以便更方便地引用它们
    const n11 = te[0],
      n12 = te[4],
      n13 = te[8],
      n14 = te[12];
    const n21 = te[1],
      n22 = te[5],
      n23 = te[9],
      n24 = te[13];
    const n31 = te[2],
      n32 = te[6],
      n33 = te[10],
      n34 = te[14];
    const n41 = te[3],
      n42 = te[7],
      n43 = te[11],
      n44 = te[15];

    // TODO: 优化此算法以提高效率
    // (参考 http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

    // 计算并返回行列式的值
    // 这里的计算是基于拉普拉斯展开，通过将四阶行列式展开为一系列三阶行列式来计算
    // 每个三阶行列式的计算又进一步展开为二阶行列式，以此类推
    // 这种方法虽然有效，但在实际应用中可能不是最高效的，特别是对于大矩阵
    return (
      n41 *
        (+n14 * n23 * n32 -
          n13 * n24 * n32 -
          n14 * n22 * n33 +
          n12 * n24 * n33 +
          n13 * n22 * n34 -
          n12 * n23 * n34) +
      n42 *
        (+n11 * n23 * n34 -
          n11 * n24 * n33 +
          n14 * n21 * n33 -
          n13 * n21 * n34 +
          n13 * n24 * n31 -
          n14 * n23 * n31) +
      n43 *
        (+n11 * n24 * n32 -
          n11 * n22 * n34 -
          n14 * n21 * n32 +
          n12 * n21 * n34 +
          n14 * n22 * n31 -
          n12 * n24 * n31) +
      n44 *
        (-n13 * n22 * n31 -
          n11 * n23 * n32 +
          n11 * n22 * n33 +
          n13 * n21 * n32 -
          n12 * n21 * n33 +
          n12 * n23 * n31)
    );
  }

  /**
   * 矩阵转置方法
   *
   * 此方法对当前矩阵进行转置操作，即行和列互换
   * 由于原矩阵是一个3x4的二维数组，转置后仍保持3x4的结构
   *
   * @returns {Matrix} 返回转置后的矩阵对象
   */
  transpose() {
    // 获取矩阵的元素数组
    const te = this.elements;
    let tmp;

    // 第1行和第2列元素交换
    tmp = te[1];
    te[1] = te[4];
    te[4] = tmp;
    // 第1行和第3列元素交换
    tmp = te[2];
    te[2] = te[8];
    te[8] = tmp;
    // 第1行和第4列元素交换
    tmp = te[6];
    te[6] = te[9];
    te[9] = tmp;

    // 第2行和第3列元素交换
    tmp = te[3];
    te[3] = te[12];
    te[12] = tmp;
    // 第2行和第4列元素交换
    tmp = te[7];
    te[7] = te[13];
    te[13] = tmp;
    // 第3行和第4列元素交换
    tmp = te[11];
    te[11] = te[14];
    te[14] = tmp;

    // 返回转置后的矩阵对象
    return this;
  }

  setPosition(x: number, y: number, z: number) {
    const te = this.elements;

    te[12] = x;
    te[13] = y;
    te[14] = z;

    return this;
  }

  invert() {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te = this.elements,
      n11 = te[0],
      n21 = te[1],
      n31 = te[2],
      n41 = te[3],
      n12 = te[4],
      n22 = te[5],
      n32 = te[6],
      n42 = te[7],
      n13 = te[8],
      n23 = te[9],
      n33 = te[10],
      n43 = te[11],
      n14 = te[12],
      n24 = te[13],
      n34 = te[14],
      n44 = te[15],
      t11 =
        n23 * n34 * n42 -
        n24 * n33 * n42 +
        n24 * n32 * n43 -
        n22 * n34 * n43 -
        n23 * n32 * n44 +
        n22 * n33 * n44,
      t12 =
        n14 * n33 * n42 -
        n13 * n34 * n42 -
        n14 * n32 * n43 +
        n12 * n34 * n43 +
        n13 * n32 * n44 -
        n12 * n33 * n44,
      t13 =
        n13 * n24 * n42 -
        n14 * n23 * n42 +
        n14 * n22 * n43 -
        n12 * n24 * n43 -
        n13 * n22 * n44 +
        n12 * n23 * n44,
      t14 =
        n14 * n23 * n32 -
        n13 * n24 * n32 -
        n14 * n22 * n33 +
        n12 * n24 * n33 +
        n13 * n22 * n34 -
        n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0)
      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] =
      (n24 * n33 * n41 -
        n23 * n34 * n41 -
        n24 * n31 * n43 +
        n21 * n34 * n43 +
        n23 * n31 * n44 -
        n21 * n33 * n44) *
      detInv;
    te[2] =
      (n22 * n34 * n41 -
        n24 * n32 * n41 +
        n24 * n31 * n42 -
        n21 * n34 * n42 -
        n22 * n31 * n44 +
        n21 * n32 * n44) *
      detInv;
    te[3] =
      (n23 * n32 * n41 -
        n22 * n33 * n41 -
        n23 * n31 * n42 +
        n21 * n33 * n42 +
        n22 * n31 * n43 -
        n21 * n32 * n43) *
      detInv;

    te[4] = t12 * detInv;
    te[5] =
      (n13 * n34 * n41 -
        n14 * n33 * n41 +
        n14 * n31 * n43 -
        n11 * n34 * n43 -
        n13 * n31 * n44 +
        n11 * n33 * n44) *
      detInv;
    te[6] =
      (n14 * n32 * n41 -
        n12 * n34 * n41 -
        n14 * n31 * n42 +
        n11 * n34 * n42 +
        n12 * n31 * n44 -
        n11 * n32 * n44) *
      detInv;
    te[7] =
      (n12 * n33 * n41 -
        n13 * n32 * n41 +
        n13 * n31 * n42 -
        n11 * n33 * n42 -
        n12 * n31 * n43 +
        n11 * n32 * n43) *
      detInv;

    te[8] = t13 * detInv;
    te[9] =
      (n14 * n23 * n41 -
        n13 * n24 * n41 -
        n14 * n21 * n43 +
        n11 * n24 * n43 +
        n13 * n21 * n44 -
        n11 * n23 * n44) *
      detInv;
    te[10] =
      (n12 * n24 * n41 -
        n14 * n22 * n41 +
        n14 * n21 * n42 -
        n11 * n24 * n42 -
        n12 * n21 * n44 +
        n11 * n22 * n44) *
      detInv;
    te[11] =
      (n13 * n22 * n41 -
        n12 * n23 * n41 -
        n13 * n21 * n42 +
        n11 * n23 * n42 +
        n12 * n21 * n43 -
        n11 * n22 * n43) *
      detInv;

    te[12] = t14 * detInv;
    te[13] =
      (n13 * n24 * n31 -
        n14 * n23 * n31 +
        n14 * n21 * n33 -
        n11 * n24 * n33 -
        n13 * n21 * n34 +
        n11 * n23 * n34) *
      detInv;
    te[14] =
      (n14 * n22 * n31 -
        n12 * n24 * n31 -
        n14 * n21 * n32 +
        n11 * n24 * n32 +
        n12 * n21 * n34 -
        n11 * n22 * n34) *
      detInv;
    te[15] =
      (n12 * n23 * n31 -
        n13 * n22 * n31 +
        n13 * n21 * n32 -
        n11 * n23 * n32 -
        n12 * n21 * n33 +
        n11 * n22 * n33) *
      detInv;

    return this;
  }
  /**
   * 缩放矩阵
   *
   * 此方法通过一个给定的向量来缩放矩阵的元素它将当前矩阵与一个由向量(v)定义的缩放矩阵相乘，
   * 结果是当前矩阵的每个元素分别乘以向量的对应分量这个操作通常用于在图形变换中缩放几何形状，
   * 比如模型、视图或投影变换矩阵的缩放
   *
   * @param v 用于指定每个维度上的缩放比例
   * @return 返回矩阵本身，允许链式调用
   */
  scale(v: Vector3) {
    const te = this.elements;
    const x = v.x,
      y = v.y,
      z = v.z;

    te[0] *= x;
    te[4] *= y;
    te[8] *= z;
    te[1] *= x;
    te[5] *= y;
    te[9] *= z;
    te[2] *= x;
    te[6] *= y;
    te[10] *= z;
    te[3] *= x;
    te[7] *= y;
    te[11] *= z;

    return this;
  }

  /**
   * 获取在x、y、z轴上最大的缩放值
   *
   * 此方法计算变换矩阵中的各个轴上的缩放值，并返回其中最大的一个
   * 它通过对矩阵中每个轴对应的三个元素进行平方求和，然后取平方根，得到每个轴上的缩放值
   * 最后，返回三个轴上的缩放值中的最大值
   *
   * @returns {number} 在x、y、z轴上最大的缩放值
   */
  getMaxScaleOnAxis() {
    const te = this.elements;

    // 计算x轴上的缩放值的平方
    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    // 计算y轴上的缩放值的平方
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    // 计算z轴上的缩放值的平方
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

    // 返回三个轴上的缩放值中的最大值的平方根，即最大的缩放值
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  makeTranslation(x: number, y: number, z: number) {
    this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);

    return this;
  }

  /**
   * 构造一个绕X轴旋转的矩阵
   *
   * @param theta 旋转角度，以弧度表示
   * @returns 返回当前矩阵对象，以便于链式调用
   *
   * 此方法通过设置一个旋转矩阵来实现绕X轴的旋转，矩阵中的元素根据给定的旋转角度进行计算
   * 通过调用set方法，一次性设置矩阵中所有元素的值，这些值反映了绕X轴旋转的变换
   * 最后，方法返回当前矩阵对象，使得可以进行链式调用，即在不丢失当前对象引用的情况下，继续调用其他方法
   */
  makeRotationX(theta: number) {
    const c = Math.cos(theta),
      s = Math.sin(theta);

    this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);

    return this;
  }

  /**
   * 构造一个绕Y轴旋转的矩阵
   *
   * @param theta 旋转角度，以弧度为单位
   * @returns 返回当前矩阵对象，支持链式调用
   */
  makeRotationY(theta: number) {
    // 计算给定角度的余弦和正弦值
    const c = Math.cos(theta),
      s = Math.sin(theta);

    // 设置矩阵元素以实现绕Y轴的旋转
    this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);

    // 支持链式调用，返回当前矩阵对象
    return this;
  }

  makeRotationZ(theta: number) {
    const c = Math.cos(theta),
      s = Math.sin(theta);

    this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

    return this;
  }

  makeRotationAxis(axis: Vector3, angle: number) {
    // Based on http://www.gamedev.net/reference/articles/article1199.asp

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const x = axis.x,
      y = axis.y,
      z = axis.z;
    const tx = t * x,
      ty = t * y;

    this.set(
      tx * x + c,
      tx * y - s * z,
      tx * z + s * y,
      0,
      tx * y + s * z,
      ty * y + c,
      ty * z - s * x,
      0,
      tx * z - s * y,
      ty * z + s * x,
      t * z * z + c,
      0,
      0,
      0,
      0,
      1
    );

    return this;
  }

  /**
   * 创建一个缩放矩阵
   *
   * 该方法生成一个在给定的x、y、z轴上进行缩放的矩阵
   * 它通过设置矩阵的对角线上分别为x、y、z来实现缩放，而其他元素则保持为0
   * 最后一行的元素保持为[0, 0, 0, 1]，以保证矩阵的正确性
   *
   * @param x - 在x轴上的缩放因子
   * @param y - 在y轴上的缩放因子
   * @param z - 在z轴上的缩放因子
   * @returns 返回当前的矩阵对象，允许链式调用
   */
  makeScale(x: number, y: number, z: number) {
    // 设置矩阵为缩放矩阵
    this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);

    // 返回当前矩阵对象，允许链式调用
    return this;
  }

  /**
   * 构造一个剪切矩阵
   *
   * @param xy 剪切系数，用于Y轴方向的剪切
   * @param xz 剪切系数，用于Z轴方向的剪切
   * @param yx 剪切系数，用于X轴方向的剪切
   * @param yz 剪切系数，用于Z轴方向的剪切
   * @param zx 剪切系数，用于X轴方向的剪切
   * @param zy 剪切系数，用于Y轴方向的剪切
   * @returns 返回当前矩阵对象，支持链式调用
   */
  makeShear(
    xy: number,
    xz: number,
    yx: number,
    yz: number,
    zx: number,
    zy: number
  ) {
    // 设置矩阵的元素，以实现特定的剪切效果
    this.set(1, yx, zx, 0, xy, 1, zy, 0, xz, yz, 1, 0, 0, 0, 0, 1);

    return this;
  }

  /**
   * 根据给定的位置、四元数和缩放因子构建一个矩阵
   *
   * @param position 位置向量，表示物体在空间中的位置
   * @param quaternion 四元数，表示物体在空间中的旋转
   * @param scale 缩放向量，表示物体在空间中的缩放比例
   * @returns 返回当前矩阵对象，以便进行链式调用
   */
  compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    // 获取矩阵元素数组
    const te = this.elements;

    // 从四元数中提取元素，并计算所需的中间值
    const x = quaternion._x,
      y = quaternion._y,
      z = quaternion._z,
      w = quaternion._w;
    const x2 = x + x,
      y2 = y + y,
      z2 = z + z;
    const xx = x * x2,
      xy = x * y2,
      xz = x * z2;
    const yy = y * y2,
      yz = y * z2,
      zz = z * z2;
    const wx = w * x2,
      wy = w * y2,
      wz = w * z2;

    // 从缩放向量中提取元素
    const sx = scale.x,
      sy = scale.y,
      sz = scale.z;

    // 根据位置、四元数和缩放因子计算矩阵的元素
    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    // 设置矩阵的平移部分
    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;

    // 返回当前矩阵对象，以便进行链式调用
    return this;
  }

  /**
   * 将矩阵分解为位置、旋转和缩放
   *
   * @param position - 用于存储分解后的位置信息
   * @param quaternion - 用于存储分解后的旋转信息
   * @param scale - 用于存储分解后的缩放信息
   * @returns 返回矩阵本身，以便于链式调用
   *
   * 此方法主要用于将矩阵分解为位置、旋转和缩放三个部分
   * 它首先计算缩放信息，然后去除矩阵中的缩放部分，再提取旋转信息
   * 最后将位置信息直接从矩阵中提取出来
   */
  decompose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    // 获取矩阵元素
    const te = this.elements;
    // 创建临时向量和矩阵用于计算
    const _v1 = new Vector3();
    const _m1 = new Matrix4();

    // 计算X轴的缩放因子
    let sx = _v1.set(te[0], te[1], te[2]).length();
    // 计算Y轴的缩放因子
    const sy = _v1.set(te[4], te[5], te[6]).length();
    // 计算Z轴的缩放因子
    const sz = _v1.set(te[8], te[9], te[10]).length();

    // 如果矩阵的行列式为负，说明有缩放因子为负，需要调整
    const det = this.determinant();
    if (det < 0) sx = -sx;

    // 从矩阵中提取位置信息
    position.x = te[12];
    position.y = te[13];
    position.z = te[14];

    // 复制当前矩阵以便后续计算旋转部分
    _m1.copy(this);

    // 计算缩放因子的倒数，用于去除矩阵中的缩放部分
    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    // 去除矩阵中的缩放部分
    _m1.elements[0] *= invSX;
    _m1.elements[1] *= invSX;
    _m1.elements[2] *= invSX;

    _m1.elements[4] *= invSY;
    _m1.elements[5] *= invSY;
    _m1.elements[6] *= invSY;

    _m1.elements[8] *= invSZ;
    _m1.elements[9] *= invSZ;
    _m1.elements[10] *= invSZ;

    // 从去除缩放部分的矩阵中提取旋转信息
    quaternion.setFromRotationMatrix(_m1);

    // 存储缩放信息
    scale.x = sx;
    scale.y = sy;
    scale.z = sz;

    // 返回矩阵本身，以便于链式调用
    return this;
  }

  /**
   * 创建一个透视投影矩阵。
   *
   * @param left - 投影空间的左边界。
   * @param right - 投影空间的右边界。
   * @param top - 投影空间的上边界。
   * @param bottom - 投影空间的下边界。
   * @param near - 投影空间的近边界。
   * @param far - 投影空间的远边界。
   *
   * @returns 返回当前矩阵对象。
   *
   * @remarks
   * 这个方法重新定义了透视投影矩阵的生成方式，改变了原有的签名。
   * 如果未定义远边界（far），则输出警告信息。
   */
  makePerspective(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number
  ) {
    const te = this.elements;
    const x = (2 * near) / (right - left);
    const y = (2 * near) / (top - bottom);

    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = -(far + near) / (far - near);
    const d = (-2 * far * near) / (far - near);

    te[0] = x;
    te[1] = 0;
    te[2] = 0;
    te[3] = 0;
    te[4] = 0;
    te[5] = y;
    te[6] = 0;
    te[7] = 0;
    te[8] = a;
    te[9] = b;
    te[10] = c;
    te[11] = -1;
    te[12] = 0;
    te[13] = 0;
    te[14] = d;
    te[15] = 0;

    return this;
  }

  perspective(fov: number, aspect: number, near: number, far: number) {
    const f = Math.tan(Math.PI * 0.5 - fov * 0.5);
    const rangeInv = 1.0 / (near - far);

    this.set(
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0
    );
  }

  /**
   * 创建一个正交投影矩阵
   *
   * 正交投影矩阵用于在三维场景中创建平行投影，这意味着所有投影线都相互平行
   * 这个函数允许指定投影空间的边界，从而控制哪些部分的场景会被投影显示
   *
   * @param left 投影空间的左边界
   * @param right 投影空间的右边界
   * @param top 投影空间的顶边界
   * @param bottom 投影空间的底边界
   * @param near 投影空间的近边界
   * @param far 投影空间的远边界
   *
   * @returns 返回当前的矩阵对象，支持链式调用
   */
  makeOrthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number
  ) {
    // 获取矩阵的元素数组
    const te = this.elements;
    // 计算宽度、高度和深度的倒数，用于后续的矩阵计算
    const w = 1.0 / (right - left);
    const h = 1.0 / (top - bottom);
    const p = 1.0 / (far - near);

    // 计算并设置矩阵的平移部分，这些值决定了投影空间的中心点
    const x = (right + left) * w;
    const y = (top + bottom) * h;
    const z = (far + near) * p;

    // 设置矩阵的元素，这些元素定义了正交投影的变换
    te[0] = 2 * w;
    te[1] = 0;
    te[2] = 0;
    te[3] = 0;
    te[4] = 0;
    te[5] = 2 * h;
    te[6] = 0;
    te[7] = 0;

    te[8] = 0;
    te[9] = 0;
    te[10] = -2 * p;
    te[11] = 0;
    te[12] = -x;
    te[13] = -y;
    te[14] = -z;
    te[15] = 1;
    // 返回当前的矩阵对象，支持链式调用
    return this;
  }

  equals(matrix: Matrix4) {
    const te = this.elements;
    const me = matrix.elements;

    for (let i = 0; i < 16; i++) {
      if (te[i] !== me[i]) return false;
    }

    return true;
  }

  fromArray(array: number[], offset: number = 0) {
    for (let i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }

    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    const te = this.elements;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;
  }

  static identity() {
    return new Matrix4().identity(); 
  }
}
