import { Camera, type View } from './Camera';

/**
 * 正交相机类，用于创建正交投影的相机
 * 正交投影保持物体的大小不随距离变化，常用于2D场景或等距视图
 */
export class OrthographicCamera extends Camera {
  /**
   * 缩放系数，影响视锥体的大小
   */
  zoom: number;

  /**
   * 视锥体左边界
   */
  left: number;

  /**
   * 视锥体右边界
   */
  right: number;

  /**
   * 视锥体上边界
   */
  top: number;

  /**
   * 视锥体下边界
   */
  bottom: number;

  /**
   * 视锥体近平面距离
   */
  near: number;

  /**
   * 视锥体远平面距离
   */
  far: number;

  /**
   * 视图偏移配置，用于实现子视图或偏移视图效果
   */
  view?: View;

  /**
   * 构造函数，创建一个正交相机实例
   * @param left - 视锥体左边界，默认值为-1
   * @param right - 视锥体右边界，默认值为1
   * @param top - 视锥体上边界，默认值为1
   * @param bottom - 视锥体下边界，默认值为-1
   * @param near - 视锥体近平面距离，默认值为0.1
   * @param far - 视锥体远平面距离，默认值为2000
   */
  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2000) {
    super();
    this.zoom = 1;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
  }

  /**
   * 从源相机复制属性
   * @param source - 源正交相机对象
   * @param recursive - 是否递归复制子对象
   * @returns 返回当前相机实例
   */
  copy(source: OrthographicCamera, recursive: boolean) {
    super.copy(source, recursive);

    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;
    this.near = source.near;
    this.far = source.far;

    this.zoom = source.zoom;
    this.view = source.view === undefined ? undefined : Object.assign({}, source.view);

    return this;
  }

  /**
   * 设置视图偏移，用于创建子视图或画中画效果
   * @param fullWidth - 完整视图宽度
   * @param fullHeight - 完整视图高度
   * @param offsetX - 偏移X坐标
   * @param offsetY - 偏移Y坐标
   * @param width - 子视图宽度
   * @param height - 子视图高度
   */
  setViewOffset(
    fullWidth: number,
    fullHeight: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ) {
    this.view = {
      enabled: true,
      fullWidth,
      fullHeight,
      offsetX,
      offsetY,
      width,
      height,
    };

    this.updateProjectionMatrix();
  }

  /**
   * 清除视图偏移设置
   */
  clearViewOffset() {
    if (this.view) {
      this.view.enabled = false;
    }
    this.updateProjectionMatrix();
  }

  /**
   * 更新投影矩阵，根据当前参数重新计算正交投影矩阵
   * 包括处理视图偏移和缩放的影响
   */
  updateProjectionMatrix() {
    // 计算缩放后的边界
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;

    // 如果启用了视图偏移，则调整边界
    if (this.view?.enabled) {
      const scaleW = (this.right - this.left) / this.view.fullWidth / this.zoom;
      const scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;

      left += scaleW * this.view.offsetX;
      right = left + scaleW * this.view.width;
      top -= scaleH * this.view.offsetY;
      bottom = top - scaleH * this.view.height;
    }

    // 更新投影矩阵和逆投影矩阵
    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);

    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
}
