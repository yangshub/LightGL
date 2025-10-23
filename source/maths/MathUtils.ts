import { Quaternion } from "./Quaternion";

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
let _seed = 12345;
let _lut = new Array(256);

for (let i = 0; i < 256; i++) {
  _lut[i] = (i.toString(16) + "").padStart(2, "0");
}

/**
 * 生成UUID
 *
 * 此方法通过结合当前时间和性能计时器的值来生成一个唯一的UUID
 * UUID的格式为8-4-4-4-12的32字符字符串
 *
 * @returns {string} 生成的UUID字符串
 */
export function generateUUID(): string {
  // 获取当前时间的毫秒值
  let d2 = Date.now();
  // 获取性能计时器的毫秒值，并乘以10000以增加精度
  let d3 = performance.now() * 10000;

  // 使用_lut数组中的值来构建UUID
  // d2和d3的位运算用于提取UUID各个部分的值
  let uuid =
    _lut[(d2 & 0x3f) | 0x80] +
    _lut[(d2 >> 8) & 0xff] +
    "-" +
    _lut[(d2 >> 16) & 0xff] +
    _lut[(d2 >> 24) & 0xff] +
    _lut[d3 & 0xff] +
    _lut[(d3 >> 8) & 0xff] +
    _lut[(d3 >> 16) & 0xff] +
    _lut[(d3 >> 24) & 0xff];

  // 将生成的UUID转换为小写并返回
  return uuid.toLowerCase();
}

/**
 * 限制数值范围
 *
 * 将给定的数值限制在指定的最小值和最大值之间，避免数值超出合理范围
 * 当数值小于最小值时，返回最小值；当数值大于最大值时，返回最大值；否则，返回原数值
 *
 * @param value 待限制的数值
 * @param min 最小值，数值不能小于该值
 * @param max 最大值，数值不能大于该值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 计算欧几里得模除
 * 欧几里得模除是指在模除操作中得到的结果总是非负的
 * 这与标准的模除操作有所不同，标准的模除结果可能为负数
 * 该函数通过调整模除的结果，确保结果始终为非负数
 *
 * @param n 被除数
 * @param m 除数，必须为正数
 * @returns 返回欧几里得模除的结果
 */
export function euclideanModulo(n: number, m: number): number {
  // 使用两次模除操作来确保结果是非负的
  // 首先执行标准的模除，然后将结果与除数相加，再进行一次模除
  // 这样做的目的是当被除数为负数时，可以得到一个非负的模除结果
  return ((n % m) + m) % m;
}

/**
 * 将数字x从一个线性范围[a1, a2]映射到另一个线性范围[b1, b2]
 *
 * @param x 待映射的数值
 * @param a1 源范围的起始值
 * @param a2 源范围的结束值
 * @param b1 目标范围的起始值
 * @param b2 目标范围的结束值
 * @returns 映射后的数值
 *
 * @example
 * mapLinear(5, 0, 10, 0, 100) // 返回50
 */
export function mapLinear(
  x: number,
  a1: number,
  a2: number,
  b1: number,
  b2: number
): number {
  // 通过线性插值公式将x从源范围映射到目标范围
  return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
}

/**
 * 实现逆向线性插值的函数
 * 该函数用于确定一个值在两个指定值范围内的相对位置
 *
 * @param x 范围的起始值
 * @param y 范围的结束值
 * @param value 需要进行逆向线性插值得到其在x和y范围内相对位置的值
 * @returns 返回value在x和y之间的相对位置值如果x等于y，则返回0
 */
export function inverseLerp(x: number, y: number, value: number): number {
  if (x !== y) {
    return (value - x) / (y - x);
  } else {
    return 0;
  }
}

/**
 * 线性插值函数
 *
 * @param x 起始值
 * @param y 结束值
 * @param t 插值系数，范围通常在0到1之间
 * @returns 返回插值结果
 *
 * 此函数用于计算两个数之间的插值值，根据系数t来决定插值的位置
 * 当t=0时，返回起始值x；当t=1时，返回结束值y
 * 在其他情况下，返回的是x和y之间的一个插值结果
 */
export function lerp(x: number, y: number, t: number): number {
  return (1 - t) * x + t * y;
}

