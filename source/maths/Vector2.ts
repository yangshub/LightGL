import {Matrix3} from "./Matrix3";

export class Vector2 {
    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    get width() {
        return this.x;
    }
    get height() {
        return this.y;
    }

    set width(width: number) {
        this.x = width;
    }

    set height(height: number) {
        this.y = height;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    setScalar(scalar: number) {
        this.x = scalar;
        this.y = scalar;
        return this;
    }

    setX(x: number) {
        this.x = x;
        return this;
    }

    setY(y: number) {
        this.y = y;
        return this;
    }

    setComponent(index: number, value: number) {
        switch (index) {
            case 0: this.x = value; break;
            case 1: this.y = value; break;
            default: throw new Error('index is out of range: ' + index);
        }
    }

    getComponent(index: number) {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            default: throw new Error('index is out of range: ' + index);
        }
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    copy(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    add(v: Vector2) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    addScalar(s: number) {
        this.x += s;
        this.y += s;
        return this;
    }

    addVectors(a: Vector2, b: Vector2) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    addScaledVector(v: Vector2, s: number) {
        this.x += v.x * s;
        this.y += v.y * s;
        return this;
    }

    sub(v: Vector2) {
        this.x -= v.x
        this.y -= v.y
        return this
    }

    subScalar(s: number) {
        this.x -= s;
        this.y -= s;
        return this;
    }

    subVectors(a: Vector2, b: Vector2) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    multiply(v: Vector2) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    multiplyScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    divide(v: Vector2) {
        this.x /= v.x;
        this.y /= v.y;
        return this;
    }

    divideScalar(scalar: number) {
        return this.multiplyScalar(1 / scalar);
    }

    /**
   * 应用一个3x3矩阵的变换到当前点上
   * 
   * @param m - 一个3x3的矩阵对象，用于变换当前点
   * @returns 返回当前点对象，以便进行链式调用
   * 
   * 此方法用于将一个3x3矩阵的变换应用到当前点上
   * 通过矩阵乘法实现点的变换，这是计算机图形学中常见的操作
   * 变换后的点坐标被更新为新的x和y值
   */
    applyMatrix3(m: Matrix3) {
        // 解构当前点的x和y坐标
        const { x, y } = this
        // 获取矩阵的元素
        const e = m.elements

        // 计算变换后的x坐标
        this.x = e[0] * x + e[3] * y + e[6]
        // 计算变换后的y坐标
        this.y = e[1] * x + e[4] * y + e[7]

        // 返回当前点对象，以支持链式调用
        return this
    }

    min(v: Vector2) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }

    max(v: Vector2) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }

    /**
     * 限制向量的x和y值在给定的最小和最大范围内
     * @param min {Vector2} 定义x和y的最小值
     * @param max {Vector2} 定义x和y的最大值
     * @returns {Vector2} 返回当前向量对象，支持链式调用
     */
    clamp(min: Vector2, max: Vector2) {
        // min和max都是向量对象，用于确定最小和最大值

        // 确保x和y值在指定的范围内
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));

        //返回当前对象，以支持链式调用
        return this;
    }

    clampScalar(min: number, max: number) {
        // 限制向量的x和y值在给定的最小和最大范围内

        // 确保x和y值在指定的范围内
        this.x = Math.max(min, Math.min(max, this.x));
        this.y = Math.max(min, Math.min(max, this.y));

        //返回当前对象，以支持链式调用
        return this;
    }

    clampLength(min: number, max: number) {
        // 限制向量的长度在给定的最小和最大范围内

        // 计算向量的长度
        const length = this.length();

        // 如果长度小于最小值，则将向量缩放为最小值
        if (length < min) {
            this.multiplyScalar(min / length);
        } else if (length > max) {
        }
    }

    /**
     * 将当前对象的x和y属性向下取整
     * 
     * 此方法修改了对象的x和y属性，将它们分别设置为各自的Math.floor()结果
     * 这在需要确保坐标值为整数时特别有用，例如在离散的坐标系中进行绘图操作
     * 
     * @returns {this} 返回当前对象的引用，支持链式调用
     */
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    /**
     * 将当前对象的x和y属性向上取整
     * 
     * 此方法使用Math.ceil函数将对象的x和y属性分别向上取整到下一个整数
     * 它修改了对象的x和y属性，并保持对象自身引用不变地返回修改后的对象
     * 
     * @returns {this} 返回修改后的当前对象
     */
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        return this;
    }

    /**
     * 对当前对象的坐标进行四舍五入
     * 
     * 此方法将对象的 x 和 y 坐标值四舍五入为最接近的整数它使得坐标值更容易处理，
     * 并减少因浮点计算带来的不精确性
     * 
     * @returns {this} 返回当前对象，支持链式调用
     */
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    /**
     * 对当前对象的坐标取最接近零的整整数， 
     * 
     * 此方法将对象的 x 和 y 坐标值 小于零时向上取整， 大于零时向下取整，
     * 
     * @returns {this} 返回当前对象，支持链式调用
     */
    roundToZero() {
        this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
        this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);

        return this;
    }

    /**
     * 将当前对象的x和y属性取反
     * 
     * 此方法用于反转当前对象的x和y属性值它通过将每个属性乘以-1来实现这一点
     * 
     * @returns {this} 返回当前对象，允许链式调用
     */
    negate() {
        this.x = -this.x;
        this.y = -this.y;

        return this;
    }

    /**
     * 计算当前向量与另一个向量的点积（内积）
     * 点积的结果是一个标量，等于两个向量的对应分量的乘积之和
     * 这个方法通常用于计算两个向量的夹角或者投影
     * 
     * @param v 另一个向量，与当前向量进行点积计算
     * @returns 返回当前向量与另一个向量的点积值
     */
    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * 计算当前向量与另一个向量的叉积
     * 
     * @param v 另一个向量
     * @returns 返回叉积的结果，即两个向量构成的平行四边形的有向面积
     */
    cross(v: Vector2) {
        return this.x * v.y - this.y * v.x;
    }

    /**
     * 计算向量的长度的平方值
     * 
     * 此方法用于获取向量的长度的平方值，即向量的x分量和y分量分别平方并求和
     * 它提供了一种高效的方式来自判断向量的长度，而无需实际计算开方
     * 
     * @returns {number} 向量的长度的平方值
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * 计算点到原点的曼哈顿距离
     * 
     * 此方法用于计算当前点（由x和y坐标表示）到原点（0,0）的曼哈顿距离
     * 曼哈顿距离是两点在网格上的最短路径距离，即水平距离和垂直距离的总和
     * 
     * @returns {number} 返回当前点到原点的曼哈顿距离
     */
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    normalize() {
        return this.divideScalar(this.length());
    }

    angle() {
        return Math.atan2(-this.y, -this.x) + Math.PI;
    }

    distanceTo(v: Vector2) {
        return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v: Vector2) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;

        return dx * dx + dy * dy;
    }

    manhattanDistanceTo(v: Vector2) {
        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }

    setLength(length: number) {
        return this.normalize().multiplyScalar(length);
    }

    /**
 * 线性插值函数
 * 通过线性插值更新当前向量，以更接近给定向量v
 * 
 * @param v 目标向量，当前向量将朝向此向量进行插值
 * @param alpha 插值因子，决定当前向量向目标向量接近的程度，通常在0到1之间
 * @returns 返回当前向量对象，以允许链式调用
 */
    lerp(v: Vector2, alpha: number) {
        // 在x轴方向上，根据插值因子alpha，更新当前向量的x坐标
        this.x += (v.x - this.x) * alpha;
        // 在y轴方向上，根据插值因子alpha，更新当前向量的y坐标
        this.y += (v.y - this.y) * alpha;

        // 返回当前向量对象，以允许链式调用
        return this;
    }

    /**
     * 对两个向量进行线性插值
     * @param v1 起始向量
     * @param v2 结束向量
     * @param alpha 插值因子，决定v1和v2之间插值的权重
     * @returns 返回插值后的向量
     */
    lerpVectors(v1: Vector2, v2: Vector2, alpha: number) {
        // 计算两个向量之间的插值，并更新当前向量
        return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
    }

    equals(v: Vector2) {
        return ((v.x === this.x) && (v.y === this.y));
    }

    fromArray(array: number[], offset: number = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];

        return this;
    }

    toArray(array: number[] = [], offset: number = 0) {
        array[offset] = this.x;
        array[offset + 1] = this.y;

        return array;
    }

    // fromBufferAttribute(attribute: BufferAttribute, index: number) {
    //     this.x = attribute.getX(index);
    //     this.y = attribute.getY(index);

    //     return this;
    // }

    /**
     * 绕指定中心点旋转当前对象
     * 
     * 该方法主要用于在2D空间中，绕着一个指定的中心点旋转当前对象
     * 它通过应用旋转变换来改变对象的位置，而不是直接修改对象的x和y属性
     * 
     * @param center {Vector2} - 旋转中心点，即绕着哪个点进行旋转
     * @param angle {number} - 旋转角度，以弧度为单位，用于指定旋转的角度
     * @returns {this} - 旋转后返回当前对象，允许链式调用
     */
    rotateAround(center: Vector2, angle: number) {
        // 计算旋转矩阵的余弦值和正弦值
        const c = Math.cos(angle), s = Math.sin(angle);

        // 计算当前对象相对于旋转中心的偏移量
        const x = this.x - center.x;
        const y = this.y - center.y;

        // 应用旋转变换，计算旋转后的坐标
        this.x = x * c - y * s + center.x;
        this.y = x * s + y * c + center.y;

        // 返回当前对象，允许链式调用
        return this;
    }

    random() {
        this.x = Math.random();
        this.y = Math.random();

        return this;
    }

    /**
     * 符号iterator的迭代器方法
     * 此方法允许对象在迭代时返回其x和y属性
     * 通过使用Symbol.iterator，该方法使得对象能够遵循迭代协议
     * 从而可以用于for-of循环或者其他需要迭代的情境中
     *
     * @returns {Generator} 返回一个生成器对象，该对象可以迭代地访问对象的x和y属性
     */
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
}