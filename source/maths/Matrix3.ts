import type { Euler } from "./Euler";
import {Matrix4} from "./Matrix4";
import { Vector3 } from "./Vector3";

export class Matrix3 {
    elements: number[];

    constructor() {
        this.elements = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    /**
     * 设置矩阵的元素值
     * 
     * 本方法用于直接设置矩阵中每个元素的值通过传入9个参数，每个参数对应矩阵中的一行一列
     * 这样做允许用户精确控制矩阵的内部结构，用于需要矩阵变换的图形学计算或者其他数学运算
     * 
     * @param n11 第一行第一列的元素值
     * @param n12 第一行第二列的元素值
     * @param n13 第一行第三列的元素值
     * @param n21 第二行第一列的元素值
     * @param n22 第二行第二列的元素值
     * @param n23 第二行第三列的元素值
     * @param n31 第三行第一列的元素值
     * @param n32 第三行第二列的元素值
     * @param n33 第三行第三列的元素值
     * @returns 返回修改后的矩阵对象，允许链式调用
     */
    set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number) {
        // 获取矩阵的元素数组，以便直接赋值
        const te = this.elements;
        // 逐个设置矩阵每一行每一列的元素值
        te[0] = n11; te[1] = n21; te[2] = n31;
        te[3] = n12; te[4] = n22; te[5] = n32;
        te[6] = n13; te[7] = n23; te[8] = n33;

        // 返回当前矩阵对象，以支持链式调用
        return this;
    }

    identity() {
        // 重置矩阵元素为单位矩阵
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );

        // 返回当前矩阵对象，以支持链式调用
        return this;
    }

    copy(m: Matrix3) {

        const te = this.elements;
        const me = m.elements;

        te[0] = me[0]; te[1] = me[1]; te[2] = me[2];
        te[3] = me[3]; te[4] = me[4]; te[5] = me[5];
        te[6] = me[6]; te[7] = me[7]; te[8] = me[8];

        return this;

    }

    extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {

        xAxis.setFromMatrix3Column(this, 0);
        yAxis.setFromMatrix3Column(this, 1);
        zAxis.setFromMatrix3Column(this, 2);

        return this;

    }

    setFromMatrix4(m: Matrix4) {

        const me = m.elements;

        this.set(

            me[0], me[4], me[8],
            me[1], me[5], me[9],
            me[2], me[6], me[10]

        );

        return this;

    }

    /**
     * 将当前矩阵与另一个矩阵相乘
     * 
     * @param m 第二个矩阵
     * @returns 返回相乘后的矩阵结果
     */
    multiply(m: Matrix3) {
        // 调用this.multiplyMatrices方法，将当前矩阵与传入的矩阵m相乘，并返回结果
        return this.multiplyMatrices(this, m);
    }

    /**
     * 当前矩阵左乘另一个矩阵
     * 
     * @param m 第二个矩阵
     * @returns 返回相乘后的矩阵结果
     */
    preMultiply(m: Matrix3) {

        return this.multiplyMatrices(m, this);

    }

    multiplyMatrices(a: Matrix3, b: Matrix3) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];

        const b11 = be[0], b12 = be[3], b13 = be[6];
        const b21 = be[1], b22 = be[4], b23 = be[7];
        const b31 = be[2], b32 = be[5], b33 = be[8];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return this;

    }

    /**
     * 将矩阵的每个元素与一个标量相乘
     * 
     * @param s - 标量，用于乘以矩阵的每个元素
     * @returns 返回修改后的矩阵，以允许链式调用
     * 
     * 此方法用于对矩阵的每个元素执行标量乘法，它接受一个标量参数s，
     * 并将该标量与矩阵的每个元素相乘结果存回原矩阵
     */
    multiplyScalar(s: number) {
        // 获取矩阵的元素数组
        const te = this.elements;

        // 对矩阵的每个元素执行标量乘法
        te[0] *= s; te[3] *= s; te[6] *= s;
        te[1] *= s; te[4] *= s; te[7] *= s;
        te[2] *= s; te[5] *= s; te[8] *= s;

        // 返回修改后的矩阵，以允许链式调用
        return this;
    }

    /**
     * 计算当前二维矩阵的行列式 determinant
     * 
     * 该方法专为2x2的二维矩阵设计，通过展开式计算行列式的值
     * 行列式的计算公式为：aei + bfg + cdh - ceg - bdi - afh
     * 其中，a、b、c、d、e、f、g、h、i分别是二维矩阵中元素的行列顺序
     */
    determinant() {
        // 将矩阵的元素存储在局部变量中，便于后续计算
        const te = this.elements;
        const a = te[0], b = te[1], c = te[2],
            d = te[3], e = te[4], f = te[5],
            g = te[6], h = te[7], i = te[8];

        // 计算并返回行列式的值
        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }

    /**
     * 计算并设置当前矩阵的逆矩阵
     * 
     * 此方法首先计算当前矩阵的伴随矩阵，然后通过伴随矩阵计算出逆矩阵
     * 如果矩阵的行列式为0，则矩阵没有逆矩阵，因此将当前矩阵设置为零矩阵
     * 
     * @returns this 如果矩阵的行列式为0，则返回零矩阵；否则，返回当前矩阵的逆矩阵
     */
    invert() {
        // 获取当前矩阵的元素
        const te = this.elements;
        // 定义矩阵元素的局部变量，以便更清晰地表示计算过程
        const n11 = te[0], n21 = te[1], n31 = te[2],
            n12 = te[3], n22 = te[4], n32 = te[5],
            n13 = te[6], n23 = te[7], n33 = te[8];

        // 计算伴随矩阵的第一列元素
        const t11 = n33 * n22 - n32 * n23;
        const t12 = n32 * n13 - n33 * n12;
        const t13 = n23 * n12 - n22 * n13;
        // 计算行列式
        const det = n11 * t11 + n21 * t12 + n31 * t13;
        // 如果行列式为0，设置矩阵为零矩阵，并返回
        if (det === 0) {
            return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
        // 计算行列式的倒数
        const detInv = 1 / det;
        // 使用行列式的倒数和伴随矩阵的元素，计算并设置逆矩阵的元素
        te[0] = t11 * detInv;
        te[1] = (n31 * n23 - n33 * n21) * detInv;
        te[2] = (n32 * n21 - n31 * n22) * detInv;

        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n31 * n13) * detInv;
        te[5] = (n31 * n12 - n32 * n11) * detInv;

        te[6] = t13 * detInv;
        te[7] = (n21 * n13 - n23 * n11) * detInv;
        te[8] = (n22 * n11 - n21 * n12) * detInv;

        // 返回当前矩阵
        return this;
    }
    /**
     * 矩阵转置方法
     * 该方法用于将当前矩阵进行转置，即行和列互换
     * 对于2x2矩阵来说，转置就是将对角线上的元素交换位置
     * 
     * @returns this 返回当前矩阵对象，支持链式调用
     */
    transpose() {
        // 获取当前矩阵的元素
        const te = this.elements;
        // 交换元素，以实现转置
        let tmp = te[1];
        te[1] = te[3];
        te[3] = tmp;

        tmp = te[2];
        te[2] = te[6];
        te[6] = tmp;

        tmp = te[5];
        te[5] = te[7];
        te[7] = tmp;
        return this;
    }

    /**
     * 计算并返回给定矩阵的法线矩阵。
     * 法线矩阵是通过将输入矩阵逆矩阵并转置得到的，主要用于光照计算中的法线变换。
     * 
     * @param matrix4 输入的4x4矩阵
     * @returns 返回计算得到的法线矩阵
     */
    getNormalMatrix(matrix4: Matrix4) {
        // 从输入矩阵生成一个新的矩阵，然后对其进行逆运算和转置操作
        // 这里的this指代当前对象，setFromMatrix4方法假设是将当前对象设置为从给定矩阵计算出的法线矩阵
        // invert方法进行矩阵逆运算，transpose方法进行矩阵转置
        return this.setFromMatrix4(matrix4).invert().transpose();
    }

    /**
     * 将矩阵的转置结果存储到一个新数组中
     * 
     * 此方法的目的是为了实现矩阵的转置操作，即将矩阵的行和列互换
     * 由于矩阵的元素是以一维数组的形式存储的，因此转置操作实际上是对数组元素进行重新排列的过程
     * 
     * @param r 目标数组，用于存储转置后的矩阵元素
     * @returns 返回当前矩阵对象，支持链式调用
     */
    transposeIntoArray(r: number[]) {

        // 源矩阵的元素数组
        const m = this.elements;

        // 逐行逐列地将元素转置并存储到目标数组中
        // 原始矩阵形式：
        // | m[0] m[1] m[2] |
        // | m[3] m[4] m[5] |
        // | m[6] m[7] m[8] |
        // 转置后应变为：
        // | m[0] m[3] m[6] |
        // | m[1] m[4] m[7] |
        // | m[2] m[5] m[8] |
        r[0] = m[0];
        r[1] = m[3];
        r[2] = m[6];
        r[3] = m[1];
        r[4] = m[4];
        r[5] = m[7];
        r[6] = m[2];
        r[7] = m[5];
        r[8] = m[8];

        // 返回当前矩阵对象，支持链式调用
        return this;

    }

    /**
     * 设置UV变换矩阵
     * 
     * 该方法用于构建一个2D的仿射变换矩阵，专门用于UV坐标系这种平行于纹理的变换
     * 它结合了平移、缩放和旋转操作，以便于在2D纹理上进行复杂的变换
     * 
     * @param tx 水平方向的平移量
     * @param ty 垂直方向的平移量
     * @param sx 水平方向的缩放因子
     * @param sy 垂直方向的缩放因子
     * @param rotation 旋转角度，以弧度表示
     * @param cx 旋转中心的X坐标
     * @param cy 旋转中心的Y坐标
     * @returns 返回当前对象，以便于链式调用
     */
    setUvTransform(tx: number, ty: number, sx: number, sy: number, rotation: number, cx: number, cy: number) {
        // 计算旋转矩阵的余弦和正弦值
        const c = Math.cos(rotation);
        const s = Math.sin(rotation);

        // 设置变换矩阵的元素
        // 前两个参数分别对应缩放和旋转矩阵的第一行
        // 第三个参数是平移和旋转中心引起的位移
        // 后三个参数分别对应缩放和旋转矩阵的第二行
        // 第七个参数是透视变换，这里设置为0
        // 最后一个参数是变换矩阵的最后一个元素，始终为1
        this.set(
            sx * c, sx * s, - sx * (c * cx + s * cy) + cx + tx,
            - sy * s, sy * c, - sy * (- s * cx + c * cy) + cy + ty,
            0, 0, 1
        )
        // 返回当前对象，以支持链式调用
        return this;
    }

    /**
     * 对当前矩阵进行缩放变换
     * 
     * @param sx 水平方向的缩放因子
     * @param sy 垂直方向的缩放因子
     * @returns 返回当前矩阵对象，支持链式调用
     */
    scale(sx: number, sy: number) {
        // 获取当前矩阵的元素
        const te = this.elements;

        // 对矩阵的每一行的元素进行缩放
        te[0] *= sx; te[3] *= sx; te[6] *= sx;
        te[1] *= sy; te[4] *= sy; te[7] *= sy;

        // 支持链式调用，返回当前矩阵对象
        return this;
    }

    /**
     * 旋转矩阵
     * 
     * 该方法通过给定的弧度角度theta，旋转当前矩阵
     * 它首先计算出旋转矩阵的余弦和正弦值，然后应用到矩阵的每个元素上
     * 
     * @param theta 旋转的角度，以弧度为单位
     * @returns 返回当前矩阵对象，以允许链式调用
     */
    rotate(theta: number) {
        // 计算旋转矩阵的余弦和正弦值
        const c = Math.cos(theta);
        const s = Math.sin(theta);

        // 获取当前矩阵的元素
        const te = this.elements;

        // 对矩阵的每一行的元素进行旋转变换
        const a11 = te[0], a12 = te[3], a13 = te[6];
        const a21 = te[1], a22 = te[4], a23 = te[7];

        te[0] = c * a11 + s * a21;
        te[3] = c * a12 + s * a22;
        te[6] = c * a13 + s * a23;

        te[1] = - s * a11 + c * a21;
        te[4] = - s * a12 + c * a22;
        te[7] = - s * a13 + c * a23;

        // 返回当前矩阵对象，以允许链式调用
        return this;
    }

    translate( tx: number, ty: number ) {

		const te = this.elements;

		te[ 0 ] += tx * te[ 2 ]; te[ 3 ] += tx * te[ 5 ]; te[ 6 ] += tx * te[ 8 ];
		te[ 1 ] += ty * te[ 2 ]; te[ 4 ] += ty * te[ 5 ]; te[ 7 ] += ty * te[ 8 ];

		return this;

	}

    equals(matrix: Matrix3) {

        // 获取当前矩阵和输入矩阵的元素
        const te = this.elements;
        const me = matrix.elements;

        // 逐个比较元素是否相等
        for (let i = 0; i < 9; i++) {
            if (te[i] !== me[i]) return false;
        }

        // 所有元素都相等，返回true
       return true;
    }

    fromArray( array:number[], offset = 0 ) {

		for ( let i = 0; i < 9; i ++ ) {

			this.elements[ i ] = array[ i + offset ];

		}

		return this;

	}

	toArray( array:number[] = [], offset = 0 ) {

		const te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ] = te[ 8 ];

		return array;

	}

    clone() {
        return new Matrix3().copy(this);
    }
}