/**
 * 计算两个数值之间的阻尼过渡
 *
 * 该函数用于计算两个数值之间的过渡效果，模拟物理阻尼运动，例如物体在液体中的运动
 * 它通过一个指数衰减函数来确定在过渡过程中，当前值应该接近目标值的程度
 *
 * @param x 当前值，表示起始位置或状态
 * @param y 目标值，表示想要达到的位置或状态
 * @param lambda 阻尼系数，控制过渡的快慢。较大的值导致更快的过渡
 * @param dt 时间步长，通常是从上一个更新到下一个更新的时间间隔，影响过渡速度
 * @returns 返回计算出的过渡后的数值
 */
export function damp(x: number, y: number, lambda: number, dt: number): number {
  // 使用线性插值计算过渡后的值，插值比例由阻尼系数和时间步长决定
  return this.lerp(x, y, 1 - Math.exp(-lambda * dt));
}

/**
 * 计算并返回一个数在指定长度范围内反弹（ping-pong）后的对应值。
 *
 * 该函数想象一个在0到指定长度两倍之间反弹的球。球从0开始，到达边界后反弹，
 * 反弹后速度方向相反。该函数计算球在x位置时，它相对于0到指定长度范围的偏移量。
 *
 * @param x 输入的数值，表示球的位置。
 * @param length 范围的长度，即球反弹的边界。默认为1。
 * @returns 返回球在指定范围内的偏移量。
 */
export function pingpong(x: number, length: number = 1): number {
  // 使用欧几里得模运算和数学绝对值函数计算反弹后的偏移量。
  return length - Math.abs(this.euclideanModulo(x, length * 2) - length);
}

/**
 * Smoothstep函数，用于在两个边界值之间平滑插值。
 * 这个函数提供了一种方式，将一个数字平滑地映射到0和1之间，常用于图形学和动画中。
 *
 * @param x 待映射的值，通常位于min和max之间。
 * @param min x的最小值边界，函数输出的下限。
 * @param max x的最大值边界，函数输出的上限。
 * @returns 返回一个平滑插值后的值，范围在0到1之间。
 */
export function smoothstep(x: number, min: number, max: number): number {
  // 当x小于等于min时，直接返回0，表示完全处于min边界之前。
  if (x <= min) return 0;
  // 当x大于等于max时，直接返回1，表示完全处于max边界之后。
  if (x >= max) return 1;

  // 将x归一化到0到1之间，以进行后续的平滑插值计算。
  x = (x - min) / (max - min);

  // 计算平滑插值值，使用了三次多项式，以提供平滑的过渡效果。
  return x * x * (3 - 2 * x);
}

/**
 * Smoothstep函数，用于在两个阈值之间生成平滑的过渡效果。
 * 该函数通过平滑插值，实现了比线性插值更柔和的过渡。
 *
 * @param x 输入的数值，通常用于表示进度或比例。
 * @param min 起始阈值，当x小于等于该值时，返回0。
 * @param max 结束阈值，当x大于等于该值时，返回1。
 * @returns 返回0到1之间平滑过渡的数值。
 */
export function smootherstep(x: number, min: number, max: number): number {
  // 当x小于等于min时，直接返回0，表示完全处于min状态。
  if (x <= min) return 0;
  // 当x大于等于max时，直接返回1，表示完全处于max状态。
  if (x >= max) return 1;

  // 将x归一化到0到1之间，去除min和max的影响。
  x = (x - min) / (max - min);

  // 通过多项式插值计算平滑过渡值，返回结果。
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/**
 * 生成指定范围内的随机整数
 *
 * @param low - 范围的下限（包含）
 * @param high - 范围的上限（包含）
 * @returns 返回在[low, high]范围内的随机整数
 */
export function randInt(low: number, high: number): number {
  // 使用Math.random()生成[0, 1)范围内的随机数，然后乘以(high - low + 1)得到[0, high - low + 1)范围内的随机数
  // 再通过Math.floor()取整，得到[0, high - low]范围内的随机整数
  // 最后加上low，确保生成的随机整数在[low, high]范围内
  return low + Math.floor(Math.random() * (high - low + 1));
}

/**
 * 生成指定范围内的随机浮点数
 *
 * @param low - 指定范围的下限
 * @param high - 指定范围的上限
 * @returns 返回一个在指定范围内的随机浮点数
 */
export function randFloat(low: number, high: number): number {
  // 使用Math.random()生成一个0到1之间的随机数，然后通过乘法和加法将其映射到指定范围
  return low + Math.random() * (high - low);
}

/**
 * 生成一个在-`range`到`range`之间的随机浮点数
 *
 * 此函数用于生成一个指定范围内的随机浮点数，它接受一个参数`range`，
 * 表示生成随机数的范围的一半。函数内部使用`Math.random()`生成一个0到1之间的随机数，
 * 然后通过乘以`range`和减去`range`的一半，将随机数的范围扩展到-`range`到`range`之间
 *
 * @param range 生成随机数的范围的一半
 * @returns 返回一个在-`range`到`range`之间的随机浮点数
 */
export function randFloatSpread(range: number): number {
  return range * (0.5 - Math.random());
}

/**
 * 基于种子的随机数生成函数
 * 该函数通过修改种子来生成随机数，提供了一个可预测的随机序列
 * @param s 可选参数，用于设置随机数的种子如果未定义，则使用默认种子
 * @returns 返回0到1之间的伪随机数
 */
export function seededRandom(s?: number): number {
  // 如果提供了种子s，则更新内部种子变量_seed
  if (s !== undefined) _seed = s;

  // 对种子进行操作，产生一个随机数t
  let t = (_seed += 0x6d2b79f5);

  // 使用位运算和数学乘法操作，进一步混淆t的值
  t = Math.imul(t ^ (t >>> 15), t | 1);

  // 再次进行位运算和数学乘法操作，加深t的混淆程度
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

  // 最后一次位运算混淆t的值，然后右移t，使其成为一个32位无符号整数
  // 将混淆后的结果转换为0到1之间的浮点数作为随机数返回
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * 将角度转换为弧度
 *
 * 此函数接收一个以度为单位的角度值，将其转换为弧度值由于在许多数学计算中使用弧度制，
 * 这种转换是必要的，以确保与JavaScript的Math库等接口的兼容性，这些接口通常接受弧度值作为参数
 *
 * @param degrees 角度值，以度为单位
 * @returns 返回对应的弧度值
 */
export function degToRad(degrees: number): number {
  return degrees * DEG2RAD;
}

/**
 * 将弧度转换为度
 *
 * 此函数接收一个以弧度为单位的角度值，并将其转换为以度为单位的角度值
 * 弧度和度之间的转换是通过乘以一个预定义的常量RAD2DEG来实现的，该常量代表了每个弧度对应的度数
 *
 * @param radians 弧度值，表示角度的弧度数
 * @returns number 返回对应的度数
 */
export function radToDeg(radians: number): number {
  return radians * RAD2DEG;
}

/**
 * 判断一个数是否为2的幂
 *
 * 此函数通过位运算来判断给定的值是否为2的幂。2的幂的二进制表示中只有一个位是1，
 * 因此value与(value-1)做与运算后结果应为0，同时value不为0以排除0的干扰。
 *
 * @param value 待判断的数值
 * @returns 如果value是2的幂则返回true，否则返回false
 */
export function isPowerOfTwo(value: number): boolean {
  return (value & (value - 1)) === 0 && value !== 0;
}

/**
 * 将给定的数值向上舍入到最接近的2的幂次方
 *
 * 此函数的主要目的是确定给定数值至少需要多大的2的幂次方来进行表示
 * 它在二进制相关操作中非常有用，比如内存分配大小、哈希表容量等
 *
 * @param value 需要向上舍入的数值
 * @returns 返回大于或等于给定数值的最接近的2的幂次方
 */
export function ceilPowerOfTwo(value: number): number {
  // 使用Math.log()计算value的对数，然后除以Math.LN2（即Math.log(2)）得到以2为底的对数
  // 使用Math.ceil()对得到的结果向上取整，确保结果是大于或等于原值的最小整数
  // 最后使用Math.pow(2, ...)计算2的该整数次幂，得到最终结果
  return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}

/**
 * 将给定的数字转换为最接近的较小的2的幂次方数
 *
 * 此函数主要用于确定一个数字，并找到最接近它的较小的2的幂次方数
 * 这在某些计算场景下非常有用，例如确定数组大小、内存分配等
 *
 * @param value 要转换的数字
 * @returns 返回最接近value的较小的2的幂次方数
 */
export function floorPowerOfTwo(value: number): number {
  // 使用Math.log获取value的自然对数，然后除以Math.LN2（自然对数的2的倒数）得到一个基数
  // Math.floor函数将这个基数向下取整，确保结果是一个整数
  // 最后，使用Math.pow(2,基数)计算出最接近value的较小的2的幂次方数
  return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}

/**
 * 从正规欧拉角设置四元数
 *
 * 此函数根据给定的三个欧拉角(a, b, c)和旋转顺序(order)，计算并设置四元数(q)的值
 * 它主要用于从欧拉角表示转换到四元数表示，以便在3D应用程序中进行旋转操作
 *
 * @param q 要设置的四元数对象
 * @param a 第一个欧拉角，以弧度表示
 * @param b 第二个欧拉角，以弧度表示
 * @param c 第三个欧拉角，以弧度表示
 * @param order 旋转顺序，指定欧拉角的应用顺序，如'XYX'、'YZY'等
 */
export function setQuaternionFromProperEuler(
  q: Quaternion,
  a: number,
  b: number,
  c: number,
  order: string
): void {
  // 缩写数学函数以提高代码的可读性和性能
  const cos = Math.cos;
  const sin = Math.sin;

  // 根据旋转顺序计算中间变量
  const c2 = cos(b / 2);
  const s2 = sin(b / 2);

  const c13 = cos((a + c) / 2);
  const s13 = sin((a + c) / 2);

  const c1_3 = cos((a - c) / 2);
  const s1_3 = sin((a - c) / 2);

  const c3_1 = cos((c - a) / 2);
  const s3_1 = sin((c - a) / 2);

  // 根据指定的旋转顺序设置四元数的分量
  switch (order) {
    case "XYX":
      q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
      break;
    case "YZY":
      q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
      break;
    case "ZXZ":
      q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
      break;
    case "XZX":
      q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
      break;
    case "YXY":
      q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
      break;
    case "ZYZ":
      q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
      break;
    default:
      // 如果遇到未知的旋转顺序，则输出警告信息
      console.warn(
        "MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " +
          order
      );
  }
}
/**
 * 对给定的数值进行反规范化
 *
 * 此函数的目的是将一个浮点数数值转换为指定类型的有符号或无符号整数
 * 它根据输入的数组类型（由array.bufferView给出）来决定如何转换数值
 *
 * @param value {number} - 需要反规范化的浮点数数值
 * @param array {ArrayBufferView} - 用于确定反规范化类型的数组
 * @returns {number} - 反规范化后的数值
 * @throws {Error} - 如果提供的数组类型不支持反规范化，则抛出错误
 */
export function denormalize(value: number, array: ArrayBufferView): number {
  switch (array.constructor) {
    case Float32Array:
      // 对于Float32Array，无需转换，直接返回原始值
      return value;
    case Uint16Array:
      // 对于Uint16Array，将浮点数除以65535.0进行反规范化
      return value / 65535.0;
    case Uint8Array:
      // 对于Uint8Array，将浮点数除以255.0进行反规范化
      return value / 255.0;
    case Int16Array:
      // 对于Int16Array，将浮点数除以32767.0进行反规范化，并确保结果不小于-1.0
      return Math.max(value / 32767.0, -1.0);
    case Int8Array:
      // 对于Int8Array，将浮点数除以127.0进行反规范化，并确保结果不小于-1.0
      return Math.max(value / 127.0, -1.0);
    default:
      // 如果数组类型不受支持，抛出错误
      throw new Error("Invalid component type.");
  }
}

/**
 * 根据不同的数组类型对数值进行归一化转换
 *
 * 此函数的目的是将给定的数值根据数组的类型进行适当的转换，
 * 以确保在不同类型的数组中存储或操作时，数值的表示是一致的
 *
 * @param value 要归一化的数值
 * @param array 用于确定归一化标准的数组类型
 * @returns 根据数组类型归一化后的数值
 * @throws 如果数组类型不被支持，则抛出错误
 */
export function normalize(value: number, array: ArrayBufferView): number {
  // 根据数组的实际类型来决定归一化的方式
  switch (array.constructor) {
    case Float32Array:
      // 对于Float32Array，无需转换，直接返回原始值
      return value;
    case Uint16Array:
      // 对于Uint16Array，将值乘以65535并四舍五入到最近的整数
      return Math.round(value * 65535.0);
    case Uint8Array:
      // 对于Uint8Array，将值乘以255并四舍五入到最近的整数
      return Math.round(value * 255.0);
    case Int16Array:
      // 对于Int16Array，将值乘以32767并四舍五入到最近的整数
      return Math.round(value * 32767.0);
    case Int8Array:
      // 对于Int8Array，将值乘以127并四舍五入到最近的整数
      return Math.round(value * 127.0);
    default:
      // 如果数组类型不是上述之一，抛出错误
      throw new Error("Invalid component type.");
  }
}
